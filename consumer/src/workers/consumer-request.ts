/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Contract } from '@aeternity/aepp-sdk';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { Aggregator } from 'src/database/schemas/aggregator';
import { AggregatorJobData, AggregatorQuestionType, FetchedAnswer } from 'src/types';
import { getSdk } from 'src/utils/aeternity';
import { aci } from 'src/acis/aggregator';
import { SourceBuilder } from 'src/utils/source-builder';

// The ConsumerRequestWorker class processes jobs related to data aggregation and blockchain updates
@Processor('ConsumerRequestWorker')
export class ConsumerRequestWorker extends WorkerHost {
    constructor(
        @InjectModel(Aggregator.name) private aggregatorModel: Model<Aggregator>
    ) {
        super();
    }

    // The main job processing function
    async process(job: Job<any, any, string>): Promise<any> {
        const { queryId, question, address } = job.data as AggregatorJobData;

        // Find the aggregator based on the job data (address)
        const aggregator = await this.aggregatorModel.findOne({ address });

        // If aggregator not found, mark the job as completed
        if (!aggregator) return job.moveToCompleted('', '');

        if (question.type == AggregatorQuestionType.PRICE) {
            // Fetch the answers from the external data sources
            const fetchedAnswer = await this.fetchAnswers(aggregator);

            // If no answers were fetched, mark the job as completed
            if (fetchedAnswer.answers.length == 0) return job.moveToCompleted('', '');

            // Write the fetched answers to the database and blockchain if necessary
            await this.writeAnswer(queryId, fetchedAnswer);

            return job.moveToCompleted('', '');
        }

        else { return job.moveToCompleted('', ''); }
    }

    // Fetches price data from external sources like CoinMarketCap and CoinGecko
    private async fetchAnswers(aggregator: Aggregator): Promise<FetchedAnswer> {
        const sources = new SourceBuilder().build(aggregator);

        // Wait for all the sources to return data and package them with timestamp
        const answers = await Promise.all(sources);

        return { answers, aggregator, timestamp: Date.now() };
    }

    // Writes the fetched answer to the database and blockchain if it meets certain conditions
    private async writeAnswer(
        queryId: string,
        fetchedAnswer: FetchedAnswer
    ) {
        // Initialize the Aeternity SDK
        const aeSdk = getSdk();

        // Initialize the Aeternity contract instance for the aggregator
        const contract = await Contract.initialize({
            ...aeSdk.getContext(),
            address: fetchedAnswer.aggregator.address,
            aci
        });

        await contract.$call('respond', [queryId, fetchedAnswer.answers]);
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}

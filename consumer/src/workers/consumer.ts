/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { Aggregator } from 'src/database/schemas/aggregator';
import { Datafeed } from 'src/database/schemas/datafeed';
import { FetchedAnswer } from 'src/types';
import { Contract } from '@aeternity/aepp-sdk';
import { getSdk } from 'src/utils/aeternity';
import { aci } from 'src/acis/aggregator';
import BigNumber from 'bignumber.js';
import { SourceBuilder } from 'src/utils/source-builder';

// The ConsumerWorker class processes jobs related to data aggregation and blockchain updates
@Processor('ConsumerWorker')
export class ConsumerWorker extends WorkerHost {
    constructor(
        @InjectModel(Aggregator.name) private aggregatorModel: Model<Aggregator>,
        @InjectModel(Datafeed.name) private datafeedModel: Model<Datafeed>,
    ) {
        super();
    }

    // The main job processing function
    async process(job: Job<any, any, string>): Promise<any> {
        const { address } = job.data;

        // Find the aggregator based on the job data (address)
        const aggregator = await this.aggregatorModel.findOne({ address });

        // If aggregator not found, mark the job as completed
        if (!aggregator) return job.moveToCompleted('', '');

        // Fetch the answers from the external data sources
        const fetchedAnswer = await this.fetchAnswers(aggregator);

        // If no answers were fetched, mark the job as completed
        if (fetchedAnswer.answers.length == 0) return job.moveToCompleted('', '');

        // Write the fetched answers to the database and blockchain if necessary
        await this.writeAnswer(fetchedAnswer);

        return job.moveToCompleted('', '');
    }

    // Fetches price data from external sources like CoinMarketCap and CoinGecko
    private async fetchAnswers(aggregator: Aggregator): Promise<FetchedAnswer> {
        const sources = new SourceBuilder().build(aggregator);

        // Wait for all the sources to return data and package them with timestamp
        const answers = await Promise.all(sources);

        return { answers, aggregator, timestamp: Date.now() };
    }

    // Writes the fetched answer to the database and blockchain if it meets certain conditions
    private async writeAnswer(fetchedAnswer: FetchedAnswer) {
        // Calculate the average of the fetched answers    
        const newRoundData = this.getAverage(fetchedAnswer.answers);

        // Get the latest round data for comparison
        const latestRoundData = await this.getLatestRoundAnswer(fetchedAnswer.aggregator.address);

        // Check if the data is off by the allowed percentage or if the heartbeat has expired
        if (
            this.isOffByPercent(newRoundData, latestRoundData, fetchedAnswer.aggregator.deviationThreshold) ||
            fetchedAnswer.aggregator.updatedAt + fetchedAnswer.aggregator.heartbeat < fetchedAnswer.timestamp
        ) {
            // If the condition is met, create a new datafeed entry
            const datafeed: Datafeed = {
                answers: fetchedAnswer.answers.map(answer => answer.toString()),
                aggregator: fetchedAnswer.aggregator.address,
                timestamp: fetchedAnswer.timestamp
            };

            // Save the datafeed entry to the database
            await this.datafeedModel.create(datafeed);
            // Update the aggregator's `updatedAt` field with the new timestamp
            await this.aggregatorModel.updateOne(
                { address: fetchedAnswer.aggregator.address },
                { updatedAt: fetchedAnswer.timestamp }
            );

            // Initialize the Aeternity SDK
            const aeSdk = getSdk();
            // Initialize the Aeternity contract instance for the aggregator
            const contract = await Contract.initialize({
                ...aeSdk.getContext(),
                address: fetchedAnswer.aggregator.address,
                aci
            });

            const answers: bigint[] = fetchedAnswer.answers.map(answer =>
                BigInt(answer.toFixed(0))
            );

            // Call the smart contract to add the round data
            await contract.$call('add_round_data', [answers, fetchedAnswer.timestamp]);
        }
    }

    // Checks if two values are off by a percentage threshold
    private isOffByPercent(value1: BigNumber, value2: BigNumber, percent: number): boolean {
        // Calculate the absolute difference between the two values
        const difference = value1.minus(value2).abs();

        // If the difference is zero, return false as it's not "off by percentage"
        if (difference.eq(0)) return false;

        // Calculate the maximum allowed difference based on the percentage
        const maxDifference = BigNumber.max(value1, value2)
            .div(new BigNumber(100))
            .times(new BigNumber(percent));

        // Return true if the difference exceeds the allowed maximum
        return difference.gt(maxDifference);
    }

    // Calculates the average of a list of answers
    private getAverage(answers: BigNumber[]): BigNumber {
        return (answers.reduce((sum, answer) => sum.plus(answer))).div(new BigNumber(answers.length));
    }

    // Fetches the latest round answer from the aggregator's smart contract
    private async getLatestRoundAnswer(address: `ct_${string}`): Promise<BigNumber> {
        try {
            const aeSdk = getSdk();
            // Initialize the contract for the given address
            const contract = await Contract.initialize({ ...aeSdk.getContext(), address, aci });

            // Call the `latest_round_data` method from the contract to get the latest round data
            const { decodedResult } = await contract.$call('latest_round_data', [], {
                callStatic: true
            });
            return new BigNumber(decodedResult.answer);
        } catch (error) {
            // Return a default value of 0 if there's an error fetching the latest round data
            return new BigNumber(0);
        }
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}

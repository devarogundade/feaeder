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
import { CMC } from 'src/sources/cmc';
import { CoinGecko } from 'src/sources/coingecko';

// The ConsumerWorker class processes jobs related to data aggregation and blockchain updates
@Processor('ConsumerWorker')
export class ConsumerWorker extends WorkerHost {
    // Instantiating sources to fetch data from CoinMarketCap and CoinGecko
    private cmc = new CMC();
    private coinGecko = new CoinGecko();

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
        try {
            // Collecting sources to fetch data from based on the aggregator's tickers
            const sources = [];

            // If CoinMarketCap data is available for the aggregator, fetch the data
            if (aggregator.tickers[this.cmc.id]) {
                sources.push(this.cmc.fetchData(aggregator.tickers[this.cmc.id], aggregator.decimals));
            }

            // If CoinGecko data is available for the aggregator, fetch the data
            if (aggregator.tickers[this.coinGecko.id]) {
                sources.push(this.coinGecko.fetchData(aggregator.tickers[this.coinGecko.id], aggregator.decimals));
            }

            // Wait for all the sources to return data and package them with timestamp
            const answers = await Promise.all(sources);

            return { answers, aggregator, timestamp: Date.now() };
        } catch (error) {
            console.error('Error fetching prices:', error);
            // Return an empty answers array if there is an error
            return { aggregator, answers: [], timestamp: Date.now() };
        }
    }

    // Writes the fetched answer to the database and blockchain if it meets certain conditions
    private async writeAnswer(fetchedAnswer: FetchedAnswer) {
        // Calculate the average of the fetched answers
        const newRoundData = this.getAverage(fetchedAnswer.answers.map(answer => BigInt(answer)));
        // Get the latest round data for comparison
        const latestRoundData = await this.getLatestRoundAnswer(fetchedAnswer.aggregator.address);

        // Check if the data is off by the allowed percentage or if the heartbeat has expired
        if (
            this.isOffByPercent(newRoundData, latestRoundData, fetchedAnswer.aggregator.deviationThreshold) ||
            fetchedAnswer.aggregator.updatedAt + fetchedAnswer.aggregator.heartbeat < fetchedAnswer.timestamp
        ) {
            // If the condition is met, create a new datafeed entry
            const datafeed: Datafeed = {
                answers: fetchedAnswer.answers,
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

            // Call the smart contract to add the round data
            await contract.$call('add_round_data', [fetchedAnswer.answers, fetchedAnswer.timestamp]);
        }
    }

    // Checks if two values are off by a percentage threshold
    private isOffByPercent(value1: bigint, value2: bigint, percent: number): boolean {
        // Ensure both values are positive to avoid division by zero and negative percentages
        if (value1 <= 0 || value2 <= 0) {
            return false;
        }

        // Calculate the absolute difference between the two values
        const difference = Math.abs(Number(value1) - Number(value2));

        // If the difference is zero, return false as it's not "off by percentage"
        if (difference == 0) return false;

        // Calculate the maximum allowed difference based on the percentage
        const maxDifference = (Math.max(Number(value1), Number(value2)) / 100) * percent;

        // Return true if the difference exceeds the allowed maximum
        return difference > maxDifference;
    }

    // Calculates the average of a list of answers
    private getAverage(answer: bigint[]): bigint {
        return (answer[0] + answer[1]) / BigInt(answer.length);
    }

    // Fetches the latest round answer from the aggregator's smart contract
    private async getLatestRoundAnswer(address: `ct_${string}`): Promise<bigint> {
        try {
            const aeSdk = getSdk();
            // Initialize the contract for the given address
            const contract = await Contract.initialize({ ...aeSdk.getContext(), address, aci });

            // Call the `latest_round_data` method from the contract to get the latest round data
            const { decodedResult } = await contract.$call('latest_round_data', []);
            return decodedResult.answer;
        } catch (error) {
            console.log(error);
            // Return a default value of 0 if there's an error fetching the latest round data
            return BigInt(0);
        }
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}

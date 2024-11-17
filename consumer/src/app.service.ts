/* eslint-disable prettier/prettier */

// Import necessary modules and dependencies
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Aggregator } from './database/schemas/aggregator';
import { Datafeed } from './database/schemas/datafeed';
import { InjectQueue } from '@nestjs/bullmq';
import { Paged } from './types';

// Define constants for pagination and job scheduling intervals
const TAKE_SIZE: number = 10; // Number of records to fetch per page

@Injectable()
export class AppService {
  constructor(
    // Inject Mongoose models for aggregators and datafeeds
    @InjectModel(Aggregator.name) private aggregatorModel: Model<Aggregator>,
    @InjectModel(Datafeed.name) private datafeedModel: Model<Datafeed>,

    // Inject BullMQ aggregatorQueue for managing consumer jobs
    @InjectQueue('ConsumerWorker') private aggregatorQueue: Queue,
    @InjectQueue('VRFWorker') private vrfQueue: Queue,
    @InjectQueue('ConsumerRequestWorker') private aggregatorRequestQueue: Queue
  ) {
    // Initialize scheduled jobs for aggregators when the service starts
    this.start();
  }

  // Method to restart jobs for all aggregators
  restart(): Promise<Aggregator[]> {
    return this.start();
  }

  // Method to add a new aggregator to the system and schedule it as a repeating job
  async addAggregator(aggregator: Aggregator): Promise<Aggregator> {
    // Check if the aggregator already exists in the database
    const aggregatorExists = await this.aggregatorModel.findOne({
      address: aggregator.address
    });

    // If aggregator exists, return it to avoid duplicate entries
    if (aggregatorExists) {
      return aggregatorExists;
    }

    // Define job options to set a repeating job interval for the aggregator
    const jobOptions: JobsOptions = {
      repeat: {
        every: aggregator.pulse
      },
      jobId: aggregator.address // Unique job ID to avoid duplicate jobs
    };

    // Add the aggregator job to the aggregatorQueue with defined options
    this.aggregatorQueue.add(aggregator.address, { address: aggregator.address },
      jobOptions
    );

    // Save the aggregator to the database and return it
    return this.aggregatorModel.create(aggregator);
  }

  // Method to fetch a paginated list of aggregators
  async getAggregators(page: number = 1, category: string, search: string): Promise<Paged<Aggregator[]>> {
    const filter = {};

    if (category && category.length > 0) {
      filter['category'] = category;
    }

    if (search && search.length > 0) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await this.aggregatorModel.countDocuments(filter); // Total count for pagination

    // Fetch a limited set of aggregator records with sorting and pagination
    const data = await this.aggregatorModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'datafeeds',
          localField: 'address',
          foreignField: 'aggregator',
          as: 'datafeeds'
        }
      },
      { $unwind: '$datafeeds' },
      { $sort: { 'aggregator.name': 1, 'datafeeds.timestamp': -1 } },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          latestDataFeed: { $first: '$datafeeds' }
        }
      },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$root', { latestDataFeed: '$latestDataFeed' }] } } },
      { $skip: (page - 1) * TAKE_SIZE },
      { $limit: TAKE_SIZE }
    ]).exec();

    const lastPage = Math.ceil(total / TAKE_SIZE); // Calculate the last page for pagination

    return { total, lastPage, data, limit: TAKE_SIZE }; // Return paginated result
  }

  // Method to fetch a paginated list of datafeeds
  async getDatafeeds(page: number): Promise<Paged<Datafeed[]>> {
    const total = await this.datafeedModel.countDocuments(); // Total count for pagination

    // Fetch a limited set of datafeed records with sorting and pagination
    const data = await this.datafeedModel.find()
      .limit(TAKE_SIZE * 1)
      .skip((page - 1) * TAKE_SIZE)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .exec();

    const lastPage = Math.ceil(total / TAKE_SIZE); // Calculate the last page for pagination

    return { total, lastPage, data, limit: TAKE_SIZE }; // Return paginated result
  }

  // Method to fetch paginated datafeeds associated with a specific aggregator
  async getAggregatorDatafeeds(aggregator: string, page: number): Promise<Paged<Datafeed[]>> {
    const total = await this.datafeedModel.countDocuments({ aggregator }); // Total count for pagination

    // Fetch datafeeds for a specific aggregator with sorting and pagination
    const data = await this.datafeedModel.find({ aggregator })
      .limit(TAKE_SIZE * 1)
      .skip((page - 1) * TAKE_SIZE)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .exec();

    const lastPage = Math.ceil(total / TAKE_SIZE); // Calculate the last page for pagination

    return { total, lastPage, data, limit: TAKE_SIZE }; // Return paginated result
  }

  async requestVrf(requestId: number, to: `ct_${string}`): Promise<void> {
    const jobOptions: JobsOptions = {
      jobId: requestId.toString() // Unique job ID to avoid duplicate jobs
    };

    this.vrfQueue.add(requestId.toString(), { requestId, to },
      jobOptions
    );
  }

  async requestAggregator(queryId: string, question: string, to: `ct_${string}`): Promise<void> {
    const jobOptions: JobsOptions = {
      jobId: queryId // Unique job ID to avoid duplicate jobs
    };

    this.aggregatorRequestQueue.add(queryId, { queryId, question, to },
      jobOptions
    );
  }

  // Private method to start and schedule jobs for each aggregator in the database
  private async start(): Promise<Aggregator[]> {
    const aggregators = await this.aggregatorModel.find(); // Fetch all aggregators

    // Iterate through each aggregator and add a job to the aggregatorQueue with a repeating interval
    aggregators.forEach(aggregator => {
      const jobOptions: JobsOptions = {
        repeat: {
          every: aggregator.pulse
        },
        jobId: aggregator.address // Unique job ID to prevent duplicates
      };

      this.aggregatorQueue.add(aggregator.address, { address: aggregator.address },
        jobOptions
      );
    });

    return aggregators; // Return list of aggregators for further processing if needed
  }
}

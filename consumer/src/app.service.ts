/* eslint-disable prettier/prettier */

// Import necessary modules and dependencies
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Aggregator } from './database/schemas/aggregator';
import { Datafeed } from './database/schemas/datafeed';
import { InjectQueue } from '@nestjs/bullmq';
import { AggregatorJobData, Paged, VRFJobData } from './types';

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
    @InjectQueue('VRFWorker') private vrfRequestQueue: Queue,
    @InjectQueue('ConsumerRequestWorker') private aggregatorRequestQueue: Queue,
    @InjectQueue('TrasherWorker') private trasherQueue: Queue
  ) {
    // Initialize scheduled jobs for aggregators when the service starts
    this.start();

    const jobOptions: JobsOptions = {
      repeat: {
        every: 24 * 60 * 60 * 1000
      },
      jobId: 'trashers-1' // Unique job ID to prevent duplicates
    };

    this.trasherQueue.add('trashers-1', {},
      jobOptions
    );
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
        every: aggregator.pulse,
        immediately: true
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
      { $sort: { 'datafeeds.timestamp': -1 } },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          latestDataFeed: { $first: '$datafeeds' }
        }
      },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$root', { latestDataFeed: '$latestDataFeed' }] } } },
      { $sort: { name: 1 } },
      { $skip: (page - 1) * TAKE_SIZE },
      { $limit: TAKE_SIZE }
    ]).exec();

    const lastPage = Math.ceil(total / TAKE_SIZE); // Calculate the last page for pagination

    return { total, lastPage, data, limit: TAKE_SIZE }; // Return paginated result
  }

  async getAggregator(address: string): Promise<Aggregator | null> {
    return this.aggregatorModel.findOne({ address }).exec();
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
  async getAggregatorDatafeeds(aggregator: string, page: number, interval: string): Promise<Paged<Datafeed[]>> {
    // Define interval logic
    const intervalMap = {
      '1m': 24 * 60 * 60 * 1000, // 1 day in milliseconds
      '1w': 7 * 60 * 60 * 1000,  // 7 hours in milliseconds
      '1d': 1 * 60 * 60 * 1000   // 1 hour in milliseconds
    };

    const bucketSize = intervalMap[interval];

    const data = await this.datafeedModel.aggregate([
      { $match: { aggregator } }, // Match specific aggregator
      {
        $sort: { timestamp: -1 } // Sort by timestamp descending
      },
      {
        $group: {
          _id: {
            $toLong: {
              $subtract: [
                { $toLong: "$timestamp" },
                { $mod: [{ $toLong: "$timestamp" }, bucketSize] }
              ]
            }
          },
          latestDatafeed: { $first: "$$ROOT" } // Select the latest datafeed in each bucket
        }
      },
      {
        $replaceRoot: { newRoot: "$latestDatafeed" } // Replace group structure with the latest datafeed
      },
      {
        $sort: { timestamp: -1 } // Sort final data by timestamp descending
      },
      {
        $skip: (page - 1) * bucketSize // Pagination skip
      },
      {
        $limit: bucketSize // Fetch only bucketSize records
      }
    ]);

    // Total documents count for the pagination
    const total = await this.datafeedModel.countDocuments({ aggregator });
    const lastPage = Math.ceil(total / bucketSize);

    return { total, lastPage, data, limit: bucketSize };
  }

  async requestVRF(jobData: VRFJobData): Promise<void> {
    const jobId = `vrf-job-${jobData.requestId}`;

    const jobOptions: JobsOptions = {
      jobId // Unique job ID to avoid duplicate jobs
    };

    this.vrfRequestQueue.add(jobId, jobData,
      jobOptions
    );
  }

  async requestAggregator(jobData: AggregatorJobData): Promise<void> {
    const jobId = `aggregator-job-${jobData.queryId}`;

    const jobOptions: JobsOptions = {
      jobId// Unique job ID to avoid duplicate jobs
    };

    this.aggregatorRequestQueue.add(jobId, jobData,
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
          every: aggregator.pulse,
          immediately: true
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

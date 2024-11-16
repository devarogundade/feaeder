/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { Aggregator } from 'src/database/schemas/aggregator';
import { Datafeed } from 'src/database/schemas/datafeed';

// The ConsumerRequestWorker class processes jobs related to data aggregation and blockchain updates
@Processor('ConsumerRequestWorker')
export class ConsumerRequestWorker extends WorkerHost {

    constructor(
        @InjectModel(Aggregator.name) private aggregatorModel: Model<Aggregator>,
        @InjectModel(Datafeed.name) private datafeedModel: Model<Datafeed>,
    ) {
        super();
    }

    // The main job processing function
    async process(job: Job<any, any, string>): Promise<any> {

    }
    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}

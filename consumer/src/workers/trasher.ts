/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bullmq";
import { Model } from "mongoose";
import { Datafeed } from "src/database/schemas/datafeed";

@Processor('TrasherWorker')
export class TrasherWorker extends WorkerHost {
    constructor(
        @InjectModel(Datafeed.name) private datafeedModel: Model<Datafeed>,
    ) {
        super();
    }

    async process(_: Job<any, any, string>): Promise<any> {
        // 31 days in milliseconds
        const cutoffTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000;

        // Remove documents with timestamp older than cutoff
        const result = await this.datafeedModel.deleteMany({
            timestamp: { $lt: cutoffTimestamp },
        });

        console.log(`${result.deletedCount} documents deleted.`);
    }
}
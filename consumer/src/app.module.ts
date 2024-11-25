/* eslint-disable prettier/prettier */

// Import necessary modules and dependencies for NestJS application
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsumerWorker } from './workers/consumer';
import { ConsumerRequestWorker } from './workers/consumer-request';
import { VRFWorker } from './workers/vrf';
import { Datafeed, DatafeedSchema } from './database/schemas/datafeed';
import { Aggregator, AggregatorSchema } from './database/schemas/aggregator';
import { TrasherWorker } from './workers/trasher';
@Module({
  imports: [
    // Load environment variables from .env file for configuration
    ConfigModule.forRoot(),

    // Configure BullMQ for task queue processing, connecting to Redis server
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      }
    }),

    // Register 'ConsumerWorker' queue for managing tasks related to consumers
    BullModule.registerQueue({ name: 'ConsumerWorker' }),
    BullModule.registerQueue({ name: 'ConsumerRequestWorker' }),
    BullModule.registerQueue({ name: 'VRFWorker' }),
    BullModule.registerQueue({ name: 'TrasherWorker' }),

    // Configure Mongoose to connect to MongoDB using URL from environment variables
    MongooseModule.forRoot(process.env.MONGO_URL),

    // Define Mongoose schemas for Datafeed and Aggregator models
    MongooseModule.forFeature([
      { name: Datafeed.name, schema: DatafeedSchema }, // Datafeed schema registration
      { name: Aggregator.name, schema: AggregatorSchema } // Aggregator schema registration
    ])
  ],

  // Define controllers used in this module
  controllers: [AppController],

  // Define service and worker providers used in this module
  providers: [
    AppService,
    ConsumerWorker,
    ConsumerRequestWorker,
    VRFWorker,
    TrasherWorker
  ],
})

export class AppModule { }

/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Aggregator } from './aggregator';

export type DatafeedDocument = HydratedDocument<Datafeed>;

@Schema()
export class Datafeed {
    @Prop({ required: true, type: Types.ObjectId, ref: Aggregator.name })
    aggregator: Aggregator | string;

    @Prop({ required: true, type: Types.Array })
    answers: string[];

    @Prop({ required: true })
    timestamp: number;
}

export const DatafeedSchema = SchemaFactory.createForClass(Datafeed);
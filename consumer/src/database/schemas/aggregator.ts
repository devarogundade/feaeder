/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AggregatorDocument = HydratedDocument<Aggregator>;

@Schema()
export class Aggregator {
    @Prop({ required: true, unique: true })
    address: `ct_${string}`;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true })
    deviationThreshold: number;

    @Prop({ required: true })
    heartbeat: number;

    @Prop({ required: true })
    pulse: number;

    @Prop({ required: true })
    updatedAt: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, type: Object })
    sources: { [key: string]: string[]; };

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    category: string;

    @Prop({ required: true })
    version: number;

    @Prop({ required: true })
    decimals: number;
}

export const AggregatorSchema = SchemaFactory.createForClass(Aggregator);
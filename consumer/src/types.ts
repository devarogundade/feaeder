/* eslint-disable prettier/prettier */

import BigNumber from "bignumber.js";
import { Aggregator } from "./database/schemas/aggregator";

export type FetchedAnswer = {
    aggregator: Aggregator;
    answers: BigNumber[];
    timestamp: number;
};

export type Paged<T> = {
    total: number,
    lastPage: number;
    data?: T;
    limit: number;
};

export interface DataSource {
    id: string;
    fetchData: (args: string[], decimals: number) => Promise<BigNumber>;
}

export interface VRFJobData {
    requestId: number;
    to: `ct_${string}`;
}

export interface AggregatorJobData {
    address: `ct_${string}`;
    queryId: string;
    question: AggregatorQuestionType;
}

export enum AggregatorQuestionType {
    PRICE
}
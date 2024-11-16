/* eslint-disable prettier/prettier */

import { Aggregator } from "./database/schemas/aggregator";

export type FetchedAnswer = {
    aggregator: Aggregator;
    answers: bigint[];
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
    fetchData: (tickers: string[], decimals: number) => Promise<bigint>;
}
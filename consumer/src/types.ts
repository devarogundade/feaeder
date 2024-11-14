/* eslint-disable prettier/prettier */

import { Aggregator } from "./database/schemas/aggregator";

export type FetchedAnswer = {
    aggregator: Aggregator;
    answers: string[];
    timestamp: number;
};

export type Paged<T> = {
    total: number,
    lastPage: number;
    data?: T;
    extra?: string;
};

export interface DataSource {
    id: string;
    fetchData: (tickers: string[], decimals: number) => Promise<string>;
}
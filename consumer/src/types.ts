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
    fetchData: (tickers: string[], decimals: number) => Promise<BigNumber>;
}

export interface VRFJobData {
    requestId: string,
    to: `ct_${string}`;
}
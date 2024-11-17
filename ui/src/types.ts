export type Paged<T> = {
    total: number,
    lastPage: number;
    data?: T;
    limit: number;
};

export type Interval = '1d' | '1w' | '1m';

export type Datafeed = {
    answers: string[];
    timestamp: number;
};

export type Aggregator = {
    address: `ct_${string}`;
    image: string;
    deviationThreshold: number;
    heartbeat: number;
    pulse: number;
    updatedAt: number;
    name: string;
    sources: { [key: string]: string[]; };
    description: string;
    category: string;
    version: number;
    decimals: number;
    latestDataFeed: Datafeed;
};

export type FeedsCategory = 'crypto' | 'fiat' | 'commodity' | 'rwa';

export enum FeedsType {
    Push = 0,
    Oracle = 1
}
export interface Subscription {
    id: number,
    version: number;
    balance: number;
    spent: number;
    creator: `ak_${string}`,
    consumers: string[];
    timestamp: bigint;
}
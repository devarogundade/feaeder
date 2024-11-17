export type Paged<T> = {
    total: number,
    lastPage: number;
    data?: T;
    limit: number;
};

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

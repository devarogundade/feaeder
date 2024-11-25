/* eslint-disable prettier/prettier */

import BigNumber from "bignumber.js";
import { CMC } from "src/sources/cmc";
import { BirdEye } from "src/sources/birdeye";
import { Chainlink } from "src/sources/chainlink";
import { CoinGecko } from "src/sources/coingecko";
import { Aggregator } from "src/database/schemas/aggregator";

export class SourceBuilder {
    private cmc: CMC;
    private birdeye: BirdEye;
    private chainlink: Chainlink;
    private coinGecko: CoinGecko;

    constructor() {
        this.cmc = new CMC();
        this.birdeye = new BirdEye();
        this.chainlink = new Chainlink();
        this.coinGecko = new CoinGecko();
    }

    build(aggregator: Aggregator): Promise<BigNumber>[] {
        const sources: Promise<BigNumber>[] = [];

        // If CoinMarketCap data is available for the aggregator, fetch the data
        if (aggregator.sources[this.cmc.id]) {
            sources.push(
                this.cmc.fetchData(
                    aggregator.sources[this.cmc.id],
                    aggregator.decimals
                )
            );
        }

        // If CoinGecko data is available for the aggregator, fetch the data
        if (aggregator.sources[this.coinGecko.id]) {
            sources.push(
                this.coinGecko.fetchData(
                    aggregator.sources[this.coinGecko.id],
                    aggregator.decimals
                )
            );
        }

        // If Chainlink data is available for the aggregator, fetch the data
        if (aggregator.sources[this.chainlink.id]) {
            sources.push(
                this.chainlink.fetchData(
                    aggregator.sources[this.chainlink.id],
                    aggregator.decimals
                )
            );
        }

        // If BirdEye data is available for the aggregator, fetch the data
        if (aggregator.sources[this.birdeye.id]) {
            sources.push(
                this.birdeye.fetchData(
                    aggregator.sources[this.birdeye.id],
                    aggregator.decimals
                )
            );
        }

        return sources;
    }
}
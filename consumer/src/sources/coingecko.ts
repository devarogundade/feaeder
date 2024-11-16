/* eslint-disable prettier/prettier */

// Import necessary modules and dependencies
import Converter from 'src/utils/converter';
import { DataSource } from './../types';

// CoinGecko class implements the DataSource interface for fetching cryptocurrency prices
export class CoinGecko implements DataSource {
    id = 'coingecko'; // Unique identifier for this data source implementation

    /**
     * Fetches the cryptocurrency price from the CoinGecko API.
     *
     * @param tickers - Array containing the cryptocurrency and currency symbols (e.g., ['bitcoin', 'usd']).
     * @param decimals - Number of decimal places to adjust the price data for formatting.
     * @returns Promise<string> - Formatted price of the specified cryptocurrency.
     * @throws Error - If price data cannot be fetched from CoinGecko.
     */
    async fetchData(tickers: string[], decimals: number): Promise<bigint> {
        // Construct the API URL with the specified cryptocurrency and currency
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tickers[0]}&vs_currencies=${tickers[1]}`;

        // Include API key in headers if required by CoinGecko
        const headers = {
            'x-cg-demo-api-key': process.env.CG_AP_KEY
        };

        // Fetch data from CoinGecko API
        const response = await fetch(url, { headers });
        const data = await response.json();

        // Check for valid response structure and extract the price data
        if (data && data[tickers[0]] && data[tickers[0]][tickers[1]]) {
            // Convert and format the price data according to the specified decimal places
            return Converter.up(data[tickers[0]][tickers[1]].toString(), decimals);
        } else {
            // Throw an error if price data cannot be retrieved
            throw new Error('Failed to fetch price from CoinGecko');
        }
    }
}

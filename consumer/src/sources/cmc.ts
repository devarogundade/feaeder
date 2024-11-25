/* eslint-disable prettier/prettier */

// Import necessary modules and interfaces
import Converter from 'src/utils/converter';
import { DataSource } from './../types';
import BigNumber from 'bignumber.js';

// CMC class implements the DataSource interface to fetch cryptocurrency prices from CoinMarketCap
export class CMC implements DataSource {
    id = 'cmc'; // Unique identifier for the CoinMarketCap data source

    /**
     * Fetches cryptocurrency price data from the CoinMarketCap API.
     *
     * @param args - Array containing the symbols for the cryptocurrency and the currency (e.g., ['BTC', 'USD']).
     * @param decimals - Number of decimal places to adjust the price for consistent formatting.
     * @returns Promise<string> - The formatted price as a string.
     * @throws Error - If the price data cannot be fetched from CoinMarketCap.
     */
    async fetchData(args: string[], decimals: number): Promise<BigNumber> {
        // Construct the API endpoint URL with the specified cryptocurrency and currency symbols
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${args[0]}&convert=${args[1]}`;

        // Configure the request headers to include the CoinMarketCap API key
        const headers = {
            'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        };

        // Send a GET request to the CoinMarketCap API
        const response = await fetch(url, { headers });
        const data = await response.json();

        // Check if the response contains valid price data for the specified cryptocurrency and currency
        if (data && data.data && data.data[args[0]] && data.data[args[0]].quote[args[1]]) {
            // Convert and format the retrieved price according to the specified decimal places
            return Converter.up(new BigNumber(data.data[args[0]].quote[args[1]].price), decimals);
        } else {
            // Throw an error if the price data is not found in the response
            throw new Error('Failed to fetch price from CoinMarketCap');
        }
    }
}

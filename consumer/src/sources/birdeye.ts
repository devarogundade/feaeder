/* eslint-disable prettier/prettier */

// Import necessary modules and interfaces
import { DataSource } from './../types';
import Converter from 'src/utils/converter';
import BigNumber from 'bignumber.js';

export class BirdEye implements DataSource {
    id = 'birdeye';

    async fetchData(args: string[], decimals: number): Promise<BigNumber> {
        // Construct the API endpoint URL with the specified cryptocurrency and currency symbols
        const url = `https://public-api.birdeye.so/defi/price?address=${args[1]}`;

        // Include API key in headers if required by BirdEye
        const headers = {
            'accept': 'application/json',
            'x-chain': args[0],
            'X-API-KEY': process.env.BE_API_KEY
        };

        // Fetch data from BirdEye API
        const response = await fetch(url, { headers });
        const data = await response.json();

        // Check for valid response structure and extract the price data
        if (data && data.success && data.data && data.data.value) {
            // Convert and format the price data according to the specified decimal places
            return Converter.up(new BigNumber(data.data.value), decimals);
        } else {
            // Throw an error if price data cannot be retrieved
            throw new Error('Failed to fetch price from BirdEye');
        }
    }
}

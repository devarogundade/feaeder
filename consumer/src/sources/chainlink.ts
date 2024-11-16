/* eslint-disable prettier/prettier */

// Import necessary modules and interfaces
import Web3 from 'web3';
import { DataSource } from './../types';
import Converter from 'src/utils/converter';
import { abi } from './../abis/aggregatorv3';

export class Chainlink implements DataSource {
    id = 'chainlink';

    async fetchData(args: string[], decimals: number): Promise<bigint> {
        const web3 = new Web3(args[0]);
        const contract = new web3.eth.Contract(abi as any, args[1]);

        try {
            // Fetch latest price data from Chainlink Aggregator
            const latestRoundData = await contract.methods.latestRoundData().call();
            const decimals1 = await contract.methods.decimals().call();

            console.log('latestRoundData', latestRoundData);
            console.log('decimals1', decimals1);

            const price = latestRoundData.answer;

            console.log(Converter.convert(price, decimals, decimals1));

            return Converter.convert(price, decimals, decimals1);
        } catch (error) {
            console.error('Error fetching data from Chainlink:', error);
            throw new Error('Failed to fetch data from Chainlink Aggregator');
        }
    }
}

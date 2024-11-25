/* eslint-disable prettier/prettier */

// Import necessary modules and interfaces
import Web3 from 'web3';
import { DataSource } from './../types';
import Converter from 'src/utils/converter';
import { abi } from './../abis/aggregatorv3';
import BigNumber from 'bignumber.js';
export class Chainlink implements DataSource {
    id = 'chainlink';

    async fetchData(args: string[], decimals: number): Promise<BigNumber> {
        const web3 = new Web3(args[0]);
        const contract = new web3.eth.Contract(abi as any, args[1]);

        const latestRoundData = await contract.methods.latestRoundData().call();
        const decimals1 = await contract.methods.decimals().call();

        const answer = latestRoundData.answer;

        return Converter.convert(new BigNumber(answer), new BigNumber(decimals), decimals1);
    }
}

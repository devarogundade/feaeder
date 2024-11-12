import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

const AGGREGATOR_CONTRACT_SOURCE = './contracts/Aggregator.aes';
const AGGREGATOR_EXAMPLE_CONTRACT_SOURCE = './contracts/examples/AggregatorExample.aes';

const BTC_VERSION = 1;
const BTC_DECIMALS = 9;
const BTC_DESCRIPTION = "BTC/USDT on-chain price aggregator.";
const BTC_TOLERANCE = 5; // 5 percentage

const AE_VERSION = 1;
const AE_DECIMALS = 9;
const AE_DESCRIPTION = "AE/USDT on-chain price aggregator.";
const AE_TOLERANCE = 7; // 7 percentage

describe('Bitcoin/Ae Aggregator Example', () => {
    let aeSdk: AeSdk | null = null;
    let btcAggContract: ContractWithMethods<ContractMethodsBase> | null = null;
    let aeAggContract: ContractWithMethods<ContractMethodsBase> | null = null;
    let exContract: ContractWithMethods<ContractMethodsBase> | null = null;

    before(async () => {
        aeSdk = new AeSdk({
            onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
            accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
            nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
        });

        aeSdk.selectNode('testnet');

        // a filesystem object must be passed to the compiler if the contract uses custom includes
        const aggFileSystem = utils.getFilesystem(AGGREGATOR_CONTRACT_SOURCE);
        const exFileSystem = utils.getFilesystem(AGGREGATOR_EXAMPLE_CONTRACT_SOURCE);

        // get content of contracts
        const aggSourceCode = utils.getContractContent(AGGREGATOR_CONTRACT_SOURCE);
        const exSourceCode = utils.getContractContent(AGGREGATOR_EXAMPLE_CONTRACT_SOURCE);

        // initialize the contracts instance
        btcAggContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: aggSourceCode, fileSystem: aggFileSystem, verify: true });
        aeAggContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: aggSourceCode, fileSystem: aggFileSystem, verify: true });
        exContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: exSourceCode, fileSystem: exFileSystem, verify: true });

        fs.mkdirSync('./acis', { recursive: true });
        fs.writeFileSync('./acis/aggregator.json', JSON.stringify(btcAggContract._aci));
        fs.writeFileSync('./acis/aggregator_example.json', JSON.stringify(exContract._aci));

        const btcArgs = [BTC_DECIMALS, BTC_DESCRIPTION, BTC_VERSION, BTC_TOLERANCE] as any;
        const btcTx = await btcAggContract.$deploy(btcArgs);

        const aeArgs = [AE_DECIMALS, AE_DESCRIPTION, AE_VERSION, AE_TOLERANCE] as any;
        const aeTx = await aeAggContract.$deploy(aeArgs);

        console.log('Deployed contract btc agg with id: ' + btcTx.result?.contractId);
        console.log('Deployed contract ae agg with id: ' + aeTx.result?.contractId);

        const exArgs = [btcTx.result?.contractId, aeTx.result?.contractId] as any;
        const exTx = await exContract.$deploy(exArgs);

        if (!exTx.result || !exTx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + exTx.result?.contractId);

        fs.mkdirSync('./addresses', { recursive: true });
        fs.writeFileSync('./addresses/aggregator_example.txt', exTx.result?.contractId);
    });

    it('Aggregator: add price btc data', async () => {
        assert.notEqual(btcAggContract, null);
        assert.notEqual(aeSdk, null);

        if (!btcAggContract || !aeSdk) return;

        const prices = [82021800000000, 82022400000000, 82022300000000];
        const timestamp = Math.ceil(Date.now() / 1000);
        await btcAggContract.$call('add_round_data', [prices, timestamp]);

        const { decodedResult } = await btcAggContract.$call('latest_round_data', []);
        assert.notEqual(decodedResult, 0);
        console.log('lastest data btc: ', decodedResult);
    });

    it('Aggregator: add price ae data', async () => {
        assert.notEqual(aeAggContract, null);
        assert.notEqual(aeSdk, null);

        if (!aeAggContract || !aeSdk) return;

        const prices = [23320030, 23322500, 23324100];
        const timestamp = Math.ceil(Date.now() / 1000);
        await aeAggContract.$call('add_round_data', [prices, timestamp]);

        const { decodedResult } = await aeAggContract.$call('latest_round_data', []);
        assert.notEqual(decodedResult, 0);
        console.log('lastest data ae: ', decodedResult);
    });

    it('Aggregator Example: get btc/ae price', async () => {
        assert.notEqual(btcAggContract, null);
        assert.notEqual(aeAggContract, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);

        if (!btcAggContract || !aeAggContract || !exContract || !aeSdk) return;

        const amount = 1_500_000;
        const { decodedResult } = await exContract.$call('get_btc_slash_ae_price', [amount]);
        assert.notEqual(decodedResult, 0);

        console.log('amount: ', decodedResult);
    });

    let query: string | null = null;

    it('Aggregator Example: ask ae all time high', async () => {
        assert.notEqual(btcAggContract, null);
        assert.notEqual(aeAggContract, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);

        if (!btcAggContract || !aeAggContract || !exContract || !aeSdk) return;

        const now = Math.ceil(Date.now() / 1000);
        const last24h = now - (24 * 60 * 60);
        const question = JSON.stringify({ type: 'ATH', from: last24h, to: now });
        const options = { amount: 10 };
        const { decodedResult } = await exContract.$call('ask_ae_usdt_all_time_high', [question], options);
        assert.notEqual(decodedResult, undefined);

        console.log('query: ', decodedResult);
        query = decodedResult;
    });

    it('Aggregator Example: respond ae all time high', async () => {
        assert.notEqual(btcAggContract, null);
        assert.notEqual(aeAggContract, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);
        assert.notEqual(query, null);

        if (!btcAggContract || !aeAggContract || !exContract || !aeSdk || !query) return;

        const prices = [33320030, 33322500, 33324100];
        const { decodedResult } = await aeAggContract.$call('respond', [query, prices]);
        assert.notEqual(decodedResult, undefined);

        console.log('reply: ', decodedResult);
    });

    it('Aggregator Example: get response ae all time high', async () => {
        assert.notEqual(btcAggContract, null);
        assert.notEqual(aeAggContract, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);
        assert.notEqual(query, null);

        if (!btcAggContract || !aeAggContract || !exContract || !aeSdk || !query) return;

        const { decodedResult } = await exContract.$call('ae_usdt_all_time_high', [query]);
        assert.notEqual(decodedResult, undefined);

        console.log('response: ', decodedResult);
    });
});

import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

const FEAEDER_CONTRACT_SOURCE = './contracts/Feaeder.aes';
const AGGREGATOR_CONTRACT_SOURCE = './contracts/Aggregator.aes';

const VERSION = 1;
const DECIMALS = 9;
const DESCRIPTION = "BTC/USD on-chain price aggregator.";
const TOLERANCE = 5; // 5 percentage
const QUERY_FEE = 1_000_000_000_000_000;

describe('Bitcoin Usd Aggregator', () => {
    let aeSdk: AeSdk | null = null;
    let contract: ContractWithMethods<ContractMethodsBase> | null = null;
    let fdContract: ContractWithMethods<ContractMethodsBase> | null = null;

    before(async () => {
        aeSdk = new AeSdk({
            onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
            accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
            nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
        });

        aeSdk.selectNode('testnet');

        // a filesystem object must be passed to the compiler if the contract uses custom includes
        const fileSystem = utils.getFilesystem(AGGREGATOR_CONTRACT_SOURCE);
        const fdFileSystem = utils.getFilesystem(FEAEDER_CONTRACT_SOURCE);

        // get content of contract
        const sourceCode = utils.getContractContent(AGGREGATOR_CONTRACT_SOURCE);
        const fdSourceCode = utils.getContractContent(FEAEDER_CONTRACT_SOURCE);

        // initialize the contract instance
        contract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode, fileSystem, verify: true });
        fdContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: fdSourceCode, fileSystem: fdFileSystem, verify: true });

        const fdArgs = [VERSION] as any;
        const fdTx = await fdContract.$deploy(fdArgs);

        const feaeder = fdTx.result?.contractId;

        const args = [DECIMALS, DESCRIPTION, VERSION, TOLERANCE, feaeder, QUERY_FEE] as any;
        const tx = await contract.$deploy(args);

        if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + tx.result?.contractId);

        const txAdd = await fdContract.$call('add_allowed_contract', [tx.result?.contractId.replace('ct', 'ak')]);

        console.log(txAdd);
    });

    it('Aggregator: add price data', async () => {
        assert.notEqual(contract, null);
        assert.notEqual(aeSdk, null);

        if (!contract || !aeSdk) return;

        const prices = [82021800000000, 82022400000000, 82022300000000];
        const timestamp = Math.ceil(Date.now() / 1000);
        await contract.$call('add_round_data', [prices, timestamp]);

        const { decodedResult } = await contract.$call('latest_round_data', []);
        assert.notEqual(decodedResult, 0);
        console.log('lastest data: ', decodedResult);
    });
});

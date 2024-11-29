import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it, afterEach } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

const AGGREGATOR_EXAMPLE_CONTRACT_SOURCE = './contracts/examples/AggregatorExample.aes';

describe('Bitcoin/Ae Aggregator Example', () => {
    let aeSdk: AeSdk | null = null;
    let exContract: ContractWithMethods<ContractMethodsBase> | null = null;
    let subscriptionId: number = 1;

    let address: `ct_${string}` = 'ct_DgVUCkr2MkhdhMwkcLWEkWdEiCKR1eeqELuJPTYybz7MrSJAX';

    before(async () => {
        aeSdk = new AeSdk({
            onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
            accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
            nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
        });

        aeSdk.selectNode('testnet');

        const fileSystem = utils.getFilesystem(AGGREGATOR_EXAMPLE_CONTRACT_SOURCE);

        // get content of contracts
        const sourceCode = utils.getContractContent(AGGREGATOR_EXAMPLE_CONTRACT_SOURCE);

        // initialize the contracts instance
        exContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode, fileSystem, address });
    });

    afterEach(async () => {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, 30_000);
        });
    });

    let query: string | null = null;

    it('Aggregator Example: ask ae price', async () => {
        assert.notEqual(subscriptionId, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);

        if (!exContract || !aeSdk) return;

        const question = 'PRICE';
        const options = { omitUnknown: true, txEvents: true };

        const { decodedResult } = await exContract.$call(
            'ask_ae_price',
            [subscriptionId, question],
            options
        );

        assert.notEqual(decodedResult, undefined);

        console.log('query: ', decodedResult);
        query = decodedResult;
    });


    it('Aggregator Example: get response ae price', async () => {
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);
        assert.notEqual(query, null);

        if (!exContract || !aeSdk || !query) return;

        const { decodedResult } = await exContract.$call('ae_usd_price', [query]);

        console.log('response: ', decodedResult);
    });
});

import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it, afterEach } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

const FEAEDER_CONTRACT_SOURCE = './contracts/Feaeder.aes';
const VRF_CONTRACT_SOURCE = './contracts/VRF.aes';
const VRF_EXAMPLE_CONTRACT_SOURCE = './contracts/examples/VRFExample.aes';

describe('VRF Example', () => {
    let aeSdk: AeSdk | null = null;
    let vrfContract: ContractWithMethods<ContractMethodsBase> | null = null;
    let exContract: ContractWithMethods<ContractMethodsBase> | null = null;
    let fdContract: ContractWithMethods<ContractMethodsBase> | null = null;

    const QUERY_FEE = 1_000_000_000_000_000;
    const VERSION = 1;

    before(async () => {
        aeSdk = new AeSdk({
            onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
            accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
            nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
        });

        aeSdk.selectNode('testnet');

        // a filesystem object must be passed to the compiler if the contract uses custom includes
        const vrfFileSystem = utils.getFilesystem(VRF_CONTRACT_SOURCE);
        const exFileSystem = utils.getFilesystem(VRF_EXAMPLE_CONTRACT_SOURCE);
        const fdFileSystem = utils.getFilesystem(FEAEDER_CONTRACT_SOURCE);

        // get content of contracts
        const vrfSourceCode = utils.getContractContent(VRF_CONTRACT_SOURCE);
        const exSourceCode = utils.getContractContent(VRF_EXAMPLE_CONTRACT_SOURCE);
        const fdSourceCode = utils.getContractContent(FEAEDER_CONTRACT_SOURCE);

        // initialize the contracts instance
        vrfContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: vrfSourceCode, fileSystem: vrfFileSystem, verify: true });
        exContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: exSourceCode, fileSystem: exFileSystem, verify: true });
        fdContract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: fdSourceCode, fileSystem: fdFileSystem, verify: true });

        const fdArgs = [VERSION] as any;
        const fdTx = await fdContract.$deploy(fdArgs);

        const feaeder = fdTx.result?.contractId;

        const vrfAgrs = [feaeder, QUERY_FEE] as any;
        const vrfTx = await vrfContract.$deploy(vrfAgrs);

        console.log('Deployed contract vrf with id: ' + vrfTx.result?.contractId);

        const exArgs = [vrfTx.result?.contractId] as any;
        const exTx = await exContract.$deploy(exArgs);

        if (!exTx.result || !exTx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + exTx.result?.contractId);

        const txAdd = await fdContract.$call('add_allowed_contract', [vrfTx.result?.contractId.replace('ct', 'ak')]);
        console.log(txAdd.hash);
    });

    afterEach(async () => {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, 1000);
        });
    });

    let subscriptionId: number | null = null;

    it('Feaeder: create subscription', async () => {
        assert.notEqual(fdContract, null);
        assert.notEqual(aeSdk, null);

        if (!fdContract || !aeSdk) return;

        await fdContract.$call('create_subscription', [], { omitUnknown: true, txEvents: true });

        const { decodedResult } = await fdContract.$call('get_owner_subscription', [process.env.PUBLIC_KEY]);

        console.log(decodedResult);

        assert.equal(decodedResult.balance, 0);
        subscriptionId = decodedResult.id;
    });

    it('Feaeder: top up subscription', async () => {
        assert.notEqual(fdContract, null);
        assert.notEqual(aeSdk, null);

        if (!fdContract || !aeSdk) return;

        const options = { amount: 1_000_000_000_000_000, omitUnknown: true, txEvents: true };

        await fdContract.$call('topup_subscrption', [], options);

        const { decodedResult } = await fdContract.$call('get_owner_subscription', [process.env.PUBLIC_KEY]);

        assert.equal(decodedResult.balance, 1_000_000_000_000_000);
    });

    it('Feaeder: add consumer', async () => {
        assert.notEqual(fdContract, null);
        assert.notEqual(aeSdk, null);

        if (!fdContract || !aeSdk) return;

        const options = { omitUnknown: true, txEvents: true };

        await fdContract.$call('add_consumer', [exContract?.$options.address?.replace('ct', 'ak')], options);
    });

    let requestId: number | null = null;

    it('Example: pick winner', async () => {
        assert.notEqual(subscriptionId, null);
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);

        if (!exContract || !aeSdk || !subscriptionId) return;

        const options = { omitUnknown: true, txEvents: true };

        const { decodedResult } = await exContract.$call('pick_winner', [subscriptionId], options);

        console.log('requestId: ', decodedResult);
        requestId = decodedResult;
    });

    it('VRF: fulfill random_number', async () => {
        assert.notEqual(vrfContract, null);
        assert.notEqual(requestId, null);
        assert.notEqual(aeSdk, null);

        if (!vrfContract || !aeSdk || !requestId) return;

        const options = { omitUnknown: true, txEvents: true };

        await vrfContract.$call(
            'fulfill_random_number',
            [
                requestId,
                exContract?.$options.address,
                Number(Math.random() * 10).toFixed(0)
            ],
            options
        );
    });

    it('Example: get state', async () => {
        assert.notEqual(exContract, null);
        assert.notEqual(aeSdk, null);

        if (!exContract || !aeSdk) return;

        const options = { omitUnknown: true, txEvents: true };

        const { decodedResult } = await exContract.$call('get_state', [], options);

        console.log(decodedResult);
    });
});
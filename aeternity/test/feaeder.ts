import { assert } from 'chai';
import dotenv from 'dotenv';
import { describe, before, it } from 'node:test';
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

const FEAEDER_CONTRACT_SOURCE = './contracts/Feaeder.aes';

const VERSION = 1;

describe('Feaeder', () => {
  let aeSdk: AeSdk | null = null;
  let contract: ContractWithMethods<ContractMethodsBase> | null = null;

  before(async () => {
    aeSdk = new AeSdk({
      onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
      accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
      nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    aeSdk.selectNode('testnet');

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(FEAEDER_CONTRACT_SOURCE);

    // get content of contract
    const sourceCode = utils.getContractContent(FEAEDER_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode, fileSystem, verify: true });
    fs.mkdirSync('./acis', { recursive: true });
    fs.writeFileSync('./acis/feaeder.json', JSON.stringify(contract._aci));

    const args = [VERSION] as any;

    const tx = await contract.$deploy(args);

    if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
    else console.log('Deployed contract with id: ' + tx.result?.contractId);

    fs.mkdirSync('./addresses', { recursive: true });
    fs.writeFileSync('./addresses/feaeder.txt', tx.result?.contractId);
  });

  it('Feaeder: create subscription', async () => {
    assert.notEqual(contract, null);
    assert.notEqual(aeSdk, null);

    if (!contract || !aeSdk) return;

    await contract.$call('create_subscription', [], { omitUnknown: true, txEvents: true });

    const { decodedResult } = await contract.$call('get_owner_subscription', [process.env.PUBLIC_KEY]);

    assert.equal(decodedResult.balance, 0);
  });

  it('Feaeder: top up subscription', async () => {
    assert.notEqual(contract, null);
    assert.notEqual(aeSdk, null);

    if (!contract || !aeSdk) return;

    const options = { amount: 100, omitUnknown: true, txEvents: true };

    await contract.$call('topup_subscrption', [], options);

    const { decodedResult } = await contract.$call('get_owner_subscription', [process.env.PUBLIC_KEY]);

    assert.equal(decodedResult.balance, 100);
  });

});

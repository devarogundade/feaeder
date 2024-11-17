import dotenv from 'dotenv';
import { AeSdk, CompilerHttp, Contract, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
import ContractWithMethods, { ContractMethodsBase } from '@aeternity/aepp-sdk/es/contract/Contract';
import { resolve } from 'path';
dotenv.config();

const FEAEDER_CONTRACT_SOURCE = './contracts/Feaeder.aes';

const VERSION = 1;

const Feaeder = {
    run: async (): Promise<{ contractId: string, contract: ContractWithMethods<ContractMethodsBase>; }> => {
        const aeSdk = new AeSdk({
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
        const contract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode, fileSystem, verify: true });
        fs.mkdirSync('./acis', { recursive: true });
        fs.writeFileSync('./acis/feaeder.json', JSON.stringify(contract._aci));

        const args = [VERSION] as any;

        const tx = await contract.$deploy(args);

        if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + tx.result?.contractId);

        fs.mkdirSync('./addresses', { recursive: true });
        fs.writeFileSync('./addresses/feaeder.txt', tx.result?.contractId);

        return { contractId: tx.result?.contractId, contract };
    },

    addAllowedContract: async (contract: ContractWithMethods<ContractMethodsBase>, address: string): Promise<void> => {
        const txAdd = await contract.$call('add_allowed_contract', [address.replace('ct', 'ak')]);
        console.log('Added contract: ', txAdd.hash);

        await new Promise((resolve) => { setTimeout(resolve, 5000); });

        console.log('=====================================');
    }
};

export default Feaeder;
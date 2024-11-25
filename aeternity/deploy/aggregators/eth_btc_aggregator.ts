import dotenv from 'dotenv';
import { AeSdk, CompilerHttp, Contract, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
dotenv.config();

const AGGREGATOR_CONTRACT_SOURCE = '../aeternity/contracts/Aggregator.aes';

const VERSION = 1;
const DECIMALS = 18;
const DESCRIPTION = "ETH/BTC on-chain price aggregator.";
const TOLERANCE = 5; // 5 percentage
const QUERY_FEE = 1_000_000_000_000_000;

const EthBtcAg = {
    run: async (feaeder: string): Promise<string> => {
        const aeSdk = new AeSdk({
            onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
            accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
            nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
        });

        aeSdk.selectNode('testnet');

        // a filesystem object must be passed to the compiler if the contract uses custom includes
        const fileSystem = utils.getFilesystem(AGGREGATOR_CONTRACT_SOURCE);

        // get content of contract
        const sourceCode = utils.getContractContent(AGGREGATOR_CONTRACT_SOURCE);

        // initialize the contract instance
        const contract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode, fileSystem, verify: true });
        fs.mkdirSync('./acis', { recursive: true });
        fs.writeFileSync('./acis/aggregator.json', JSON.stringify(contract._aci, null, 2));

        const args = [DECIMALS, DESCRIPTION, VERSION, TOLERANCE, feaeder, QUERY_FEE] as any;
        const tx = await contract.$deploy(args);

        if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + tx.result?.contractId);

        fs.mkdirSync('./addresses', { recursive: true });
        fs.writeFileSync('./addresses/eth_btc_aggregator.txt', tx.result?.contractId);

        if (!tx.result?.contractId) throw new Error('Failed to deploy');

        const data = await fetch(`https://feaeder-consumer-h0e0gsemcpdrh5hr.canadacentral-01.azurewebsites.net/add-aggregator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: tx.result?.contractId,
                image: 'https://testnet.feaeder.xyz/images/eth.png',
                deviationThreshold: 0.5,
                pulse: 1_200_000,
                heartbeat: 5_000_000,
                updatedAt: Date.now(),
                name: "ETH / BTC",
                sources: {
                    cmc: ["ETH", "BTC"],
                    chainlink: ["https://eth.llamarpc.com", "0xAc559F25B1619171CbC396a50854A3240b6A4e99"]
                },
                description: DESCRIPTION,
                category: "crypto",
                version: VERSION,
                decimals: DECIMALS
            })
        });

        const response = await data.json();

        console.log('Aggregator ETH/BTC hosted: ' + JSON.stringify(response, null, 2));

        return tx.result?.contractId;
    }
};

export default EthBtcAg;
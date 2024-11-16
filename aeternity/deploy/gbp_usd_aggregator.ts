import dotenv from 'dotenv';
import { AeSdk, CompilerHttp, Contract, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
dotenv.config();

const AGGREGATOR_CONTRACT_SOURCE = './contracts/Aggregator.aes';

const VERSION = 1;
const DECIMALS = 18;
const DESCRIPTION = "GBP/USD on-chain price aggregator.";
const TOLERANCE = 5; // 5 percentage

const GbpUsdAg = {
    run: async (): Promise<void> => {
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
        fs.writeFileSync('./acis/aggregator.json', JSON.stringify(contract._aci));

        const args = [DECIMALS, DESCRIPTION, VERSION, TOLERANCE] as any;
        const tx = await contract.$deploy(args);

        if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + tx.result?.contractId);

        fs.mkdirSync('./addresses', { recursive: true });
        fs.writeFileSync('./addresses/gbp_usd_aggregator.txt', tx.result?.contractId);

        if (!tx.result?.contractId) return;

        const data = await fetch(`http://localhost:3000/add-aggregator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: tx.result?.contractId,
                image: 'https://feaeder.netlify.app/images/gbp.png',
                deviationThreshold: 0.15,
                pulse: 600_000,
                heartbeat: 1_200_000,
                updatedAt: Date.now(),
                name: "GBP / USD",
                sources: {
                    chainlink: ["https://eth.llamarpc.com", "0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5"]
                },
                description: DESCRIPTION,
                category: "fiat",
                version: VERSION,
                decimals: DECIMALS
            })
        });

        const response = await data.json();

        console.log('Aggregator GBP/USD hosted: ' + JSON.stringify(response, null, 2));
    }
};

export default GbpUsdAg;
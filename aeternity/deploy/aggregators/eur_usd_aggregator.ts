import dotenv from 'dotenv';
import { AeSdk, CompilerHttp, Contract, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
dotenv.config();

const AGGREGATOR_CONTRACT_SOURCE = '../aeternity/contracts/Aggregator.aes';

const VERSION = 1;
const DECIMALS = 18;
const DESCRIPTION = "EUR/USD on-chain price aggregator.";
const TOLERANCE = 5; // 5 percentage
const QUERY_FEE = 1_000_000_000_000_000;

const EurUsdAg = {
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
        fs.writeFileSync('./acis/aggregator.json', JSON.stringify(contract._aci));

        const args = [DECIMALS, DESCRIPTION, VERSION, TOLERANCE, feaeder, QUERY_FEE] as any;
        const tx = await contract.$deploy(args);

        if (!tx.result || !tx.result.contractId) throw new Error('Failed to deploy contract.');
        else console.log('Deployed contract with id: ' + tx.result?.contractId);

        fs.mkdirSync('./addresses', { recursive: true });
        fs.writeFileSync('./addresses/eur_usd_aggregator.txt', tx.result?.contractId);

        if (!tx.result?.contractId) throw new Error('Failed to deploy');

        const data = await fetch(`http://localhost:3000/add-aggregator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: tx.result?.contractId,
                image: 'https://testnet.feaeder.xyz/images/eur.png',
                deviationThreshold: 0.15,
                pulse: 600_000,
                heartbeat: 1_200_000,
                updatedAt: Date.now(),
                name: "EUR / USD",
                sources: {
                    chainlink: ["https://eth.llamarpc.com", "0xb49f677943BC038e9857d61E7d053CaA2C1734C1"]
                },
                description: DESCRIPTION,
                category: "fiat",
                version: VERSION,
                decimals: DECIMALS
            })
        });

        const response = await data.json();

        console.log('Aggregator EUR/USD hosted: ' + JSON.stringify(response, null, 2));

        return tx.result?.contractId;
    }
};

export default EurUsdAg;
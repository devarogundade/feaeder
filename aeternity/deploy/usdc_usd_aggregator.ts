import dotenv from 'dotenv';
import { AeSdk, CompilerHttp, Contract, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { utils } from '@aeternity/aeproject';
import fs from 'fs';
dotenv.config();

const AGGREGATOR_CONTRACT_SOURCE = './contracts/Aggregator.aes';

const VERSION = 1;
const DECIMALS = 18;
const DESCRIPTION = "USDC/USD on-chain price aggregator.";
const TOLERANCE = 5; // 5 percentage

const UsdcUsdAg = {
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
        fs.writeFileSync('./addresses/usdc_usd_aggregator.txt', tx.result?.contractId);

        if (!tx.result?.contractId) return;

        const data = await fetch(`http://localhost:3000/add-aggregator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: tx.result?.contractId,
                image: 'https://feaeder.netlify.app/images/usdc.png',
                deviationThreshold: 1,
                pulse: 200_000,
                heartbeat: 720_000,
                updatedAt: Date.now(),
                name: "USDC / USD",
                sources: {
                    chainlink: ["https://eth.llamarpc.com", "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"]
                },
                description: DESCRIPTION,
                category: "crypto",
                version: VERSION,
                decimals: DECIMALS
            })
        });

        const response = await data.json();

        console.log('Aggregator USDC/USD hosted: ' + JSON.stringify(response, null, 2));
    }
};

export default UsdcUsdAg;
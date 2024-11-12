import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
import { Aci } from '@aeternity/aepp-sdk/es/contract/compiler/Base';
dotenv.config();

const aci = fs.readFileSync('./../aeternity/acis/aggregator.json', 'utf8');
const contractId = fs.readFileSync('./../aeternity/addresses/btc_usdt_aggregator.txt', 'utf8') as `ct_${string}`;

let aeSdk: AeSdk | null = null;
let contract: ContractWithMethods<ContractMethodsBase> | null = null;

async function initNode() {
    aeSdk = new AeSdk({
        onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
        accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
        nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    aeSdk.selectNode('testnet');

    const aciObject = JSON.parse(aci) as Aci;

    contract = await Contract.initialize({ ...aeSdk.getContext(), aci: aciObject, address: contractId });
}

initNode();

async function fullfillQuery(query: string) {
    if (!contract) return;

    let question = await contract.$call('get_question', [query]);
    console.log(question.decodedResult);

    const pairs = question.decodedResult.split(",");

    axios.get(`https://api.feader.xyz/price_data?base=${pairs[0]}&quote=${pairs[1]}`).then(async (res) => {
        const prices = res.data.data.prices;
        let response = await contract?.$call('respond', [query, prices]);
        console.log(response);
    });
}

// websocket listening...
const WebSocketClient = require('websocket').client;

let processedIndex = -1;
const client = new WebSocketClient();

client.on('connectFailed', function (error: any) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection: any) {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error: any) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message: any) {
        if (message.type === 'utf8') {
            // console.log("Received: '" + message.utf8Data + "'");
            var dataToDecode = null;
            if (message.utf8Data !== "connected") {
                dataToDecode = JSON.parse(message.utf8Data);
                if (dataToDecode.payload) {
                    var hash = dataToDecode.payload.hash;
                    axios.get(`https://testnet.aeternity.io/v2/transactions/${hash}/info`).then((res) => {

                        if (res.data.call_info.log.length > 0) {
                            const queryIndex = res.data.call_info.log[0].topics[1];
                            if (processedIndex !== queryIndex) {
                                fullfillQuery(queryIndex);
                                processedIndex = queryIndex;
                            }
                        }
                    });
                }
            }
            else {
                console.log(message.utf8Data);
            }
        }
    });

    function sendSubscriptionRequest() {
        if (connection.connected) {
            connection.sendUTF(`{"op":"Subscribe",  "payload": "Object", "target":"${contractId}"}`);
        }
    }

    sendSubscriptionRequest();
});

client.connect(`wss://testnet.aeternal.io/websocket`);
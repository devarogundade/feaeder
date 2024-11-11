const WebSocketClient = require('websocket').client;
import { AeSdk, CompilerHttp, Contract, ContractMethodsBase, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import axios from 'axios';
import dotenv from 'dotenv';
import ContractWithMethods from '@aeternity/aepp-sdk/es/contract/Contract';
dotenv.config();

let processedIndex = 0;
const contractId = "ct_";

let aeSdk: AeSdk | null = null;
let contract: ContractWithMethods<ContractMethodsBase> | null = null;

async function initNode() {
    aeSdk = new AeSdk({
        onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
        accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],
        nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    aeSdk.selectNode('testnet');
    const aci = {};

    contract = await Contract.initialize({ ...aeSdk.getContext(), aci, address: contractId });
}

initNode();

async function fullFillQuery(queryIdx: number) {
    if (!contract) return;

    let aggQuery = await contract.$call('get_query_address', [queryIdx]);
    console.log(aggQuery.decodedResult);

    let question = await contract.$call('get_question', [aggQuery.decodedResult]);
    console.log(question.decodedResult);

    const pairs = question.decodedResult.split(",");

    axios.get(`https://api.feader.xyz/price_data?base=${pairs[0]}&quote=${pairs[1]}`).then(async (res) => {
        const prices = res.data.data.prices;
        let response = await contract?.$call('respond', [aggQuery.decodedResult, prices]);
        console.log(response);
    });
}

const websocketClient = new WebSocketClient();

websocketClient.on('connectFailed', function (error: any) {
    console.log('Connect Error: ' + error.toString());
});

websocketClient.on('connect', function (connection: any) {
    console.log('WebSocket Client Connected');

    connection.on('error', function (error: any) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function (message: any) {
        if (message.type === 'utf8') {
            let dataToDecode = null;
            if (message.utf8Data !== "connected") {
                dataToDecode = JSON.parse(message.utf8Data);
                if (dataToDecode.payload) {
                    const hash = dataToDecode.payload.hash;

                    axios.get(`https://testnet.aeternity.io/v2/transactions/${hash}/info`).then((res) => {
                        if (res.data.call_info.log.length > 0) {
                            const currentQueryIdx = res.data.call_info.log[0].topics[1];

                            if (processedIndex !== currentQueryIdx) {
                                fullFillQuery(currentQueryIdx);
                                processedIndex = currentQueryIdx;
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

websocketClient.connect(`wss://testnet.aeternal.io/websocket`);


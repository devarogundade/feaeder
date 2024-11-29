/* eslint-disable prettier/prettier */

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as WebSocketClient from 'websocket';
import { getSdk } from 'src/utils/aeternity';
import { Contract } from '@aeternity/aepp-sdk';
import { aci } from 'src/acis/aggregator';
import { JobsOptions, Queue } from 'bullmq';
import { AggregatorJobData, AggregatorQuestionType } from 'src/types';
import { InjectQueue } from '@nestjs/bullmq';
import axios from 'axios';

@Injectable()
export class OracleService implements OnModuleInit {
    private readonly WebSocketClient = new WebSocketClient.client();
    private address: `ct_${string}` = `ct_2hyocLTtFSicJnPxDCGWQi8pDNLeD5gTAWAPudz962d9UTh4N5`;

    constructor(
        @InjectQueue('ConsumerRequestWorker') private aggregatorRequestQueue: Queue,
    ) { }

    async onModuleInit() {
        console.log('test test');
        this.setupWebSocket();
    }

    private async fullFillQuery(queryIdx: number) {
        const aeSdk = getSdk();
        const contract = await Contract.initialize({ ...aeSdk.getContext(), address: this.address, aci });

        const queryId = await contract.$call('get_query_address', [queryIdx], {
            callStatic: true
        });
        console.log(queryId.decodedResult);

        const question = await contract.$call('get_question', [queryId.decodedResult], {
            callStatic: true
        });
        console.log(question.decodedResult);

        const jobId = `aggregator-job-${queryId.decodedResult}`;

        const jobOptions: JobsOptions = {
            jobId// Unique job ID to avoid duplicate jobs
        };

        const jobData: AggregatorJobData = {
            address: this.address,
            queryId: queryId.decodedResult,
            question: question.decodedResult as AggregatorQuestionType
        };

        this.aggregatorRequestQueue.add(jobId, jobData,
            jobOptions
        );
    }

    private setupWebSocket() {
        this.WebSocketClient.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error.toString());
        });

        this.WebSocketClient.on('connect', (connection) => {
            console.log('WebSocket Client Connected');
            connection.on('error', (error) => {
                console.log("Connection Error: " + error.toString());
            });
            connection.on('close', () => {
                console.log('echo-protocol Connection Closed');
            });

            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    let dataToDecode = null;
                    if (message.utf8Data !== "connected") {
                        dataToDecode = JSON.parse(message.utf8Data);
                        if (dataToDecode.payload) {
                            const hash = dataToDecode.payload.hash;
                            axios.get(`https://testnet.aeternity.io/v2/transactions/${hash}/info`)
                                .then((res) => {
                                    console.log('response', res);

                                    if (res.data.call_info.log.length > 0) {
                                        const queryIdx = res.data.call_info.log[0].topics[1];
                                        this.fullFillQuery(queryIdx);
                                    }
                                });
                        }
                    } else {
                        console.log(message.utf8Data);
                    }
                }
            });

            const sendSubscriptionRequest = () => {
                if (connection.connected) {
                    connection.sendUTF(`{"op":"Subscribe", "payload": "Object", "target":"${this.address}"}`, (err) => {
                        console.log('subscribe err', err);
                    });
                }
            };

            sendSubscriptionRequest();
        });

        this.WebSocketClient.connect(`wss://testnet.aeternity.io/mdw/v3/websocket`);
    }
}

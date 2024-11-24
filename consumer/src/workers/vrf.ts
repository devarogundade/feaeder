/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Contract } from '@aeternity/aepp-sdk';
import { getSdk } from 'src/utils/aeternity';
import { aci } from 'src/acis/ivrf';
import { DrandVRF } from 'src/utils/drand-vrf';
import { VRFJobData } from 'src/types';
import BigNumber from 'bignumber.js';
@Processor('VRFWorker')
export class VRFWorker extends WorkerHost {
    private address: `ct_${string}` = 'ct_';

    async process(job: Job<any, any, string>): Promise<any> {
        const { requestId, to } = job.data as VRFJobData;

        const drandVRF = new DrandVRF();
        const randomness = await drandVRF.fetchLatestBeacon();

        const randomWords = this.randomnessToInt(randomness);

        await this.respondVrf(requestId, randomWords, to);
    }

    private async respondVrf(
        requestId: number,
        randomWords: BigNumber,
        to: `ct_${string}`
    ): Promise<void> {
        const aeSdk = getSdk();

        // Initialize the contract for the given address
        const contract = await Contract.initialize({
            ...aeSdk.getContext(),
            address: this.address,
            aci
        });

        await contract.$call('fulfill_random_number', [requestId, to, randomWords]);
    }

    private randomnessToInt(randomness: string): BigNumber {
        // Hash the input string to generate a numeric seed
        let hash = 0;

        for (let i = 0; i < randomness.length; i++) {
            hash = randomness.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Map the hash to a number in the range 100000 to 999999
        const min = 100000;
        const max = 999999;
        const range = max - min + 1;

        const result = Math.abs(hash % range) + min; // Ensure it's within range
        return new BigNumber(result);
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}
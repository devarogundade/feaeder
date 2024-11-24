/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Contract } from '@aeternity/aepp-sdk';
import { getSdk } from 'src/utils/aeternity';
import { aci } from 'src/acis/ivrf';
import { DrandVRF } from 'src/utils/drand-vrf';
import { VRFJobData } from 'src/types';
@Processor('VRFWorker')
export class VRFWorker extends WorkerHost {
    private address: `ct_${string}` = 'ct_';

    async process(job: Job<any, any, string>): Promise<any> {
        const { requestId, to } = job.data as VRFJobData;

        const drandVRF = new DrandVRF();
        const randomWords = await drandVRF.fetchLatestBeacon();

        console.log('randomResult: ', randomWords);

        // await this.respondVrf(requestId, randomResult, to);
    }

    private async respondVrf(
        requestId: number,
        randomWords: string,
        to: `ct_${string}`
    ): Promise<void> {
        try {
            const aeSdk = getSdk();

            // Initialize the contract for the given address
            const contract = await Contract.initialize({
                ...aeSdk.getContext(),
                address: this.address,
                aci
            });

            // Call the `latest_round_data` method from the contract to get the latest round data
            await contract.$call('fulfill_random_number', [requestId, to, randomWords]);
        } catch (error) {
            console.log(error);
        }
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}
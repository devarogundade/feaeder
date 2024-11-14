/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Contract } from '@aeternity/aepp-sdk';
import { getSdk } from 'src/utils/aeternity';
import { aci } from 'src/acis/ivrf';

@Processor('VRFWorker')
export class VRFWorker extends WorkerHost {
    async process(job: Job<any, any, string>): Promise<any> {
        const { requestId, randomNumber, to } = job.data;

        await this.respondVrf(requestId, randomNumber, to);
    }

    private async respondVrf(requestId: number, randomNumber: number, address: `ct_${string}`): Promise<void> {
        try {
            const aeSdk = getSdk();
            // Initialize the contract for the given address
            const contract = await Contract.initialize({ ...aeSdk.getContext(), address, aci });

            // Call the `latest_round_data` method from the contract to get the latest round data
            await contract.$call('fulfill_random_number', [requestId, randomNumber]);
        } catch (error) {
            console.log(error);
        }
    }

    // This event handler is triggered when the worker job completes
    @OnWorkerEvent('completed')
    onCompleted() { }
}
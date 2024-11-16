/* eslint-disable prettier/prettier */

import {
    fetchBeacon,
    fetchBeaconByTime,
    HttpChainClient,
    FastestNodeClient,
    watch,
    HttpCachingChain,
    MultiBeaconNode
} from 'drand-client';

export class DrandVRF {
    private readonly chainHash: string;
    private readonly publicKey: string;
    private readonly options: any;
    private client: HttpChainClient | FastestNodeClient | null = null;

    constructor(
        nodeUrls: string[] = ['https://api.drand.sh', 'https://drand.cloudflare.com']
    ) {
        this.chainHash = process.env.VRF_CHAIN_HASH;
        this.publicKey = process.env.VRF_PUBLIC_KEY;;

        // Options for drand-client
        this.options = {
            disableBeaconVerification: false, // Ensure the beacon is verified
            noCache: false, // Enable caching for performance
            chainVerificationParams: { chainHash: this.chainHash, publicKey: this.publicKey }
        };

        // Initialize the client to use the fastest available node
        if (nodeUrls.length > 1) {
            const fastestNodeClient = new FastestNodeClient(nodeUrls, this.options);
            fastestNodeClient.start(); // Automatically optimize for the fastest node
            this.client = fastestNodeClient;
        } else {
            const chain = new HttpCachingChain(nodeUrls[0], this.options);
            this.client = new HttpChainClient(chain, this.options);
        }
    }

    /**
     * Fetch the latest randomness beacon
     * @returns {Promise<string>} The randomness value as a hex string
     */
    async fetchLatestBeacon(): Promise<string> {
        if (!this.client) {
            throw new Error('Drand client is not initialized');
        }

        const beacon = await fetchBeacon(this.client);
        return beacon.randomness;
    }

    /**
     * Fetch randomness for a specific timestamp
     * @param timestamp - The timestamp in milliseconds
     * @returns {Promise<string>} The randomness value as a hex string
     */
    async fetchBeaconByTimestamp(timestamp: number): Promise<string> {
        if (!this.client) {
            throw new Error('Drand client is not initialized');
        }

        const beacon = await fetchBeaconByTime(this.client, timestamp);
        return beacon.randomness;
    }

    /**
     * Watch for new randomness beacons
     * @param callback - A callback function to handle new beacons
     */
    async watchBeacons(callback: (randomness: string) => void): Promise<AbortController> {
        if (!this.client) {
            throw new Error('Drand client is not initialized');
        }

        const abortController = new AbortController();
        for await (const beacon of watch(this.client, abortController)) {
            callback(beacon.randomness);
        }

        return abortController;
    }

    /**
     * Stop watching randomness beacons
     */
    stopWatching(abortController: AbortController): void {
        abortController.abort();
    }

    /**
     * Fetch health information for MultiBeaconNode (optional)
     * @returns {Promise<{ status: number; current: number; expected: number }>} Health info
     */
    async fetchMultiBeaconHealth(): Promise<{ status: number; current: number; expected: number; }> {
        const multiBeaconNode = new MultiBeaconNode('https://api.drand.sh', this.options);
        return multiBeaconNode.health();
    }
}

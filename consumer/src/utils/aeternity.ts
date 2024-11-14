/* eslint-disable prettier/prettier */

// Import necessary modules from the Aeternity SDK
import { AeSdk, CompilerHttp, MemoryAccount, Node } from '@aeternity/aepp-sdk';

/**
 * Initializes and configures the Aeternity SDK instance.
 *
 * @returns {AeSdk} - Configured instance of AeSdk for interacting with the Aeternity blockchain.
 */
export function getSdk(): AeSdk {
    // Create a new AeSdk instance with the specified configuration
    const aeSdk = new AeSdk({
        // Set up the Aeternity smart contract compiler endpoint
        onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),

        // Load the account into memory using the secret key from environment variables
        accounts: [new MemoryAccount(process.env.SECRET_KEY as `sk_${string}`)],

        // Define the blockchain nodes available to the SDK, in this case, the Aeternity testnet node
        nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    // Select 'testnet' as the active node for transactions and queries
    aeSdk.selectNode('testnet');

    // Return the configured AeSdk instance
    return aeSdk;
}

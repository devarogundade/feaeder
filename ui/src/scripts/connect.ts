import {
    AeSdkAepp, CompilerHttp, Node, walletDetector, BrowserWindowMessageConnection, RpcConnectionDenyError,
    // @ts-expect-error
    SUBSCRIPTION_TYPES
} from '@aeternity/aepp-sdk';


export function getAeSdk(): AeSdkAepp {
    const aeSdk = new AeSdkAepp({
        name: 'Feæder',
        onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
        nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    aeSdk.selectNode('testnet');

    return aeSdk;
}

export async function connectWallet(): Promise<`ak_${string}` | null> {
    const aeSdk = getAeSdk();
    const connection = await scanForWallets();

    try {
        await aeSdk.connectToWallet(connection);
    } catch (error) {
        if (error instanceof RpcConnectionDenyError) connection.disconnect();
        return null;
    }

    const { address } = await aeSdk.subscribeAddress(
        SUBSCRIPTION_TYPES.subscribe, 'connected'
    );

    return Object.keys(address.current)[0] as `ak_${string}`;
}

function scanForWallets(): Promise<BrowserWindowMessageConnection> {
    return new Promise((resolve) => {
        const scannerConnection = new BrowserWindowMessageConnection();

        const stopScan = walletDetector(scannerConnection, ({ wallets, newWallet }) => {
            stopScan();
            newWallet = newWallet || Object.values(wallets)[0];
            resolve(newWallet.getConnection());
        });
    });
}
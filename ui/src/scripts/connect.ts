import {
    walletDetector,
    BrowserWindowMessageConnection,
    // @ts-expect-error
    SUBSCRIPTION_TYPES,
    WalletConnectorFrame
} from '@aeternity/aepp-sdk';
import type AccountRpc from 'node_modules/@aeternity/aepp-sdk/es/account/Rpc';

const AEPP_NAME = 'feaeder';

let accounts: AccountRpc[] = [];

export async function getAccounts(): Promise<AccountRpc[]> {
    if (accounts.length > 0) return accounts;

    const connection = await scanForWallets();

    const walletConnectorFrame = await WalletConnectorFrame.connect(
        AEPP_NAME,
        connection
    );

    accounts = await walletConnectorFrame.subscribeAccounts(
        SUBSCRIPTION_TYPES.subscribe,
        'connected'
    );

    return accounts;
}

export async function getAccount(): Promise<AccountRpc | null> {
    const accounts = await getAccounts();
    if (accounts.length == 0) return null;
    return accounts[0];
}

export async function connectWallet(): Promise<`ak_${string}` | null> {
    try {
        const accounts = await getAccounts();
        if (accounts.length == 0) return null;
        return accounts[0].address;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function scanForWallets(): Promise<BrowserWindowMessageConnection> {
    return new Promise((resolve) => {
        const browserConnection = new BrowserWindowMessageConnection();

        const stopScan = walletDetector(browserConnection, ({ wallets, newWallet }) => {
            stopScan();

            newWallet = newWallet || Object.values(wallets)[0];
            resolve(newWallet.getConnection());
        });
    });
}
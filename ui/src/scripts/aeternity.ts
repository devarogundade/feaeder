import { AeSdk, CompilerHttp, Contract, Node } from "@aeternity/aepp-sdk";
import { aci as feaederAci } from "@/acis/feaeder";
import { getAccount, getAccounts } from "./connect";
import type { Subscription } from "@/types";

let aeSdk: AeSdk | null = null;
const feaederId: `ct_${string}` = `ct_E7AN2m8WMzzaCdeSLzj9xSEJZvc2tj5yEySPTXd9G4E8tAWQP`;

const getAeSdk = async (): Promise<AeSdk> => {
    if (aeSdk) return aeSdk;

    const accounts = await getAccounts();

    aeSdk = new AeSdk({
        accounts,
        onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
        nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }]
    });

    return aeSdk;
};

export async function createSubscription(): Promise<`th_${string}` | null> {
    try {
        const aeSdk = await getAeSdk();

        const contract = await Contract.initialize({
            ...aeSdk.getContext(), aci: feaederAci, address: feaederId
        });

        const receipt = await contract.$call('create_subscription', [], {
            omitUnknown: true
        });

        return receipt.hash;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getSubscription(owner: `ak_${string}`): Promise<Subscription | null> {
    try {
        const aeSdk = await getAeSdk();

        const contract = await Contract.initialize({
            ...aeSdk.getContext(), aci: feaederAci, address: feaederId
        });

        const { decodedResult } = await contract.$call('get_owner_subscription', [owner], {
            callStatic: true
        });
        console.log(decodedResult);

        return decodedResult;
    } catch (error) {
        console.log(error);
        return null;
    }
}
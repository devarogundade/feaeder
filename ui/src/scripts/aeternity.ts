import { Contract } from "@aeternity/aepp-sdk";
import { getAeSdk } from "./connect";
import { aci as feaederAci } from "@/acis/feaeder";

const aeSdk = getAeSdk();
const feaederAddress: `ct_${string}` = `ct_E7AN2m8WMzzaCdeSLzj9xSEJZvc2tj5yEySPTXd9G4E8tAWQP`;

export async function createSubscription() {
    const contract = await Contract.initialize({
        ...aeSdk.getContext(), aci: feaederAci, address: feaederAddress
    });

    // const transaction = aeSdk.
}
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useWalletStore } from '@/stores/wallet';
import { createSubscription, getSubscription, addConsumer, removeConsumer, topUpSubscription, withdrawSubscription } from '@/scripts/aeternity';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import Converter from '@/scripts/converter';
import { onMounted, watch, ref } from 'vue';
import ProgressBox from '@/components/ProgressBox.vue';
import Button from '@/components/Button.vue';
import TicketIcon from '@/components/icons/TicketIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import BigNumber from 'bignumber.js';
import ToolTip from '@/components/ToolTip.vue';

const walletStore = useWalletStore();
const userStore = useUserStore();
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });
const fetchingSubscription = ref(false);
const creatingSubscription = ref(false);
const addingConsumer = ref(false);
const removingConsumer = ref<string | null>(null);
const toppingUp = ref(false);
const withdrawing = ref(false);

const fetchOwnerSubscription = async (owner: `ak_${string}`, progress = true) => {
    fetchingSubscription.value = progress;
    const subscription = await getSubscription(owner);
    userStore.setSubscription(subscription);
    fetchingSubscription.value = false;
};

const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(text);
};

const topUp = async () => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (toppingUp.value) return;

    toppingUp.value = true;

    const amount = prompt('Enter an amount in Æ');

    if (!amount) {
        toppingUp.value = false;
        return;
    }

    const txHash = await topUpSubscription(Converter.up(new BigNumber(amount), 18));

    if (txHash) {
        toast.success('Subscription topped up');
        fetchOwnerSubscription(walletStore.address, false);
    } else {
        toast.error('Subscription topping up failed');
    }

    toppingUp.value = false;
};

const withdraw = async () => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (withdrawing.value) return;

    withdrawing.value = true;

    const amount = prompt('Enter an amount in Æ');

    if (!amount) {
        withdrawing.value = false;
        return;
    }

    const txHash = await withdrawSubscription(Converter.up(new BigNumber(amount), 18));

    if (txHash) {
        toast.success('Subscription withdrawn');
        fetchOwnerSubscription(walletStore.address, false);
    } else {
        toast.error('Subscription withdrawing failed');
    }

    withdrawing.value = false;
};

const newConsumer = async () => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (addingConsumer.value) return;

    addingConsumer.value = true;

    const address = prompt('Enter a consumer contract address (starts with ct_)');

    if (!address || !address.startsWith('ct_')) {
        addingConsumer.value = false;
        return;
    }

    const txHash = await addConsumer(address as `ct_${string}`);

    if (txHash) {
        toast.success('Consumer added');
        fetchOwnerSubscription(walletStore.address, false);
    } else {
        toast.error('Consumer creation failed');
    }

    addingConsumer.value = false;
};

const deleteConsumer = async (address: `ak_${string}`) => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (addingConsumer.value) return;

    removingConsumer.value = address;

    const txHash = await removeConsumer(address);

    if (txHash) {
        toast.success('Consumer added');
        fetchOwnerSubscription(walletStore.address, false);
    } else {
        toast.error('Consumer creation failed');
    }

    removingConsumer.value = null;
};

const newSubscription = async () => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (creatingSubscription.value) return;

    creatingSubscription.value = true;

    const txHash = await createSubscription();

    if (txHash) {
        toast.success('Subscription created');
        fetchOwnerSubscription(walletStore.address);
    } else {
        toast.error('Subscription creation failed');
    }

    creatingSubscription.value = false;
};

onMounted(() => {
    if (walletStore.address) {
        fetchOwnerSubscription(walletStore.address);
    }
});

watch(walletStore, (store) => {
    if (store.address) {
        fetchOwnerSubscription(store.address);
    }
});
</script>

<template>
    <section>
        <div class="app_width">
            <div class="progress" v-if="fetchingSubscription">
                <ProgressBox />
            </div>

            <div class="subscription" v-else>
                <div class="table">
                    <div class="name">My subscription</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>ID</p>
                                    <ToolTip :tooltip-text="'Identifier.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Creator</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Created at</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Version</p>
                                    <ToolTip :tooltip-text="'Subscription contract version.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Spent</p>
                                    <ToolTip :tooltip-text="'Amount used from subscription.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Balance</p>
                                </div>
                            </div>
                            <div class="td"></div>
                            <div class="td"></div>
                        </div>
                    </div>
                    <div class="tbody" v-if="userStore.subscription">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <TicketIcon />
                                    <p>{{ userStore.subscription.id }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(userStore.subscription.creator, 4) }}
                                    </p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.fullMonth(new
                                        Date(Number(userStore.subscription.timestamp))) }}
                                    </p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Number(userStore.subscription.version).toFixed(1) }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toMoney(
                                        Converter.down(new BigNumber(userStore.subscription.spent), 18)
                                    ) }} Æ</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toMoney(
                                        Converter.down(new BigNumber(userStore.subscription.balance), 18)
                                    ) }} Æ</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <button class="topup" @click="topUp">
                                        {{ toppingUp ? 'Topping up...' : 'Top up' }}
                                    </button>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <button class="withdraw" @click="withdraw">
                                        {{ withdrawing ? 'Withdrawing...' : 'Withdraw' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <img src="/images/empty.png" alt="Empty data">
                        <p>No subscription</p>
                        <Button :loading="creatingSubscription" @click="newSubscription"
                            :text="'Create subscription'" />
                    </div>
                </div>

                <div class="table consumers" v-if="userStore.subscription">
                    <div class="name">Consumers</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>Contract address</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td"> </div>
                        </div>
                    </div>
                    <div class="tbody" v-if="userStore.subscription.consumers.length > 0">
                        <div class="tr" v-for="consumer in userStore.subscription.consumers">
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(consumer, 16) }}
                                    </p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <button class="remove" @click="deleteConsumer(consumer)">
                                        {{ removingConsumer == consumer ? 'Removing...' : 'Remove' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <img src="/images/empty.png" alt="Empty data">
                        <p>No consumer</p>
                        <Button :loading="addingConsumer" @click="newConsumer" :text="'Add consumer'" />
                    </div>
                </div>

                <Button v-if="userStore.subscription && userStore.subscription.consumers.length > 0"
                    :loading="addingConsumer" @click="newConsumer" :text="'Add another consumer'" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.table {
    margin-top: 30px;
    width: 100%;
}

.name {
    font-size: 30px;
    font-weight: 500;
}

.thead {
    font-size: 14px;
    color: var(--tx-normal);
    font-weight: 500;
}

.tr {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1.5fr 0.6fr 0.8fr 0.8fr 0.5fr 0.5fr;
    align-items: center;
    height: 50px;
}

.consumers .tr {
    grid-template-columns: 2fr 1fr;
}

.thead .td div {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
}

.tbody .td div button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
}

.consumers .remove {
    color: var(--sm-red);
    text-decoration: underline;
}

.topup {
    color: var(--primary);
    text-decoration: underline;
}

.withdraw {
    color: var(--tx-semi);
    text-decoration: underline;
}

.tbody {
    font-size: 14px;
    color: var(--tx-semi);
    font-weight: 500;
}

.tbody .tr {
    background: var(--white);
    border-radius: 4px;
    margin-bottom: 10px;
    border: 1px solid var(--bg-darkest);
    height: 60px;
}

.tr svg {
    width: 16px;
    height: 16px;
}

.tbody .td div {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    text-transform: capitalize;
}

.tbody .td img,
.tbody .td svg {
    width: 18px;
    height: 18px;
}

a p {
    color: var(--primary);
}
</style>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useWalletStore } from '@/stores/wallet';
import { createSubscription, getSubscription, addConsumer } from '@/scripts/aeternity';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import Converter from '@/scripts/converter';
import { onMounted, watch, ref } from 'vue';
import ProgressBox from '@/components/ProgressBox.vue';
import Button from '@/components/Button.vue';
import TicketIcon from '@/components/icons/TicketIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';

const walletStore = useWalletStore();
const userStore = useUserStore();
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });
const fetchingSubscription = ref(false);
const creatingSubscription = ref(false);
const addingConsumer = ref(false);

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

const newConsumer = async () => {
    if (!walletStore.address) {
        toast.warning('Please connect your wallet');
        return;
    }
    if (addingConsumer.value) return;

    addingConsumer.value = true;

    const address = prompt('Enter a consumer contract address (starts with ct_)');

    if (!address || !address.startsWith('ct_')) return;

    const txHash = await addConsumer(address as `ct_${string}`);

    if (txHash) {
        toast.success('Consumer added');
        fetchOwnerSubscription(walletStore.address, false);
    } else {
        toast.error('Consumer creation failed');
    }

    addingConsumer.value = false;
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

            <div class="subscription" v-else-if="userStore.subscription">
                <div class="table">
                    <div class="name">My subscription</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>ID</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Creator</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Created</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Version</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Consumers</p>
                                    <InfoIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Balance</p>
                                </div>
                            </div>
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
                                    <p>{{ userStore.subscription.consumers.length }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ userStore.subscription.balance }} Æ</p>
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

                <div class="table consumers">
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
                                    <TicketIcon />
                                    <p>{{ userStore.subscription.id }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(consumer, 8) }}
                                    </p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <button>Removed</button>
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
    grid-template-columns: 1fr 1.2fr 2fr 0.6fr 0.8fr 1.5fr;
    align-items: center;
    height: 50px;
}

.consumers .tr {
    grid-template-columns: 3fr 1fr;
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

.tbody {
    font-size: 14px;
    color: var(--tx-semi);
    font-weight: 500;
}

.tbody .tr {
    background: #FFF;
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
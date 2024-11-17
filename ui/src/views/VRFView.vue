<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import CopyIcon from '@/components/icons/CopyIcon.vue';
import {
    createSubscription,
    getSubscription
} from '@/scripts/aeternity';
import Converter from '@/scripts/converter';
import { useWalletStore } from '@/stores/wallet';
import { onMounted, watch } from 'vue';

const walletStore = useWalletStore();

const fetchOwnerSubscription = async (owner: `ak_${string}`) => {
    walletStore.setSubscription(await getSubscription(owner));
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
            <div class="datafeeds">
                <div class="hero">
                    <h3>Feæder Verifiable Randomness Function</h3>
                    <p>Chainlink VRF provides cryptographically secure randomness for your smart contracts.</p>
                    <button v-if="!walletStore.subscription" @click="createSubscription">Create subscription</button>

                    <RouterLink to="/subscription" v-else>
                        <button>Manage subscription</button>
                    </RouterLink>
                </div>

                <div class="table">
                    <div class="name">My subscription</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>ID</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Creator</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Created</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Version</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Consumers</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Balance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tbody" v-if="walletStore.subscription">
                        <div class="tr">
                            <div class="td">
                                <RouterLink :to="`/subscriptions/${walletStore.subscription.id}`">
                                    <div>
                                        <img src="/images/ae.png" alt="">
                                        <p>{{ walletStore.subscription.id }}</p>
                                    </div>
                                </RouterLink>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(walletStore.subscription.creator, 4) }}</p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.fullMonth(new Date(Number(walletStore.subscription.timestamp))) }}
                                    </p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Number(walletStore.subscription.version).toFixed(1) }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ walletStore.subscription.consumers.length }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ walletStore.subscription.balance }} Æ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <img src="/images/empty.png" alt="Empty data">
                        <p>No subscription</p>
                    </div>
                </div>

                <div class="table">
                    <div class="name">Recent subscriptions</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>ID</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Creator</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Created</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Version</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Consumers</p>
                                    <ArrowRightIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Balance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tbody">
                        <div class="tr" v-for="i in 5">
                            <div class="td">
                                <RouterLink :to="`/feeds/${i}`">
                                    <div>
                                        <img src="/images/ae.png" alt="">
                                        <p>707220...6395</p>
                                    </div>
                                </RouterLink>
                            </div>
                            <div class="td">
                                <div>
                                    <p>ak_ae54...6031</p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>November 16, 2024 at 06:46 UTC</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>1.0</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>2</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>1.46 Æ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pagination">
                    <p>Showing 1 to 5 of 45 entries</p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
section {
    padding-top: 60px;
    padding-bottom: 100px;
}

.hero h3 {
    font-size: 36px;
    line-height: 55px;
    color: var(--tx-normal);
}

.hero p {
    font-size: 20px;
    line-height: 36px;
    color: var(--tx-semi);
    margin-top: 20px;
    max-width: 600px;
}

.hero button {
    padding: 0 16px;
    border-radius: 4px;
    background: var(--primary);
    color: var(--bg);
    border: none;
    height: 40px;
    font-size: 14px;
    font-weight: 500;
    margin-top: 20px;
}

.table {
    margin-top: 50px;
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
    margin-top: 10px;
}

.tr {
    display: grid;
    grid-template-columns: 1fr 1.2fr 2fr 0.6fr 0.8fr 1.5fr;
    align-items: center;
    height: 50px;
}

.thead .td div {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
}

.tbody {
    font-size: 14px;
    color: var(--tx-semi);
    font-weight: 500;
}

.tbody .tr {
    background: #FFF;
    border: 1px solid var(--bg-darkest);
    border-radius: 4px;
    margin-bottom: 10px;
    height: 60px;
}

.tbody .td div {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
}

.tbody .td img,
.tbody .td svg {
    width: 18px;
    height: 18px;
}

a p {
    color: var(--primary);
}

.pagination {
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px
}

.pagination p {
    font-size: 14px;
    color: var(--tx-semi);
    text-align: center;
}
</style>

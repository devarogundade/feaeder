<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import CopyIcon from '@/components/icons/CopyIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import TicketIcon from '@/components/icons/TicketIcon.vue';
import ToolTip from '@/components/ToolTip.vue';
import { getSubscription, vrfs } from '@/scripts/aeternity';
import Converter from '@/scripts/converter';
import { useUserStore } from '@/stores/user';
import { useWalletStore } from '@/stores/wallet';
import BigNumber from 'bignumber.js';
import { onMounted, watch } from 'vue';

const walletStore = useWalletStore();
const userStore = useUserStore();

const fetchOwnerSubscription = async (owner: `ak_${string}`) => {
    userStore.setSubscription(await getSubscription(owner));
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

                    <a href="https://docs.feaeder.xyz" target="_blank"><button>Read the docs</button></a>
                </div>

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
                                    <p>Consumers</p>
                                    <ToolTip :tooltip-text="'Number of added consumer contracts.'">
                                        <InfoIcon />
                                    </ToolTip>
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
                                <RouterLink :to="`/subscription`">
                                    <div>
                                        <TicketIcon />
                                        <p>{{ userStore.subscription.id }}</p>
                                    </div>
                                </RouterLink>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(userStore.subscription.creator, 4) }}</p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.fullMonth(new Date(Number(userStore.subscription.timestamp))) }}
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
                                    <p>{{ Converter.toMoney(
                                        Converter.down(new BigNumber(userStore.subscription.balance), 18)
                                    ) }} Æ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <img src="/images/empty.png" alt="Empty data">
                        <p>No subscription</p>
                    </div>
                </div>

                <div class="table vrfs">
                    <div class="name">VRFs</div>
                    <div class="thead">
                        <div class="tr">
                            <div class="td">
                                <div>
                                    <p>Type</p>
                                    <ToolTip :tooltip-text="'VRF contract type.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Contract address</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Version</p>
                                    <ToolTip :tooltip-text="'VRF contract version.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>Query Fee</p>
                                    <ToolTip :tooltip-text="'The cost of using VRF contract per request.'">
                                        <InfoIcon />
                                    </ToolTip>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tbody">
                        <div class="tr" v-for="vrf in vrfs">
                            <div class="td">
                                <div>
                                    <img src="/images/ae.png" alt="">
                                    <p>{{ vrf.name }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Converter.toChecksumAddress(vrf.address, 8) }}</p>
                                    <CopyIcon />
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ Number(vrf.version).toFixed(1) }}</p>
                                </div>
                            </div>
                            <div class="td">
                                <div>
                                    <p>{{ vrf.queryFee }} Æ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pagination">
                    <p>Showing all {{ vrfs.length }} entries</p>
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
    color: var(--tx-normal);
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

.tr svg {
    width: 16px;
    height: 16px;
}

.vrfs .tr {
    grid-template-columns: 1fr 1.5fr 0.6fr 0.6fr;
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
    background: var(--white);
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

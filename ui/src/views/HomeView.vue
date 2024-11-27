<script setup lang="ts">
import CopyIcon from '@/components/icons/CopyIcon.vue';
import { fetchAggregators } from '@/scripts/consumer';
import Converter from '@/scripts/converter';
import { FeedsType, type Aggregator, type FeedsCategory } from '@/types';
import { onMounted, ref, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { getSubscription } from '@/scripts/aeternity';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import BigNumber from 'bignumber.js';
import { useUserStore } from '@/stores/user';
import CoinIcon from '@/components/icons/CoinIcon.vue';
import FiatIcon from '@/components/icons/FiatIcon.vue';
import CommodityIcon from '@/components/icons/CommodityIcon.vue';
import RWAIcon from '@/components/icons/RWAIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import TicketIcon from '@/components/icons/TicketIcon.vue';
import ProgressBox from '@/components/ProgressBox.vue';
import ToolTip from '@/components/ToolTip.vue';

const total = ref(1);
const currentPage = ref(1);
const lastPage = ref(1);
const limit = ref(10);
const aggregators = ref<Aggregator[]>([]);
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });
const category = ref<FeedsCategory | null>(null);
const type = ref(FeedsType.Push);
const walletStore = useWalletStore();
const userStore = useUserStore();
const fetchingAggregators = ref(false);

const selectCategory = (newCategory: string) => {
  if (category.value == newCategory) {
    category.value = null;
  } else {
    category.value = newCategory as FeedsCategory;
  }

  getAggregator(1);
};

const getAggregator = async (page: number) => {
  fetchingAggregators.value = page == 1;

  const result = await fetchAggregators(page, category.value);

  if (!result || !result.data) {
    return;
  }

  total.value = result.total;
  currentPage.value = page;
  lastPage.value = result.lastPage;
  aggregators.value = result.data;
  limit.value = result.limit;

  fetchingAggregators.value = false;
};

const fetchOwnerSubscription = async (owner: `ak_${string}`) => {
  userStore.setSubscription(await getSubscription(owner));
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(text);
};

onMounted(() => {
  getAggregator(currentPage.value);

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
          <h3>Feæder Oracle Data Feeds</h3>
          <p>Robust infrastructure designed for secure and reliable delivery of market-representative data.</p>
        </div>

        <div class="types">
          <button :class="type == FeedsType.Push ? 'type type_active' : 'type'" @click="type = FeedsType.Push">Push
            based</button>
          <button :class="type == FeedsType.Oracle ? 'type type_active' : 'type'"
            @click="type = FeedsType.Oracle">Oracle based</button>
        </div>

        <div class="table subscription" v-show="type == FeedsType.Oracle">
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

        <div class="filters">
          <button :class="category == 'crypto' ? 'filter filter_active' : 'filter'" @click="selectCategory('crypto')">
            <CoinIcon />
            <p>Cryptocurrencies</p>
          </button>

          <button :class="category == 'fiat' ? 'filter filter_active' : 'filter'" @click="selectCategory('fiat')">
            <FiatIcon />
            <p>Fiat</p>
          </button>

          <button :class="category == 'commodity' ? 'filter filter_active' : 'filter'"
            @click="selectCategory('commodity')">
            <CommodityIcon />
            <p>Commodities</p>
          </button>

          <button :class="category == 'rwa' ? 'filter filter_active' : 'filter'" @click="selectCategory('rwa')">
            <RWAIcon />
            <p>RWA</p>
          </button>
        </div>

        <div class="table">
          <div class="thead">
            <div class="tr">
              <div class="td">
                <div>
                  <p>Feed</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Pulse</p>
                  <ToolTip :tooltip-text="'Interval between updates.'">
                    <InfoIcon />
                  </ToolTip>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Latest Answer</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Deviation threshold</p>
                  <ToolTip
                    :tooltip-text="'The answer updates when a node identifies that the off-chain values deviate by more than the defined deviation threshold from the onchain value.'">
                    <InfoIcon />
                  </ToolTip>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Heartbeat</p>
                  <ToolTip
                    :tooltip-text="'A countdown timer that updates the price on-chain when it reaches 00:00. It is a backup in the event that the deviation threshold does not trigger an update over the length of the heartbeat.'">
                    <InfoIcon />
                  </ToolTip>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Category</p>
                </div>
              </div>
            </div>
          </div>
          <div class="progress" v-if="fetchingAggregators">
            <ProgressBox />
          </div>
          <div class="tbody" v-else-if="aggregators.length > 0">
            <div class="tr" v-for="aggregator, index in aggregators" :key="index">
              <div class="td">
                <RouterLink :to="`/feeds/${aggregator.address}`">
                  <div>
                    <img :src="aggregator.image" :alt="aggregator.name">
                    <p>{{ aggregator.name }}</p>
                  </div>
                </RouterLink>
              </div>
              <div class="td">
                <div>
                  <p>{{ Converter.convertSecondsToMMSS(aggregator.pulse) }}</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>
                    {{ aggregator.name.endsWith('USD') ? '$' : '' }}
                    {{ aggregator.name.endsWith('ETH') ? 'Ξ' : '' }}
                    {{ aggregator.name.endsWith('BTC') ? '₿' : '' }}
                    {{ aggregator.name.endsWith('EUR') ? '€' : '' }}
                    {{
                      Converter.toMoney(
                        Converter.down(
                          Converter.getAverage(aggregator.latestDataFeed.answers.map(answer => new BigNumber(answer))),
                          aggregator.decimals
                        )
                      )
                    }}
                  </p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>{{ aggregator.deviationThreshold }}%</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>{{ Converter.convertSecondsToHHMMSS(aggregator.heartbeat) }}</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <p>{{ aggregator.category }}</p>
                </div>
              </div>
              <div class="td">
                <div>
                  <button @click="copyText(aggregator.address)">
                    <CopyIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="empty" v-show="!fetchingAggregators && aggregators.length == 0">
          <img src="/images/empty.png" alt="Empty data">
          <p>No aggregators found.</p>
        </div>

        <div class="pagination" v-show="aggregators.length > 0">
          <button :class="currentPage > 1 ? 'button_active' : ''"
            @click="currentPage > 1 ? getAggregator(currentPage - 1) : null">Prev</button>

          <p>
            Showing {{ (limit * (currentPage - 1)) + 1 }}
            to {{ limit * currentPage > total ? total : limit * currentPage }}
            of {{ total }} entries</p>

          <button :class="currentPage < lastPage ? 'button_active' : ''"
            @click="currentPage < lastPage ? getAggregator(currentPage + 1) : null">Next</button>
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

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.filter {
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid var(--bg-darkest);
  font-size: 12px;
  font-weight: 400;
  color: var(--tx-semi);
  background: var(--accent);
}

.filter svg {
  width: 18px;
  height: 18px;
}

.filter_active {
  background: var(--accent);
  color: var(--primary);
  border: 1px solid var(--primary);
}

.types {
  margin-top: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-dark);
  border: 1px solid var(--bg-darkest);
  width: fit-content;
}

.type {
  height: 40px;
  padding: 0 16px;
  background: none;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--tx-semi);
  border-radius: 4px;
}

.type_active {
  border: 1px solid var(--primary);
  color: var(--primary);
  font-weight: 600;
  background: var(--accent);
}

.table {
  margin-top: 30px;
  width: 100%;
  overflow-x: auto;
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
  width: 100%;
  min-width: 1200px;
}

.tr {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1.4fr 1fr 0.8fr 0.3fr;
  align-items: center;
  height: 50px;
}

.subscription .tr {
  grid-template-columns: 1fr 1.2fr 2fr 0.6fr 0.8fr 1.5fr;
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
  width: 100%;
  min-width: 1200px;
}

.tbody .tr {
  background: var(--accent);
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

.pagination {
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px
}

.pagination button {
  padding: 0 26px;
  border-radius: 4px;
  background: var(--bg-dark);
  border: 2px solid var(--bg-darkest);
  color: var(--tx-normal);
  height: 36px;
  font-size: 14px;
  font-weight: 500;
}

.pagination .button_active {
  background: var(--accent);
  border: 2px solid var(--primary);
  color: var(--primary);
}

.pagination p {
  font-size: 14px;
  color: var(--tx-semi);
  text-align: center;
}

@media screen and (max-width: 768px) {
  section {
    padding-top: 30px;
  }

  .tr {
    display: grid;
    grid-template-columns: 0.8fr 0.6fr 1fr 1fr 0.8fr 0.6fr 0.3fr;
    align-items: center;
    height: 50px;
  }

  .subscription .tr {
    grid-template-columns: 1fr 1.2fr 2fr 0.6fr 0.8fr 1.5fr;
  }

  .hero h3 {
    font-size: 24px;
    line-height: 36px;
  }

  .hero p {
    font-size: 16px;
    line-height: 24px;
    margin-top: 16px;
    max-width: 100%;
  }

  .types {
    margin-top: 20px;
    overflow: hidden;
    width: 100%;
  }

  .type {
    width: 100%;
  }


  .filters {
    gap: 10px;
  }

  .filter {
    padding: 0 8px;
    font-size: 12px;
    height: 26px;
    gap: 8px;
  }

  .filter svg {
    width: 14px;
    height: 14px;
  }

  .pagination {
    margin-top: 20px;
  }

  .pagination button {
    padding: 0 16px;
    height: 30px;
    font-size: 12px;
  }

  .pagination p {
    font-size: 12px;
  }
}
</style>

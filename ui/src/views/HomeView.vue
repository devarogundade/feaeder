<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import CopyIcon from '@/components/icons/CopyIcon.vue';
import { fetchAggregators } from '@/scripts/consumer';
import Converter from '@/scripts/converter';
import { FeedsType, type Aggregator, type FeedsCategory } from '@/types';
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const total = ref(1);
const currentPage = ref(1);
const lastPage = ref(1);
const limit = ref(10);
const aggregators = ref<Aggregator[]>([]);
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });
const category = ref<FeedsCategory | null>(null);
const type = ref(FeedsType.Push);

const selectCategory = (newCategory: string) => {
  if (category.value == newCategory) {
    category.value = null;
  } else {
    category.value = newCategory as FeedsCategory;
  }

  getAggregator(1);
};

const getAggregator = async (page: number) => {
  const result = await fetchAggregators(page, category.value);

  if (!result || !result.data) {
    return;
  }

  total.value = result.total;
  currentPage.value = page;
  lastPage.value = result.lastPage;
  aggregators.value = result.data;
  limit.value = result.limit;
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(text);
};

onMounted(() => {
  getAggregator(currentPage.value);
});
</script>

<template>
  <section>
    <div class="app_width">
      <div class="datafeeds">
        <div class="hero">
          <h3>Feæder Oracle Data Feeds</h3>
          <p>Battle-tested infrastructure for highly secure and reliable market-representative data.</p>
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
            <div class="tr" v-for="i in 0">
              <div class="td">
                <RouterLink :to="`/feeds/${i}`">
                  <div>
                    <img src="/images/ae.png" alt="">
                    <p>6395</p>
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
          <div class="empty">
            <img src="/images/empty.png" alt="Empty data">
            <p>No subscription</p>
          </div>
        </div>


        <div class="filters">
          <button :class="category == 'crypto' ? 'filter filter_active' : 'filter'" @click="selectCategory('crypto')">
            <ArrowRightIcon />
            <p>Cryptocurrencies</p>
          </button>

          <button :class="category == 'fiat' ? 'filter filter_active' : 'filter'" @click="selectCategory('fiat')">
            <ArrowRightIcon />
            <p>Fiat</p>
          </button>

          <button :class="category == 'commodity' ? 'filter filter_active' : 'filter'"
            @click="selectCategory('commodity')">
            <ArrowRightIcon />
            <p>Commodities</p>
          </button>

          <button :class="category == 'rwa' ? 'filter filter_active' : 'filter'" @click="selectCategory('rwa')">
            <ArrowRightIcon />
            <p>RWA</p>
          </button>
        </div>

        <div class="table">
          <div class="thead">
            <div class="tr">
              <div class="td">
                <div>
                  <p>Feed</p>
                  <ArrowRightIcon />
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Pulse</p>
                  <ArrowRightIcon />
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Latest Answer</p>
                  <ArrowRightIcon />
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Deviation threshold</p>
                  <ArrowRightIcon />
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Heartbeat</p>
                  <ArrowRightIcon />
                </div>
              </div>
              <div class="td">
                <div>
                  <p>Category</p>
                </div>
              </div>
            </div>
          </div>
          <div class="tbody">
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
                  <p>$3,503.95</p>
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
                  <ArrowRightIcon />
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

        <div class="empty" v-show="aggregators.length == 0">
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
  background: #FFF;
}

.filter_active {
  background: #FFF;
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
  background: #FFF;
}

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
}

.tbody .tr {
  background: #FFF;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid var(--bg-darkest);
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
  background: #FFF;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.pagination p {
  font-size: 14px;
  color: var(--tx-semi);
}
</style>

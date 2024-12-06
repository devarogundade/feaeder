<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import Converter from '@/scripts/converter';
import { useRoute } from 'vue-router';
import { fetchAggregator, fetchDatafeeds } from '@/scripts/consumer';
import type { Aggregator, Datafeed, Interval } from '@/types';
import { onMounted, ref, watch } from 'vue';
import BigNumber from 'bignumber.js';
import Chart from '@/components/Chart.vue';
import { format as formatDate } from 'timeago.js';
import CopyIcon from '@/components/icons/CopyIcon.vue';
import ProgressBox from '@/components/ProgressBox.vue';
import ToolTip from '@/components/ToolTip.vue';
import TimeDown from '@/components/TimeDown.vue';

interface ChartData {
    name: string;
    answer: number;
}

const route = useRoute();
const aggregator = ref<Aggregator | null>(null);
const datafeeds = ref<Datafeed[]>([]);
const chartData = ref<ChartData[]>([]);
const loadingChartData = ref(true);
const minData = ref(Number.MAX_VALUE);
const maxData = ref(0);
const interval = ref<Interval>('1d');
const fetchingAggregator = ref(false);
const symbol = ref('');
const notFound = ref(false);

const getAggregator = async () => {
    fetchingAggregator.value = true;

    aggregator.value = await fetchAggregator(route.params.id.toString());

    if (!aggregator.value) {
        notFound.value = true;
        return;
    }

    if (aggregator.value.name.endsWith('USD')) symbol.value = '$';
    if (aggregator.value.name.endsWith('ETH')) symbol.value = 'Ξ';
    if (aggregator.value.name.endsWith('BTC')) symbol.value = '₿';
    if (aggregator.value.name.endsWith('EUR')) symbol.value = '€';

    fetchingAggregator.value = false;
    getDatafeeds();
};

const getDatafeeds = async () => {
    const result = await fetchDatafeeds(route.params.id.toString(), 1, interval.value);

    if (result && result.data && aggregator.value) {
        datafeeds.value = result.data;
        chartData.value = result.data.reverse().map((m) => {
            let answer = Converter.down(
                Converter.getAverage(m.answers.map(a => new BigNumber(a))),
                aggregator.value!.decimals
            ).toNumber();

            if (answer < minData.value) minData.value = answer;
            if (answer > maxData.value) maxData.value = answer;

            return {
                name: m.timestamp.toString(),
                answer
            };
        });

        loadingChartData.value = false;
    }
};

onMounted(() => {
    getAggregator();
});

watch(interval, () => {
    getDatafeeds();
});
</script>

<template>
    <section>
        <div class="app_width">
            <div class="progress" v-if="fetchingAggregator || loadingChartData">
                <ProgressBox />
            </div>
            <div class="datafeeds" v-else-if="aggregator && datafeeds.length > 0">
                <div class="title">
                    <RouterLink to="/">
                        <h3>Data Feeds</h3>
                    </RouterLink>
                    <ArrowRightIcon />
                    <h3>{{ Converter.toChecksumAddress(route.params.id.toString(), 4) }}</h3>
                    <button>
                        <CopyIcon />
                    </button>
                </div>

                <div class="info">
                    <div class="name">
                        <img :src="aggregator.image" :alt="aggregator.name">
                        <p>{{ aggregator.name }}</p>
                    </div>

                    <p class="description">{{ aggregator.description }}</p>

                    <button class="category">{{ aggregator.category }}</button>
                </div>

                <div class="details">
                    <div class="parameters">
                        <div class="parameter">
                            <p>Latest Answer</p>
                            <h3>
                                {{ symbol }}
                                {{ Converter.toMoney(
                                    Converter.down(
                                        Converter.getAverage(datafeeds[
                                            datafeeds.length - 1
                                        ].answers.map(a => new BigNumber(a))),
                                        aggregator.decimals
                                    )
                                ) }}</h3>
                        </div>

                        <div class="parameter">
                            <p>Decimals</p>
                            <h3>{{ aggregator.decimals }}</h3>
                        </div>

                        <div class="parameter_grid">
                            <div class="parameter">
                                <p>Deviation threshold</p>
                                <h3>{{ aggregator.deviationThreshold }}%</h3>
                            </div>

                            <div class="parameter">
                                <p>Heartbeat</p>
                                <h3>
                                    <TimeDown :last-updated-at="aggregator.updatedAt" :interval="aggregator.heartbeat"
                                        :show-hours="true" />
                                </h3>
                            </div>
                        </div>

                        <div class="parameter_grid">
                            <div class="parameter">
                                <p>Pulse</p>
                                <h3>
                                    <TimeDown :last-updated-at="aggregator.updatedAt" :interval="aggregator.pulse"
                                        :show-hours="false" />
                                </h3>
                            </div>

                            <div class="parameter">
                                <p>Sources</p>
                                <div class="images">
                                    <ToolTip v-for="source in Object.keys(aggregator.sources)" :key="source"
                                        :tooltip-text="source">
                                        <img :src="`/images/${source}.png`" :alt="source">
                                    </ToolTip>
                                </div>
                            </div>
                        </div>

                        <div class="parameter">
                            <p>Query fee</p>
                            <h3>0.001 Æ</h3>
                        </div>

                        <div class="parameter">
                            <p>Last update</p>
                            <h3>{{ Converter.fullMonth(new Date(aggregator.updatedAt)) }}</h3>
                            <span>{{ formatDate(new Date(aggregator.updatedAt)) }}</span>
                        </div>
                    </div>
                    <div v-if="loadingChartData"></div>
                    <div v-else class="chart_data">
                        <div class="chart_tools">
                            <div class="intervals">
                                <button :class="interval == '1d' ? 'interval interval_active' : 'interval'"
                                    @click="interval = '1d'">1D</button>
                                <button :class="interval == '1w' ? 'interval interval_active' : 'interval'"
                                    @click="interval = '1w'">1W</button>
                                <button :class="interval == '1m' ? 'interval interval_active' : 'interval'"
                                    @click="interval = '1m'">1M</button>
                            </div>
                        </div>
                        <Chart :width="800" :height="550" :data="chartData" :domain="[
                            minData - (0.02 * minData),
                            maxData + (0.02 * maxData)
                        ]" :marker="true" :symbol="symbol" />
                    </div>
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

.title {
    display: flex;
    align-items: center;
    gap: 20px;
}

.title a h3 {
    color: var(--primary);
}

.title h3 {
    font-size: 20px;
    color: var(--tx-normal);
    font-weight: 500;
}

.title button {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.info {
    margin-top: 20px;
}

.info .name {
    display: flex;
    align-items: center;
    gap: 10px;
}

.info img {
    width: 40px;
    height: 40px;
}

.info p {
    font-size: 24px;
    font-weight: 500;
    color: var(--tx-normal)
}

.info .description {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-semi);
    margin-top: 10px;
}

.info .category {
    margin-top: 16px;
    height: 30px;
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
    text-transform: capitalize;
}

.details {
    margin-top: 30px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    background: var(--accent);
    border: 1px solid var(--bg-darkest);
    border-radius: 4px;
}

.parameters {
    padding: 30px
}

.parameter {
    min-height: 100px;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid var(--bg-darkest);
}

.images {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
}

.images img {
    width: 24px;
    height: 24px;
    border-radius: 20px;
    object-fit: cover;
}

.parameter p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-semi);
}

.parameter h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--tx-normal);
    margin-top: 10px;
}

.parameter_grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
}

.parameters>.parameter:last-child {
    border-bottom: none;
}

.parameter span {
    color: var(--tx-dimmed);
    font-size: 14px;
    margin-top: 4px;
}

.chart_data {
    background: var(--bg-dark);
    padding: 30px 0 30px 30px;
    overflow: auto;
}

.chart_tools {
    display: flex;
    justify-content: flex-end;
    padding-right: 30px;
    margin-bottom: 20px;
}

.chart_tools .interval {
    background: var(--bg-darkest);
    padding: 0 12px;
    height: 30px;
    border: 1px solid transparent;
    color: var(--tx-semi);
    font-size: 12px;
    font-weight: 500;
}

.chart_tools .interval:first-child {
    border-radius: 4px 0 0 4px;
}

.chart_tools .interval:last-child {
    border-radius: 0 4px 4px 0;
}

.chart_tools .interval_active {
    border: 1px solid var(--primary);
    color: var(--primary);
    background: var(--accent);
}

@media screen and (max-width: 768px) {
    section {
        padding-top: 30px;
    }

    .title {
        gap: 10px;
    }

    .title h3 {
        font-size: 14px;
    }


    .info {
        margin-top: 16;
    }

    .info img {
        width: 20px;
        height: 20px;
    }

    .info p {
        font-size: 16px;
    }

    .info .description {
        font-size: 12px;
        margin-top: 18x;
    }

    .info .category {
        margin-top: 10px;
        height: 30px;
        padding: 0 10px;
        gap: 8px;
        font-size: 10px;
    }

    .details {
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr;
    }

    .parameters {
        padding: 16px;
    }

    .parameter {
        min-height: 80px;
        padding: 10px 0;
    }

    .images {
        gap: 8px;
    }

    .images img {
        width: 20px;
        height: 20px;
    }

    .parameter p {
        font-size: 12px;
    }

    .parameter h3 {
        font-size: 14px;
    }

}
</style>
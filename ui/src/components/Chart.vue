<script setup lang="ts">
import Converter from '@/scripts/converter';
import { ref } from 'vue';
import { Chart, Area, Line, Grid } from 'vue3-charts';
import type { Direction, ChartAxis } from 'vue3-charts/src/types';

const props = defineProps({
    data: { type: Object },
    marker: { type: Boolean },
    domain: { required: true },
    symbol: { type: String },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
});
const direction = ref<Direction>('horizontal');
const margin = ref({
    left: 0,
    top: 20,
    right: 20,
    bottom: 0
});
const axis = ref<ChartAxis>({
    primary: {
        type: 'band',
        domain: ['dataMin', 'dataMax'],
        hide: true
    },
    secondary: {
        domain: props.domain as any,
        type: 'linear',
        ticks: 8,
        format: (value) => `${props.symbol}${Converter.toMoney(value)}`
    }
})

</script>

<template>
    <Chart ref="chartRef" :size="{ width: props.width, height: props.height }" style="color: var(--tx-semi);"
        :data="(props.data as any)" :margin="margin" :direction="direction" :axis="axis">

        <template #layers>
            <Grid :stroke-dasharray="'2,2'" :hide-y="true" />

            <Area :dataKeys="['name', 'answer']" type="monotone" :areaStyle="{ fill: 'url(#grad)' }" />

            <Line :dataKeys="['name', 'answer']" type="monotone" :lineStyle="{
                stroke: 'var(--primary)'
            }" />

            <defs>
                <linearGradient id="grad" gradientTransform="rotate(90)">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.4" />
                    <stop offset="2%" stop-color="var(--primary)" stop-opacity="0" />
                </linearGradient>
            </defs>
        </template>
    </Chart>
</template>
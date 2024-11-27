<template>
    {{ formattedTime }}
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
    props: {
        lastUpdatedAt: {
            type: Number,
            required: true, // Timestamp in milliseconds
        },
        interval: {
            type: Number,
            required: true, // Interval in milliseconds
        },
        showHours: {
            type: Boolean,
            required: true,
        }
    },
    setup(props) {
        const countdown = ref(0);

        // Function to calculate remaining time
        const updateCountdown = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - props.lastUpdatedAt;
            const remainingTime = props.interval - (elapsedTime % props.interval);

            // Ensure countdown doesn't go negative
            countdown.value = remainingTime > 0 ? remainingTime : 0;
        };

        // Watch for updates to `lastUpdatedAt` prop and start the countdown
        watch(() => props.lastUpdatedAt, () => {
            updateCountdown();
        });

        // Update countdown every second
        setInterval(() => {
            if (countdown.value <= 0) {
                updateCountdown();
            } else {
                countdown.value -= 1000; // Decrease countdown by 1 second
            }
        }, 1000);

        // Computed property to format the remaining time into hours, minutes, seconds
        const formattedTime = computed(() => {
            const seconds = Math.floor(countdown.value / 1000) % 60;
            const minutes = Math.floor(countdown.value / (1000 * 60)) % 60;
            const hours = Math.floor(countdown.value / (1000 * 60 * 60));
            return props.showHours ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
        });

        return {
            formattedTime,
        };
    },
});
</script>
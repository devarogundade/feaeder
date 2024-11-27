<script setup lang="ts">
import TwitterIcon from './icons/TwitterIcon.vue';
</script>

<template>
    <section>
        <div class="app_width">
            <footer>
                <p>All right reserved.</p>
                <div class="links">
                    <a href="https://x.com/feaeder" target="_blank">
                        <TwitterIcon />
                    </a>
                </div>
            </footer>
        </div>
    </section>
</template>

<style scoped>
section {
    height: 50px;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
}

footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

footer p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-semi);
}

@media screen and (max-width: 768px) {
    section {
        height: 40px;
    }

    footer p {
        font-size: 12px;
    }
}
</style>
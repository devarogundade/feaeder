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
</style>
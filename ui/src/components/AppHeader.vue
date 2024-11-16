<script setup lang="ts">
import EnthroLogo from '@/components/icons/EnthroLogo.vue';
import ArrowRightIcon from './icons/ArrowRightIcon.vue';
import DiscoverIcon from './icons/DiscoverIcon.vue';
import { useRoute } from 'vue-router';
import { connectWallet } from '@/scripts/connect';
import { useWalletStore } from '@/stores/wallet';
import Converter from '@/scripts/converter';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const route = useRoute();
const walletStore = useWalletStore();
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });

const connect = async () => {
    const address = await connectWallet();

    if (address) {
        walletStore.setAddress(address);
    } else {
        toast.error('Error: Wallet connection failed.');
    }
};
</script>

<template>
    <section>
        <div class="app_width">
            <header>
                <EnthroLogo />
                <div class="contents">
                    <nav class="tabs">
                        <RouterLink to="/">
                            <button :class="route.name == 'datafeeds' ? 'tab tab_active' : 'tab'">
                                <p>Data Feeds</p>
                                <ArrowRightIcon />
                            </button>
                        </RouterLink>
                        <RouterLink to="/vrf">
                            <button :class="route.name == 'vrf' ? 'tab tab_active' : 'tab'">
                                VRF
                            </button>
                        </RouterLink>
                        <RouterLink to="/functions">
                            <button :class="route.name == 'functions' ? 'tab tab_active' : 'tab'">
                                Functions
                            </button>
                        </RouterLink>
                    </nav>

                    <div class="actions">
                        <div class="search_bar">
                            <ArrowRightIcon />
                            <input type="text" placeholder="Search data feeds" />
                        </div>

                        <button class="docs">
                            <DiscoverIcon :color="'var(--tx-semi)'" />
                        </button>

                        <button class="connect_wallet" @click="connect">
                            {{ walletStore.address ?
                                Converter.toChecksumAddress(walletStore.address) :
                                'Connect wallet'
                            }}
                        </button>
                    </div>
                </div>
            </header>
        </div>
    </section>
</template>

<style scoped>
section {
    background: #FFF;
    position: sticky;
    top: 0;
    z-index: 1;
}

header {
    height: 80px;
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 40px;
}

.contents {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    gap: 20px;
}

.actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.tabs {
    height: 100%;
    display: flex;
    align-items: center;
}

.tabs a {
    display: block;
    height: 100%;
}

.tab {
    height: 100%;
    padding: 0 20px;
    border: none;
    background: #FFF;
    border-left: 1px solid var(--bg-darkest);
    color: var(--tx-normal);
    font-size: 16px;
    font-weight: 500;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
}

.tab_active {
    border-bottom: 4px solid var(--primary-light);
}

.tab:hover {
    color: var(--primary);
}

.tabs a:last-child {
    border-right: 1px solid var(--bg-darkest);
}

.tabs a:last-child {
    text-decoration: line-through;
}

.search_bar {
    width: 240px;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid var(--bg-darkest);
    background: #FFF;
    padding: 0 10px;
}

.search_bar input {
    border: none;
    background: none;
    height: 100%;
    outline: none;
    font-size: 14px;
    font-weight: 400;
    color: var(--tx-normal);
}

.docs {
    background: none;
    outline: none;
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.connect_wallet {
    padding: 0 16px;
    border-radius: 4px;
    background: var(--primary);
    color: var(--bg);
    border: none;
    height: 40px;
    font-size: 14px;
    font-weight: 500;
}
</style>
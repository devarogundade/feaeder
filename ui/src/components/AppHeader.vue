<script setup lang="ts">
import FeaederLogo from '@/components/icons/FeaederLogo.vue';
import { useRoute } from 'vue-router';
import { connectWallet } from '@/scripts/connect';
import { useWalletStore } from '@/stores/wallet';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import SearchIcon from './icons/SearchIcon.vue';
import DocsIcon from './icons/DocsIcon.vue';
import Button from './Button.vue';
import { ref } from 'vue';
import ToolTip from './ToolTip.vue';
import { useDark } from '@vueuse/core';
import OutIcon from './icons/OutIcon.vue';

const route = useRoute();
const walletStore = useWalletStore();
const toast = useToast({ duration: 4000, position: 'top', dismissible: true });
const connectingWallet = ref(false);
const isDark = useDark({ attribute: 'data-theme' });
const handburgerRef = ref<HTMLDivElement>();
const menuRef = ref<HTMLDivElement>();

const connect = async () => {
    connectingWallet.value = true;

    const address = await connectWallet();

    if (address) {
        walletStore.setAddress(address);
    } else {
        toast.error('Error: Wallet connection failed.');
    }

    connectingWallet.value = false;
};

const onDrawer = () => {
    handburgerRef.value?.classList.toggle("open");
    menuRef.value?.classList.toggle("open_menu");
    document.body.classList.toggle("modal");
};
</script>

<template>
    <section>
        <div class="app_width">
            <header>
                <FeaederLogo />

                <div class="contents" ref="menuRef">
                    <nav class="tabs">
                        <RouterLink to="/">
                            <button :class="route.name?.toString().includes('datafeeds') ? 'tab tab_active' : 'tab'">
                                Data Feeds
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
                        <a href="https://docs.feaeder.xyz" target="_blank">
                            <button class="tab">
                                <p>Documentation</p>
                                <OutIcon />
                            </button>
                        </a>
                    </nav>

                    <div class="actions">
                        <div class="search_bar">
                            <SearchIcon />
                            <input type="text" placeholder="Search data feeds" />
                        </div>

                        <ToolTip :tooltip-text="'Documentation'" :position="'left'">
                            <a href="https://docs.feaeder.xyz" target="_blank">
                                <button class="docs">
                                    <DocsIcon />
                                </button>
                            </a>
                        </ToolTip>

                        <Button v-if="!walletStore.address" :loading="connectingWallet" @click="connect"
                            :text="'Connect wallet'" />
                        <RouterLink to="/subscription" v-else>
                            <Button :text="'My Subscrption'" />
                        </RouterLink>

                        <label class="switch">
                            <input type="checkbox" :checked="isDark" @change="(e) => {
                                // @ts-ignore
                                isDark = e.target.checked;
                            }">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <div class="handburger">
                    <div ref="handburgerRef" id="handburger" @click="onDrawer()">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </header>
        </div>
    </section>
</template>

<style scoped>
section {
    background: var(--accent);
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
    background: transparent;
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
    display: none;
}

.tabs a:nth-child(3) {
    text-decoration: line-through var(--accent);
    border-right: 1px solid var(--bg-darkest);
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
    background: var(--accent);
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

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

.handburger {
    display: none;
    cursor: pointer;
}

@media screen and (max-width: 768px) {
    header {
        height: 60px;
        gap: 16px;
        display: flex;
        justify-content: space-between;
    }

    .contents {
        position: fixed;
        height: 100%;
        width: 100%;
        left: -100%;
        top: 60px;
        background: var(--bg);
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 20px;
        z-index: 10;
    }

    .open_menu {
        left: 0;
    }

    .handburger {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        width: 40px;
        height: 40px;
    }

    #handburger {
        width: 24px;
        height: 14px;
        position: relative;
        transform: rotate(0deg);
        transition: 0.5s ease-in-out;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #handburger span {
        display: block;
        position: absolute;
        height: 2px;
        width: 24px;
        background: var(--tx-normal);
        opacity: 1;
        left: 0;
        transform: rotate(0deg);
        transition: 0.25s ease-in-out;
    }

    #handburger span:nth-child(1) {
        top: 0px;
    }

    #handburger span:nth-child(2),
    #handburger span:nth-child(3) {
        top: 6px;
    }

    #handburger span:nth-child(4) {
        top: 12px;
    }

    #handburger.open span:nth-child(1) {
        top: 10px;
        width: 0%;
        left: 50%;
    }

    #handburger.open span:nth-child(2) {
        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    #handburger.open span:nth-child(3) {
        -webkit-transform: rotate(-45deg);
        -moz-transform: rotate(-45deg);
        -o-transform: rotate(-45deg);
        transform: rotate(-45deg);
    }

    #handburger.open span:nth-child(4) {
        top: 18px;
        width: 0%;
        left: 50%;
    }

    .open-menu {
        top: 90px !important;
        transition: .2s;
    }

    .tabs {
        flex-direction: column;
        height: unset;
        width: 100%;
    }

    .tabs a {
        display: block;
        height: 64px;
        width: 100%;
    }

    .tab {
        width: 100%;
        text-align: left;
        border-top: 1px solid transparent;
        border-bottom: 1px solid var(--bg-darkest);
        border-left: none;
        justify-content: flex-start;
        padding: 0;
        font-size: 14px;
    }

    .search_bar {
        display: none;
    }

    .actions>span {
        display: none;
    }

    .tabs a:nth-child(3) {
        border-right: none;
    }

    .tabs a:last-child {
        display: block;
    }

    .actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 60px;
        justify-content: space-between;
        position: absolute;
        bottom: 120px;
        left: 0;
        padding: 20px
    }
}
</style>
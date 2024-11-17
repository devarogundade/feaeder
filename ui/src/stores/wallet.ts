import type { Subscription } from '@/types';
import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    address: null as `ak_${string}` | null,
    subscription: null as Subscription | null
  }),
  actions: {
    setAddress(newAddress: `ak_${string}` | null) {
      this.address = newAddress;
    },
    setSubscription(newSubscription: Subscription | null) {
      this.subscription = newSubscription;
    }
  }
});

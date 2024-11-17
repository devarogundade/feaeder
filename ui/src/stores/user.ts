import type { Subscription } from '@/types';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    subscription: null as Subscription | null
  }),
  actions: {
    setSubscription(newSubscription: Subscription | null) {
      this.subscription = newSubscription;
    }
  }
});

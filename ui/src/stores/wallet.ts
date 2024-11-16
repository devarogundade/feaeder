import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    address: null as `ak_${string}` | null,
  }),
  actions: {
    setAddress(newAddress: `ak_${string}` | null) {
      this.address = newAddress;
    }
  }
});

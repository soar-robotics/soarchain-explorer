import { defineStore } from 'pinia';

export const usePoaStore = defineStore('poaStore', {
  state: () => {
    return {
      totalCars: '0',
    };
  },
  getters: {},
  actions: {
    initial() {
      this.fetchReputation();
    },
    async fetchReputation() {
      try {
        const res = await fetch('https://rpc1.testnet.soarchain.com/api/soarchain/poa/reputation')
          .then(response => response.json())
          .catch(() => {
            this.totalCars = '0';
          });
        if (res) {
          this.totalCars = res.pagination.total.toString();
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
});
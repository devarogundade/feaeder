import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import VRFView from '@/views/VRFView.vue';
import FunctionsView from '@/views/FunctionsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'datafeeds',
      component: HomeView,
    },
    {
      path: '/feeds/:id',
      name: 'datafeed',
      component: HomeView,
    },
    {
      path: '/vrf',
      name: 'vrf',
      component: VRFView,
    },
    {
      path: '/functions',
      name: 'functions',
      component: FunctionsView,
    }
  ],
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import VRFView from '@/views/VRFView.vue';
import FunctionsView from '@/views/FunctionsView.vue';
import SubscriptionView from '@/views/SubscriptionView.vue';
import DatafeedView from '@/views/DatafeedView.vue';

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
      name: 'datafeeds-id',
      component: DatafeedView,
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: SubscriptionView,
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

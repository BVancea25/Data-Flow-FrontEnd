/* eslint-disable prettier/prettier */
import { createRouter, createWebHistory } from 'vue-router';
import PrivateRoutes from './private';
import PublicRoutes from './public';
import { getKeycloak } from '@/security/keycloak';

const whiteList = ['Login', 'Register', 'Forget', 'Reset'];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 };

    return { top: 0 };
  },
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/NotFound.vue')
    },
    PrivateRoutes,
    PublicRoutes
  ]
});

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach(async (to) => {
  const kc = getKeycloak();

  if (to.meta.requiresAuth) {
    if (!kc.authenticated) {
      // Force redirect to Keycloak login
      await kc.login();
      return false; // stop navigation
    }
  }

  return true;
});

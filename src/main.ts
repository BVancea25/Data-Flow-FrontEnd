/* eslint-disable prettier/prettier */
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify/index';
import i18n from '@/plugins/i18n';
import msw from '@/plugins/msw';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css';
import VueApexCharts from 'vue3-apexcharts';
import store, { useUserStore } from './store';
import { initKeycloak, startTokenRefresh, getKeycloak } from './security/keycloak';

initKeycloak()
  .then((authenticated) => {
    if (authenticated) {
      const app = createApp(App);
      app.use(router);
      app.use(PerfectScrollbar);
      app.use(VueApexCharts);
      app.use(store);
      app.use(i18n);
      app.use(msw);

      const userStore = useUserStore();
      userStore.refreshFromKeycloak();

      console.log(userStore.getUsername);

      app.use(vuetify).mount('#app');

      // Start background token refresh
      startTokenRefresh();
    }
  })
  .catch((err) => {
    console.error('Failed to initialize Keycloak', err);
  });

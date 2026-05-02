<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import Logo from '@/components/Logo.vue';
import { reactive, computed } from 'vue';
import { useLocale } from 'vuetify';

const { t } = useLocale();
const items = [
  { type: 'subheader', title: t('Data') },
  {
    title: t('Import'),
    props: {
      prependIcon: 'mdi-invoice-import-outline',
      link: true,
      to: '/import',
      exact: true
    },
    value: '/import'
  },
  {
    title: t('Transactions'),
    props: {
      prependIcon: 'mdi-currency-usd',
      link: true,
      to: '/list/transactions',
      exact: true
    },
    value: '/list/transactions'
  },
  {
    title: t('Categories'),
    props: {
      prependIcon: 'mdi-widgets-outline',
      link: true,
      to: '/list/categories',
      exact: true
    },
    value: '/list/categories'
  },
  { type: 'subheader', title: t('BI') },
  {
    title: t('Dashboard'),
    props: {
      prependIcon: 'mdi-view-dashboard-outline',
      link: true,
      to: '/',
      exact: true
    },
    value: '/'
  },
  {
    title: t('budgets'),
    props: {
      prependIcon: 'mdi-cash',
      link: true,
      to: '/budgets',
      exact: true
    },
    value: '/budgets'
  }
];

const drawerProps = reactive({
  rail: false,
  railWidth: 256,
  icon: 'mdi-arrow-left'
});

const handleDrawerWidth = () => {
  const rail = drawerProps.rail;
  const railWidth = drawerProps.railWidth;
  drawerProps.rail = !rail;
  drawerProps.railWidth = railWidth == 64 ? 256 : 64;
  drawerProps.icon = drawerProps.railWidth === 256 ? 'mdi-arrow-expand-left  ' : 'mdi-arrow-expand-right';
};

const menus = computed(() => {
  if (drawerProps.railWidth === 256) {
    return items;
  } else {
    return items.filter((item) => {
      return item.type !== 'subheader';
    });
  }
});
</script>

<template>
  <VNavigationDrawer :rail-width="drawerProps.railWidth" :rail="drawerProps.rail" :border="true" :elevation="1">
    <VToolbar class="px-3" color="transparent">
      <Logo :height="26" />
      <VToolbarTitle>DataFlow</VToolbarTitle>
    </VToolbar>
    <div class="app-drawer__inner">
      <VList :items="menus" color="primary" class="menu-list" nav :slim="true" />
    </div>
    <VBtn
      class="btn-collapse"
      rounded="lg"
      color="white"
      size="x-small"
      :icon="drawerProps.icon"
      @click="handleDrawerWidth"
      :style="{ left: drawerProps.railWidth - 12 + 'px' }"
    />
  </VNavigationDrawer>
</template>

<style lang="scss">
.btn-collapse {
  position: absolute;
  inset-block-start: 50%;
  transform: translateY(-50%);
}
.menu-list {
  .v-list-subheader__text {
    text-transform: uppercase;
  }
  .v-list-item__prepend > .v-icon {
    margin-inline-end: 16px;
  }
  .v-list-item-title {
    text-transform: capitalize;
  }
}
</style>

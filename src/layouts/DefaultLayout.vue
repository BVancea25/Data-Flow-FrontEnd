<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import AppToolbar from '@/components/AppToolbar.vue';
import { computed } from 'vue';
const route = useRoute();

const pageTitle = computed(() => String(route.meta.title || route.name || 'DataFlow'));
const pageSubtitle = computed(() => String(route.meta.subtitle || ''));
</script>

<template>
  <VApp class="app">
    <!------Sidebar-------->
    <AppSidebar />
    <!------Header-------->
    <AppToolbar />
    <!------Page-------->
    <VMain class="app-main">
      <VContainer class="app-container">
        <div class="page-wrapper">
          <header class="page-header">
            <div>
              <div class="page-kicker">DataFlow</div>
              <h1 class="page-title">{{ pageTitle }}</h1>
              <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
            </div>
          </header>
          <RouterView />
        </div>
      </VContainer>
    </VMain>
  </VApp>
</template>

<style lang="scss">
.app-main {
  background-color: var(--v-theme-background, '#f6f6f6');
  .app-container {
    max-width: 1440px;
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      padding: 28px 0 22px;
    }

    .page-kicker {
      color: rgb(var(--v-theme-primary));
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .page-title {
      color: #202433;
      font-size: 30px;
      line-height: 1.15;
      font-weight: 800;
      margin: 0;
    }

    .page-subtitle {
      color: #747988;
      font-size: 14px;
      line-height: 1.5;
      margin: 8px 0 0;
      max-width: 720px;
    }

    @media (max-width: 600px) {
      .page-header {
        padding: 22px 0 18px;
      }

      .page-title {
        font-size: 24px;
      }
    }
  }
}
</style>

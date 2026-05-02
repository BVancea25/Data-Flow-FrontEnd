<script setup lang="ts">
import { ref } from 'vue';
const props = withDefaults(
  defineProps<{
    height: number;
  }>(),
  {
    height: 36
  }
);

const primary = ref('rgb(var(--v-theme-primary))');
const secondary = ref('rgb(var(--v-theme-secondary))');
</script>

<template>
  <div style="line-height: 0; color: rgb(var(--v-theme-primary))" class="logo">
    <svg :height="props.height" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" aria-label="DataFlow logo">
      <rect x="8" y="8" width="56" height="56" rx="14" :fill="String(primary)" />
      <path
        d="M21 24h15c8.84 0 16 7.16 16 16v8H37c-8.84 0-16-7.16-16-16v-8Z"
        :fill="String(secondary)"
      />
      <path d="M24 24h12c6.63 0 12 5.37 12 12H36c-6.63 0-12-5.37-12-12Z" fill="white" fill-opacity=".92" />
      <circle cx="24" cy="48" r="4" fill="white" fill-opacity=".92" />
      <circle cx="36" cy="48" r="4" fill="white" fill-opacity=".92" />
      <circle cx="48" cy="48" r="4" fill="white" fill-opacity=".92" />
    </svg>
  </div>
</template>

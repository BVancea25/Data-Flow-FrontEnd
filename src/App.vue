<script lang="ts">
import Snackbar from './components/Snackbar.vue';
</script>

<template>
<VLocaleProvider>
  <RouterView />
  <Snackbar></Snackbar>
</VLocaleProvider>
</template>

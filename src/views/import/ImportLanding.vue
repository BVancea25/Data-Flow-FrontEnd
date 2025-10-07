<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToBulkImport = () => {
  router.push({ name: 'ImportTransactions' });
};
</script>

<template>
  <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <VCard class="rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer" @click="goToBulkImport">
      <VCardTitle>Bulk Transaction Import</VCardTitle>
      <VCardText>
        Upload a CSV, XLSX, JSON or XML file with your transactions to import or update data in bulk. Useful for
        onboarding or syncing with external systems.
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click.stop="goToBulkImport">Start Import</VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

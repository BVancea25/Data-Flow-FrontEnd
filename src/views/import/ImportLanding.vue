<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { VCardActions, VCardText } from 'vuetify/components';
import { refreshTransactions, createConsent, getConsent } from '@/api/bt';
import { ref, onMounted } from 'vue';

const router = useRouter();

const goToBulkImport = () => {
  router.push({ name: 'ImportTransactions' });
};

const consentStatus = ref<string | null>(null);

onMounted(async () => {
  consentStatus.value = await getConsent();
});
</script>

<template>
  <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 card-margin">
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
    <VCard class="rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer">
      <VCardTitle>Connect your BT account</VCardTitle>
      <VCardText> BT </VCardText>
      <VCardActions>
        <!-- If consent is valid: show "Connected" -->
        <VChip v-if="consentStatus === 'valid'" color="green" class="text-white"> Connected </VChip>
        <VBtn v-if="consentStatus === 'valid'" color="info" @click.stop="refreshTransactions()">
          Refresh your transactions
        </VBtn>
        <!-- If not valid/expired/null: show Connect button -->
        <VBtn v-else color="primary" @click.stop="createConsent()"> Connect </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
.card-margin > * {
  margin-bottom: 30px;
}
</style>

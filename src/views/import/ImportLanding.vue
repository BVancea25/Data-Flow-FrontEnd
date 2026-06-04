<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { VCardActions, VCardText } from 'vuetify/components';
import { refreshTransactions, createConsent, getConsent } from '@/api/bt';
import { createRevolutConsent, getRevolutConsent, refreshRevolutTransactions, revokeRevolutConsent } from '@/api/revolut';
import { ref, onMounted } from 'vue';
import { getApiErrorMessage } from '@/utils/apiErrors';

const router = useRouter();

const goToBulkImport = () => {
  router.push({ name: 'ImportTransactions' });
};

const consentStatus = ref<string | null>(null);
const btActionLoading = ref(false);
const btErrorMessage = ref('');
const btSuccessMessage = ref('');
const revolutConsentStatus = ref<string | null>(null);
const revolutActionLoading = ref(false);
const revolutErrorMessage = ref('');
const revolutSuccessMessage = ref('');

onMounted(async () => {
  try {
    consentStatus.value = (await getConsent()) as unknown as string;
  } catch (err) {
    btErrorMessage.value = getApiErrorMessage(err, 'Unable to check the BT connection status.');
  }

  try {
    revolutConsentStatus.value = await getRevolutConsent();
  } catch (err) {
    revolutErrorMessage.value = getApiErrorMessage(err, 'Unable to check the Revolut connection status.');
  }
});

async function handleCreateConsent() {
  btActionLoading.value = true;
  btErrorMessage.value = '';
  btSuccessMessage.value = '';

  try {
    await createConsent();
  } catch (err) {
    btErrorMessage.value = getApiErrorMessage(err, 'Unable to start the BT connection. Please try again.');
  } finally {
    btActionLoading.value = false;
  }
}

async function handleRefreshTransactions() {
  btActionLoading.value = true;
  btErrorMessage.value = '';
  btSuccessMessage.value = '';

  try {
    await refreshTransactions();
    btSuccessMessage.value = 'Transaction refresh started successfully.';
  } catch (err) {
    btErrorMessage.value = getApiErrorMessage(err, 'Unable to refresh BT transactions. Please try again.');
  } finally {
    btActionLoading.value = false;
  }
}

async function handleCreateRevolutConsent() {
  revolutActionLoading.value = true;
  revolutErrorMessage.value = '';
  revolutSuccessMessage.value = '';

  try {
    await createRevolutConsent();
  } catch (err) {
    revolutErrorMessage.value = getApiErrorMessage(err, 'Unable to start the Revolut connection. Please try again.');
  } finally {
    revolutActionLoading.value = false;
  }
}

async function handleRefreshRevolutTransactions() {
  revolutActionLoading.value = true;
  revolutErrorMessage.value = '';
  revolutSuccessMessage.value = '';

  try {
    await refreshRevolutTransactions();
    revolutSuccessMessage.value = 'Revolut transaction refresh started successfully.';
  } catch (err) {
    revolutErrorMessage.value = getApiErrorMessage(err, 'Unable to refresh Revolut transactions. Please try again.');
  } finally {
    revolutActionLoading.value = false;
  }
}

async function handleRevokeRevolutConsent() {
  revolutActionLoading.value = true;
  revolutErrorMessage.value = '';
  revolutSuccessMessage.value = '';

  try {
    await revokeRevolutConsent();
    revolutConsentStatus.value = 'expired';
    revolutSuccessMessage.value = 'Revolut connection removed successfully.';
  } catch (err) {
    revolutErrorMessage.value = getApiErrorMessage(err, 'Unable to remove the Revolut connection. Please try again.');
  } finally {
    revolutActionLoading.value = false;
  }
}
</script>

<template>
  <div class="import-options">
    <VCard class="import-card cursor-pointer" elevation="0" @click="goToBulkImport">
      <div class="card-icon card-icon--file">
        <VIcon icon="mdi-file-upload-outline" size="34" />
      </div>
      <VCardTitle class="card-title">Bulk Transaction Import</VCardTitle>
      <VCardText class="card-description">
        Import transactions from CSV, XLSX, XLS or XML files. Use this option for historical data, manual exports, or
        batches that need row-level validation feedback.
      </VCardText>
      <VCardActions class="card-actions">
        <VBtn color="primary" @click.stop="goToBulkImport">Start Import</VBtn>
      </VCardActions>
    </VCard>

    <VCard class="import-card" elevation="0">
      <div class="bt-logo-wrap">
        <VImg src="/assets/images/other/bt_logo.png" alt="Banca Transilvania logo" class="bt-logo" contain />
      </div>
      <VCardTitle class="card-title">Connect your BT account</VCardTitle>
      <VCardText class="card-description">
        Link your Banca Transilvania account to refresh transactions directly from the bank connection, without
        preparing an import file.
      </VCardText>
      <VAlert v-if="btErrorMessage" type="error" variant="tonal" density="comfortable" class="mb-4">
        {{ btErrorMessage }}
      </VAlert>
      <VAlert v-if="btSuccessMessage" type="success" variant="tonal" density="comfortable" class="mb-4">
        {{ btSuccessMessage }}
      </VAlert>
      <VCardActions class="card-actions">
        <!-- If consent is valid: show "Connected" -->
        <VChip v-if="consentStatus === 'valid'" color="green" class="text-white"> Connected </VChip>
        <VBtn
          v-if="consentStatus === 'valid'"
          color="info"
          :loading="btActionLoading"
          @click.stop="handleRefreshTransactions"
        >
          Refresh your transactions
        </VBtn>
        <!-- If not valid/expired/null: show Connect button -->
        <VBtn v-else color="primary" :loading="btActionLoading" @click.stop="handleCreateConsent"> Connect </VBtn>
      </VCardActions>
    </VCard>

    <VCard class="import-card" elevation="0">
      <div class="bank-logo-wrap">
        <VImg src="/assets/images/other/revolut.png" alt="Revolut logo" class="revolut-logo" contain />
      </div>
      <VCardTitle class="card-title">Connect your Revolut account</VCardTitle>
      <VCardText class="card-description">
        Link your Revolut account to refresh transactions directly from the bank connection, without preparing an import
        file.
      </VCardText>
      <VAlert v-if="revolutErrorMessage" type="error" variant="tonal" density="comfortable" class="mb-4">
        {{ revolutErrorMessage }}
      </VAlert>
      <VAlert v-if="revolutSuccessMessage" type="success" variant="tonal" density="comfortable" class="mb-4">
        {{ revolutSuccessMessage }}
      </VAlert>
      <VCardActions class="card-actions">
        <VChip v-if="revolutConsentStatus === 'valid'" color="green" class="text-white"> Connected </VChip>
        <VBtn
          v-if="revolutConsentStatus === 'valid'"
          color="info"
          :loading="revolutActionLoading"
          @click.stop="handleRefreshRevolutTransactions"
        >
          Refresh your transactions
        </VBtn>
        <VBtn
          v-if="revolutConsentStatus === 'valid'"
          color="error"
          variant="tonal"
          :loading="revolutActionLoading"
          @click.stop="handleRevokeRevolutConsent"
        >
          Disconnect
        </VBtn>
        <VBtn v-else color="primary" :loading="revolutActionLoading" @click.stop="handleCreateRevolutConsent">
          Connect
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
.import-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.import-card {
  display: flex;
  flex-direction: column;
  min-height: 260px;
  padding: 22px;
  border: 1px solid #e7e9f0;
  border-radius: 8px;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.import-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 12px 26px rgba(24, 39, 75, 0.08);
  transform: translateY(-2px);
}

.card-icon,
.bt-logo-wrap,
.bank-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: #f5f7fb;
}

.card-icon--file {
  color: rgb(var(--v-theme-primary));
}

.bt-logo {
  width: 54px;
  height: 54px;
}

.revolut-logo {
  width: 56px;
  height: 56px;
}

.card-title {
  padding: 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
}

.card-description {
  flex: 1;
  padding: 10px 0 18px;
  color: #5f6678;
  line-height: 1.6;
}

.card-actions {
  gap: 10px;
  padding: 0;
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .import-options {
    grid-template-columns: 1fr;
  }
}
</style>

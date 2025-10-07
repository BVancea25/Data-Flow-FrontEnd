<script setup lang="ts">
import { ref } from 'vue';
import api from '@/api/axios';
import { requiredValidator } from '@/utils/validators';

const file = ref<File | null>(null);
const uploading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const selectedDateFormat = ref('');

const dateFormats = [
  { label: '', value: '' },
  { label: 'ISO (2025-02-11T03:36:00)', value: 'ISO' },
  { label: 'YYYY-MM-DD HH:mm:ss (2025-02-11 03:36:00)', value: 'yyyy-MM-dd HH:mm:ss' },
  { label: 'MM/DD/YYYY HH:mm:ss (02/11/2025 03:36:00)', value: 'MM/dd/yyyy HH:mm:ss' },
  { label: 'YYYY/MM/DD HH:mm:ss (2025/02/11 03:36:00)', value: 'yyyy/MM/dd HH:mm:ss' },
  { label: 'M/d/yyyy HH:mm:ss (2/11/2025 03:36:00)', value: 'M/d/yyyy HH:mm:ss' }
];

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;

  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
  }
}

const uploadFile = async () => {
  if (!file.value) return;

  uploading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('file', file.value);
  if (selectedDateFormat.value != '') {
    formData.append('formatDateTime', selectedDateFormat.value);
  }

  try {
    const resp = await api.post(import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST + '/transaction/upload', formData, {
      Headers: { 'Content-Type': 'multipart/form-data' }
    });
    successMessage.value = 'File uploaded successfully! The import process has started.';
    console.log(resp.data);
  } catch (err: any) {
    errorMessage.value = 'Upload failed. Please verify the format.';
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <VCard>
      <VCardTitle>Transaction Import Instructions</VCardTitle>
      <VCardText>
        <p>Please prepare your data in <b>CSV</b> format with the following columns:</p>
        <ul class="list-disc ml-6">
          <li><code>transaction_date</code> Multiple formats supported, one can be selected to speed up the process</li>
          <li><code>category</code> (text)</li>
          <li><code>description</code> (optional text)</li>
          <li><code>amount</code> (decimal)</li>
          <li><code>currency</code> (currency code, text)</li>
          <li><code>payment_mode</code> (text)</li>
        </ul>
        <VSelect
          v-model="selectedDateFormat"
          :items="dateFormats"
          label="Select Date Format"
          item-title="label"
          item-value="value"
          class="mt-3"
        />
      </VCardText>
    </VCard>

    <VCard>
      <VCardTitle>Upload Your File</VCardTitle>
      <VCardText>
        <input type="file" accept=".csv,.xlsx,.xml,.json" @change="handleFileChange" />
        <div v-if="file" class="mt-2">Selected file: {{ file.name }}</div>

        <VBtn color="primary" class="mt-4" :loading="uploading" :disabled="!file" @click="uploadFile"> Upload </VBtn>

        <div v-if="successMessage" class="mt-3 text-green-600">{{ successMessage }}</div>
        <div v-if="errorMessage" class="mt-3 text-red-600">{{ errorMessage }}</div>
      </VCardText>
    </VCard>
  </div>
</template>

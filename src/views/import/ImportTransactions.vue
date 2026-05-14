<script setup lang="ts">
import { ref } from 'vue';
import api from '@/api/axios';
import { getApiErrorMessage } from '@/utils/apiErrors';

const file = ref<File | null>(null);
const uploading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const warningMessage = ref('');
const selectedDateFormat = ref('');
const errorReportBase64 = ref('');
const errorReportFileName = ref('');

const allowedExtensions = ['csv', 'xlsx', 'xls', 'xml'];

interface ImportResult {
  message: string;
  importedRows: number;
  failedRows: number;
  errorReportFileName?: string;
  errorReportBase64?: string;
}

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
    errorMessage.value = '';
    warningMessage.value = '';
    successMessage.value = '';
    errorReportBase64.value = '';
    errorReportFileName.value = '';
  }
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function validateFile(selectedFile: File | null) {
  if (!selectedFile) {
    return 'Please select a transaction file before uploading.';
  }

  if (selectedFile.size === 0) {
    return 'The selected file is empty. Please choose a file with transaction rows.';
  }

  const extension = getFileExtension(selectedFile.name);
  if (!allowedExtensions.includes(extension)) {
    return 'Unsupported file type. Allowed formats are CSV, XLSX, XLS, and XML.';
  }

  return '';
}

function downloadErrorReport() {
  if (!errorReportBase64.value || !errorReportFileName.value) return;

  const binary = atob(errorReportBase64.value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = errorReportFileName.value;
  link.click();

  URL.revokeObjectURL(url);
}

const uploadFile = async () => {
  const validationError = validateFile(file.value);
  if (validationError) {
    errorMessage.value = validationError;
    successMessage.value = '';
    warningMessage.value = '';
    return;
  }

  uploading.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  warningMessage.value = '';
  errorReportBase64.value = '';
  errorReportFileName.value = '';

  const formData = new FormData();
  formData.append('file', file.value as File);
  if (selectedDateFormat.value != '') {
    formData.append('formatDateTime', selectedDateFormat.value);
  }

  try {
    const resp = await api.post(import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST + '/income/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const result = resp.data as ImportResult;

    if (result.failedRows > 0) {
      warningMessage.value = `${result.message} Imported ${result.importedRows} rows and skipped ${result.failedRows} rows.`;
      errorReportBase64.value = result.errorReportBase64 || '';
      errorReportFileName.value = result.errorReportFileName || '';
      downloadErrorReport();
    } else {
      successMessage.value = result.message || `File imported successfully. Imported ${result.importedRows} rows.`;
    }
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Upload failed. Please verify the file format and contents.');
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
        <p>Please prepare your data in <b>CSV, XLSX, XLS, or XML</b> format with the following columns:</p>
        <ul class="list-disc ml-6">
          <li><code>transactionDate</code> Multiple formats supported, one can be selected to speed up the process</li>
          <li><code>categoryName</code> (text, optional)</li>
          <li><code>description</code> (optional text)</li>
          <li><code>amount</code> (decimal; positive values become income, zero or negative values become expenses)</li>
          <li><code>currencyCode</code> (currency code, for example RON or EUR)</li>
          <li><code>paymentMode</code> (<code>CARD</code>, <code>CASH</code>, or <code>TRANSFER</code>)</li>
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
        <input type="file" accept=".csv,.xlsx,.xls,.xml" @change="handleFileChange" />
        <div v-if="file" class="mt-2">Selected file: {{ file.name }}</div>

        <VBtn color="primary" class="mt-4" :loading="uploading" :disabled="!file" @click="uploadFile"> Upload </VBtn>

        <div v-if="successMessage" class="mt-3 text-green-600">{{ successMessage }}</div>
        <div v-if="warningMessage" class="mt-3 text-orange-600">
          {{ warningMessage }}
          <VBtn
            v-if="errorReportBase64"
            color="warning"
            variant="tonal"
            size="small"
            class="ml-2"
            @click="downloadErrorReport"
          >
            Download skipped rows
          </VBtn>
        </div>
        <div v-if="errorMessage" class="mt-3 text-red-600">{{ errorMessage }}</div>
      </VCardText>
    </VCard>
  </div>
</template>

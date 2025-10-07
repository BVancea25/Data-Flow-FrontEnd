<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { ITransaction } from '@/api/type';
import { createTransaction } from '@/api/transactions';
import { VAutocomplete, VTextField } from 'vuetify/components';
import { ICurrency, searchCurrenciesByCode } from '@/api/currency';

interface Props {
  show: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const formValid = ref(false);

const transaction = reactive<Partial<ITransaction>>({
  category: '',
  description: '',
  amount: 0,
  currencyCode: '',
  paymentMode: '',
  transactionDate: ''
});

const currencySearch = ref('');
const currencyItems = ref<ICurrency[]>([]);
const loadingCurrencies = ref(false);

watch(currencySearch, async (newQuery) => {
  if (!newQuery || newQuery.length < 1) {
    currencyItems.value = [];
    return;
  }
  loadingCurrencies.value = true;
  try {
    currencyItems.value = await searchCurrenciesByCode(newQuery);
  } catch (err) {
    console.error('Failed to fetch currencies:', err);
  } finally {
    loadingCurrencies.value = false;
  }
});

async function handleSubmit() {
  const form = formRef.value as any;
  if (!(await form.validate())) return;

  try {
    await createTransaction(transaction);
    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Failed to create transaction:', err);
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="600">
    <VCard>
      <VCardTitle>Add New Transaction</VCardTitle>
      <VCardText>
        <VForm ref="formRef" v-model="formValid">
          <VTextField
            class="form-field"
            v-model="transaction.category"
            label="Category"
            :rules="[(v) => !!v || 'Required']"
          />
          <VTextField class="form-field" v-model="transaction.description" label="Description" />
          <VTextField
            class="form-field"
            v-model.number="transaction.amount"
            label="Amount"
            type="number"
            :rules="[(v) => v > 0 || 'Must be > 0']"
          />
          <VAutocomplete
            class="form-field"
            v-model="transaction.currencyCode"
            v-model:search="currencySearch"
            :items="currencyItems"
            :loading="loadingCurrencies"
            item-title="name"
            item-value="code"
            label="Currency"
            clearable
            hide-no-data
            hide-details
            no-filter
          />
          <VTextField class="form-field" v-model="transaction.paymentMode" label="Payment Mode" />
          <VTextField v-model="transaction.transactionDate" label="Transaction Date" type="datetime-local" />
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text @click="emit('close')">Cancel</VBtn>
        <VBtn color="primary" :disabled="!formValid" @click="handleSubmit">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

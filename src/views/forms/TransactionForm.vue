<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { IIncome } from '@/api/type';
import { fetchCategories } from '@/api/category';
import type { Category, TransactionType } from '@/api/category';
import { createTransaction, updateTransaction } from '@/api/income';
import { VAutocomplete, VTextField } from 'vuetify/components';
import { ICurrency, searchCurrenciesByCode } from '@/api/currency';
import { typeOptions, paymentModeOptions } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiErrors';
import {
  dateTimeLocalValidator,
  maxTrimmedLengthValidator,
  positiveNumberValidator,
  requiredValidator
} from '@/utils/validators';

interface Props {
  show: boolean;
  transaction?: IIncome | null;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const formValid = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

const income = reactive<Partial<IIncome>>({
  categoryId: '',
  description: '',
  amount: 0,
  currencyCode: '',
  paymentMode: '',
  transactionDate: '',
  type: ''
});

const currencySearch = ref('');
const currencyItems = ref<ICurrency[]>([]);
const loadingCurrencies = ref(false);
const categories = ref<Category[]>([]);
const loadingCategories = ref(false);

function toDateTimeLocalInputValue(value: unknown) {
  if (!value) return '';

  const valueAsString = String(value);
  const localDateTimeMatch = valueAsString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if (localDateTimeMatch) return localDateTimeMatch[1];

  const parsed = new Date(valueAsString);
  if (Number.isNaN(parsed.getTime())) return valueAsString;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const currencyCodeRules = [
  requiredValidator,
  (value: unknown) => {
    if (!value) return true;

    const selectedCode = String(value);
    const selectedFromCurrentSearch = currencyItems.value.some((currency) => currency.code === selectedCode);
    const selectedFromExistingTransaction = props.transaction?.currencyCode === selectedCode;

    return selectedFromCurrentSearch || selectedFromExistingTransaction || 'Select a currency from the list';
  }
];

watch(currencySearch, async (newQuery) => {
  if (!newQuery || newQuery.length < 1) {
    currencyItems.value = [];
    return;
  }
  loadingCurrencies.value = true;
  try {
    currencyItems.value = await searchCurrenciesByCode(newQuery);
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to load currencies. Please try again.');
  } finally {
    loadingCurrencies.value = false;
  }
});

watch(
  () => props.transaction,
  (newVal) => {
    errorMessage.value = '';

    if (newVal) {
      Object.assign(income, newVal); // ✅ correctly populate reactive object
      income.transactionDate = toDateTimeLocalInputValue(newVal.transactionDate);
    } else {
      Object.assign(income, {
        categoryId: '',
        description: '',
        amount: 0,
        currencyCode: '',
        paymentMode: '',
        transactionDate: '',
        type: ''
      });
    }
  },
  { immediate: true }
);

watch(
  () => income.type,
  async (selectedType) => {
    loadingCategories.value = true;
    try {
      const type = selectedType as TransactionType | '';
      categories.value = await fetchCategories(type ? { type } : undefined);
      const hasSelectedCategory = categories.value.some((category) => category.id === income.categoryId);
      if (!hasSelectedCategory) {
        income.categoryId = '';
      }
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'Unable to load categories. Please try again.');
    } finally {
      loadingCategories.value = false;
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  const form = formRef.value as any;
  const validation = await form.validate();
  if (!validation.valid) return;

  submitting.value = true;
  errorMessage.value = '';

  try {
    if (props.transaction) {
      await updateTransaction(income);
    } else {
      await createTransaction(income);
    }
    emit('saved');
    emit('close');
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to save the transaction. Please try again.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="600">
    <VCard>
      <VCardTitle>{{ props.transaction ? 'Edit Transaction' : 'Add New Income Transaction' }}</VCardTitle>
      <VCardText>
        <VForm ref="formRef" v-model="formValid">
          <VSelect v-model="income.type" label="Type" class="form-field" :items="typeOptions" :rules="[requiredValidator]" />
          <VAutocomplete
            class="form-field"
            v-model="income.categoryId"
            :items="categories"
            :loading="loadingCategories"
            item-title="name"
            item-value="id"
            label="Category"
            :rules="[(v) => !!v || 'Required']"
            clearable
            :disabled="!income.type"
          />
          <VTextField
            class="form-field"
            v-model="income.description"
            label="Description"
            :rules="[maxTrimmedLengthValidator(180)]"
          />
          <VTextField
            class="form-field"
            v-model.number="income.amount"
            label="Amount"
            type="number"
            :rules="[requiredValidator, positiveNumberValidator]"
          />
          <VAutocomplete
            class="form-field"
            v-model="income.currencyCode"
            v-model:search="currencySearch"
            currencyItems
            :items="currencyItems"
            :loading="loadingCurrencies"
            item-title="name"
            item-value="code"
            label="Currency"
            clearable
            hide-no-data
            no-filter
            :rules="currencyCodeRules"
          />
          <VSelect
            class="form-field"
            v-model="income.paymentMode"
            :items="paymentModeOptions"
            label="Payment Mode"
            :rules="[requiredValidator]"
          />
          <VTextField
            class="form-field"
            v-model="income.transactionDate"
            label="Transaction Date"
            type="datetime-local"
            :rules="[requiredValidator, dateTimeLocalValidator]"
          />
        </VForm>
        <VAlert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mt-3">
          {{ errorMessage }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text :disabled="submitting" @click="emit('close')">Cancel</VBtn>
        <VBtn color="primary" :loading="submitting" :disabled="!formValid" @click="handleSubmit">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

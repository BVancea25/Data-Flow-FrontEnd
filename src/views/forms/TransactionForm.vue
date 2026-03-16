<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { IIncome } from '@/api/type';
import { fetchCategories } from '@/api/category';
import type { Category } from '@/api/category';
import { createTransaction } from '@/api/income';
import { VAutocomplete, VTextField } from 'vuetify/components';
import { ICurrency, searchCurrenciesByCode } from '@/api/currency';
import { typeOptions, paymentModeOptions } from '@/utils/constants';

interface Props {
  show: boolean;
  transaction?: IIncome | null;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const formValid = ref(false);

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

watch(
  () => props.transaction,
  (newVal) => {
    if (newVal) {
      Object.assign(income, newVal); // ✅ correctly populate reactive object
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
  async () => {
    loadingCategories.value = true;
    try {
      categories.value = await fetchCategories();
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      loadingCategories.value = false;
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  const form = formRef.value as any;
  if (!(await form.validate())) return;

  try {
    await createTransaction(income);
    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Failed to create income transaction:', err);
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="600">
    <VCard>
      <VCardTitle>Add New Income Transaction</VCardTitle>
      <VCardText>
        <VForm ref="formRef" v-model="formValid">
          <VSelect v-model="income.type" label="Type" class="form-field" :items="typeOptions" />
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
          />
          <VTextField class="form-field" v-model="income.description" label="Description" />
          <VTextField
            class="form-field"
            v-model.number="income.amount"
            label="Amount"
            type="number"
            :rules="[(v) => v > 0 || 'Must be > 0']"
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
            hide-details
            no-filter
          />
          <VSelect class="form-field" v-model="income.paymentMode" :items="paymentModeOptions" label="Payment Mode" />
          <VTextField
            class="form-field"
            v-model="income.transactionDate"
            label="Transaction Date"
            type="datetime-local"
          />
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

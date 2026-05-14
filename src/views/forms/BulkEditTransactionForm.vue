<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { fetchCategories } from '@/api/category';
import type { Category, TransactionType } from '@/api/category';
import { updateTransactions } from '@/api/income';
import type { UpdateIncome } from '@/api/type';
import { ICurrency, searchCurrenciesByCode } from '@/api/currency';
import { typeOptions, paymentModeOptions } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiErrors';

interface Props {
  show: boolean;
  ids: string[];
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const patch = reactive<Omit<UpdateIncome, 'ids'>>({
  type: undefined,
  categoryId: undefined,
  paymentMode: undefined,
  currencyCode: undefined
});

const categories = ref<Category[]>([]);
const loadingCategories = ref(false);
const currencySearch = ref('');
const currencyItems = ref<ICurrency[]>([]);
const loadingCurrencies = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

const hasAnyPatchValue = computed(() => Object.values(patch).some((value) => value != null && value !== ''));
const categoryRules = [
  (value: unknown) => {
    if (!value) return true;

    return !!patch.type || 'Select a type before selecting a category';
  }
];
const currencyCodeRules = [
  (value: unknown) => {
    if (!value) return true;

    const selectedCode = String(value);
    const selectedFromCurrentSearch = currencyItems.value.some((currency) => currency.code === selectedCode);

    return selectedFromCurrentSearch || 'Select a currency from the list';
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
  () => patch.type,
  async (selectedType) => {
    loadingCategories.value = true;
    try {
      const type = selectedType as TransactionType | undefined;
      categories.value = await fetchCategories(type ? { type } : undefined);
      const stillValid = categories.value.some((c) => c.id === patch.categoryId);
      if (!stillValid) patch.categoryId = undefined;
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'Unable to load categories. Please try again.');
    } finally {
      loadingCategories.value = false;
    }
  }
);

function handleClose() {
  Object.assign(patch, { type: undefined, categoryId: undefined, paymentMode: undefined, currencyCode: undefined });
  errorMessage.value = '';
  emit('close');
}

async function handleSubmit() {
  const validation = await formRef.value?.validate();
  if (validation && !validation.valid) return;

  if (!hasAnyPatchValue.value) {
    errorMessage.value = 'Select at least one field to update.';
    return;
  }

  // Strip undefined fields — only send what the user actually filled in
  const payload: UpdateIncome = {
    ids: props.ids,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v != null && v !== ''))
  };

  submitting.value = true;
  errorMessage.value = '';

  try {
    await updateTransactions(payload);
    emit('saved');
    handleClose();
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to update the selected transactions. Please try again.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VDialog :model-value="props.show" max-width="500" @update:model-value="handleClose">
    <VCard>
      <VCardTitle>Bulk Edit ({{ props.ids.length }} transactions)</VCardTitle>
      <VCardSubtitle>Only filled fields will be applied.</VCardSubtitle>
      <VCardText>
        <VForm ref="formRef">
          <VSelect v-model="patch.type" label="Type" class="form-field" :items="typeOptions" clearable />
          <VAutocomplete
            v-model="patch.categoryId"
            :items="categories"
            :loading="loadingCategories"
            item-title="name"
            item-value="id"
            label="Category"
            class="form-field"
            clearable
            :disabled="!patch.type"
            :rules="categoryRules"
          />
          <VSelect
            v-model="patch.paymentMode"
            :items="paymentModeOptions"
            label="Payment Mode"
            class="form-field"
            clearable
          />
          <VAutocomplete
            v-model="patch.currencyCode"
            v-model:search="currencySearch"
            :items="currencyItems"
            :loading="loadingCurrencies"
            item-title="name"
            item-value="code"
            label="Currency"
            class="form-field"
            clearable
            hide-no-data
            no-filter
            :rules="currencyCodeRules"
          />
        </VForm>
        <VAlert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mt-3">
          {{ errorMessage }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text :disabled="submitting" @click="handleClose">Cancel</VBtn>
        <VBtn color="primary" :loading="submitting" @click="handleSubmit">Apply</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

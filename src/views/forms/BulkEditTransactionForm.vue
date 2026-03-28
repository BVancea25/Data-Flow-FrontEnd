<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { fetchCategories } from '@/api/category';
import type { Category, TransactionType } from '@/api/category';
import { updateTransactions } from '@/api/income';
import type { UpdateIncome } from '@/api/type';
import { ICurrency, searchCurrenciesByCode } from '@/api/currency';
import { typeOptions, paymentModeOptions } from '@/utils/constants';

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
  () => patch.type,
  async (selectedType) => {
    loadingCategories.value = true;
    try {
      const type = selectedType as TransactionType | undefined;
      categories.value = await fetchCategories(type ? { type } : undefined);
      const stillValid = categories.value.some((c) => c.id === patch.categoryId);
      if (!stillValid) patch.categoryId = undefined;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      loadingCategories.value = false;
    }
  }
);

function handleClose() {
  Object.assign(patch, { type: undefined, categoryId: undefined, paymentMode: undefined, currencyCode: undefined });
  emit('close');
}

async function handleSubmit() {
  // Strip undefined fields — only send what the user actually filled in
  const payload: UpdateIncome = {
    ids: props.ids,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v != null && v !== ''))
  };

  try {
    await updateTransactions(payload);
    emit('saved');
    handleClose();
  } catch (err) {
    console.error('Failed to bulk update transactions:', err);
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
          />
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text @click="handleClose">Cancel</VBtn>
        <VBtn color="primary" @click="handleSubmit">Apply</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

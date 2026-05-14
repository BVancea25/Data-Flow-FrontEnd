<script setup lang="ts">
import { watch, ref, onMounted, computed } from 'vue';
import type { DashboardFilter } from '@/types/dashboard';
import { fetchCategories } from '@/api/category';
import type { Category } from '@/api/category';
import { searchCurrenciesByCode, type ICurrency } from '@/api/currency';
import { dateOnlyValidator, optionalDateRangeValidator } from '@/utils/validators';

interface Props {
  modelValue: DashboardFilter;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: DashboardFilter): void;
}>();

const categories = ref<Category[]>([]);
const currencies = ref<ICurrency[]>([]);

const currencySearch = ref('');
const isCurrencyLoading = ref(false);
const showAdvanced = ref(false);
const validationMessage = ref('');

const activeAdvancedFilters = computed(() => {
  return [
    props.modelValue.paymentMethod,
    props.modelValue.categoryId,
    props.modelValue.timeMeasure && props.modelValue.timeMeasure !== 'MONTH' ? props.modelValue.timeMeasure : null
  ].filter(Boolean).length;
});

function updateFilter<K extends keyof DashboardFilter>(key: K, value: DashboardFilter[K]) {
  const nextValue = {
    ...props.modelValue,
    [key]: value
  };

  if (key === 'from' || key === 'to') {
    const fromValid = dateOnlyValidator(nextValue.from);
    const toValid = dateOnlyValidator(nextValue.to);
    const rangeValid = optionalDateRangeValidator(nextValue.from, nextValue.to);

    if (fromValid !== true || toValid !== true || rangeValid !== true) {
      validationMessage.value =
        typeof rangeValid === 'string' ? rangeValid : 'Use valid dates before applying filters.';
      return;
    }
  }

  validationMessage.value = '';
  emit('update:modelValue', nextValue);
}

//currency watcher
watch(currencySearch, async (val) => {
  if (!val || val.length < 2) return;

  isCurrencyLoading.value = true;
  try {
    currencies.value = await searchCurrenciesByCode(val);
  } finally {
    isCurrencyLoading.value = false;
  }
});

onMounted(async () => {
  categories.value = await fetchCategories();
});
</script>

<template>
  <VCard class="dashboard-filters" elevation="0">
    <div class="quick-filter-grid">
      <VTextField
        :model-value="modelValue.from"
        type="date"
        label="From"
        density="compact"
        hide-details
        @update:model-value="updateFilter('from', $event)"
      />

      <VTextField
        :model-value="modelValue.to"
        type="date"
        label="To"
        density="compact"
        hide-details
        @update:model-value="updateFilter('to', $event)"
      />

      <VAutocomplete
        :model-value="modelValue.currencyCode"
        v-model:search="currencySearch"
        :items="currencies"
        :loading="isCurrencyLoading"
        item-title="code"
        item-value="code"
        label="Currency"
        density="compact"
        clearable
        hide-details
        no-filter
        :no-data-text="isCurrencyLoading ? 'Searching...' : 'Type to search currencies'"
        @update:model-value="updateFilter('currencyCode', $event)"
      />

      <VSelect
        :model-value="modelValue.type"
        :items="[
          { title: 'All activity', value: null },
          { title: 'Income', value: 'INCOME' },
          { title: 'Expense', value: 'EXPENSE' }
        ]"
        label="Type"
        density="compact"
        hide-details
        @update:model-value="updateFilter('type', $event)"
      />

      <VBtn
        class="filters-toggle"
        variant="tonal"
        color="primary"
        :prepend-icon="showAdvanced ? 'mdi-filter-minus-outline' : 'mdi-filter-variant'"
        @click="showAdvanced = !showAdvanced"
      >
        Filters
        <VChip v-if="activeAdvancedFilters" class="ml-2" size="x-small" color="primary">
          {{ activeAdvancedFilters }}
        </VChip>
      </VBtn>
    </div>

    <VAlert v-if="validationMessage" type="error" variant="tonal" density="compact" class="mt-3">
      {{ validationMessage }}
    </VAlert>

    <VExpandTransition>
      <div v-show="showAdvanced" class="advanced-filter-grid">
        <VSelect
          :model-value="modelValue.timeMeasure"
          :items="['DAY', 'MONTH', 'YEAR']"
          label="Group by"
          density="compact"
          hide-details
          @update:model-value="updateFilter('timeMeasure', $event)"
        />

        <VSelect
          :model-value="modelValue.paymentMethod"
          :items="[
            { title: 'All payments', value: null },
            { title: 'Cash', value: 'CASH' },
            { title: 'Card', value: 'CARD' },
            { title: 'Bank transfer', value: 'TRANSFER' }
          ]"
          label="Payment"
          density="compact"
          hide-details
          @update:model-value="updateFilter('paymentMethod', $event)"
        />

        <VAutocomplete
          :model-value="modelValue.categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
          density="compact"
          clearable
          hide-details
          @update:model-value="updateFilter('categoryId', $event)"
        />
      </div>
    </VExpandTransition>
  </VCard>
</template>

<style scoped>
.dashboard-filters {
  width: 100%;
  padding: 14px;
  border: 1px solid #e7e9f0;
  border-radius: 8px;
  background: #ffffff;
}

.quick-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
  gap: 12px;
  align-items: center;
}

.advanced-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #edf0f5;
}

.filters-toggle {
  height: 40px;
  min-width: 120px;
}

@media (max-width: 1100px) {
  .quick-filter-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  .filters-toggle {
    width: 100%;
  }
}

@media (max-width: 700px) {
  .quick-filter-grid,
  .advanced-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>

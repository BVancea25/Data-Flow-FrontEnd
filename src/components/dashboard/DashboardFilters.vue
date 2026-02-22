<script setup lang="ts">
import { reactive, watch, ref, onMounted, computed } from 'vue';
import type { DashboardFilter, TimeMeasure } from '@/api/types';
import { fetchCategories } from '@/api/category';
import type { Category } from '@/api/category';

interface Props {
  modelValue: DashboardFilter;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: DashboardFilter): void;
}>();

const categories = ref<Category[]>([]);

// local copy to avoid direct mutation
const localFilters = computed({
  get: () => props.modelValue,
  set: (val: DashboardFilter) => emit('update:modelValue', val)
});

watch(
  () => localFilters,
  (val) => {
    emit('update:modelValue', { ...val });
  },
  { deep: true }
);

onMounted(async () => {
  categories.value = await fetchCategories();
});
</script>

<template>
  <VCard class="pa-4 mb-4">
    <VRow dense>
      <!-- Date From -->
      <VCol cols="12" md="2">
        <VTextField v-model="localFilters.from" type="date" label="From" density="compact" />
      </VCol>

      <!-- Date To -->
      <VCol cols="12" md="2">
        <VTextField v-model="localFilters.to" type="date" label="To" density="compact" />
      </VCol>

      <!-- Time Measure -->
      <VCol cols="12" md="2">
        <VSelect
          v-model="localFilters.timeMeasure"
          :items="['DAY', 'MONTH', 'YEAR']"
          label="Time Measure"
          density="compact"
        />
      </VCol>

      <!-- Transaction Type -->
      <VCol cols="12" md="2">
        <VSelect
          v-model="localFilters.type"
          :items="[
            { title: 'All', value: null },
            { title: 'Income', value: 'INCOME' },
            { title: 'Expense', value: 'EXPENSE' }
          ]"
          label="Type"
          density="compact"
        />
      </VCol>

      <!-- Payment Method -->
      <VCol cols="12" md="2">
        <VSelect
          v-model="localFilters.paymentMethod"
          :items="[
            { title: 'All', value: null },
            { title: 'Cash', value: 'CASH' },
            { title: 'Card', value: 'CARD' },
            { title: 'Bank Transfer', value: 'TRANSFER' }
          ]"
          label="Payment"
          density="compact"
        />
      </VCol>

      <!-- Category -->
      <VCol cols="12" md="2">
        <VAutocomplete
          v-model="localFilters.categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
          density="compact"
          clearable
        />
      </VCol>
    </VRow>
  </VCard>
</template>

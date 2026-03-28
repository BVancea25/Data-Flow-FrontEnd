<template>
  <VCard variant="outlined" class="rounded-xl pa-5 shadow-sm hover-shadow transition-swing">
    <div class="d-flex justify-space-between align-start mb-4">
      <div>
        <h3 class="text-h6 font-weight-bold text-grey-darken-3 mb-0">{{ item.categoryName }}</h3>
        <p class="text-caption text-grey-lighten-1 text-uppercase font-weight-bold tracking-wider">
          {{ item.period?.toLowerCase() }} Budget
        </p>
        <p class="text-caption text-grey-darken-1 mb-0">
          Currency: {{ item.currencyCode }}
        </p>
      </div>
      <VChip :color="statusColor" size="small" label font-weight-bold>
        {{ item.status.replace('_', ' ') }}
      </VChip>
    </div>

    <div class="d-flex align-end gap-1 mb-1">
      <span class="text-h4 font-weight-black text-grey-darken-4">{{ item.spentAmount }}</span>
      <span class="text-grey-darken-1 text-body-2 mb-1">/ {{ item.limitAmount }}</span>
    </div>

    <VProgressLinear
      :model-value="Math.min(item.progressPercentage, 100)"
      :color="statusColor"
      height="12"
      rounded
      class="mb-3"
    />

    <div class="d-flex justify-space-between text-body-2">
      <span class="text-grey-darken-1">
        {{ item.remainingAmount > 0 ? `${item.remainingAmount} left` : 'Limit Reached' }}
      </span>
      <span :class="`text-${statusColor} font-weight-bold`"> {{ item.progressPercentage }}% </span>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BudgetStatus } from '@/types/budget';

const props = defineProps<{ item: BudgetStatus }>();

// Vuetify uses standard color names (success, warning, error)
const statusColor = computed(() => {
  if (props.item.status === 'EXCEEDED') return 'error';
  if (props.item.status === 'WARNING') return 'warning';
  return 'success';
});
</script>

<style scoped>
.hover-shadow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
.gap-1 {
  gap: 4px;
}
</style>

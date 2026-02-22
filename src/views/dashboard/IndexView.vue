<script setup lang="ts">
/*Call Components*/
import OverviewChart from '@/components/charts/OverviewChart.vue';
import YearlyBreakup from '@/components/charts/YearlyBreakup.vue';
import MonthlyEarning from '@/components/charts/MonthlyEarnings.vue';
import RecentTransaction from '@/components/dashboard/RecentTransaction.vue';
import RecentTask from '@/components/dashboard/RecentTask.vue';
import { reactive } from 'vue';
import type { DashboardFilter } from '@/types/dashboard';
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue';
const filters = reactive<DashboardFilter>({
  from: null,
  to: null,
  timeMeasure: 'MONTH',
  paymentMethod: null,
  categoryId: null,
  type: null
});
</script>
<template>
  <DashboardFilters v-model="filters" />
  <VRow>
    <VCol cols="12">
      <VRow>
        <!-- Sales overview -->
        <VCol cols="12" lg="8">
          <OverviewChart :filters="filters" />
        </VCol>
        <!-- Yearly Breakup / Monthly Earnings -->
        <VCol cols="12" lg="4">
          <div class="mb-6">
            <YearlyBreakup />
          </div>
          <div>
            <MonthlyEarning />
          </div>
        </VCol>
        <!-- Recent transaction -->
        <VCol cols="12" lg="4">
          <RecentTransaction />
        </VCol>
        <!-- Product performence -->
        <VCol cols="12" lg="8">
          <RecentTask />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

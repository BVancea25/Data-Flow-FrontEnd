<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

import { fetchCategoryComparison } from '@/api/dashboard';
import type { DashboardFilter, CategoryComparisonPoint } from '@/types/dashboard';

const props = defineProps<{
  filter: DashboardFilter;
}>();

const rawData = ref<CategoryComparisonPoint[]>([]);
const loading = ref(false);

async function loadChart() {
  loading.value = true;
  try {
    rawData.value = await fetchCategoryComparison(props.filter);
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    loading.value = false;
  }
}

watch(() => props.filter, loadChart, { deep: true });
onMounted(loadChart);

// 1. Sort data: Incomes first (descending), then Expenses (descending)
const sortedData = computed(() => {
  const incomes = rawData.value.filter((p) => p.type === 'INCOME').sort((a, b) => b.total - a.total);

  const expenses = rawData.value.filter((p) => p.type === 'EXPENSE').sort((a, b) => b.total - a.total);

  return [...incomes, ...expenses];
});

// 2. Categories for the Y-Axis
const categories = computed(() => sortedData.value.map((p) => p.category));

// 3. Build Mutually Exclusive Series
const chartSeries = computed(() => {
  return [
    {
      name: 'Income',
      data: sortedData.value.map((p) => (p.type === 'INCOME' ? Number(p.total) : 0))
    },
    {
      name: 'Expense',
      data: sortedData.value.map((p) => (p.type === 'EXPENSE' ? Number(p.total) : 0))
    }
  ];
});

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    stacked: true, // This is the key!
    toolbar: { show: false }
  },
  colors: ['#10b981', '#ef4444'], // Green and Red
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 2
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => (val > 0 ? `${val.toLocaleString()}` : ''),
    style: { fontSize: '10px' }
  },
  xaxis: {
    categories: categories.value,
    labels: {
      formatter: (val: number) => `${val.toLocaleString()}`
    }
  },
  yaxis: {
    labels: {
      style: { fontWeight: 600 }
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val.toLocaleString()}`
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  grid: {
    xaxis: { lines: { show: true } }
  }
}));

const hasData = computed(() => rawData.value.length > 0);
</script>

<template>
  <div class="chart-card">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="chart-title mb-0">Category Breakdown</h3>
      <v-chip size="small" color="secondary" variant="outlined">
        {{ filter.currencyCode }}
      </v-chip>
    </div>

    <div v-if="loading" class="state-container">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <VueApexCharts
        v-if="hasData"
        type="bar"
        :height="Math.max(350, categories.length * 40)"
        :options="chartOptions"
        :series="chartSeries"
      />

      <div v-else class="state-container no-data">
        <v-icon icon="mdi-chart-bar" size="large" />
        <p>No transactions found</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chart-card {
  background: white;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(20, 24, 40, 0.05);
  min-height: 430px;
  height: 100%;
}

.chart-title {
  font-size: 1rem;
  font-weight: 800;
  color: #202433;
}

.state-container {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
</style>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

import { fetchCategoryBreakdown } from '@/api/dashboard';
import type { DashboardFilter, CategoryBreakdownPoint } from '@/types/dashboard';

const props = defineProps<{
  filter: DashboardFilter;
}>();

const series = ref<number[]>([]);
const labels = ref<string[]>([]);
const loading = ref(false);

async function loadChart() {
  loading.value = true;
  try {
    const data: CategoryBreakdownPoint[] = await fetchCategoryBreakdown(props.filter);

    // Map the values and labels
    // We use Number() to ensure BigDecimal strings from the API are treated as numbers
    series.value = data.map((p) => Number(p.value));
    labels.value = data.map((p) => p.label || 'Unknown');
  } catch (error) {
    console.error('Failed to load category breakdown:', error);
    series.value = [];
    labels.value = [];
  } finally {
    loading.value = false;
  }
}

// Watch the entire filter object deeply
// When any property changes, reload the data
watch(
  () => props.filter,
  () => {
    loadChart();
  },
  { deep: true }
);

onMounted(loadChart);

// FIX: chartOptions MUST be computed so it unwraps labels.value
// and re-renders when labels update.
const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    id: 'category-donut'
  },
  labels: labels.value, // Now passing the raw array, not the ref object
  legend: {
    position: 'bottom'
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val.toLocaleString()}`
    }
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  ]
}));

// Optional: Check if we actually have data to show
const hasData = computed(() => series.value.length > 0);
</script>

<template>
  <div class="chart-card">
    <h3 class="chart-title">Category Distribution</h3>

    <div v-if="loading" class="state-container">
      <v-progress-circular indeterminate color="primary" />
      <div class="mt-2">Loading chart...</div>
    </div>

    <template v-else>
      <VueApexCharts v-if="hasData" type="donut" height="350" :options="chartOptions" :series="series" />

      <div v-else class="state-container no-data">
        <v-icon icon="mdi-chart-arc" size="large" class="mb-2" />
        <p>No data found for this period</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin-bottom: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.state-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.no-data {
  opacity: 0.6;
}
</style>

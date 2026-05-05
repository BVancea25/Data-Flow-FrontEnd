<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

import { fetchPaymentMethodBreakdown } from '@/api/dashboard';
import type { DashboardFilter, PaymentMethodBreakdownPoint } from '@/types/dashboard';

const props = defineProps<{
  filter: DashboardFilter;
}>();

const seriesData = ref<number[]>([]);
const categories = ref<string[]>([]);
const loading = ref(false);

const formatLabel = (label: string) => {
  return label
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function loadChart() {
  loading.value = true;
  try {
    const data: PaymentMethodBreakdownPoint[] = await fetchPaymentMethodBreakdown(props.filter);

    seriesData.value = data.map((p) => Number(p.total));
    categories.value = data.map((p) => formatLabel(p.paymentMethod));
  } catch (error) {
    console.error('Failed to load payment breakdown:', error);
  } finally {
    loading.value = false;
  }
}

watch(() => props.filter, loadChart, { deep: true });
onMounted(loadChart);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true, // Makes it a horizontal bar chart
      barHeight: '45%',
      distributed: true // Gives each bar a different color
    }
  },
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toLocaleString()}`,
    textAnchor: 'start',
    style: { colors: ['#fff'] }
  },
  xaxis: {
    categories: categories.value,
    labels: {
      formatter: (val: string) => `${val}`
    }
  },
  yaxis: {
    labels: {
      style: { fontWeight: 600 }
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => `${val.toLocaleString()}`
    }
  },
  legend: { show: false }
}));

// Format for ApexCharts Bar: [{ data: [10, 20...] }]
const chartSeries = computed(() => [
  {
    name: 'Total amount',
    data: seriesData.value
  }
]);

const hasData = computed(() => seriesData.value.length > 0);
</script>

<template>
  <div class="chart-card">
    <h3 class="chart-title">Payment Methods</h3>

    <div v-if="loading" class="state-container">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <VueApexCharts v-if="hasData" type="bar" height="350" :options="chartOptions" :series="chartSeries" />

      <div v-else class="state-container no-data">
        <v-icon icon="mdi-cash-register" size="large" class="mb-2" />
        <p>No payment data found</p>
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
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin-bottom: 12px;
  font-size: 1rem;
  font-weight: 800;
  color: #202433;
}

.state-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>

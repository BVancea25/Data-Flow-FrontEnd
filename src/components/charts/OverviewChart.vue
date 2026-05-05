<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { fetchOverview } from '@/api/dashboard';
import type { DashboardFilter, OverviewPoint } from '@/types/dashboard';

interface Props {
  filters: DashboardFilter;
}

const props = defineProps<Props>();

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const secondary = theme.current.value.colors.warning;

const overviewData = ref<OverviewPoint[]>([]);
const loading = ref(false);

async function loadData() {
  loading.value = true;
  try {
    overviewData.value = await fetchOverview(props.filters);
    console.log(overviewData.value);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [
    props.filters.from,
    props.filters.to,
    props.filters.timeMeasure,
    props.filters.paymentMethod,
    props.filters.categoryId,
    props.filters.type,
    props.filters.currencyCode
  ],
  loadData
);

onMounted(loadData);

const chartOptions = computed(() => {
  const categories = overviewData.value.map((d) => d.label);
  const income = overviewData.value.map((d) => d.income);
  const expense = overviewData.value.map((d) => d.expense);

  return {
    series: [
      { name: 'Income', data: income },
      { name: 'Expense', data: expense }
    ],
    chartOptions: {
      grid: {
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '35%', borderRadius: [8] }
      },
      colors: [primary, secondary],
      chart: {
        type: 'bar',
        height: 370,
        offsetX: -15,
        toolbar: { show: true },
        foreColor: '#adb0bb',
        fontFamily: 'inherit',
        sparkline: { enabled: false }
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      legend: { show: false },
      xaxis: {
        type: 'category',
        categories: categories,
        labels: {
          style: { cssClass: 'grey--text lighten-2--text fill-color' }
        }
      },
      yaxis: {
        show: true,
        min: 0,
        max: (max) => (max > 0 ? max : 100),
        labels: {
          style: {
            cssClass: 'grey--text lighten-2--text fill-color'
          }
        }
      },
      stroke: {
        show: true,
        width: 3,
        lineCap: 'butt',
        colors: ['transparent']
      },
      // tooltip: { theme: 'light' },

      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3
              }
            }
          }
        }
      ]
    }
  };
});
</script>
<template>
  <VCard class="chart-card" elevation="0">
    <VCardTitle class="chart-title">Cash Flow Overview</VCardTitle>

    <VCardText>
      <apexchart type="bar" height="350" :options="chartOptions.chartOptions" :series="chartOptions.series" />
    </VCardText>
  </VCard>
</template>

<style scoped>
.chart-card {
  height: 100%;
  min-height: 430px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(20, 24, 40, 0.05);
}

.chart-title {
  color: #202433;
  font-size: 1rem;
  font-weight: 800;
  padding: 18px 20px 0;
}
</style>

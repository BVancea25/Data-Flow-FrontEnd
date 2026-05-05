<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { DashboardFilter, Kpis } from '@/types/dashboard';
import { fetchKpis } from '@/api/dashboard';

const props = defineProps<{
  filter: DashboardFilter;
}>();

const kpis = ref<Kpis | null>(null);
const loading = ref(false);

async function loadKpis() {
  loading.value = true;
  try {
    kpis.value = await fetchKpis(props.filter);
  } finally {
    loading.value = false;
  }
}

onMounted(loadKpis);

watch(
  () => [
    props.filter.from,
    props.filter.to,
    props.filter.currencyCode,
    props.filter.categoryId,
    props.filter.paymentMethod
  ],
  () => loadKpis(),
  { deep: true }
);
</script>

<template>
  <div class="kpi-grid">
    <div class="kpi-card kpi-card--income">
      <span class="label">Income</span>
      <span class="value">{{ kpis?.income ?? 0 }}</span>
    </div>

    <div class="kpi-card kpi-card--expense">
      <span class="label">Expenses</span>
      <span class="value">{{ kpis?.expenses ?? 0 }}</span>
    </div>

    <div class="kpi-card kpi-card--net">
      <span class="label">Net</span>
      <span class="value">{{ kpis?.net ?? 0 }}</span>
    </div>

    <div class="kpi-card kpi-card--savings">
      <span class="label">Savings Rate</span>
      <span class="value">
        {{ kpis ? (kpis.savingsRate * 100).toFixed(1) + '%' : '0%' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.kpi-card {
  background: white;
  padding: 18px 20px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(20, 24, 40, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 104px;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: #304ffd;
}

.kpi-card--income::before {
  background: #16a34a;
}

.kpi-card--expense::before {
  background: #ef4444;
}

.kpi-card--net::before {
  background: #304ffd;
}

.kpi-card--savings::before {
  background: #f59e0b;
}

.label {
  font-size: 0.78rem;
  color: #747988;
  font-weight: 700;
  text-transform: uppercase;
}

.value {
  color: #202433;
  font-size: 1.5rem;
  line-height: 1.25;
  font-weight: 800;
  margin-top: 10px;
  overflow-wrap: anywhere;
}

@media (max-width: 960px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>

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
    <div class="kpi-card">
      <span class="label">Income</span>
      <span class="value">{{ kpis?.income ?? 0 }}</span>
    </div>

    <div class="kpi-card">
      <span class="label">Expenses</span>
      <span class="value">{{ kpis?.expenses ?? 0 }}</span>
    </div>

    <div class="kpi-card">
      <span class="label">Net</span>
      <span class="value">{{ kpis?.net ?? 0 }}</span>
    </div>

    <div class="kpi-card">
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: white;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #777;
}

.value {
  font-size: 1.6rem;
  font-weight: 600;
}
</style>

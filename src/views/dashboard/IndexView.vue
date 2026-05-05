<script setup lang="ts">
/*Call Components*/
import OverviewChart from '@/components/charts/OverviewChart.vue';
import { reactive, ref } from 'vue';
import type { DashboardFilter } from '@/types/dashboard';
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue';
import KpiCards from '@/components/card/KpiCards.vue';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart.vue';
import PaymentMethodBreakdownChart from '@/components/charts/PaymentMethodBreakdownChart.vue';
import CategoryComparisonChart from '@/components/charts/CategoryComparisonChart.vue';
import html2pdf from 'html2pdf.js';

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  const targetMonth = nextDate.getMonth() + months;

  nextDate.setMonth(targetMonth);

  if (nextDate.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    nextDate.setDate(0);
  }

  return nextDate;
}

function getDefaultDateRange(timeMeasure: DashboardFilter['timeMeasure']) {
  const to = new Date();

  if (timeMeasure === 'DAY') {
    return {
      from: formatDateForInput(addMonths(to, -1)),
      to: formatDateForInput(to)
    };
  }

  if (timeMeasure === 'MONTH') {
    return {
      from: formatDateForInput(addMonths(to, -12)),
      to: formatDateForInput(to)
    };
  }

  return {
    from: null,
    to: formatDateForInput(to)
  };
}

const defaultDateRange = getDefaultDateRange('MONTH');

const filters = reactive<DashboardFilter>({
  from: defaultDateRange.from,
  to: defaultDateRange.to,
  timeMeasure: 'MONTH',
  paymentMethod: null,
  currencyCode: 'RON',
  categoryId: null,
  type: 'INCOME'
});

const dashboardRef = ref<HTMLElement | null>(null);
const isExporting = ref(false);
const hasManualDateRange = ref(false);

function handleFiltersUpdate(nextFilters: DashboardFilter) {
  const fromChanged = nextFilters.from !== filters.from;
  const toChanged = nextFilters.to !== filters.to;
  const timeMeasureChanged = nextFilters.timeMeasure !== filters.timeMeasure;

  if ((fromChanged || toChanged) && !timeMeasureChanged) {
    hasManualDateRange.value = true;
  }

  if (timeMeasureChanged && !hasManualDateRange.value) {
    const nextDefaultDateRange = getDefaultDateRange(nextFilters.timeMeasure);

    Object.assign(filters, {
      ...nextFilters,
      ...nextDefaultDateRange
    });

    return;
  }

  Object.assign(filters, nextFilters);
}

const exportToPdf = async () => {
  if (!dashboardRef.value) return;

  isExporting.value = true;

  try {
    // PDF Configuration
    const options = {
      margin: 0.25, // in inches
      filename: `Financial_Report_${filters.currencyCode}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      pagebreak: { mode: ['css'], avoid: '.v-row' },
      html2canvas: {
        scale: 2, // Higher scale = sharper charts
        useCORS: true,
        scrollY: 0
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'landscape' // Landscape is usually better for wide charts
      }
    };

    // Generate and save the PDF
    await html2pdf().set(options).from(dashboardRef.value).save();
  } catch (error) {
    console.error('PDF generation failed', error);
  } finally {
    isExporting.value = false;
  }
};
</script>
<template>
  <div class="dashboard-page">
    <section class="dashboard-toolbar">
      <DashboardFilters :model-value="filters" @update:model-value="handleFiltersUpdate" />
      <v-btn class="export-button" color="primary" prepend-icon="mdi-download" :loading="isExporting" @click="exportToPdf">
        Export Report
      </v-btn>
    </section>

    <section ref="dashboardRef" class="dashboard-report">
      <KpiCards :filter="filters" />

      <div class="dashboard-grid primary-grid">
        <div class="grid-span-8">
          <OverviewChart :filters="filters" />
        </div>

        <div class="grid-span-4">
          <CategoryBreakdownChart :filter="filters" />
        </div>
      </div>

      <div class="html2pdf__page-break"></div>

      <div class="dashboard-grid secondary-grid">
        <div class="grid-span-5">
          <PaymentMethodBreakdownChart :filter="filters" />
        </div>

        <div class="grid-span-7">
          <CategoryComparisonChart :filter="filters" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 28px;
}

.dashboard-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
}

.export-button {
  min-height: 48px;
  border-radius: 8px;
}

.dashboard-report {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.grid-span-8 {
  grid-column: span 8;
}

.grid-span-7 {
  grid-column: span 7;
}

.grid-span-5 {
  grid-column: span 5;
}

.grid-span-4 {
  grid-column: span 4;
}

@media (max-width: 1180px) {
  .primary-grid .grid-span-8,
  .primary-grid .grid-span-4 {
    grid-column: span 12;
  }

  .secondary-grid .grid-span-5,
  .secondary-grid .grid-span-7 {
    grid-column: span 6;
  }
}

@media (max-width: 760px) {
  .dashboard-toolbar {
    grid-template-columns: 1fr;
  }

  .export-button {
    width: 100%;
  }

  .secondary-grid .grid-span-5,
  .secondary-grid .grid-span-7 {
    grid-column: span 12;
  }
}

@media print {
  .d-none.d-print-block {
    display: block !important;
  }
  .dashboard-report {
    background-color: white !important;
  }
}
</style>

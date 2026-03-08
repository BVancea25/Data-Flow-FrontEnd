<script setup lang="ts">
/*Call Components*/
import OverviewChart from '@/components/charts/OverviewChart.vue';
import { reactive, ref } from 'vue';
import type { DashboardFilter } from '@/types/dashboard';
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue';
import KpiCards from '@/components/card/KpiCards.vue';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart.vue';
import { VCol } from 'vuetify/components';
import PaymentMethodBreakdownChart from '@/components/charts/PaymentMethodBreakdownChart.vue';
import CategoryComparisonChart from '@/components/charts/CategoryComparisonChart.vue';
import html2pdf from 'html2pdf.js';

const filters = reactive<DashboardFilter>({
  from: null,
  to: null,
  timeMeasure: 'MONTH',
  paymentMethod: null,
  currencyCode: 'RON',
  categoryId: null,
  type: 'INCOME'
});

const dashboardRef = ref<HTMLElement | null>(null);
const isExporting = ref(false);

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
  <v-container fluid class="pa-6 grey lighten-4">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Financial Reporting</h1>
          <v-btn color="primary" prepend-icon="mdi-download" :loading="isExporting" @click="exportToPdf"
            >Export Report</v-btn
          >
        </div>
        <DashboardFilters v-model="filters" />
      </v-col>
    </v-row>

    <div ref="dashboardRef" class="pdf-container">
      <v-row dense class="mb-4">
        <v-col cols="12">
          <KpiCards :filter="filters" />
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12">
          <v-card elevation="2" class="rounded-lg">
            <OverviewChart :filters="filters" />
          </v-card>
        </v-col>
      </v-row>

      <div class="html2pdf__page-break"></div>

      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card elevation="2" class="rounded-lg h-100">
            <CategoryBreakdownChart :filter="filters" />
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card elevation="2" class="rounded-lg h-100">
            <PaymentMethodBreakdownChart :filter="filters" />
          </v-card>
        </v-col>
      </v-row>

      <div class="html2pdf__page-break"></div>

      <v-row>
        <v-col cols="12">
          <v-card elevation="2" class="rounded-lg">
            <CategoryComparisonChart :filter="filters" />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
/* Optional: Soften the background for better contrast with white cards */
.v-container {
  background-color: #f8fafc !important;
  min-height: 100vh;
}

/* Ensure all cards in a row have the same height */
.h-100 {
  height: 100%;
}

@media print {
  .d-none.d-print-block {
    display: block !important;
  }
  .pdf-container {
    background-color: white !important;
  }
}
</style>

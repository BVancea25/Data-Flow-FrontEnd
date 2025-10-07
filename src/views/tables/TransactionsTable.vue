<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchTransactions, deleteTransactions } from '@/api/transactions';
import type { ITransaction } from '@/api/type';
import type { TransactionPage } from '@/api/transactions';

const transactions = ref<ITransaction[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const showFilters = ref(true);

const selected = ref<ITransaction[]>([]);

const options = reactive({
  page: 1,
  itemsPerPage: 20,
  sortBy: [{ key: 'createdAt', order: 'desc' }]
});

// 🧭 Filters
const filters = reactive({
  category: '',
  currencyCode: '',
  paymentMode: '',
  description: '',
  startDate: '',
  endDate: ''
});

const headers = [
  { title: 'Date', key: 'transactionDate', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Currency', key: 'currencyCode', sortable: true },
  { title: 'Payment Mode', key: 'paymentMode', sortable: true },
  { title: 'Created At', key: 'createdAt', sortable: true }
];

async function handleBulkDelete() {
  const ids = selected.value.map((t) => t);
  console.log(ids);
  if (!ids.length) return;
  if (confirm(`Delete ${ids.length} transactions?`)) {
    await deleteTransactions(ids);
    selected.value = [];
    await loadTransactions();
  }
}

async function loadTransactions() {
  loading.value = true;
  //console.log(filters.paymentMode);
  try {
    const sortOption = options.sortBy?.[0] || { key: 'transactionDate', order: 'desc' };
    const resp: TransactionPage = await fetchTransactions({
      page: options.page - 1, // backend 0-based
      size: options.itemsPerPage,
      sortBy: sortOption.key,
      ascending: sortOption.order === 'asc',
      ...filters
    });

    transactions.value = resp.content;
    totalItems.value = resp.totalElements;
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
  } finally {
    loading.value = false;
  }
}

function handleApplyFilters() {
  options.page = 1; // reset pagination
  loadTransactions();
}

function handleResetFilters() {
  Object.keys(filters).forEach((key) => (filters[key as keyof typeof filters] = ''));
  handleApplyFilters();
}

onMounted(loadTransactions);
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Your Transactions</VCardTitle>

          <!-- 🔍 FILTER TOOLBAR -->
          <VToolbar color="transparent" flat>
            <VTextField
              v-model="filters.description"
              placeholder="Search description"
              hide-details
              clearable
              variant="outlined"
              density="compact"
              class="mr-4"
              style="max-width: 250px; margin-left: 15px"
              @keyup.enter="handleApplyFilters"
            />
            <VBtn icon @click="showFilters = !showFilters">
              <VIcon>{{ showFilters ? 'mdi-filter-minus' : 'mdi-filter-variant' }}</VIcon>
            </VBtn>
            <VSpacer />
            <VBtn color="primary" variant="outlined" @click="handleApplyFilters">Apply</VBtn>
            <VBtn class="ml-2" variant="text" @click="handleResetFilters">Reset</VBtn>
          </VToolbar>

          <!-- 🧩 FILTER PANEL -->
          <VExpandTransition>
            <VSheet v-show="showFilters" color="#FBFBFB" class="pa-4">
              <VRow>
                <VCol cols="12" md="3">
                  <VTextField
                    v-model="filters.category"
                    label="Category"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField
                    v-model="filters.currencyCode"
                    label="Currency"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="3">
                  <VTextField
                    v-model="filters.paymentMode"
                    label="Payment Mode"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField
                    v-model="filters.startDate"
                    type="date"
                    label="Start Date"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="12" md="2">
                  <VTextField
                    v-model="filters.endDate"
                    type="date"
                    label="End Date"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
              </VRow>
            </VSheet>
          </VExpandTransition>

          <VDivider />

          <VCardText>
            <VBtn color="error" :disabled="!selected.length" @click="handleBulkDelete"> Delete Selected </VBtn>
            <VDataTableServer
              v-model:items-per-page="options.itemsPerPage"
              v-model:page="options.page"
              v-model:sort-by="options.sortBy"
              v-model="selected"
              :headers="headers"
              :items="transactions"
              :items-length="totalItems"
              :loading="loading"
              item-value="id"
              hover
              show-select
              @update:options="loadTransactions"
            >
              <template #item.amount="{ item }">
                {{ item.amount.toFixed(2) }}
              </template>

              <template #item.transactionDate="{ item }">
                {{ new Date(item.transactionDate).toLocaleString() }}
              </template>
            </VDataTableServer>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>

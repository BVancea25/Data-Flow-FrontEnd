<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchTransactions, deleteTransactions } from '@/api/income';
import type { IIncome } from '@/api/type';
import type { IncomePage } from '@/api/income';
import TransactionForm from '../forms/TransactionForm.vue';
import formatEnum from '../../utils/formatters';
import { typeOptions } from '@/utils/constants';

const transactions = ref<IIncome[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const showFilters = ref(true);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editingTransaction = ref<IIncome | null>(null);

const selected = ref<IIncome[]>([]);

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
  endDate: '',
  type: ''
});

const headers = [
  { title: 'Date', key: 'transactionDate', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Currency', key: 'currencyCode', sortable: true },
  { title: 'Payment Mode', key: 'paymentMode', sortable: true },
  { title: 'Created At', key: 'createdAt', sortable: true },
  { title: 'Type', key: 'type', sortable: false },
  { title: '', key: 'action', sortable: false }
];

async function handleBulkDelete() {
  const ids = selected.value.map((t) => t.id);
  console.log(ids);
  if (!ids.length) return;
  if (confirm(`Delete ${ids.length} income transactions?`)) {
    await deleteTransactions(ids);
    selected.value = [];
    await loadTransactions();
  }
}

async function handleEdit(item: IIncome) {
  const income = item ?? transactions.value.find((t) => t.id === selected.value[0].id) ?? null;
  if (!income) return;
  console.log(transactions.value.find((t) => t.id === selected.value[0].id));
  editingTransaction.value = { ...income };
  showEditDialog.value = true;
}

async function loadTransactions() {
  loading.value = true;
  console.log(filters);
  try {
    const sortOption = options.sortBy?.[0] || { key: 'transactionDate', order: 'desc' };
    const resp: IncomePage = await fetchTransactions({
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
          <VCardTitle>Your Income Transactions</VCardTitle>
          <VBtn color="error" :disabled="!selected.length" @click="handleBulkDelete" style="margin-left: 15px">
            Delete selected
          </VBtn>
          <VBtn color="success" @click="showAddDialog = true" style="margin-left: 15px">Add Income Transaction</VBtn>
          <VBtn
            color="primary"
            @click="handleEdit(selected[0])"
            style="margin-left: 15px"
            :disabled="selected.length !== 1"
            >Edit</VBtn
          >
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
                <VCol cols="12" md="2">
                  <VSelect
                    v-model="filters.type"
                    type=""
                    label="Type"
                    variant="outlined"
                    density="compact"
                    :items="typeOptions"
                  />
                </VCol>
              </VRow>
            </VSheet>
          </VExpandTransition>

          <VDivider />

          <VCardText>
            <VDataTableServer
              v-model:items-per-page="options.itemsPerPage"
              v-model:page="options.page"
              v-model:sort-by="options.sortBy"
              v-model="selected"
              :headers="headers"
              :items="transactions"
              :items-length="totalItems"
              :loading="loading"
              return-object
              hover
              show-select
              @update:options="loadTransactions"
            >
              <template #item.amount="{ item }">
                {{ item.amount.toFixed(2) }}
              </template>

              <template #item.action="{ item }">
                <VBtn icon="mdi-pencil-outline" variant="plain" density="compact" @click.stop="handleEdit(item)" />
              </template>

              <template #item.transactionDate="{ item }">
                {{ new Date(item.transactionDate).toLocaleString() }}
              </template>

              <template #item.type="{ item }">
                <VChip :color="item.type === 'INCOME' ? 'success' : 'error'" variant="flat" size="small">
                  {{ formatEnum(item.type) }}
                </VChip>
              </template>
            </VDataTableServer>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <TransactionForm :show="showAddDialog" @close="showAddDialog = false" @saved="loadTransactions" />
    <TransactionForm
      :income="editingTransaction"
      :show="showEditDialog"
      :transaction="editingTransaction"
      @close="showEditDialog = false"
      @saved="loadTransactions"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchBudgetStatuses } from '@/api/budget';
import { BudgetStatus } from '@/types/budget';
import BudgetCard from '@/components/card/BudgetCard.vue';
import BudgetForm from '../forms/BudgetForm.vue';
import { getApiErrorMessage } from '@/utils/apiErrors';

const budgets = ref<BudgetStatus[]>([]);
const loading = ref(true);
const showAddDialog = ref(false);
const editingBudget = ref(null);
const pageErrorMessage = ref('');

async function loadBudgets() {
  loading.value = true;
  pageErrorMessage.value = '';
  try {
    budgets.value = await fetchBudgetStatuses();
  } catch (err) {
    pageErrorMessage.value = getApiErrorMessage(err, 'Unable to load budgets. Please try again.');
  } finally {
    loading.value = false;
  }
}

function editBudget(budget: any) {
  editingBudget.value = budget;
  showAddDialog.value = true;
}

function closeDialog() {
  showAddDialog.value = false;
  editingBudget.value = null;
}

onMounted(loadBudgets);
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex justify-end align-center mb-8">
      <VBtn color="primary" size="large" prepend-icon="mdi-plus" @click="showAddDialog = true"> Set Budget </VBtn>
    </div>

    <VAlert v-if="pageErrorMessage" type="error" variant="tonal" density="comfortable" class="mb-4">
      {{ pageErrorMessage }}
    </VAlert>

    <VRow>
      <VCol v-for="budget in budgets" :key="budget.budgetId" cols="12" sm="6" md="4">
        <BudgetCard :item="budget" @click="editBudget(budget)" class="cursor-pointer" />
      </VCol>

      <VCol v-if="!loading && budgets.length === 0" cols="12">
        <VSheet rounded="xl" height="200" class="d-flex flex-column align-center justify-center border-dashed">
          <p class="text-grey">No budgets set yet. Start by setting a limit!</p>
        </VSheet>
      </VCol>
    </VRow>

    <BudgetForm :show="showAddDialog" :budget="editingBudget" @close="closeDialog" @saved="loadBudgets" />
  </VContainer>
</template>

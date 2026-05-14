<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { VAutocomplete, VTextField, VSelect, VDialog, VCard, VForm, VSwitch } from 'vuetify/components';
import { fetchCategories } from '@/api/category';
import { searchCurrenciesByCode } from '@/api/currency';
import { createBudget, updateBudget } from '@/api/budget';
import { BudgetPeriod } from '@/types/budget';
import type { BudgetStatus } from '@/types/budget';
import type { ICurrency } from '@/api/currency';
import type { Category } from '@/api/category';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { dateOnlyValidator, positiveNumberValidator, requiredValidator } from '@/utils/validators';

type BudgetFormBudget = BudgetStatus & {
  id?: string;
  categoryId?: string;
  isActive?: boolean;
};

interface Props {
  show: boolean;
  budget?: BudgetFormBudget | null;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);
const categories = ref<Category[]>([]);
const currencyItems = ref<ICurrency[]>([]);

const loadingCurrencies = ref(false);
const currencySearch = ref('');
const formRef = ref();
const formValid = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const isEditMode = computed(() => !!(props.budget?.budgetId || props.budget?.id));

const loadingCategories = ref(false);

const budgetData = reactive({
  categoryId: '',
  limitAmount: 0,
  currencyCode: '',
  period: BudgetPeriod.MONTHLY,
  startDate: new Date().toISOString().substr(0, 10),
  isActive: true
});

const periodOptions = [
  { title: 'Weekly', value: BudgetPeriod.WEEKLY },
  { title: 'Monthly', value: BudgetPeriod.MONTHLY },
  { title: 'Yearly', value: BudgetPeriod.YEARLY }
];

const currencyCodeRules = [
  requiredValidator,
  (value: unknown) => {
    if (!value) return true;

    const selectedCode = String(value);
    const selectedFromCurrentSearch = currencyItems.value.some((currency) => currency.code === selectedCode);
    const selectedFromExistingBudget = props.budget?.currencyCode === selectedCode;

    return selectedFromCurrentSearch || selectedFromExistingBudget || 'Select a currency from the list';
  }
];

// ... (Currency/Category search logic stays the same)

watch(
  () => props.show,
  async (isShowing) => {
    errorMessage.value = '';

    if (isShowing) {
      loadingCategories.value = true;
      try {
        categories.value = await fetchCategories({ type: 'EXPENSE' });

        if (props.budget) {
          const categoryId =
            props.budget.categoryId ||
            categories.value.find((category) => category.name === props.budget?.categoryName)?.id ||
            '';

          // Populating for Update DTO
          Object.assign(budgetData, {
            categoryId,
            limitAmount: props.budget.limitAmount,
            currencyCode: props.budget.currencyCode,
            period: props.budget.period,
            startDate: props.budget.startDate?.split('T')[0] || '',
            isActive: props.budget.isActive ?? true
          });
        } else {
          // Reset for new budget
          Object.assign(budgetData, {
            categoryId: '',
            limitAmount: 0,
            currencyCode: '',
            period: BudgetPeriod.MONTHLY,
            startDate: new Date().toISOString().substr(0, 10),
            isActive: true
          });
        }
      } catch (err) {
        errorMessage.value = getApiErrorMessage(err, 'Unable to load budget form data. Please try again.');
      } finally {
        loadingCategories.value = false;
      }
    }
  }
);

watch(currencySearch, async (newQuery) => {
  if (!newQuery || newQuery.length < 2) {
    currencyItems.value = [];
    return;
  }
  loadingCurrencies.value = true;
  try {
    currencyItems.value = await searchCurrenciesByCode(newQuery);
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to load currencies. Please try again.');
  } finally {
    loadingCurrencies.value = false;
  }
});

async function handleSubmit() {
  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  submitting.value = true;
  errorMessage.value = '';

  try {
    if (isEditMode.value) {
      const budgetId = props.budget?.budgetId || props.budget?.id;
      if (!budgetId) {
        errorMessage.value = 'Unable to identify the budget to update.';
        return;
      }
      await updateBudget(budgetId, {
        limitAmount: budgetData.limitAmount,
        isActive: budgetData.isActive,
        currencyCode: budgetData.currencyCode
      });
    } else {
      await createBudget({
        categoryId: budgetData.categoryId,
        limitAmount: budgetData.limitAmount,
        currencyCode: budgetData.currencyCode,
        period: budgetData.period,
        startDate: new Date(budgetData.startDate)
      });
    }
    emit('saved');
    emit('close');
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to save the budget. Please try again.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="500">
    <VCard>
      <VCardTitle class="px-6 pt-6 flex justify-between items-center">
        <span class="text-h5 font-bold">{{ isEditMode ? 'Edit' : 'New' }} Budget</span>
        <VSwitch
          v-if="isEditMode"
          v-model="budgetData.isActive"
          label="Active"
          hide-details
          color="success"
          density="compact"
        />
      </VCardTitle>

      <VCardText class="px-6">
        <VForm ref="formRef" v-model="formValid">
          <VSelect
            v-model="budgetData.categoryId"
            :items="categories"
            :loading="loadingCategories"
            item-title="name"
            item-value="id"
            label="Category"
            variant="outlined"
            :disabled="isEditMode"
            :rules="[requiredValidator]"
            class="mb-2 form-field"
          />

          <div class="flex gap-4 mb-2">
            <VTextField
              v-model.number="budgetData.limitAmount"
              label="Limit Amount"
              type="number"
              variant="outlined"
              :rules="[requiredValidator, positiveNumberValidator]"
              class="flex-grow form-field"
            />

            <VAutocomplete
              v-model="budgetData.currencyCode"
              v-model:search="currencySearch"
              :items="currencyItems"
              item-title="code"
              item-value="code"
              label="Currency"
              variant="outlined"
              class="w-32 form-field"
              hide-no-data
              no-filter
              :rules="currencyCodeRules"
            />
          </div>

          <VSelect
            v-model="budgetData.period"
            :items="periodOptions"
            label="Period"
            variant="outlined"
            :disabled="isEditMode"
            :rules="[requiredValidator]"
            class="mb-2 form-field"
          />

          <VTextField
            v-model="budgetData.startDate"
            label="Effective Date"
            type="date"
            variant="outlined"
            :disabled="isEditMode"
            :rules="[requiredValidator, dateOnlyValidator]"
          />
        </VForm>
        <VAlert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mt-3">
          {{ errorMessage }}
        </VAlert>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn variant="text" :disabled="submitting" @click="emit('close')">Cancel</VBtn>
        <VBtn color="primary" variant="flat" :loading="submitting" :disabled="!formValid" @click="handleSubmit">
          {{ isEditMode ? 'Update' : 'Create' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

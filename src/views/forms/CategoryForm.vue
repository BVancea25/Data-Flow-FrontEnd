<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import type { Category } from '@/api/category';
import { createCategory, updateCategory } from '@/api/category';
import { fetchBudgetStatuses } from '@/api/budget';
import type { BudgetStatus } from '@/types/budget';
import { VTextField } from 'vuetify/components';
import { typeOptions } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { maxTrimmedLengthValidator, requiredValidator } from '@/utils/validators';

interface Props {
  show: boolean;
  category?: Category | null;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const formValid = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const budgetWarningMessage = ref('');
const activeBudgets = ref<BudgetStatus[]>([]);
const budgetsLoaded = ref(false);
const budgetsLoading = ref(false);
const budgetsLoadFailed = ref(false);

const category = reactive<Omit<Category, 'id' | 'createdAt'>>({
  name: '',
  type: 'EXPENSE'
});

const isEditMode = computed(() => !!props.category?.id);
const originalType = computed(() => props.category?.type);
const typeHasChanged = computed(() => isEditMode.value && category.type !== originalType.value);
const hasActiveBudget = computed(
  () => !!props.category?.id && activeBudgets.value.some((budget) => budget.categoryId === props.category?.id)
);
const typeChangeBlocked = computed(() => typeHasChanged.value && (hasActiveBudget.value || budgetsLoadFailed.value));

function updateBudgetWarning() {
  if (!isEditMode.value) {
    budgetWarningMessage.value = '';
    return;
  }

  budgetWarningMessage.value = hasActiveBudget.value
    ? 'This category has an active budget, so its type cannot be changed. Archive the budget first.'
    : '';
}

async function loadActiveBudgetsForValidation() {
  if (!isEditMode.value || budgetsLoaded.value || budgetsLoading.value) return;

  budgetsLoading.value = true;
  budgetsLoadFailed.value = false;

  try {
    activeBudgets.value = await fetchBudgetStatuses();
    budgetsLoaded.value = true;
  } catch (err) {
    budgetsLoadFailed.value = true;
    errorMessage.value = getApiErrorMessage(
      err,
      'Unable to verify active budgets. Please try again before changing the category type.'
    );
  } finally {
    budgetsLoading.value = false;
    updateBudgetWarning();
  }
}

watch(
  () => props.show,
  async (isShowing) => {
    errorMessage.value = '';
    budgetWarningMessage.value = '';
    activeBudgets.value = [];
    budgetsLoaded.value = false;
    budgetsLoadFailed.value = false;

    if (props.category) {
      Object.assign(category, props.category); // ✅ correctly populate reactive object
    } else {
      Object.assign(category, {
        name: '',
        type: undefined
      });
    }

    if (formRef.value) {
      formRef.value.resetValidation();
    }

    if (isShowing && props.category) {
      await loadActiveBudgetsForValidation();
    }
  },
  { immediate: true }
);

watch(
  () => category.type,
  () => {
    errorMessage.value = '';
    updateBudgetWarning();
  }
);

async function handleSubmit() {
  const form = formRef.value as any;
  const validation = await form.validate();
  if (!validation.valid) return;

  if (typeChangeBlocked.value) {
    errorMessage.value = budgetsLoadFailed.value
      ? 'Unable to verify active budgets. Please try again before changing the category type.'
      : 'This category has an active budget, so its type cannot be changed. Archive the budget first.';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    if (props.category) {
      await updateCategory(props.category.id, category);
    } else {
      await createCategory(category);
    }
    emit('saved');
    emit('close');
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Unable to save the category. Please try again.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="600">
    <VCard>
      <VCardTitle>Add New Category</VCardTitle>
      <VCardText>
        <VForm ref="formRef" v-model="formValid">
          <VTextField
            class="form-field"
            v-model="category.name"
            label="Name"
            :rules="[requiredValidator, maxTrimmedLengthValidator(80)]"
          />
          <VSelect
            class="form-field"
            v-model="category.type"
            :items="typeOptions"
            label="Type"
            :loading="budgetsLoading"
            :disabled="hasActiveBudget"
            :rules="[requiredValidator]"
          />
        </VForm>
        <VAlert v-if="budgetWarningMessage" type="warning" variant="tonal" density="comfortable" class="mt-3">
          {{ budgetWarningMessage }}
        </VAlert>
        <VAlert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mt-3">
          {{ errorMessage }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text :disabled="submitting" @click="emit('close')">Cancel</VBtn>
        <VBtn color="primary" :loading="submitting" :disabled="!formValid" @click="handleSubmit">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

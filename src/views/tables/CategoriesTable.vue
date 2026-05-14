<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchCategories } from '@/api/category';
import type { Category } from '@/api/category';
import formatEnum from '@/utils/formatters';
import { typeOptions } from '@/utils/constants';
import CategoryForm from '@/views/forms/CategoryForm.vue';
import { getApiErrorMessage } from '@/utils/apiErrors';

const categories = ref<Category[]>([]);
const loading = ref(false);
const selected = ref<Category[]>([]);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editingCategory = ref<Category | null>(null);
const pageErrorMessage = ref('');

// Filters
const filters = reactive({
  name: '',
  type: ''
});

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Created At', key: 'createdAt', sortable: true },
  { title: '', key: 'action', sortable: false }
];

async function loadCategories() {
  loading.value = true;
  pageErrorMessage.value = '';
  try {
    categories.value = await fetchCategories({
      name: filters.name || undefined,
      type: filters.type || undefined
    });
  } catch (err) {
    pageErrorMessage.value = getApiErrorMessage(err, 'Unable to load categories. Please try again.');
  } finally {
    loading.value = false;
  }
}

async function handleEdit(item: Category) {
  const income = item ?? categories.value.find((t) => t.id === selected.value[0].id) ?? null;
  if (!income) return;
  editingCategory.value = { ...income };
  showEditDialog.value = true;
}

function handleEditRow(item: Category) {
  editingCategory.value = { ...item };
  showEditDialog.value = true;
}

function handleResetFilters() {
  filters.name = '';
  filters.type = '';
  loadCategories();
}

onMounted(loadCategories);
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Categories</VCardTitle>
          <VAlert v-if="pageErrorMessage" type="error" variant="tonal" density="comfortable" class="mx-4 mb-4">
            {{ pageErrorMessage }}
          </VAlert>

          <VBtn color="success" @click="showAddDialog = true" style="margin-left: 15px"> Add Category </VBtn>
          <VBtn
            color="primary"
            @click="handleEdit(selected[0])"
            style="margin-left: 15px"
            :disabled="selected.length !== 1"
            >Edit</VBtn
          >
          <!-- 🔍 FILTER BAR -->
          <VToolbar color="transparent" flat>
            <VTextField
              v-model="filters.name"
              placeholder="Search name"
              hide-details
              clearable
              variant="outlined"
              density="compact"
              class="mr-4"
              style="max-width: 250px; margin-left: 15px"
              @keyup.enter="loadCategories"
            />

            <VSelect
              v-model="filters.type"
              label="Type"
              :items="typeOptions"
              clearable
              variant="outlined"
              density="compact"
              style="max-width: 180px"
            />

            <VSpacer />

            <VBtn color="primary" variant="outlined" @click="loadCategories"> Apply </VBtn>
            <VBtn class="ml-2" variant="text" @click="handleResetFilters"> Reset </VBtn>
          </VToolbar>

          <VDivider />

          <VCardText>
            <VDataTable
              v-model="selected"
              :headers="headers"
              :items="categories"
              :loading="loading"
              return-object
              hover
              show-select
            >
              <template #item.type="{ item }">
                <VChip :color="item.type === 'INCOME' ? 'success' : 'error'" size="small" variant="flat">
                  {{ formatEnum(item.type) }}
                </VChip>
              </template>

              <template #item.createdAt="{ item }">
                {{ new Date(item.createdAt).toLocaleString() }}
              </template>

              <template #item.action="{ item }">
                <VBtn icon="mdi-pencil-outline" variant="plain" density="compact" @click.stop="handleEditRow(item)" />
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <CategoryForm :show="showAddDialog" @close="showAddDialog = false" @saved="loadCategories" />
    <CategoryForm
      :category="editingCategory"
      :show="showEditDialog"
      @close="showEditDialog = false"
      @saved="loadCategories"
    />
  </section>
</template>

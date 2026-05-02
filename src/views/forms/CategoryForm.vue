<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { Category } from '@/api/category';
import { createCategory, updateCategory } from '@/api/category';
import { VTextField } from 'vuetify/components';
import { typeOptions } from '@/utils/constants';

interface Props {
  show: boolean;
  category?: Category | null;
}
const props = defineProps<Props>();
const emit = defineEmits(['close', 'saved']);

const formRef = ref();
const formValid = ref(false);

const category = reactive<Omit<Category, 'id' | 'createdAt'>>({
  name: '',
  type: 'EXPENSE'
});

watch(
  () => props.show,
  (isShowing) => {
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
  },
  { immediate: true }
);

async function handleSubmit() {
  const form = formRef.value as any;
  if (!(await form.validate())) return;

  try {
    if (props.category) {
      await updateCategory(props.category.id, category);
    } else {
      await createCategory(category);
    }
    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Failed to create category:', err);
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="600">
    <VCard>
      <VCardTitle>Add New Category</VCardTitle>
      <VCardText>
        <VForm ref="formRef" v-model="formValid">
          <VTextField class="form-field" v-model="category.name" label="Name" :rules="[(v) => !!v || 'Required']" />
          <VSelect class="form-field" v-model="category.type" :items="typeOptions" label="Type" />
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text @click="emit('close')">Cancel</VBtn>
        <VBtn color="primary" :disabled="!formValid" @click="handleSubmit">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.form-field {
  margin-bottom: 15px;
}
</style>

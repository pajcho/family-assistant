<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Rođendani</h1>
      <Button @click="openAdd">
        <PlusIcon class="mr-2 h-5 w-5" />
        Dodaj rođendan
      </Button>
    </div>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="sortedBirthdays.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Nema unetih rođendana.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <li
        v-for="b in sortedBirthdays"
        :key="b.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <BirthdaysBirthdayListItem
          :birthday="b"
          @edit="openEdit"
          @delete="confirmDelete"
        />
      </li>
    </ul>

    <BirthdayFormDialog
      v-model:open="dialogOpen"
      :birthday="editingBirthday"
      :error="errorMessage"
      @submit="onFormSubmit"
      @cancel="dialogOpen = false"
    />
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Obriši rođendan"
      :message="deleteConfirmMessage"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline';
import type { Birthday } from '~/types/database';
import { Button } from '~/components/ui/button';
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue';
import BirthdayFormDialog from '~/components/birthdays/BirthdayFormDialog.vue';
import { daysUntilBirthday } from '~/utils/birthday';
import { useBirthdays } from '~/composables/useBirthdays';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchBirthdays, createBirthday, updateBirthday, deleteBirthday } = useBirthdays();

const birthdays = ref<Birthday[]>([]);
const loading = ref(true);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingBirthday = ref<Birthday | null>(null);
const birthdayToDelete = ref<Birthday | null>(null);
const deleting = ref(false);
const errorMessage = ref('');

const sortedBirthdays = computed(() => {
  return birthdays.value.toSorted(
    (a, b) => daysUntilBirthday(a.birth_date) - daysUntilBirthday(b.birth_date),
  );
});

const deleteConfirmMessage = computed(
  () => `Da li ste sigurni da želite da obrišete „${birthdayToDelete.value?.name ?? ''}"?`,
);

async function loadBirthdays(): Promise<void> {
  await fetchProfile();
  if (!familyId.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  birthdays.value = await fetchBirthdays();
  loading.value = false;
}

function openAdd(): void {
  editingBirthday.value = null;
  errorMessage.value = '';
  dialogOpen.value = true;
}

function openEdit(b: Birthday): void {
  editingBirthday.value = b;
  errorMessage.value = '';
  dialogOpen.value = true;
}

async function onFormSubmit(payload: {
  name: string;
  description: string | null;
  birth_date: string;
}): Promise<void> {
  errorMessage.value = '';
  if (editingBirthday.value) {
    const { error } = await updateBirthday(editingBirthday.value.id, payload);
    if (error) {
      errorMessage.value = error.message || 'Greška pri ažuriranju rođendana';
      return;
    }
    dialogOpen.value = false;
    await loadBirthdays();
  } else {
    const { error } = await createBirthday(payload);
    if (error) {
      errorMessage.value = error.message || 'Greška pri kreiranju rođendana';
      return;
    }
    dialogOpen.value = false;
    await loadBirthdays();
  }
}

function confirmDelete(b: Birthday): void {
  birthdayToDelete.value = b;
  deleteDialogOpen.value = true;
}

async function doDelete(): Promise<void> {
  if (!birthdayToDelete.value) return;
  deleting.value = true;
  const { error } = await deleteBirthday(birthdayToDelete.value.id);
  deleting.value = false;
  if (!error) {
    deleteDialogOpen.value = false;
    birthdayToDelete.value = null;
    await loadBirthdays();
  }
}

onMounted(() => {
  loadBirthdays();
});
</script>

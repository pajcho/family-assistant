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
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500"
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
        <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-900 dark:text-gray-100">
              {{ birthdayDisplayText(b.name, b.birth_date) }}
            </p>
            <p
              v-if="b.description"
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ b.description }}
            </p>
          </div>
          <!-- Mobile: Dropdown menu -->
          <div class="flex shrink-0 sm:hidden">
            <Dropdown>
              <DropdownItem
                label="Izmeni"
                :icon="PencilIcon"
                @click="openEdit(b)"
              />
              <DropdownItem
                label="Obriši"
                :icon="TrashIcon"
                variant="destructive"
                @click="confirmDelete(b)"
              />
            </Dropdown>
          </div>
          <!-- Desktop: Regular buttons -->
          <div class="hidden shrink-0 gap-2 sm:flex">
            <Button
              variant="outline"
              size="sm"
              @click="openEdit(b)"
            >
              <PencilIcon class="mr-1 h-4 w-4" />
              Izmeni
            </Button>
            <Button
              variant="destructive"
              size="sm"
              @click="confirmDelete(b)"
            >
              <TrashIcon class="mr-1 h-4 w-4" />
              Obriši
            </Button>
          </div>
        </div>
      </li>
    </ul>

    <Dialog
      v-model:open="dialogOpen"
      title-id="birthday-dialog-title"
    >
      <DialogHeader>
        <h2
          id="birthday-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingBirthday ? 'Izmeni rođendan' : 'Dodaj rođendan' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <div
          v-if="errorMessage"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>
        <BirthdayForm
          :birthday="editingBirthday"
          @submit="onFormSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      v-model:open="deleteDialogOpen"
      title-id="delete-birthday-title"
    >
      <DialogHeader>
        <h2
          id="delete-birthday-title"
          class="text-lg font-semibold"
        >
          Obriši rođendan
        </h2>
      </DialogHeader>
      <DialogContent>
        <p class="text-gray-600">
          Da li ste sigurni da želite da obrišete „{{ birthdayToDelete?.name }}”?
        </p>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          @click="deleteDialogOpen = false"
        >
          Otkaži
        </Button>
        <Button
          variant="destructive"
          :disabled="deleting"
          @click="doDelete"
        >
          Obriši
        </Button>
      </DialogFooter>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Birthday } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import BirthdayForm from '~/components/birthdays/BirthdayForm.vue';
import { birthdayDisplayText, daysUntilBirthday } from '~/utils/birthday';
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
  description?: string;
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

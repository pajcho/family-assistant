<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Planirani troškovi</h1>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input
            v-model="hidePaid"
            type="checkbox"
            class="rounded border-gray-300"
          />
          Sakrij plaćene
        </label>
        <Button @click="openAdd">
          <PlusIcon class="mr-2 h-5 w-5" />
          Dodaj trošak
        </Button>
      </div>
    </div>

    <p
      v-if="!loading && unpaidTotal > 0"
      class="mt-2 text-sm text-gray-600"
    >
      Ukupno neplaćeno:
      <strong>{{ formatAmount(unpaidTotal) }}</strong>
    </p>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="expenses.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Nema planiranih troškova za prikaz.
    </div>
    <ul
      v-else
      ref="listRef"
      class="mt-6 space-y-3"
    >
      <li
        v-for="e in expenses"
        :key="e.id"
        :data-id="e.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        :class="{ 'opacity-60': e.is_paid }"
      >
        <ExpensesExpenseListItem
          :expense="e"
          @mark-paid="markPaid($event)"
          @edit="openEdit($event)"
          @delete="confirmDelete($event)"
        />
      </li>
    </ul>

    <ExpenseFormDialog
      v-model:open="dialogOpen"
      :expense="editingExpense"
      @submit="onFormSubmit"
      @cancel="dialogOpen = false"
    />
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Obriši trošak"
      :message="deleteConfirmMessage"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Sortable } from 'sortablejs';
import { PlusIcon } from '@heroicons/vue/24/outline';
import type { Expense } from '~/types/database';
import { Button } from '~/components/ui/button';
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue';
import ExpenseFormDialog from '~/components/expenses/ExpenseFormDialog.vue';
import { formatAmount } from '~/utils/format';
import { useExpenses } from '~/composables/useExpenses';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchExpenses, createExpense, updateExpense, deleteExpense, markAsPaid, reorderExpenses } =
  useExpenses();

const expenses = ref<Expense[]>([]);
const loading = ref(true);
const hidePaid = ref(false);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingExpense = ref<Expense | null>(null);
const expenseToDelete = ref<Expense | null>(null);
const deleting = ref(false);
const listRef = ref<HTMLUListElement | null>(null);
let sortableInstance: Sortable | null = null;

const unpaidTotal = computed(() =>
  expenses.value.filter((e) => !e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0),
);

const deleteConfirmMessage = computed(
  () => `Da li ste sigurni da želite da obrišete "${expenseToDelete.value?.name ?? ''}"?`,
);

async function loadExpenses(): Promise<void> {
  await fetchProfile();
  if (!familyId.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  expenses.value = await fetchExpenses(hidePaid.value);
  loading.value = false;
}

function initSortable(): void {
  if (!listRef.value) return;
  if (sortableInstance) {
    sortableInstance.destroy();
  }
  sortableInstance = Sortable.create(listRef.value, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'opacity-50',
    onEnd: async (evt) => {
      if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
      if (evt.oldIndex === evt.newIndex) return;

      // Get the reordered list
      const items = [...expenses.value];
      const [moved] = items.splice(evt.oldIndex, 1);
      items.splice(evt.newIndex, 0, moved);

      // Update sort_order for all items
      const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index + 1,
      }));

      await reorderExpenses(updates);
      await loadExpenses();
    },
  });
}

function openAdd(): void {
  editingExpense.value = null;
  dialogOpen.value = true;
}

function openEdit(e: Expense): void {
  editingExpense.value = e;
  dialogOpen.value = true;
}

async function onFormSubmit(payload: {
  name: string;
  description: string | null;
  amount: number;
}): Promise<void> {
  if (editingExpense.value) {
    const { error } = await updateExpense(editingExpense.value.id, payload);
    if (!error) {
      dialogOpen.value = false;
      await loadExpenses();
    }
  } else {
    const { error } = await createExpense(payload);
    if (!error) {
      dialogOpen.value = false;
      await loadExpenses();
    }
  }
}

async function markPaid(e: Expense): Promise<void> {
  const { error } = await markAsPaid(e.id);
  if (!error) await loadExpenses();
}

function confirmDelete(e: Expense): void {
  expenseToDelete.value = e;
  deleteDialogOpen.value = true;
}

async function doDelete(): Promise<void> {
  if (!expenseToDelete.value) return;
  deleting.value = true;
  const { error } = await deleteExpense(expenseToDelete.value.id);
  deleting.value = false;
  if (!error) {
    deleteDialogOpen.value = false;
    expenseToDelete.value = null;
    await loadExpenses();
  }
}

watch(hidePaid, () => {
  loadExpenses();
});

watch(
  () => expenses.value.length,
  () => {
    nextTick(() => {
      initSortable();
    });
  },
);

onMounted(async () => {
  await loadExpenses();
  nextTick(() => {
    initSortable();
  });
});

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy();
  }
});
</script>

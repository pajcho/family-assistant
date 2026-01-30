<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Planirana izdvajanja</h1>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input
            v-model="hidePaid"
            type="checkbox"
            class="rounded border-gray-300"
          />
          Sakrij plaćena
        </label>
        <Button @click="openAdd">
          <PlusIcon class="mr-2 h-5 w-5" />
          Dodaj izdvajanje
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
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500"
    >
      Nema planiranih izdvajanja za prikaz.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <li
        v-for="e in expenses"
        :key="e.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        :class="{ 'opacity-60': e.is_paid }"
      >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900">{{ e.name }}</p>
          <p class="text-sm text-gray-600">{{ formatAmount(e.amount) }}</p>
          <p
            v-if="e.description"
            class="mt-1 text-sm text-gray-500"
          >
            {{ e.description }}
          </p>
          <p
            v-if="e.is_paid && e.paid_date"
            class="mt-1 text-sm text-gray-500"
          >
            Kupljeno {{ formatDate(e.paid_date) }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <template v-if="!e.is_paid">
            <Button
              size="sm"
              @click="markPaid(e)"
            >
              Označi kao plaćeno
            </Button>
          </template>
          <Button
            variant="outline"
            size="sm"
            aria-label="Izmeni"
            @click="openEdit(e)"
          >
            <PencilIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            aria-label="Obriši"
            @click="confirmDelete(e)"
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </div>
      </li>
    </ul>

    <Dialog
      v-model:open="dialogOpen"
      title-id="expense-dialog-title"
    >
      <DialogHeader>
        <h2
          id="expense-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingExpense ? 'Izmeni izdvajanje' : 'Dodaj izdvajanje' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <ExpenseForm
          :expense="editingExpense"
          @submit="onFormSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      v-model:open="deleteDialogOpen"
      title-id="delete-expense-title"
    >
      <DialogHeader>
        <h2
          id="delete-expense-title"
          class="text-lg font-semibold"
        >
          Obriši izdvajanje
        </h2>
      </DialogHeader>
      <DialogContent>
        <p class="text-gray-600">
          Da li ste sigurni da želite da obrišete „{{ expenseToDelete?.name }}”?
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
import type { Expense } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import ExpenseForm from '~/components/expenses/ExpenseForm.vue';
import { formatDate, formatAmount } from '~/utils/format';
import { useExpenses } from '~/composables/useExpenses';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchExpenses, createExpense, updateExpense, deleteExpense, markAsPaid } = useExpenses();

const expenses = ref<Expense[]>([]);
const loading = ref(true);
const hidePaid = ref(false);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingExpense = ref<Expense | null>(null);
const expenseToDelete = ref<Expense | null>(null);
const deleting = ref(false);

const unpaidTotal = computed(() =>
  expenses.value.filter((e) => !e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0),
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
  description?: string;
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

onMounted(() => {
  loadExpenses();
});
</script>

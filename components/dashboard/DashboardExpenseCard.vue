<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="pb-2">
      <div class="flex items-center gap-2">
        <ShoppingBagIcon
          class="h-5 w-5 shrink-0"
          :class="
            unpaidExpenses.length > 0
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-400 dark:text-gray-500'
          "
        />
        <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
          Neplaćena izdvajanja
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent class="flex flex-1 flex-col">
      <!-- Unpaid expenses list -->
      <div
        v-if="unpaidExpenses.length > 0"
        class="space-y-2"
      >
        <button
          v-for="e in unpaidExpenses.slice(0, 5)"
          :key="e.id"
          type="button"
          class="flex w-full items-center justify-between rounded-md bg-purple-50 px-3 py-2 text-left text-sm transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
          @click="openDetail(e)"
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ e.name }}</span>
          <span class="text-purple-700 dark:text-purple-400">{{ formatAmount(e.amount) }}</span>
        </button>
        <p
          v-if="unpaidExpenses.length > 5"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          + još {{ unpaidExpenses.length - 5 }}
        </p>
      </div>
      <p
        v-else
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        Nema neplaćenih izdvajanja
      </p>

      <div class="mt-auto flex flex-wrap gap-2 pt-4">
        <Button
          size="sm"
          @click="$emit('add')"
        >
          Dodaj izdvajanje
        </Button>
        <NuxtLink to="/expenses">
          <Button
            variant="outline"
            size="sm"
          >
            Pogledaj sve
          </Button>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>

  <!-- Detail popup -->
  <Dialog
    v-model:open="detailOpen"
    title-id="expense-detail-title"
  >
    <DialogHeader>
      <h2
        id="expense-detail-title"
        class="text-lg font-semibold"
      >
        Detalji izdvajanja
      </h2>
    </DialogHeader>
    <DialogContent v-if="selectedExpense">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50"
          >
            <ShoppingBagIcon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ selectedExpense.name }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatAmount(selectedExpense.amount) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Status:</dt>
              <dd
                :class="
                  selectedExpense.is_paid
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-purple-700 dark:text-purple-400'
                "
              >
                {{ selectedExpense.is_paid ? 'Plaćeno' : 'Nije plaćeno' }}
              </dd>
            </div>
            <div
              v-if="selectedExpense.paid_date"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Datum plaćanja:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(selectedExpense.paid_date) }}
              </dd>
            </div>
            <div
              v-if="selectedExpense.description"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Opis:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedExpense.description }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DialogContent>
    <DialogFooter>
      <Button
        variant="outline"
        @click="detailOpen = false"
      >
        Zatvori
      </Button>
      <Button @click="handleEdit">Izmeni</Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { ShoppingBagIcon } from '@heroicons/vue/24/outline';
import type { Expense } from '~/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { formatDate, formatAmount } from '~/utils/format';

interface Props {
  expenses: Expense[];
}

const props = defineProps<Props>();

const emit = defineEmits<{ add: []; edit: [expense: Expense] }>();

const detailOpen = ref(false);
const selectedExpense = ref<Expense | null>(null);

function handleEdit(): void {
  if (selectedExpense.value) {
    detailOpen.value = false;
    emit('edit', selectedExpense.value);
  }
}

// Filter unpaid expenses
const unpaidExpenses = computed(() => {
  return props.expenses.filter((e) => !e.is_paid);
});

function openDetail(e: Expense): void {
  selectedExpense.value = e;
  detailOpen.value = true;
}
</script>

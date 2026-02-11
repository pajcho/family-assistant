<template>
  <Dialog
    :open="open"
    title-id="expense-dialog-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="expense-dialog-title"
        class="text-lg font-semibold"
      >
        {{ expense ? 'Izmeni trošak' : 'Dodaj trošak' }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <div
        v-if="error"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        {{ error }}
      </div>
      <ExpenseForm
        :expense="expense"
        @submit="$emit('submit', $event)"
        @cancel="$emit('cancel')"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Expense } from '~/types/database';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import ExpenseForm from '~/components/expenses/ExpenseForm.vue';

interface Props {
  open: boolean;
  expense: Expense | null;
  error?: string;
}

defineProps<Props>();

defineEmits<{
  'update:open': [value: boolean];
  submit: [
    payload: {
      name: string;
      description: string | null;
      amount: number;
    },
  ];
  cancel: [];
}>();
</script>

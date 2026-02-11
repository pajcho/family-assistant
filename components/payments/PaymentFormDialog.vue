<template>
  <Dialog
    :open="open"
    title-id="payment-dialog-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="payment-dialog-title"
        class="text-lg font-semibold"
      >
        {{ payment ? 'Izmeni plaćanje' : 'Dodaj plaćanje' }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <div
        v-if="error"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        {{ error }}
      </div>
      <PaymentForm
        :payment="payment"
        :has-history="hasHistory"
        @submit="$emit('submit', $event)"
        @cancel="$emit('cancel')"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Payment, RecurrencePeriod } from '~/types/database';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import PaymentForm from '~/components/payments/PaymentForm.vue';

interface Props {
  open: boolean;
  payment: Payment | null;
  hasHistory?: boolean;
  error?: string;
}

withDefaults(defineProps<Props>(), { hasHistory: false });

defineEmits<{
  'update:open': [value: boolean];
  submit: [
    payload: {
      name: string;
      description: string | null;
      amount: number;
      due_date: string;
      is_recurring: boolean;
      recurrence_period: RecurrencePeriod | null;
      remaining_occurrences?: number | null;
      is_paused?: boolean;
    },
  ];
  cancel: [];
}>();
</script>

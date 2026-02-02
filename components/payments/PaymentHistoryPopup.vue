<template>
  <Dialog
    :open="open"
    title-id="payment-history-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="payment-history-title"
        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        Istorija: {{ payment?.name }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <div
        v-if="loading"
        class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Učitavanje…
      </div>
      <div
        v-else-if="history.length === 0"
        class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Nema zabeleženih uplata za ovo plaćanje.
      </div>
      <ul
        v-else
        class="space-y-2"
      >
        <li
          v-for="(entry, index) in history"
          :key="entry.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/50"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ index + 1 }}. Dospeće {{ formatDate(entry.due_date) }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Plaćeno {{ formatDate(entry.paid_date) }}
            </span>
          </div>
          <span class="font-semibold text-emerald-700 dark:text-emerald-400">
            {{ formatAmount(entry.amount) }}
          </span>
        </li>
      </ul>
    </DialogContent>
    <DialogFooter>
      <Button
        variant="outline"
        @click="$emit('update:open', false)"
      >
        Zatvori
      </Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import type { Payment, PaymentHistory } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { formatDate } from '~/utils/date';
import { formatAmount } from '~/utils/format';
import { usePayments } from '~/composables/usePayments';

interface Props {
  open: boolean;
  payment: Payment | null;
}

const props = defineProps<Props>();

defineEmits<{ 'update:open': [value: boolean] }>();

const { fetchPaymentHistoryByPaymentId } = usePayments();

const history = ref<PaymentHistory[]>([]);
const loading = ref(false);

watch(
  () => [props.open, props.payment?.id] as const,
  async ([isOpen, paymentId]) => {
    if (!isOpen || !paymentId) {
      history.value = [];
      return;
    }
    loading.value = true;
    history.value = await fetchPaymentHistoryByPaymentId(paymentId);
    loading.value = false;
  },
  { immediate: true },
);
</script>

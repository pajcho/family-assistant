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
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/50"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ index + 1 }}. Dospeće {{ formatDate(entry.due_date) }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Plaćeno {{ formatDate(entry.paid_date) }}
            </span>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span class="font-semibold text-emerald-700 dark:text-emerald-400">
              {{ formatAmount(entry.amount) }}
            </span>
            <button
              v-if="index === 0"
              type="button"
              class="inline-flex items-center gap-1 text-xs font-medium text-red-600 underline-offset-4 hover:underline disabled:opacity-50 dark:text-red-400"
              :disabled="undoing"
              @click="undoConfirmOpen = true"
            >
              <ArrowUturnLeftIcon class="h-3.5 w-3.5" />
              Poništi
            </button>
          </div>
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

  <Dialog
    v-model:open="undoConfirmOpen"
    title-id="undo-payment-history-title"
  >
    <DialogHeader>
      <h2
        id="undo-payment-history-title"
        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        Poništi plaćanje
      </h2>
    </DialogHeader>
    <DialogContent>
      <p class="text-gray-600 dark:text-gray-400">
        Da li ste sigurni da želite da poništite poslednje plaćanje za „{{ payment?.name }}"?
      </p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Ovo će obrisati zapis iz istorije i vratiti datum dospeća na prethodni mesec (kod mesečnih
        plaćanja), odnosno označiti plaćanje kao neplaćeno (kod jednokratnih).
      </p>
    </DialogContent>
    <DialogFooter>
      <Button
        variant="outline"
        @click="undoConfirmOpen = false"
      >
        Otkaži
      </Button>
      <Button
        variant="destructive"
        :disabled="undoing"
        @click="doUndo"
      >
        Poništi
      </Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { ArrowUturnLeftIcon } from '@heroicons/vue/24/outline';
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

const emit = defineEmits<{ 'update:open': [value: boolean]; undo: [] }>();

const { fetchPaymentHistoryByPaymentId, undoLastPayment } = usePayments();

const history = ref<PaymentHistory[]>([]);
const loading = ref(false);
const undoing = ref(false);
const undoConfirmOpen = ref(false);

async function loadHistory(): Promise<void> {
  if (!props.payment?.id) return;
  loading.value = true;
  history.value = await fetchPaymentHistoryByPaymentId(props.payment.id);
  loading.value = false;
}

watch(
  () => [props.open, props.payment?.id] as const,
  async ([isOpen, paymentId]) => {
    if (!isOpen || !paymentId) {
      history.value = [];
      return;
    }
    await loadHistory();
  },
  { immediate: true },
);

async function doUndo(): Promise<void> {
  if (!props.payment?.id) return;
  undoing.value = true;
  const { error } = await undoLastPayment(props.payment.id);
  undoing.value = false;
  if (!error) {
    undoConfirmOpen.value = false;
    await loadHistory();
    emit('undo');
  }
}
</script>

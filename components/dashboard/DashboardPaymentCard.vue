<template>
  <DashboardCard
    :icon="BanknotesIcon"
    title="Predstojeca plaćanja"
    empty-message="Nema plaćanja za prikaz"
    add-label="Dodaj plaćanje"
    view-all-link="/payments"
    :has-items="duePayments.length > 0"
    variant="amber"
    @add="$emit('add')"
  >
    <template #items>
      <DashboardCardItem
        v-for="p in duePayments.slice(0, 5)"
        :key="p.id"
        :label="p.name"
        :value="formatAmount(p.amount)"
        :variant="isOverdue(p.due_date) ? 'red' : 'amber'"
        :badge-icon="isOverdue(p.due_date) ? ExclamationTriangleIcon : undefined"
        :badge-icon-title="isOverdue(p.due_date) ? 'Prekoračeno' : undefined"
        @click="openDetail(p)"
      />
      <p
        v-if="duePayments.length > 5"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        + još {{ duePayments.length - 5 }}
      </p>
    </template>
  </DashboardCard>

  <!-- Detail popup -->
  <Dialog
    v-model:open="detailOpen"
    title-id="payment-detail-title"
  >
    <DialogHeader>
      <h2
        id="payment-detail-title"
        class="text-lg font-semibold"
      >
        Detalji plaćanja
      </h2>
    </DialogHeader>
    <DialogContent v-if="selectedPayment">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50"
          >
            <BanknotesIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ selectedPayment.name }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ recurrenceLabel(selectedPayment) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Iznos:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatAmount(selectedPayment.amount) }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Datum dospeća:</dt>
              <dd class="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(selectedPayment.due_date) }}
                <span
                  v-if="!selectedPayment.is_paid && isOverdue(selectedPayment.due_date)"
                  class="rounded bg-red-200 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-800/60 dark:text-red-200"
                >
                  Prekoračeno
                </span>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Status:</dt>
              <dd
                :class="
                  selectedPayment.is_paid
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                "
              >
                {{ selectedPayment.is_paid ? 'Plaćeno' : 'Nije plaćeno' }}
              </dd>
            </div>
            <div
              v-if="selectedPayment.description"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Opis:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedPayment.description }}
              </dd>
            </div>
            <div
              v-if="
                selectedPayment.recurrence_period === 'limited' &&
                selectedPayment.remaining_occurrences
              "
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Preostalo:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedPayment.remaining_occurrences }} rata
              </dd>
            </div>
            <!-- Link akcije: Istorija levo, Označi kao plaćeno desno -->
            <div class="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
              <button
                type="button"
                class="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                @click="openHistory"
              >
                Istorija
              </button>
              <button
                v-if="!selectedPayment.is_paid"
                type="button"
                class="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                :disabled="markingPaid"
                @click="handleMarkAsPaid"
              >
                Označi kao plaćeno
              </button>
              <span
                v-else
                class="text-sm text-gray-400 dark:text-gray-500"
              />
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

  <PaymentHistoryPopup
    v-model:open="historyOpen"
    :payment="selectedPayment"
  />
</template>

<script setup lang="ts">
import { BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import type { Payment } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import DashboardCard from '~/components/dashboard/DashboardCard.vue';
import DashboardCardItem from '~/components/dashboard/DashboardCardItem.vue';
import PaymentHistoryPopup from '~/components/payments/PaymentHistoryPopup.vue';
import { formatDate, formatAmount } from '~/utils/format';
import { isOverdue, isDateInRange, startOfToday, addDays } from '~/utils/date';
import { usePayments } from '~/composables/usePayments';

interface Props {
  payments: Payment[];
}

const props = defineProps<Props>();

const emit = defineEmits<{ add: []; updated: []; edit: [payment: Payment] }>();

const { markAsPaid } = usePayments();

function handleEdit(): void {
  if (selectedPayment.value) {
    detailOpen.value = false;
    emit('edit', selectedPayment.value);
  }
}

const detailOpen = ref(false);
const selectedPayment = ref<Payment | null>(null);
const markingPaid = ref(false);
const historyOpen = ref(false);

function openHistory(): void {
  detailOpen.value = false;
  historyOpen.value = true;
}

// Kad se zatvori istorija, ponovo otvori detalje
watch(historyOpen, (isOpen, wasOpen) => {
  if (wasOpen && !isOpen && selectedPayment.value) {
    detailOpen.value = true;
  }
});

async function handleMarkAsPaid(): Promise<void> {
  if (!selectedPayment.value) return;
  markingPaid.value = true;
  const { error } = await markAsPaid(selectedPayment.value.id);
  markingPaid.value = false;
  if (!error) {
    detailOpen.value = false;
    emit('updated');
  }
}

// Unpaid, non-paused: overdue (due_date < today) + upcoming (today <= due_date <= today+7), sorted: overdue first, then upcoming by due_date
const duePayments = computed(() => {
  const today = startOfToday();
  const in7 = addDays(today, 7);

  const unpaid = props.payments.filter((p) => !p.is_paid && !p.is_paused);
  const overdue = unpaid
    .filter((p) => isOverdue(p.due_date))
    .slice()
    .toSorted((a, b) => a.due_date.localeCompare(b.due_date));
  const upcoming = unpaid
    .filter((p) => isDateInRange(p.due_date, today, in7))
    .slice()
    .toSorted((a, b) => a.due_date.localeCompare(b.due_date));

  return [...overdue, ...upcoming];
});

function recurrenceLabel(p: Payment): string {
  if (p.recurrence_period === 'monthly') return 'Mesečno plaćanje';
  if (p.recurrence_period === 'limited') return 'Plaćanje na rate';
  return 'Jednokratno plaćanje';
}

function openDetail(p: Payment): void {
  selectedPayment.value = p;
  detailOpen.value = true;
}
</script>

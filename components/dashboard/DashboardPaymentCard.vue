<template>
  <DashboardCard
    :icon="BanknotesIcon"
    title="Plaćanja (7 dana)"
    empty-message="Nema plaćanja ove nedelje"
    add-label="Dodaj plaćanje"
    view-all-link="/payments"
    :has-items="upcomingPayments.length > 0"
    variant="amber"
    @add="$emit('add')"
  >
    <template #items>
      <DashboardCardItem
        v-for="p in upcomingPayments.slice(0, 3)"
        :key="p.id"
        :label="p.name"
        :value="formatAmount(p.amount)"
        variant="amber"
        @click="openDetail(p)"
      />
      <p
        v-if="upcomingPayments.length > 3"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        + još {{ upcomingPayments.length - 3 }}
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
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(selectedPayment.due_date) }}
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
      <Button
        v-if="selectedPayment && !selectedPayment.is_paid"
        variant="success"
        :disabled="markingPaid"
        @click="handleMarkAsPaid"
      >
        Označi kao plaćeno
      </Button>
      <Button @click="handleEdit">Izmeni</Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { BanknotesIcon } from '@heroicons/vue/24/outline';
import type { Payment } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import DashboardCard from '~/components/dashboard/DashboardCard.vue';
import DashboardCardItem from '~/components/dashboard/DashboardCardItem.vue';
import { formatDate, formatAmount } from '~/utils/format';
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

// Filter unpaid, non-paused payments within 7 days and sort by due date
const upcomingPayments = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  return props.payments
    .filter((p) => {
      if (p.is_paid || p.is_paused) return false;
      const dueDate = new Date(p.due_date + 'T00:00:00');
      return dueDate >= today && dueDate <= in7;
    })
    .toSorted((a, b) => a.due_date.localeCompare(b.due_date));
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

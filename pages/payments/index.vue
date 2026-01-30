<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Plaćanja</h1>
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
          Dodaj plaćanje
        </Button>
      </div>
    </div>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="payments.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500"
    >
      Nema plaćanja za prikaz.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <li
        v-for="p in payments"
        :key="p.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        :class="{ 'opacity-60': p.is_paid }"
      >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900">{{ p.name }}</p>
          <p class="text-sm text-gray-600">
            {{ formatDate(p.due_date) }} · {{ formatAmount(p.amount) }}
          </p>
          <p
            v-if="p.description"
            class="mt-1 text-sm text-gray-500"
          >
            {{ p.description }}
          </p>
          <div class="mt-1 flex flex-wrap gap-2 text-xs">
            <span
              v-if="p.is_paid"
              class="text-gray-500"
            >
              Plaćeno {{ p.paid_date ? formatDate(p.paid_date) : '' }}
            </span>
            <span
              v-else-if="p.recurrence_period === 'monthly'"
              class="text-amber-600"
            >
              Mesečno
            </span>
            <span
              v-else-if="p.recurrence_period === 'limited'"
              class="text-amber-600"
            >
              Ostalo {{ p.remaining_occurrences ?? 0 }} uplata
            </span>
            <span
              v-else
              class="text-gray-500"
            >
              Jednokratno
            </span>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <template v-if="!p.is_paid">
            <Button
              size="sm"
              @click="markPaid(p)"
            >
              Označi kao plaćeno
            </Button>
          </template>
          <Button
            variant="outline"
            size="sm"
            aria-label="Izmeni"
            @click="openEdit(p)"
          >
            <PencilIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            aria-label="Obriši"
            @click="confirmDelete(p)"
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </div>
      </li>
    </ul>

    <Dialog
      v-model:open="dialogOpen"
      title-id="payment-dialog-title"
    >
      <DialogHeader>
        <h2
          id="payment-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingPayment ? 'Izmeni plaćanje' : 'Dodaj plaćanje' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <PaymentForm
          :payment="editingPayment"
          @submit="onFormSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      v-model:open="deleteDialogOpen"
      title-id="delete-payment-title"
    >
      <DialogHeader>
        <h2
          id="delete-payment-title"
          class="text-lg font-semibold"
        >
          Obriši plaćanje
        </h2>
      </DialogHeader>
      <DialogContent>
        <p class="text-gray-600">
          Da li ste sigurni da želite da obrišete „{{ paymentToDelete?.name }}”?
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
import type { Payment, RecurrencePeriod } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import PaymentForm from '~/components/payments/PaymentForm.vue';
import { formatDate, formatAmount } from '~/utils/format';
import { usePayments } from '~/composables/usePayments';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchPayments, createPayment, updatePayment, deletePayment, markAsPaid } = usePayments();

const payments = ref<Payment[]>([]);
const loading = ref(true);
const hidePaid = ref(false);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingPayment = ref<Payment | null>(null);
const paymentToDelete = ref<Payment | null>(null);
const deleting = ref(false);

async function loadPayments(): Promise<void> {
  await fetchProfile();
  if (!familyId.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  payments.value = await fetchPayments(hidePaid.value);
  loading.value = false;
}

function openAdd(): void {
  editingPayment.value = null;
  dialogOpen.value = true;
}

function openEdit(p: Payment): void {
  editingPayment.value = p;
  dialogOpen.value = true;
}

async function onFormSubmit(payload: {
  name: string;
  description?: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  recurrence_period: RecurrencePeriod | null;
  remaining_occurrences?: number | null;
}): Promise<void> {
  if (editingPayment.value) {
    const { error } = await updatePayment(editingPayment.value.id, payload);
    if (!error) {
      dialogOpen.value = false;
      await loadPayments();
    }
  } else {
    const { error } = await createPayment(payload);
    if (!error) {
      dialogOpen.value = false;
      await loadPayments();
    }
  }
}

async function markPaid(p: Payment): Promise<void> {
  const { error } = await markAsPaid(p.id);
  if (!error) await loadPayments();
}

function confirmDelete(p: Payment): void {
  paymentToDelete.value = p;
  deleteDialogOpen.value = true;
}

async function doDelete(): Promise<void> {
  if (!paymentToDelete.value) return;
  deleting.value = true;
  const { error } = await deletePayment(paymentToDelete.value.id);
  deleting.value = false;
  if (!error) {
    deleteDialogOpen.value = false;
    paymentToDelete.value = null;
    await loadPayments();
  }
}

watch(hidePaid, () => {
  loadPayments();
});

onMounted(() => {
  loadPayments();
});
</script>

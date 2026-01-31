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

    <!-- Month filter buttons -->
    <div class="mt-4 flex flex-wrap gap-2">
      <Button
        v-for="filter in monthFilters"
        :key="filter.value"
        :variant="selectedMonth === filter.value ? 'default' : 'outline'"
        size="sm"
        @click="selectedMonth = filter.value"
      >
        {{ filter.label }}
      </Button>
    </div>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="combinedList.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500"
    >
      Nema plaćanja za prikaz.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <!-- History entries (paid) -->
      <li
        v-for="item in combinedList"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-4 shadow-sm"
        :class="getItemClass(item)"
      >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900">{{ item.name }}</p>
          <p class="text-sm text-gray-600">
            {{ formatDate(item.due_date) }} · {{ formatAmount(item.amount) }}
          </p>
          <p
            v-if="'description' in item && item.description"
            class="mt-1 text-sm text-gray-500"
          >
            {{ item.description }}
          </p>
          <div class="mt-1 flex flex-wrap gap-2 text-xs">
            <!-- History entry -->
            <template v-if="item.type === 'history'">
              <span class="font-medium text-emerald-600">
                Plaćeno {{ formatDate(item.paid_date) }}
              </span>
            </template>
            <!-- Paused payment -->
            <template v-else-if="item.is_paused">
              <span class="font-medium text-gray-500">Pauzirano</span>
            </template>
            <!-- Active payment -->
            <template v-else>
              <span
                v-if="item.is_paid"
                class="text-gray-500"
              >
                Plaćeno {{ item.paid_date ? formatDate(item.paid_date) : '' }}
              </span>
              <span
                v-else-if="item.recurrence_period === 'monthly'"
                class="text-amber-600"
              >
                Mesečno
              </span>
              <span
                v-else-if="item.recurrence_period === 'limited'"
                class="text-amber-600"
              >
                Ostalo {{ item.remaining_occurrences ?? 0 }} uplata
              </span>
              <span
                v-else
                class="text-gray-500"
              >
                Jednokratno
              </span>
            </template>
          </div>
        </div>
        <!-- Undo button for history entries (only last one) -->
        <div
          v-if="item.type === 'history' && item.isLast"
          class="flex shrink-0 items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            @click="confirmUndo(item)"
          >
            Poništi
          </Button>
        </div>
        <div
          v-if="item.type === 'payment'"
          class="flex shrink-0 items-center gap-2"
        >
          <!-- Pause/Resume button for recurring -->
          <template v-if="!item.is_paid && item.recurrence_period !== 'one-time'">
            <Button
              v-if="item.is_paused"
              variant="outline"
              size="sm"
              @click="handleTogglePause(item)"
            >
              Nastavi
            </Button>
            <Button
              v-else
              variant="secondary"
              size="sm"
              @click="handleTogglePause(item)"
            >
              Pauziraj
            </Button>
          </template>
          <!-- Mark as paid -->
          <template v-if="!item.is_paid && !item.is_paused">
            <Button
              variant="success"
              size="sm"
              @click="markPaid(item)"
            >
              Plaćeno
            </Button>
          </template>
          <Button
            variant="outline"
            size="sm"
            aria-label="Izmeni"
            @click="openEdit(item)"
          >
            <PencilIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            aria-label="Obriši"
            @click="confirmDelete(item)"
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
          :has-history="editingHasHistory"
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
          Da li ste sigurni da želite da obrišete „{{ paymentToDelete?.name }}"?
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

    <Dialog
      v-model:open="undoDialogOpen"
      title-id="undo-payment-title"
    >
      <DialogHeader>
        <h2
          id="undo-payment-title"
          class="text-lg font-semibold"
        >
          Poništi plaćanje
        </h2>
      </DialogHeader>
      <DialogContent>
        <p class="text-gray-600">
          Da li ste sigurni da želite da poništite poslednje plaćanje za „{{
            historyToUndo?.name
          }}"?
        </p>
        <p class="mt-2 text-sm text-gray-500">
          Ovo će obrisati zapis iz istorije i vratiti datum dospeća na prethodni mesec.
        </p>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          @click="undoDialogOpen = false"
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
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Payment, PaymentHistory, RecurrencePeriod } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import PaymentForm from '~/components/payments/PaymentForm.vue';
import { formatDate, formatAmount } from '~/utils/format';
import { usePayments } from '~/composables/usePayments';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

// Combined list item type
interface PaymentListItem extends Payment {
  type: 'payment';
}

interface HistoryListItem {
  type: 'history';
  id: string;
  payment_id: string;
  name: string;
  amount: number;
  due_date: string;
  paid_date: string;
  isLast: boolean;
}

type ListItem = PaymentListItem | HistoryListItem;

const { fetchProfile, familyId } = useProfile();
const {
  fetchPayments,
  fetchPaymentHistory,
  hasPaymentHistory,
  undoLastPayment,
  createPayment,
  updatePayment,
  deletePayment,
  markAsPaid,
  togglePause,
} = usePayments();

const allPayments = ref<Payment[]>([]);
const allHistory = ref<PaymentHistory[]>([]);
const loading = ref(true);
const hidePaid = ref(false);
const selectedMonth = ref('all');
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingPayment = ref<Payment | null>(null);
const editingHasHistory = ref(false);
const paymentToDelete = ref<Payment | null>(null);
const deleting = ref(false);
const undoDialogOpen = ref(false);
const historyToUndo = ref<HistoryListItem | null>(null);
const undoing = ref(false);

// Serbian month names
const monthNames = [
  'Januar',
  'Februar',
  'Mart',
  'April',
  'Maj',
  'Jun',
  'Jul',
  'Avgust',
  'Septembar',
  'Oktobar',
  'Novembar',
  'Decembar',
];

// Generate month filter options
const monthFilters = computed(() => {
  const today = new Date();
  const filters = [{ label: 'Sva', value: 'all' }];

  for (let i = 0; i < 3; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthIndex = date.getMonth();
    filters.push({
      label: monthNames[monthIndex],
      value: `${date.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}`,
    });
  }

  return filters;
});

// Create a map of payment names by ID for history entries
const paymentNameMap = computed(() => {
  const map = new Map<string, string>();
  for (const p of allPayments.value) {
    map.set(p.id, p.name);
  }
  return map;
});

// Combined and filtered list
const combinedList = computed<ListItem[]>(() => {
  const items: ListItem[] = [];

  // Add payments
  for (const p of allPayments.value) {
    // Filter by month if selected
    if (selectedMonth.value !== 'all' && !p.due_date.startsWith(selectedMonth.value)) {
      continue;
    }
    // Hide paid if checkbox is checked
    if (hidePaid.value && p.is_paid) {
      continue;
    }
    items.push({ ...p, type: 'payment' });
  }

  // Add history entries (only when filtering by month, not "all")
  if (selectedMonth.value !== 'all') {
    // Find the last history entry per payment_id (by paid_date)
    const lastHistoryByPayment = new Map<string, { id: string; paid_date: string }>();
    for (const h of allHistory.value) {
      const existing = lastHistoryByPayment.get(h.payment_id);
      if (!existing || h.paid_date > existing.paid_date) {
        lastHistoryByPayment.set(h.payment_id, { id: h.id, paid_date: h.paid_date });
      }
    }

    for (const h of allHistory.value) {
      if (!h.due_date.startsWith(selectedMonth.value)) continue;
      // Don't hide history entries even if hidePaid is checked
      items.push({
        type: 'history',
        id: h.id,
        payment_id: h.payment_id,
        name: paymentNameMap.value.get(h.payment_id) ?? 'Nepoznato plaćanje',
        amount: h.amount,
        due_date: h.due_date,
        paid_date: h.paid_date,
        isLast: lastHistoryByPayment.get(h.payment_id)?.id === h.id,
      });
    }
  }

  // Sort by due_date
  items.sort((a, b) => a.due_date.localeCompare(b.due_date));

  return items;
});

function getItemClass(item: ListItem): string {
  if (item.type === 'history') {
    return 'border-l-4 border-l-emerald-500 border-gray-200 opacity-75';
  }
  if (item.is_paused) {
    return 'border-gray-200 bg-gray-50 opacity-60';
  }
  if (item.is_paid) {
    return 'border-gray-200 opacity-60';
  }
  return 'border-gray-200';
}

async function loadData(): Promise<void> {
  await fetchProfile();
  if (!familyId.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  // Load payments and history in parallel
  const [payments, history] = await Promise.all([fetchPayments(false), fetchPaymentHistory()]);
  allPayments.value = payments;
  allHistory.value = history;
  loading.value = false;
}

function openAdd(): void {
  editingPayment.value = null;
  editingHasHistory.value = false;
  dialogOpen.value = true;
}

async function openEdit(item: PaymentListItem): Promise<void> {
  editingPayment.value = item;
  editingHasHistory.value = await hasPaymentHistory(item.id);
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
  is_paused?: boolean;
}): Promise<void> {
  if (editingPayment.value) {
    const { error } = await updatePayment(editingPayment.value.id, payload);
    if (!error) {
      dialogOpen.value = false;
      await loadData();
    }
  } else {
    const { error } = await createPayment(payload);
    if (!error) {
      dialogOpen.value = false;
      await loadData();
    }
  }
}

async function markPaid(item: PaymentListItem): Promise<void> {
  const { error } = await markAsPaid(item.id);
  if (!error) await loadData();
}

async function handleTogglePause(item: PaymentListItem): Promise<void> {
  const { error } = await togglePause(item.id);
  if (!error) await loadData();
}

function confirmDelete(item: PaymentListItem): void {
  paymentToDelete.value = item;
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
    await loadData();
  }
}

function confirmUndo(item: HistoryListItem): void {
  historyToUndo.value = item;
  undoDialogOpen.value = true;
}

async function doUndo(): Promise<void> {
  if (!historyToUndo.value) return;
  undoing.value = true;
  const { error } = await undoLastPayment(historyToUndo.value.payment_id);
  undoing.value = false;
  if (!error) {
    undoDialogOpen.value = false;
    historyToUndo.value = null;
    await loadData();
  }
}

watch(hidePaid, () => {
  // No need to reload, combinedList will re-filter
});

onMounted(() => {
  loadData();
});
</script>

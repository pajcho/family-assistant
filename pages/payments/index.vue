<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Plaćanja</h1>
      <Button @click="openAdd">
        <PlusIcon class="mr-2 h-5 w-5" />
        Dodaj plaćanje
      </Button>
    </div>

    <!-- Month filter + Sakrij plaćena -->
    <div class="mt-4 flex flex-wrap items-center gap-4">
      <div class="flex flex-wrap gap-2">
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
      <label
        class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <input
          v-model="hidePaid"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-500"
        />
        Sakrij plaćena
      </label>
    </div>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="displayedList.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      {{ emptyListMessage }}
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <!-- Payment/History items -->
      <li
        v-for="item in displayedList"
        :key="item.id"
        class="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800"
        :class="getItemClass(item)"
      >
        <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ item.name }}</p>
              <span
                v-if="item.type === 'history' || (item.type === 'payment' && item.is_paid)"
                class="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
              >
                Plaćeno
              </span>
              <span
                v-else-if="item.type === 'payment' && !item.is_paused && isOverdue(item.due_date)"
                class="rounded bg-red-200 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-800/60 dark:text-red-200"
              >
                Prekoračeno
              </span>
              <span
                v-else-if="item.type === 'upcoming'"
                class="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-400"
              >
                Nadolazeće
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(item.due_date) }} · {{ formatAmount(item.amount) }}
            </p>
            <p
              v-if="'description' in item && item.description"
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ item.description }}
            </p>
            <div class="mt-1 flex flex-wrap gap-2 text-xs">
              <!-- History entry -->
              <template v-if="item.type === 'history'">
                <span class="font-medium text-emerald-600 dark:text-emerald-400">
                  Plaćeno {{ formatDate(item.paid_date) }}
                </span>
              </template>
              <!-- Upcoming (informational only) -->
              <template v-else-if="item.type === 'upcoming'">
                <span class="font-medium text-sky-600 dark:text-sky-400">Nadolazeće</span>
                <span
                  v-if="item.recurrence_period === 'monthly'"
                  class="text-gray-500 dark:text-gray-400"
                >
                  Mesečno
                </span>
                <span
                  v-else-if="
                    item.recurrence_period === 'limited' && item.remaining_occurrences != null
                  "
                  class="text-gray-500 dark:text-gray-400"
                >
                  Ostalo {{ item.remaining_occurrences }} uplata
                </span>
              </template>
              <!-- Paused payment -->
              <template v-else-if="item.is_paused">
                <span class="font-medium text-gray-500 dark:text-gray-400">Pauzirano</span>
              </template>
              <!-- Active payment -->
              <template v-else>
                <span
                  v-if="item.is_paid"
                  class="font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Plaćeno {{ item.paid_date ? formatDate(item.paid_date) : '' }}
                </span>
                <span
                  v-else-if="item.recurrence_period === 'monthly'"
                  class="text-amber-600 dark:text-amber-400"
                >
                  Mesečno
                </span>
                <span
                  v-else-if="item.recurrence_period === 'limited'"
                  class="text-amber-600 dark:text-amber-400"
                >
                  Ostalo {{ item.remaining_occurrences ?? 0 }} uplata
                </span>
                <span
                  v-else
                  class="text-gray-500 dark:text-gray-400"
                >
                  Jednokratno
                </span>
              </template>
            </div>
          </div>
          <!-- History: Undo button -->
          <template v-if="item.type === 'history' && item.isLast">
            <div class="flex shrink-0 sm:hidden">
              <Dropdown>
                <DropdownItem
                  label="Poništi"
                  :icon="ArrowUturnLeftIcon"
                  @click="confirmUndo(item)"
                />
              </Dropdown>
            </div>
            <div class="hidden shrink-0 sm:flex">
              <Button
                variant="outline"
                size="sm"
                @click="confirmUndo(item)"
              >
                Poništi
              </Button>
            </div>
          </template>
          <!-- Upcoming: no actions (informational only) -->
          <!-- Payment: Actions -->
          <template v-if="item.type === 'payment'">
            <!-- Mobile: Dropdown -->
            <div class="flex shrink-0 sm:hidden">
              <Dropdown>
                <DropdownItem
                  v-if="!item.is_paid && !item.is_paused"
                  label="Označi kao plaćeno"
                  :icon="CheckIcon"
                  @click="markPaid(item)"
                />
                <DropdownItem
                  v-if="!item.is_paid && item.recurrence_period !== 'one-time' && item.is_paused"
                  label="Nastavi"
                  :icon="PlayIcon"
                  @click="handleTogglePause(item)"
                />
                <DropdownItem
                  v-if="!item.is_paid && item.recurrence_period !== 'one-time' && !item.is_paused"
                  label="Pauziraj"
                  :icon="PauseIcon"
                  @click="handleTogglePause(item)"
                />
                <DropdownItem
                  v-if="item.recurrence_period !== 'one-time'"
                  label="Istorija"
                  :icon="ClockIcon"
                  @click="openHistory(item)"
                />
                <DropdownItem
                  label="Izmeni"
                  :icon="PencilIcon"
                  @click="openEdit(item)"
                />
                <DropdownItem
                  label="Obriši"
                  :icon="TrashIcon"
                  variant="destructive"
                  @click="confirmDelete(item)"
                />
              </Dropdown>
            </div>
            <!-- Desktop: Buttons -->
            <div class="hidden shrink-0 gap-2 sm:flex">
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
                v-if="item.recurrence_period !== 'one-time'"
                variant="outline"
                size="sm"
                @click="openHistory(item)"
              >
                <ClockIcon class="mr-1 h-4 w-4" />
                Istorija
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="openEdit(item)"
              >
                <PencilIcon class="mr-1 h-4 w-4" />
                Izmeni
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click="confirmDelete(item)"
              >
                <TrashIcon class="mr-1 h-4 w-4" />
                Obriši
              </Button>
            </div>
          </template>
        </div>
      </li>
    </ul>

    <PaymentHistoryPopup
      v-model:open="historyPopupOpen"
      :payment="selectedPaymentForHistory"
      @undo="loadData"
    />

    <!-- Summary section -->
    <div
      v-if="combinedList.length > 0"
      class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <template v-if="summary.type === 'all'">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Ukupno za platiti:
          </span>
          <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ formatAmount(summary.total) }}
          </span>
        </div>
      </template>
      <template v-else>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div class="flex items-center justify-between sm:gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Za platiti:</span>
            <span class="font-semibold text-amber-700 dark:text-amber-400">
              {{ formatAmount(summary.unpaidTotal) }}
            </span>
          </div>
          <div class="flex items-center justify-between sm:gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Plaćeno:</span>
            <span class="font-semibold text-emerald-700 dark:text-emerald-400">
              {{ formatAmount(summary.paidTotal) }}
            </span>
          </div>
        </div>
      </template>
    </div>

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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  ArrowUturnLeftIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';
import type { Payment, PaymentHistory, RecurrencePeriod } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import PaymentForm from '~/components/payments/PaymentForm.vue';
import PaymentHistoryPopup from '~/components/payments/PaymentHistoryPopup.vue';
import { formatAmount } from '~/utils/format';
import {
  formatDate,
  isOverdue,
  getDueDateInMonth,
  currentMonthYYYYMM,
  getLimitedMonths as getLimitedMonthsFromDate,
} from '~/utils/date';
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

/** Informational row for a future month (no actions). */
interface UpcomingListItem {
  type: 'upcoming';
  id: string;
  paymentId: string;
  name: string;
  amount: number;
  due_date: string;
  description: string | null;
  recurrence_period: RecurrencePeriod | null;
  remaining_occurrences: number | null;
}

type ListItem = PaymentListItem | HistoryListItem | UpcomingListItem;

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
const selectedMonth = ref('all');
const hidePaid = ref(false);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingPayment = ref<Payment | null>(null);
const editingHasHistory = ref(false);
const paymentToDelete = ref<Payment | null>(null);
const deleting = ref(false);
const undoDialogOpen = ref(false);
const historyToUndo = ref<HistoryListItem | null>(null);
const undoing = ref(false);
const historyPopupOpen = ref(false);
const selectedPaymentForHistory = ref<Payment | null>(null);

function openHistory(payment: Payment): void {
  selectedPaymentForHistory.value = payment;
  historyPopupOpen.value = true;
}

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

function getLimitedMonths(p: Payment): string[] {
  return getLimitedMonthsFromDate(p.due_date, Math.max(0, p.remaining_occurrences ?? 0));
}

// Combined and filtered list
const combinedList = computed<ListItem[]>(() => {
  const items: ListItem[] = [];
  const sel = selectedMonth.value;
  const currentMonth = currentMonthYYYYMM();

  // Add payments (real rows: due in this month)
  for (const p of allPayments.value) {
    if (sel !== 'all' && !p.due_date.startsWith(sel)) continue;
    items.push({ ...p, type: 'payment' });
  }

  // Add history entries (only when filtering by month)
  // Skip history for one-time payments due in this month — they are already shown as payment rows
  if (sel !== 'all') {
    const oneTimePaymentIdsInMonth = new Set(
      allPayments.value
        .filter((p) => p.recurrence_period === 'one-time' && p.due_date.startsWith(sel))
        .map((p) => p.id),
    );
    const lastHistoryByPayment = new Map<string, { id: string; paid_date: string }>();
    for (const h of allHistory.value) {
      const existing = lastHistoryByPayment.get(h.payment_id);
      if (!existing || h.paid_date > existing.paid_date) {
        lastHistoryByPayment.set(h.payment_id, { id: h.id, paid_date: h.paid_date });
      }
    }
    for (const h of allHistory.value) {
      if (!h.due_date.startsWith(sel)) continue;
      if (oneTimePaymentIdsInMonth.has(h.payment_id)) continue;
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

    // Add upcoming rows for current/future months (informational only).
    // Do not add upcoming for a payment if that month's instance was already paid (has history entry).
    if (sel >= currentMonth) {
      const paymentIdsWithHistoryInMonth = new Set(
        allHistory.value.filter((h) => h.due_date.startsWith(sel)).map((h) => h.payment_id),
      );
      for (const p of allPayments.value) {
        if (p.is_paid || p.is_paused) continue;
        if (paymentIdsWithHistoryInMonth.has(p.id)) continue; // already paid this month
        const period = p.recurrence_period;
        const hasRealRow = p.due_date.startsWith(sel);

        if (period === 'monthly') {
          if (!hasRealRow) {
            items.push({
              type: 'upcoming',
              id: `upcoming-${p.id}-${sel}`,
              paymentId: p.id,
              name: p.name,
              amount: p.amount,
              due_date: getDueDateInMonth(sel, p.due_date),
              description: p.description,
              recurrence_period: p.recurrence_period,
              remaining_occurrences: p.remaining_occurrences,
            });
          }
        } else if (period === 'limited') {
          const months = getLimitedMonths(p);
          if (months.includes(sel) && !hasRealRow) {
            items.push({
              type: 'upcoming',
              id: `upcoming-${p.id}-${sel}`,
              paymentId: p.id,
              name: p.name,
              amount: p.amount,
              due_date: getDueDateInMonth(sel, p.due_date),
              description: p.description,
              recurrence_period: p.recurrence_period,
              remaining_occurrences: p.remaining_occurrences,
            });
          }
        }
        // one-time: no upcoming rows, only real row in due month
      }
    }
  }

  items.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return items;
});

// When "Sakrij plaćena" is on, hide payment rows that are paid and all history rows
const displayedList = computed<ListItem[]>(() => {
  if (!hidePaid.value) return combinedList.value;
  return combinedList.value.filter((item) => {
    if (item.type === 'history') return false;
    if (item.type === 'payment' && item.is_paid) return false;
    return true;
  });
});

const emptyListMessage = computed(() => {
  if (combinedList.value.length === 0) return 'Nema plaćanja za prikaz.';
  return 'Nema neplaćenih plaćanja. Sve stavke su plaćene ili ih sakriva filter „Sakrij plaćena".';
});

// Summary computed properties
const summary = computed(() => {
  if (selectedMonth.value === 'all') {
    // For "all" tab, show total future payments (not paid, not paused)
    const total = allPayments.value
      .filter((p) => !p.is_paid && !p.is_paused)
      .reduce((sum, p) => sum + p.amount, 0);
    return { type: 'all' as const, total };
  }

  // For specific month, show unpaid + paid amounts (unpaid includes real + upcoming for that month)
  const sel = selectedMonth.value;
  const currentMonth = currentMonthYYYYMM();
  let unpaidTotal = 0;
  let paidTotal = 0;

  // Count payments for this month (real rows)
  for (const p of allPayments.value) {
    if (!p.due_date.startsWith(sel)) continue;
    if (p.is_paused) continue;
    if (p.is_paid) {
      paidTotal += p.amount;
    } else {
      unpaidTotal += p.amount;
    }
  }

  // Count history entries for this month (skip one-time due in this month — already in payment count)
  const oneTimePaymentIdsInMonth = new Set(
    allPayments.value
      .filter((p) => p.recurrence_period === 'one-time' && p.due_date.startsWith(sel))
      .map((p) => p.id),
  );
  for (const h of allHistory.value) {
    if (!h.due_date.startsWith(sel)) continue;
    if (oneTimePaymentIdsInMonth.has(h.payment_id)) continue;
    paidTotal += h.amount;
  }

  // Include upcoming amounts for this month in unpaid total (same logic as combinedList)
  if (sel >= currentMonth) {
    const paymentIdsWithHistoryInMonth = new Set(
      allHistory.value.filter((h) => h.due_date.startsWith(sel)).map((h) => h.payment_id),
    );
    for (const p of allPayments.value) {
      if (p.is_paid || p.is_paused) continue;
      if (paymentIdsWithHistoryInMonth.has(p.id)) continue;
      const hasRealRow = p.due_date.startsWith(sel);
      if (p.recurrence_period === 'monthly' && !hasRealRow) {
        unpaidTotal += p.amount;
      } else if (
        p.recurrence_period === 'limited' &&
        getLimitedMonths(p).includes(sel) &&
        !hasRealRow
      ) {
        unpaidTotal += p.amount;
      }
    }
  }

  return { type: 'month' as const, unpaidTotal, paidTotal };
});

function getItemClass(item: ListItem): string {
  if (item.type === 'history') {
    return 'border border-gray-200/80 bg-gray-50 opacity-75 dark:border-gray-700 dark:bg-gray-800/80';
  }
  if (item.type === 'upcoming') {
    return 'border border-sky-200/80 bg-sky-50/50 opacity-60 dark:border-sky-800/50 dark:bg-sky-900/10';
  }
  if (item.is_paused) {
    return 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 opacity-60';
  }
  if (item.is_paid) {
    return 'border border-gray-200/80 bg-gray-50 opacity-75 dark:border-gray-700 dark:bg-gray-800/80';
  }
  // Overdue unpaid: subtle red border so it stands out
  if (item.type === 'payment' && isOverdue(item.due_date)) {
    return 'border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-900/20';
  }
  return 'border border-gray-200 dark:border-gray-700';
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
  description: string | null;
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

onMounted(() => {
  loadData();
});
</script>

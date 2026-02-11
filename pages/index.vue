<template>
  <PullToRefresh>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ familyName ? `Porodica ${familyName}` : 'Kontrolna tabla' }}
      </h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Dobrodošli nazad! Pregled nadolazećih obaveza.
      </p>

      <div
        v-if="!familyId"
        class="mt-6 text-gray-500 dark:text-gray-400"
      >
        Učitavanje…
      </div>
      <div
        v-else
        class="stagger-fade-in mt-6 grid gap-4 sm:grid-cols-2"
      >
        <DashboardEventCard
          :events="allEvents"
          @add="openAddEvent"
          @edit="openEditEvent"
        />
        <DashboardPaymentCard
          :payments="allPayments"
          @add="openAddPayment"
          @updated="loadPayments"
          @edit="openEditPayment"
        />
        <DashboardBirthdayCard
          :birthdays="allBirthdays"
          @add="openAddBirthday"
          @edit="openEditBirthday"
        />
        <DashboardExpenseCard
          :expenses="allExpenses"
          @add="openAddExpense"
          @edit="openEditExpense"
        />
      </div>

      <EventFormDialog
        v-model:open="eventDialogOpen"
        :event="editingEvent"
        :error="eventError"
        @submit="onEventSubmit"
        @cancel="eventDialogOpen = false"
      />
      <PaymentFormDialog
        v-model:open="paymentDialogOpen"
        :payment="editingPayment"
        :error="paymentError"
        @submit="onPaymentSubmit"
        @cancel="paymentDialogOpen = false"
      />
      <BirthdayFormDialog
        v-model:open="birthdayDialogOpen"
        :birthday="editingBirthday"
        :error="birthdayError"
        @submit="onBirthdaySubmit"
        @cancel="birthdayDialogOpen = false"
      />
      <ExpenseFormDialog
        v-model:open="expenseDialogOpen"
        :expense="editingExpense"
        :error="expenseError"
        @submit="onExpenseSubmit"
        @cancel="expenseDialogOpen = false"
      />
    </div>
  </PullToRefresh>
</template>

<script setup lang="ts">
import type { Event, Payment, Birthday, Expense, RecurrencePeriod } from '~/types/database';
import DashboardEventCard from '~/components/dashboard/DashboardEventCard.vue';
import DashboardPaymentCard from '~/components/dashboard/DashboardPaymentCard.vue';
import DashboardBirthdayCard from '~/components/dashboard/DashboardBirthdayCard.vue';
import DashboardExpenseCard from '~/components/dashboard/DashboardExpenseCard.vue';
import EventFormDialog from '~/components/events/EventFormDialog.vue';
import PaymentFormDialog from '~/components/payments/PaymentFormDialog.vue';
import BirthdayFormDialog from '~/components/birthdays/BirthdayFormDialog.vue';
import ExpenseFormDialog from '~/components/expenses/ExpenseFormDialog.vue';
import { useEvents } from '~/composables/useEvents';
import { usePayments } from '~/composables/usePayments';
import { useBirthdays } from '~/composables/useBirthdays';
import { useExpenses } from '~/composables/useExpenses';
import PullToRefresh from '~/components/PullToRefresh.vue';

definePageMeta({ layout: 'default' });

const { familyId, familyName, fetchProfile } = useProfile();
const supabase = useSupabase();

// Composables for CRUD operations
const { createEvent, updateEvent } = useEvents();
const { createPayment, updatePayment } = usePayments();
const { createBirthday, updateBirthday } = useBirthdays();
const { createExpense, updateExpense } = useExpenses();

// Data
const allEvents = ref<Event[]>([]);
const allPayments = ref<Payment[]>([]);
const allBirthdays = ref<Birthday[]>([]);
const allExpenses = ref<Expense[]>([]);

// Dialog state
const eventDialogOpen = ref(false);
const paymentDialogOpen = ref(false);
const birthdayDialogOpen = ref(false);
const expenseDialogOpen = ref(false);

// Editing state
const editingEvent = ref<Event | null>(null);
const editingPayment = ref<Payment | null>(null);
const editingBirthday = ref<Birthday | null>(null);
const editingExpense = ref<Expense | null>(null);

// Error state
const eventError = ref('');
const paymentError = ref('');
const birthdayError = ref('');
const expenseError = ref('');

// Open Add dialogs
function openAddEvent(): void {
  eventError.value = '';
  editingEvent.value = null;
  eventDialogOpen.value = true;
}

function openAddPayment(): void {
  paymentError.value = '';
  editingPayment.value = null;
  paymentDialogOpen.value = true;
}

function openAddBirthday(): void {
  birthdayError.value = '';
  editingBirthday.value = null;
  birthdayDialogOpen.value = true;
}

function openAddExpense(): void {
  expenseError.value = '';
  editingExpense.value = null;
  expenseDialogOpen.value = true;
}

// Open Edit dialogs
function openEditEvent(event: Event): void {
  eventError.value = '';
  editingEvent.value = event;
  eventDialogOpen.value = true;
}

function openEditPayment(payment: Payment): void {
  paymentError.value = '';
  editingPayment.value = payment;
  paymentDialogOpen.value = true;
}

function openEditBirthday(birthday: Birthday): void {
  birthdayError.value = '';
  editingBirthday.value = birthday;
  birthdayDialogOpen.value = true;
}

function openEditExpense(expense: Expense): void {
  expenseError.value = '';
  editingExpense.value = expense;
  expenseDialogOpen.value = true;
}

// Submit handlers
async function onEventSubmit(
  payload: Omit<Event, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
): Promise<void> {
  eventError.value = '';
  if (editingEvent.value) {
    const { error } = await updateEvent(editingEvent.value.id, payload);
    if (error) {
      eventError.value = error.message || 'Greška pri ažuriranju događaja';
      return;
    }
  } else {
    const { error } = await createEvent(payload);
    if (error) {
      eventError.value = error.message || 'Greška pri kreiranju događaja';
      return;
    }
  }
  eventDialogOpen.value = false;
  await loadEvents();
}

async function onPaymentSubmit(payload: {
  name: string;
  description?: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  recurrence_period: RecurrencePeriod | null;
  remaining_occurrences?: number | null;
}): Promise<void> {
  paymentError.value = '';
  if (editingPayment.value) {
    const { error } = await updatePayment(editingPayment.value.id, payload);
    if (error) {
      paymentError.value = error.message || 'Greška pri ažuriranju plaćanja';
      return;
    }
  } else {
    const { error } = await createPayment(payload);
    if (error) {
      paymentError.value = error.message || 'Greška pri kreiranju plaćanja';
      return;
    }
  }
  paymentDialogOpen.value = false;
  await loadPayments();
}

async function onBirthdaySubmit(payload: {
  name: string;
  description?: string;
  birth_date: string;
}): Promise<void> {
  birthdayError.value = '';
  if (editingBirthday.value) {
    const { error } = await updateBirthday(editingBirthday.value.id, payload);
    if (error) {
      birthdayError.value = error.message || 'Greška pri ažuriranju rođendana';
      return;
    }
  } else {
    const { error } = await createBirthday(payload);
    if (error) {
      birthdayError.value = error.message || 'Greška pri kreiranju rođendana';
      return;
    }
  }
  birthdayDialogOpen.value = false;
  await loadBirthdays();
}

async function onExpenseSubmit(payload: {
  name: string;
  description?: string;
  amount: number;
}): Promise<void> {
  expenseError.value = '';
  if (editingExpense.value) {
    const { error } = await updateExpense(editingExpense.value.id, payload);
    if (error) {
      expenseError.value = error.message || 'Greška pri ažuriranju troška';
      return;
    }
  } else {
    const { error } = await createExpense(payload);
    if (error) {
      expenseError.value = error.message || 'Greška pri kreiranju troška';
      return;
    }
  }
  expenseDialogOpen.value = false;
  await loadExpenses();
}

// Load data functions
async function loadEvents(): Promise<void> {
  const fid = familyId.value;
  if (!fid) return;
  const { data } = await supabase.from('events').select('*').eq('family_id', fid);
  allEvents.value = (data as Event[]) ?? [];
}

async function loadPayments(): Promise<void> {
  const fid = familyId.value;
  if (!fid) return;
  const { data } = await supabase.from('payments').select('*').eq('family_id', fid);
  allPayments.value = (data as Payment[]) ?? [];
}

async function loadBirthdays(): Promise<void> {
  const fid = familyId.value;
  if (!fid) return;
  const { data } = await supabase.from('birthdays').select('*').eq('family_id', fid);
  allBirthdays.value = (data as Birthday[]) ?? [];
}

async function loadExpenses(): Promise<void> {
  const fid = familyId.value;
  if (!fid) return;
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('family_id', fid)
    .order('sort_order', { ascending: true });
  allExpenses.value = (data as Expense[]) ?? [];
}

async function refreshData(): Promise<void> {
  await fetchProfile();
  if (!familyId.value) return;
  await Promise.all([loadEvents(), loadPayments(), loadBirthdays(), loadExpenses()]);
}

onMounted(() => {
  refreshData();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">Kontrolna tabla</h1>
    <p class="mt-1 text-gray-600">Dobrodošli nazad! Pregled nadolazećih obaveza.</p>

    <div
      v-if="!familyId"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else
      class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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

    <!-- Event Dialog (Add/Edit) -->
    <Dialog
      v-model:open="eventDialogOpen"
      title-id="event-dialog-title"
    >
      <DialogHeader>
        <h2
          id="event-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingEvent ? 'Izmeni događaj' : 'Dodaj događaj' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <div
          v-if="eventError"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ eventError }}
        </div>
        <EventForm
          :event="editingEvent"
          @submit="onEventSubmit"
          @cancel="eventDialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Payment Dialog (Add/Edit) -->
    <Dialog
      v-model:open="paymentDialogOpen"
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
        <div
          v-if="paymentError"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ paymentError }}
        </div>
        <PaymentForm
          :payment="editingPayment"
          @submit="onPaymentSubmit"
          @cancel="paymentDialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Birthday Dialog (Add/Edit) -->
    <Dialog
      v-model:open="birthdayDialogOpen"
      title-id="birthday-dialog-title"
    >
      <DialogHeader>
        <h2
          id="birthday-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingBirthday ? 'Izmeni rođendan' : 'Dodaj rođendan' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <div
          v-if="birthdayError"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ birthdayError }}
        </div>
        <BirthdayForm
          :birthday="editingBirthday"
          @submit="onBirthdaySubmit"
          @cancel="birthdayDialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Expense Dialog (Add/Edit) -->
    <Dialog
      v-model:open="expenseDialogOpen"
      title-id="expense-dialog-title"
    >
      <DialogHeader>
        <h2
          id="expense-dialog-title"
          class="text-lg font-semibold"
        >
          {{ editingExpense ? 'Izmeni izdvajanje' : 'Dodaj izdvajanje' }}
        </h2>
      </DialogHeader>
      <DialogContent>
        <div
          v-if="expenseError"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ expenseError }}
        </div>
        <ExpenseForm
          :expense="editingExpense"
          @submit="onExpenseSubmit"
          @cancel="expenseDialogOpen = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Event, Payment, Birthday, Expense, RecurrencePeriod } from '~/types/database';
import DashboardEventCard from '~/components/dashboard/DashboardEventCard.vue';
import DashboardPaymentCard from '~/components/dashboard/DashboardPaymentCard.vue';
import DashboardBirthdayCard from '~/components/dashboard/DashboardBirthdayCard.vue';
import DashboardExpenseCard from '~/components/dashboard/DashboardExpenseCard.vue';
import EventForm from '~/components/events/EventForm.vue';
import PaymentForm from '~/components/payments/PaymentForm.vue';
import BirthdayForm from '~/components/birthdays/BirthdayForm.vue';
import ExpenseForm from '~/components/expenses/ExpenseForm.vue';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import { useEvents } from '~/composables/useEvents';
import { usePayments } from '~/composables/usePayments';
import { useBirthdays } from '~/composables/useBirthdays';
import { useExpenses } from '~/composables/useExpenses';

definePageMeta({ layout: 'default' });

const { familyId, fetchProfile } = useProfile();
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
      expenseError.value = error.message || 'Greška pri ažuriranju izdvajanja';
      return;
    }
  } else {
    const { error } = await createExpense(payload);
    if (error) {
      expenseError.value = error.message || 'Greška pri kreiranju izdvajanja';
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

onMounted(async () => {
  await fetchProfile();
  if (!familyId.value) return;

  // Load all data in parallel
  await Promise.all([loadEvents(), loadPayments(), loadBirthdays(), loadExpenses()]);
});
</script>

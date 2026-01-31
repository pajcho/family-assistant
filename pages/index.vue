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
      />
      <DashboardPaymentCard
        :payments="allPayments"
        @add="openAddPayment"
        @updated="loadPayments"
      />
      <DashboardBirthdayCard
        :birthdays="allBirthdays"
        @add="openAddBirthday"
      />
      <DashboardExpenseCard
        :expenses="allExpenses"
        @add="openAddExpense"
      />
    </div>

    <!-- Add Event Dialog -->
    <Dialog
      v-model:open="addEventOpen"
      title-id="add-event-title"
    >
      <DialogHeader>
        <h2
          id="add-event-title"
          class="text-lg font-semibold"
        >
          Dodaj događaj
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
          @submit="onEventSubmit"
          @cancel="addEventOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Add Payment Dialog -->
    <Dialog
      v-model:open="addPaymentOpen"
      title-id="add-payment-title"
    >
      <DialogHeader>
        <h2
          id="add-payment-title"
          class="text-lg font-semibold"
        >
          Dodaj plaćanje
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
          @submit="onPaymentSubmit"
          @cancel="addPaymentOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Add Birthday Dialog -->
    <Dialog
      v-model:open="addBirthdayOpen"
      title-id="add-birthday-title"
    >
      <DialogHeader>
        <h2
          id="add-birthday-title"
          class="text-lg font-semibold"
        >
          Dodaj rođendan
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
          @submit="onBirthdaySubmit"
          @cancel="addBirthdayOpen = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Add Expense Dialog -->
    <Dialog
      v-model:open="addExpenseOpen"
      title-id="add-expense-title"
    >
      <DialogHeader>
        <h2
          id="add-expense-title"
          class="text-lg font-semibold"
        >
          Dodaj izdvajanje
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
          @submit="onExpenseSubmit"
          @cancel="addExpenseOpen = false"
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
const { createEvent } = useEvents();
const { createPayment } = usePayments();
const { createBirthday } = useBirthdays();
const { createExpense } = useExpenses();

// Data
const allEvents = ref<Event[]>([]);
const allPayments = ref<Payment[]>([]);
const allBirthdays = ref<Birthday[]>([]);
const allExpenses = ref<Expense[]>([]);

// Dialog state
const addEventOpen = ref(false);
const addPaymentOpen = ref(false);
const addBirthdayOpen = ref(false);
const addExpenseOpen = ref(false);

// Error state
const eventError = ref('');
const paymentError = ref('');
const birthdayError = ref('');
const expenseError = ref('');

// Open dialogs
function openAddEvent(): void {
  eventError.value = '';
  addEventOpen.value = true;
}

function openAddPayment(): void {
  paymentError.value = '';
  addPaymentOpen.value = true;
}

function openAddBirthday(): void {
  birthdayError.value = '';
  addBirthdayOpen.value = true;
}

function openAddExpense(): void {
  expenseError.value = '';
  addExpenseOpen.value = true;
}

// Submit handlers
async function onEventSubmit(
  payload: Omit<Event, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
): Promise<void> {
  eventError.value = '';
  const { error } = await createEvent(payload);
  if (error) {
    eventError.value = error.message || 'Greška pri kreiranju događaja';
    return;
  }
  addEventOpen.value = false;
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
  const { error } = await createPayment(payload);
  if (error) {
    paymentError.value = error.message || 'Greška pri kreiranju plaćanja';
    return;
  }
  addPaymentOpen.value = false;
  await loadPayments();
}

async function onBirthdaySubmit(payload: {
  name: string;
  description?: string;
  birth_date: string;
}): Promise<void> {
  birthdayError.value = '';
  const { error } = await createBirthday(payload);
  if (error) {
    birthdayError.value = error.message || 'Greška pri kreiranju rođendana';
    return;
  }
  addBirthdayOpen.value = false;
  await loadBirthdays();
}

async function onExpenseSubmit(payload: {
  name: string;
  description?: string;
  amount: number;
}): Promise<void> {
  expenseError.value = '';
  const { error } = await createExpense(payload);
  if (error) {
    expenseError.value = error.message || 'Greška pri kreiranju izdvajanja';
    return;
  }
  addExpenseOpen.value = false;
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
  const { data } = await supabase.from('expenses').select('*').eq('family_id', fid);
  allExpenses.value = (data as Expense[]) ?? [];
}

onMounted(async () => {
  await fetchProfile();
  if (!familyId.value) return;

  // Load all data in parallel
  await Promise.all([loadEvents(), loadPayments(), loadBirthdays(), loadExpenses()]);
});
</script>

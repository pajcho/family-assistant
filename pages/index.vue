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
      <DashboardSummaryCard
        title="Događaji (14 dana)"
        :display-value="eventsCount"
        :subtitle="eventsSubtitle"
        :icon="CalendarIcon"
        :variant="eventsCount > 0 ? 'default' : 'muted'"
        action-label="Dodaj događaj"
        to="/events"
        @action="navigateTo('/events')"
      />
      <DashboardSummaryCard
        title="Plaćanja (7 dana)"
        :display-value="paymentsCount"
        :subtitle="paymentsSubtitle"
        :icon="BanknotesIcon"
        :variant="paymentsCount > 0 ? 'warning' : 'muted'"
        action-label="Dodaj plaćanje"
        to="/payments"
        @action="navigateTo('/payments')"
      />
      <DashboardBirthdayCard
        :birthdays="allBirthdays"
        @add="openAddBirthday"
      />
      <DashboardSummaryCard
        title="Neplaćena izdvajanja"
        :display-value="expensesCount"
        :subtitle="expensesSubtitle"
        :icon="ShoppingBagIcon"
        :variant="expensesCount > 0 ? 'default' : 'muted'"
        to="/expenses"
        action-label="Dodaj izdvajanje"
        @action="navigateTo('/expenses')"
      />
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, BanknotesIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline';
import type { Birthday } from '~/types/database';
import DashboardSummaryCard from '~/components/dashboard/DashboardSummaryCard.vue';
import DashboardBirthdayCard from '~/components/dashboard/DashboardBirthdayCard.vue';
import BirthdayForm from '~/components/birthdays/BirthdayForm.vue';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import { formatAmount } from '~/utils/format';
import { useBirthdays } from '~/composables/useBirthdays';

definePageMeta({ layout: 'default' });

const router = useRouter();
const { familyId, fetchProfile } = useProfile();
const supabase = useSupabase();
const { createBirthday } = useBirthdays();

const eventsCount = ref(0);
const paymentsCount = ref(0);
const expensesCount = ref(0);
const eventsSubtitle = ref('');
const paymentsSubtitle = ref('');
const expensesSubtitle = ref('');

// Birthday state
const allBirthdays = ref<Birthday[]>([]);
const addBirthdayOpen = ref(false);
const birthdayError = ref('');

function navigateTo(path: string): void {
  router.push(path);
}

function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function openAddBirthday(): void {
  birthdayError.value = '';
  addBirthdayOpen.value = true;
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

async function loadBirthdays(): Promise<void> {
  const fid = familyId.value;
  if (!fid) return;
  const { data } = await supabase.from('birthdays').select('*').eq('family_id', fid);
  allBirthdays.value = (data as Birthday[]) ?? [];
}

onMounted(async () => {
  await fetchProfile();
  const fid = familyId.value;
  if (!fid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14 = new Date(today);
  in14.setDate(in14.getDate() + 14);
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  const { count: events } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', fid)
    .gte('date', dateToISO(today))
    .lte('date', dateToISO(in14));
  eventsCount.value = events ?? 0;
  eventsSubtitle.value =
    eventsCount.value === 0 ? 'Nema nadolazećih događaja' : 'u narednih 14 dana';

  const { count: payments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', fid)
    .eq('is_paid', false)
    .gte('due_date', dateToISO(today))
    .lte('due_date', dateToISO(in7));
  paymentsCount.value = payments ?? 0;
  paymentsSubtitle.value =
    paymentsCount.value === 0 ? 'Nema plaćanja ove nedelje' : 'dospeva uskoro';

  // Load all birthdays for the new card
  await loadBirthdays();

  const { count: expenses, data: expensesData } = await supabase
    .from('expenses')
    .select('amount', { count: 'exact', head: true })
    .eq('family_id', fid)
    .eq('is_paid', false);
  expensesCount.value = expenses ?? 0;
  const totalUnpaid = expensesData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;
  expensesSubtitle.value =
    expensesCount.value === 0 ? 'Nema neplaćenih' : `Ukupno: ${formatAmount(totalUnpaid)}`;
});
</script>

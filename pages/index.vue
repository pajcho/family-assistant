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
      <DashboardSummaryCard
        title="Rođendani (30 dana)"
        :display-value="birthdaysCount"
        :subtitle="birthdaysSubtitle"
        :icon="CakeIcon"
        :variant="birthdaysCount > 0 ? 'success' : 'muted'"
        to="/birthdays"
        action-label="Dodaj rođendan"
        @action="navigateTo('/birthdays')"
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
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, BanknotesIcon, CakeIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline';
import DashboardSummaryCard from '~/components/dashboard/DashboardSummaryCard.vue';
import { formatAmount } from '~/utils/format';

definePageMeta({ layout: 'default' });

const router = useRouter();
const { familyId, fetchProfile } = useProfile();
const supabase = useSupabase();

const eventsCount = ref(0);
const paymentsCount = ref(0);
const birthdaysCount = ref(0);
const expensesCount = ref(0);
const eventsSubtitle = ref('');
const paymentsSubtitle = ref('');
const birthdaysSubtitle = ref('');
const expensesSubtitle = ref('');

function navigateTo(path: string): void {
  router.push(path);
}

function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
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

  const { data: birthdays } = await supabase
    .from('birthdays')
    .select('id, birth_date')
    .eq('family_id', fid);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const next30 =
    birthdays?.filter((b) => {
      const bd = new Date(b.birth_date);
      const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      const nextYear = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
      return (thisYear >= today && thisYear <= in30) || (nextYear >= today && nextYear <= in30);
    }).length ?? 0;
  birthdaysCount.value = next30;
  birthdaysSubtitle.value =
    birthdaysCount.value === 0 ? 'Nema rođendana u narednih 30 dana' : 'u narednih 30 dana';

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

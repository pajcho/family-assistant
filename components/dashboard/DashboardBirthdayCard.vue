<template>
  <DashboardCard
    :icon="CakeIcon"
    title="Sledeći rođendani"
    empty-message="Nema nadolazećih rođendana"
    add-label="Dodaj rođendan"
    view-all-link="/birthdays"
    :has-items="displayBirthdays.length > 0"
    variant="emerald"
    @add="$emit('add')"
  >
    <template #items>
      <DashboardCardItem
        v-for="b in displayBirthdays"
        :key="b.id"
        :label="b.name"
        :value="daysLabel(b.birth_date)"
        variant="emerald"
        @click="openDetail(b)"
      />
    </template>
  </DashboardCard>

  <!-- Detail popup -->
  <Dialog
    v-model:open="detailOpen"
    title-id="birthday-detail-title"
  >
    <DialogHeader>
      <h2
        id="birthday-detail-title"
        class="text-lg font-semibold"
      >
        Detalji rođendana
      </h2>
    </DialogHeader>
    <DialogContent v-if="selectedBirthday">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50"
          >
            <CakeIcon class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ selectedBirthday.name }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ birthdayDisplayText(selectedBirthday.name, selectedBirthday.birth_date) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Datum rođenja:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(selectedBirthday.birth_date) }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Trenutne godine:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ currentAge(selectedBirthday.birth_date) }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Sledeći rođendan:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(nextBirthdayDateStr(selectedBirthday.birth_date)) }}
              </dd>
            </div>
            <div
              v-if="selectedBirthday.description"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Opis:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedBirthday.description }}
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
      <Button @click="handleEdit">Izmeni</Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { CakeIcon } from '@heroicons/vue/24/outline';
import type { Birthday } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import DashboardCard from '~/components/dashboard/DashboardCard.vue';
import DashboardCardItem from '~/components/dashboard/DashboardCardItem.vue';
import {
  daysUntilBirthday,
  currentAge,
  birthdayDisplayText,
  nextBirthdayDate,
} from '~/utils/birthday';
import { formatDate } from '~/utils/date';

interface Props {
  birthdays: Birthday[];
}

const props = defineProps<Props>();

const emit = defineEmits<{ add: []; edit: [birthday: Birthday] }>();

const detailOpen = ref(false);
const selectedBirthday = ref<Birthday | null>(null);

function handleEdit(): void {
  if (selectedBirthday.value) {
    detailOpen.value = false;
    emit('edit', selectedBirthday.value);
  }
}

// All birthdays sorted by next occurrence (days until)
const allSortedBirthdays = computed(() => {
  return [...props.birthdays].toSorted(
    (a, b) => daysUntilBirthday(a.birth_date) - daysUntilBirthday(b.birth_date),
  );
});

// First 3 upcoming; if the 3rd shares its date with more, show all on that day
const displayBirthdays = computed(() => {
  const sorted = allSortedBirthdays.value;
  if (sorted.length === 0) return [];
  if (sorted.length <= 3 || !sorted[2]) return sorted;
  const third = sorted[2];
  const thirdNextDate = nextBirthdayDate(third.birth_date).getTime();
  return sorted.filter((b) => nextBirthdayDate(b.birth_date).getTime() <= thirdNextDate);
});

function daysLabel(birthDate: string): string {
  const days = daysUntilBirthday(birthDate);
  if (days === 0) return 'danas';
  if (days === 1) return 'sutra';
  return `za ${days} dana`;
}

function nextBirthdayDateStr(birthDate: string): string {
  const d = nextBirthdayDate(birthDate);
  return d.toISOString().slice(0, 10);
}

function openDetail(b: Birthday): void {
  selectedBirthday.value = b;
  detailOpen.value = true;
}
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="pb-2">
      <div class="flex items-center gap-2">
        <CakeIcon
          class="h-5 w-5 shrink-0"
          :class="
            upcomingBirthdays.length > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-400 dark:text-gray-500'
          "
        />
        <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
          Rođendani (30 dana)
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent class="flex flex-1 flex-col">
      <!-- Upcoming birthdays list -->
      <div
        v-if="upcomingBirthdays.length > 0"
        class="mt-3 space-y-2"
      >
        <button
          v-for="b in upcomingBirthdays.slice(0, 3)"
          :key="b.id"
          type="button"
          class="flex w-full items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-left text-sm transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
          @click="openDetail(b)"
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ b.name }}</span>
          <span class="text-emerald-700 dark:text-emerald-400">{{ daysLabel(b.birth_date) }}</span>
        </button>
        <p
          v-if="upcomingBirthdays.length > 3"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          + još {{ upcomingBirthdays.length - 3 }}
        </p>
      </div>
      <p
        v-else
        class="mt-1 text-xs text-gray-500 dark:text-gray-400"
      >
        Nema rođendana u narednih 30 dana
      </p>

      <div class="mt-auto flex flex-wrap gap-2 pt-4">
        <Button
          size="sm"
          @click="$emit('add')"
        >
          Dodaj rođendan
        </Button>
        <NuxtLink to="/birthdays">
          <Button
            variant="outline"
            size="sm"
          >
            Pogledaj sve
          </Button>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>

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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import {
  daysUntilBirthday,
  currentAge,
  birthdayDisplayText,
  nextBirthdayDate,
} from '~/utils/birthday';
import { formatDate } from '~/utils/format';

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

// Filter birthdays within 30 days and sort by days until
const upcomingBirthdays = computed(() => {
  return props.birthdays
    .filter((b) => daysUntilBirthday(b.birth_date) <= 30)
    .toSorted((a, b) => daysUntilBirthday(a.birth_date) - daysUntilBirthday(b.birth_date));
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

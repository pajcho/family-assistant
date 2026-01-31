<template>
  <DashboardCard
    :icon="CalendarIcon"
    title="Događaji (14 dana)"
    empty-message="Nema nadolazećih događaja"
    add-label="Dodaj događaj"
    view-all-link="/events"
    :has-items="upcomingEvents.length > 0"
    variant="blue"
    @add="$emit('add')"
  >
    <template #items>
      <button
        v-for="e in upcomingEvents.slice(0, 3)"
        :key="e.id"
        type="button"
        class="flex w-full items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
        @click="openDetail(e)"
      >
        <span class="min-w-0 flex-1">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ e.name }}</span>
          <span class="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
            {{ formatTime(e.start_time) }}–{{ formatTime(e.end_time) }}
          </span>
        </span>
        <span class="shrink-0 text-blue-700 dark:text-blue-400">
          {{ eventDateLabel(e.date) }}
        </span>
      </button>
      <p
        v-if="upcomingEvents.length > 3"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        + još {{ upcomingEvents.length - 3 }}
      </p>
    </template>
  </DashboardCard>

  <!-- Detail popup -->
  <Dialog
    v-model:open="detailOpen"
    title-id="event-detail-title"
  >
    <DialogHeader>
      <h2
        id="event-detail-title"
        class="text-lg font-semibold"
      >
        Detalji događaja
      </h2>
    </DialogHeader>
    <DialogContent v-if="selectedEvent">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50"
          >
            <CalendarIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ selectedEvent.name }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(selectedEvent.date) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500 dark:text-gray-400">Vreme:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatTime(selectedEvent.start_time) }} –
                {{ formatTime(selectedEvent.end_time) }}
              </dd>
            </div>
            <div
              v-if="selectedEvent.description"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Opis:</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-100">
                {{ selectedEvent.description }}
              </dd>
            </div>
            <div
              v-if="selectedEvent.notes"
              class="flex justify-between"
            >
              <dt class="text-gray-500 dark:text-gray-400">Napomene:</dt>
              <dd class="font-medium text-amber-700 dark:text-amber-400">
                {{ selectedEvent.notes }}
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
import { CalendarIcon } from '@heroicons/vue/24/outline';
import type { Event } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import DashboardCard from '~/components/dashboard/DashboardCard.vue';
import { formatDate, formatTime } from '~/utils/format';

interface Props {
  events: Event[];
}

const props = defineProps<Props>();

const emit = defineEmits<{ add: []; edit: [event: Event] }>();

const detailOpen = ref(false);
const selectedEvent = ref<Event | null>(null);

function handleEdit(): void {
  if (selectedEvent.value) {
    detailOpen.value = false;
    emit('edit', selectedEvent.value);
  }
}

// Filter events within 14 days and sort by date
const upcomingEvents = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14 = new Date(today);
  in14.setDate(in14.getDate() + 14);

  return props.events
    .filter((e) => {
      const eventDate = new Date(e.date + 'T00:00:00');
      return eventDate >= today && eventDate <= in14;
    })
    .toSorted((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
});

function eventDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'danas';
  if (diff === 1) return 'sutra';
  return `za ${diff} dana`;
}

function openDetail(e: Event): void {
  selectedEvent.value = e;
  detailOpen.value = true;
}
</script>

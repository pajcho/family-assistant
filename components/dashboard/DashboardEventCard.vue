<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="pb-2">
      <div class="flex items-center gap-2">
        <CalendarIcon
          class="h-5 w-5 shrink-0"
          :class="upcomingEvents.length > 0 ? 'text-blue-600' : 'text-gray-400'"
        />
        <CardTitle class="text-sm font-medium text-gray-600">Događaji (14 dana)</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="flex flex-1 flex-col">
      <!-- Upcoming events list -->
      <div
        v-if="upcomingEvents.length > 0"
        class="space-y-2"
      >
        <button
          v-for="e in upcomingEvents.slice(0, 3)"
          :key="e.id"
          type="button"
          class="flex w-full items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-100"
          @click="openDetail(e)"
        >
          <span class="font-medium text-gray-900">{{ e.name }}</span>
          <span class="text-blue-700">{{ eventDateLabel(e.date) }}</span>
        </button>
        <p
          v-if="upcomingEvents.length > 3"
          class="text-xs text-gray-500"
        >
          + još {{ upcomingEvents.length - 3 }}
        </p>
      </div>
      <p
        v-else
        class="text-sm text-gray-500"
      >
        Nema nadolazećih događaja
      </p>

      <div class="mt-auto flex flex-wrap gap-2 pt-4">
        <Button
          size="sm"
          @click="$emit('add')"
        >
          Dodaj događaj
        </Button>
        <NuxtLink to="/events">
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
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CalendarIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900">{{ selectedEvent.name }}</p>
            <p class="text-sm text-gray-600">{{ formatDate(selectedEvent.date) }}</p>
          </div>
        </div>

        <div class="rounded-lg bg-gray-50 p-4">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">Vreme:</dt>
              <dd class="font-medium text-gray-900">
                {{ formatTime(selectedEvent.start_time) }} –
                {{ formatTime(selectedEvent.end_time) }}
              </dd>
            </div>
            <div
              v-if="selectedEvent.description"
              class="flex justify-between"
            >
              <dt class="text-gray-500">Opis:</dt>
              <dd class="font-medium text-gray-900">{{ selectedEvent.description }}</dd>
            </div>
            <div
              v-if="selectedEvent.notes"
              class="flex justify-between"
            >
              <dt class="text-gray-500">Napomene:</dt>
              <dd class="font-medium text-amber-700">{{ selectedEvent.notes }}</dd>
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
      <NuxtLink to="/events">
        <Button @click="detailOpen = false">Izmeni</Button>
      </NuxtLink>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { CalendarIcon } from '@heroicons/vue/24/outline';
import type { Event } from '~/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { formatDate, formatTime } from '~/utils/format';

interface Props {
  events: Event[];
}

const props = defineProps<Props>();

defineEmits<{ add: [] }>();

const detailOpen = ref(false);
const selectedEvent = ref<Event | null>(null);

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

<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Događaji</h1>
      <div class="flex flex-wrap items-center gap-2">
        <label
          class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <input
            v-model="hideCompleted"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-500"
          />
          Sakrij završene
        </label>
        <Button @click="openAdd">
          <PlusIcon class="mr-2 h-5 w-5" />
          Dodaj događaj
        </Button>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-4 sm:flex-row">
      <div class="flex items-center gap-2">
        <Label
          for="from"
          class="shrink-0"
        >
          Od
        </Label>
        <Input
          id="from"
          v-model="filterFrom"
          type="date"
          class="w-40"
        />
      </div>
      <div class="flex items-center gap-2">
        <Label
          for="to"
          class="shrink-0"
        >
          Do
        </Label>
        <Input
          id="to"
          v-model="filterTo"
          type="date"
          class="w-40"
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        @click="clearFilters"
      >
        Prikaži sve
      </Button>
    </div>

    <div
      v-if="loading"
      class="mt-6 text-gray-500"
    >
      Učitavanje…
    </div>
    <div
      v-else-if="filteredEvents.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Nema događaja za prikaz. Dodajte prvi događaj.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <li
        v-for="ev in filteredEvents"
        :key="ev.id"
        :class="[
          'rounded-lg border p-4 shadow-sm dark:border-gray-700',
          isEventEnded(ev)
            ? 'border-gray-200/80 bg-gray-50 opacity-75 dark:bg-gray-800/80'
            : 'border-gray-200 bg-white dark:bg-gray-800',
        ]"
      >
        <EventsEventListItem
          :event="ev"
          @edit="openEdit"
          @delete="confirmDelete"
        />
      </li>
    </ul>

    <EventFormDialog
      v-model:open="dialogOpen"
      :event="editingEvent"
      :error="errorMessage"
      @submit="onFormSubmit"
      @cancel="dialogOpen = false"
    />
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Obriši događaj"
      :message="deleteConfirmMessage"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline';
import type { Event } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue';
import EventFormDialog from '~/components/events/EventFormDialog.vue';
import { isEventEnded } from '~/utils/event';
import { useEvents } from '~/composables/useEvents';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();

const events = ref<Event[]>([]);
const loading = ref(true);
const hideCompleted = ref(true);
const filterFrom = ref('');
const filterTo = ref('');
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingEvent = ref<Event | null>(null);
const eventToDelete = ref<Event | null>(null);
const deleting = ref(false);
const errorMessage = ref('');

const filteredEvents = computed(() => {
  if (hideCompleted.value) {
    return events.value.filter((ev) => !isEventEnded(ev));
  }
  return [...events.value];
});

const deleteConfirmMessage = computed(
  () => `Da li ste sigurni da želite da obrišete "${eventToDelete.value?.name ?? ''}"?`,
);

async function loadEvents(): Promise<void> {
  await fetchProfile();
  const fid = familyId.value;
  if (!fid) {
    loading.value = false;
    return;
  }
  loading.value = true;
  events.value = await fetchEvents(filterFrom.value || undefined, filterTo.value || undefined);
  loading.value = false;
}

function openAdd(): void {
  editingEvent.value = null;
  errorMessage.value = '';
  dialogOpen.value = true;
}

function openEdit(ev: Event): void {
  editingEvent.value = ev;
  errorMessage.value = '';
  dialogOpen.value = true;
}

function clearFilters(): void {
  filterFrom.value = '';
  filterTo.value = '';
  loadEvents();
}

async function onFormSubmit(
  payload: Omit<Event, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
): Promise<void> {
  errorMessage.value = '';
  if (editingEvent.value) {
    const { error } = await updateEvent(editingEvent.value.id, payload);
    if (error) {
      errorMessage.value = error.message || 'Greška pri ažuriranju događaja';
      return;
    }
    dialogOpen.value = false;
    await loadEvents();
  } else {
    const { error } = await createEvent(payload);
    if (error) {
      errorMessage.value = error.message || 'Greška pri kreiranju događaja';
      return;
    }
    dialogOpen.value = false;
    await loadEvents();
  }
}

function confirmDelete(ev: Event): void {
  eventToDelete.value = ev;
  deleteDialogOpen.value = true;
}

async function doDelete(): Promise<void> {
  if (!eventToDelete.value) return;
  deleting.value = true;
  const { error } = await deleteEvent(eventToDelete.value.id);
  deleting.value = false;
  if (!error) {
    deleteDialogOpen.value = false;
    eventToDelete.value = null;
    await loadEvents();
  }
}

watch([filterFrom, filterTo], () => {
  loadEvents();
});

onMounted(() => {
  loadEvents();
});
</script>

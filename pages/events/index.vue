<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Događaji</h1>
      <Button @click="openAdd">
        <PlusIcon class="mr-2 h-5 w-5" />
        Dodaj događaj
      </Button>
    </div>

    <div class="mt-4 flex flex-wrap gap-4 sm:flex-row">
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
      v-else-if="events.length === 0"
      class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Nema događaja za prikaz. Dodajte prvi događaj.
    </div>
    <ul
      v-else
      class="mt-6 space-y-3"
    >
      <li
        v-for="ev in events"
        :key="ev.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-900 dark:text-gray-100">{{ ev.name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(ev.date) }} · {{ formatTime(ev.start_time) }} –
              {{ formatTime(ev.end_time) }}
            </p>
            <p
              v-if="ev.description"
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ ev.description }}
            </p>
            <p
              v-if="ev.notes"
              class="mt-1 text-sm text-amber-700 dark:text-amber-400"
            >
              {{ ev.notes }}
            </p>
          </div>
          <!-- Mobile: Dropdown menu -->
          <div class="flex shrink-0 sm:hidden">
            <Dropdown>
              <DropdownItem
                label="Izmeni"
                :icon="PencilIcon"
                @click="openEdit(ev)"
              />
              <DropdownItem
                label="Obriši"
                :icon="TrashIcon"
                variant="destructive"
                @click="confirmDelete(ev)"
              />
            </Dropdown>
          </div>
          <!-- Desktop: Regular buttons -->
          <div class="hidden shrink-0 gap-2 sm:flex">
            <Button
              variant="outline"
              size="sm"
              @click="openEdit(ev)"
            >
              <PencilIcon class="mr-1 h-4 w-4" />
              Izmeni
            </Button>
            <Button
              variant="destructive"
              size="sm"
              @click="confirmDelete(ev)"
            >
              <TrashIcon class="mr-1 h-4 w-4" />
              Obriši
            </Button>
          </div>
        </div>
      </li>
    </ul>

    <Dialog
      v-model:open="dialogOpen"
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
          v-if="errorMessage"
          class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>
        <EventForm
          :event="editingEvent"
          @submit="onFormSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      v-model:open="deleteDialogOpen"
      title-id="delete-dialog-title"
    >
      <DialogHeader>
        <h2
          id="delete-dialog-title"
          class="text-lg font-semibold"
        >
          Obriši događaj
        </h2>
      </DialogHeader>
      <DialogContent>
        <p class="text-gray-600">
          Da li ste sigurni da želite da obrišete „{{ eventToDelete?.name }}”?
        </p>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          @click="deleteDialogOpen = false"
        >
          Otkaži
        </Button>
        <Button
          variant="destructive"
          :disabled="deleting"
          @click="doDelete"
        >
          Obriši
        </Button>
      </DialogFooter>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Event } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import EventForm from '~/components/events/EventForm.vue';
import { formatDate, formatTime } from '~/utils/format';
import { useEvents } from '~/composables/useEvents';
import { useProfile } from '~/composables/useProfile';

definePageMeta({ layout: 'default' });

const { fetchProfile, familyId } = useProfile();
const { fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();

const events = ref<Event[]>([]);
const loading = ref(true);
const filterFrom = ref('');
const filterTo = ref('');
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingEvent = ref<Event | null>(null);
const eventToDelete = ref<Event | null>(null);
const deleting = ref(false);
const errorMessage = ref('');

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

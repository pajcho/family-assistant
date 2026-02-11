<template>
  <Dialog
    :open="open"
    title-id="event-dialog-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="event-dialog-title"
        class="text-lg font-semibold"
      >
        {{ event ? 'Izmeni događaj' : 'Dodaj događaj' }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <div
        v-if="error"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        {{ error }}
      </div>
      <EventForm
        :event="event"
        @submit="$emit('submit', $event)"
        @cancel="$emit('cancel')"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Event } from '~/types/database';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import EventForm from '~/components/events/EventForm.vue';

interface Props {
  open: boolean;
  event: Event | null;
  error?: string;
}

defineProps<Props>();

defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: Omit<Event, 'id' | 'family_id' | 'created_at' | 'updated_at'>];
  cancel: [];
}>();
</script>

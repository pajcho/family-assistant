<template>
  <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-medium text-gray-900 dark:text-gray-100">{{ event.name }}</p>
        <span
          v-if="isEnded"
          class="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-400"
        >
          Završeno
        </span>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ formatDate(event.date) }} · {{ formatEventTimeRange(event) }}
      </p>
      <p
        v-if="event.description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ event.description }}
      </p>
      <p
        v-if="event.notes"
        class="mt-1 text-sm text-amber-700 dark:text-amber-400"
      >
        {{ event.notes }}
      </p>
    </div>
    <div class="flex shrink-0 sm:hidden">
      <Dropdown>
        <DropdownItem
          label="Izmeni"
          :icon="PencilIcon"
          @click="$emit('edit', event)"
        />
        <DropdownItem
          label="Obriši"
          :icon="TrashIcon"
          variant="destructive"
          @click="$emit('delete', event)"
        />
      </Dropdown>
    </div>
    <div class="hidden shrink-0 gap-2 sm:flex">
      <Button
        variant="outline"
        size="sm"
        @click="$emit('edit', event)"
      >
        <PencilIcon class="mr-1 h-4 w-4" />
        Izmeni
      </Button>
      <Button
        variant="destructive"
        size="sm"
        @click="$emit('delete', event)"
      >
        <TrashIcon class="mr-1 h-4 w-4" />
        Obriši
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Event } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import { formatDate } from '~/utils/date';
import { isEventEnded, formatEventTimeRange } from '~/utils/event';

const props = defineProps<{ event: Event }>();
defineEmits<{ edit: [event: Event]; delete: [event: Event] }>();

const isEnded = computed(() => isEventEnded(props.event));
</script>

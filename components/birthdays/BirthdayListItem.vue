<template>
  <div
    class="flex flex-wrap gap-3 sm:flex-nowrap"
    :class="birthday.description ? 'items-start' : 'items-center'"
  >
    <div class="min-w-0 flex-1">
      <BirthdayDisplayLine
        :name="birthday.name"
        :birth-date="birthday.birth_date"
      />
      <p
        v-if="birthday.description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ birthday.description }}
      </p>
    </div>
    <div class="flex shrink-0 sm:hidden">
      <Dropdown>
        <DropdownItem
          label="Izmeni"
          :icon="PencilIcon"
          @click="$emit('edit', birthday)"
        />
        <DropdownItem
          label="Obriši"
          :icon="TrashIcon"
          variant="destructive"
          @click="$emit('delete', birthday)"
        />
      </Dropdown>
    </div>
    <div class="hidden shrink-0 gap-2 sm:flex">
      <Button
        variant="outline"
        size="sm"
        @click="$emit('edit', birthday)"
      >
        <PencilIcon class="mr-1 h-4 w-4" />
        Izmeni
      </Button>
      <Button
        variant="destructive"
        size="sm"
        @click="$emit('delete', birthday)"
      >
        <TrashIcon class="mr-1 h-4 w-4" />
        Obriši
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import type { Birthday } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import BirthdayDisplayLine from '~/components/birthdays/BirthdayDisplayLine.vue';

defineProps<{ birthday: Birthday }>();

defineEmits<{ edit: [birthday: Birthday]; delete: [birthday: Birthday] }>();
</script>

<template>
  <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
    <div
      class="drag-handle flex cursor-grab items-center py-2 text-gray-400 active:cursor-grabbing dark:text-gray-500"
    >
      <Bars3Icon class="h-5 w-5" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="font-medium text-gray-900 dark:text-gray-100">{{ expense.name }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatAmount(expense.amount) }}</p>
      <p
        v-if="expense.description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ expense.description }}
      </p>
      <p
        v-if="expense.is_paid && expense.paid_date"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        Kupljeno {{ formatDate(expense.paid_date) }}
      </p>
    </div>
    <div class="flex shrink-0 sm:hidden">
      <Dropdown>
        <DropdownItem
          v-if="!expense.is_paid"
          label="Označi kao plaćeno"
          :icon="CheckIcon"
          @click="$emit('markPaid', expense)"
        />
        <DropdownItem
          label="Izmeni"
          :icon="PencilIcon"
          @click="$emit('edit', expense)"
        />
        <DropdownItem
          label="Obriši"
          :icon="TrashIcon"
          variant="destructive"
          @click="$emit('delete', expense)"
        />
      </Dropdown>
    </div>
    <div class="hidden shrink-0 gap-2 sm:flex">
      <template v-if="!expense.is_paid">
        <Button
          size="sm"
          @click="$emit('markPaid', expense)"
        >
          Plaćeno
        </Button>
      </template>
      <Button
        variant="outline"
        size="sm"
        @click="$emit('edit', expense)"
      >
        <PencilIcon class="mr-1 h-4 w-4" />
        Izmeni
      </Button>
      <Button
        variant="destructive"
        size="sm"
        @click="$emit('delete', expense)"
      >
        <TrashIcon class="mr-1 h-4 w-4" />
        Obriši
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, TrashIcon, Bars3Icon, CheckIcon } from '@heroicons/vue/24/outline';
import type { Expense } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import { formatDate } from '~/utils/date';
import { formatAmount } from '~/utils/format';

defineProps<{ expense: Expense }>();

defineEmits<{
  markPaid: [expense: Expense];
  edit: [expense: Expense];
  delete: [expense: Expense];
}>();
</script>

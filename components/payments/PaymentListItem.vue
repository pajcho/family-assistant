<template>
  <div class="flex flex-wrap items-start gap-3 sm:flex-nowrap">
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-medium text-gray-900 dark:text-gray-100">{{ item.name }}</p>
        <span
          v-if="item.type === 'history' || (item.type === 'payment' && item.is_paid)"
          class="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
        >
          Plaćeno
        </span>
        <span
          v-else-if="item.type === 'payment' && !item.is_paused && isOverdue(item.due_date)"
          class="rounded bg-red-200 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-800/60 dark:text-red-200"
        >
          Prekoračeno
        </span>
        <span
          v-else-if="item.type === 'upcoming'"
          class="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-400"
        >
          Nadolazeće
        </span>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ formatDate(item.due_date) }} · {{ formatAmount(item.amount) }}
      </p>
      <p
        v-if="'description' in item && item.description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ item.description }}
      </p>
      <div class="mt-1 flex flex-wrap gap-2 text-xs">
        <template v-if="item.type === 'history'">
          <span class="font-medium text-emerald-600 dark:text-emerald-400">
            Plaćeno {{ formatDate(item.paid_date) }}
          </span>
        </template>
        <template v-else-if="item.type === 'upcoming'">
          <span class="font-medium text-sky-600 dark:text-sky-400">Nadolazeće</span>
          <span
            v-if="item.recurrence_period === 'monthly'"
            class="text-gray-500 dark:text-gray-400"
          >
            Mesečno
          </span>
          <span
            v-else-if="item.recurrence_period === 'limited' && item.remaining_occurrences != null"
            class="text-gray-500 dark:text-gray-400"
          >
            Ostalo {{ item.remaining_occurrences }} uplata
          </span>
        </template>
        <template v-else-if="item.is_paused">
          <span class="font-medium text-gray-500 dark:text-gray-400">Pauzirano</span>
        </template>
        <template v-else>
          <span
            v-if="item.is_paid"
            class="font-medium text-emerald-600 dark:text-emerald-400"
          >
            Plaćeno {{ item.paid_date ? formatDate(item.paid_date) : '' }}
          </span>
          <span
            v-else-if="item.recurrence_period === 'monthly'"
            class="text-amber-600 dark:text-amber-400"
          >
            Mesečno
          </span>
          <span
            v-else-if="item.recurrence_period === 'limited'"
            class="text-amber-600 dark:text-amber-400"
          >
            Ostalo {{ item.remaining_occurrences ?? 0 }} uplata
          </span>
          <span
            v-else
            class="text-gray-500 dark:text-gray-400"
          >
            Jednokratno
          </span>
        </template>
      </div>
    </div>
    <template v-if="item.type === 'history' && item.isLast">
      <div class="flex shrink-0 sm:hidden">
        <Dropdown>
          <DropdownItem
            label="Poništi"
            :icon="ArrowUturnLeftIcon"
            @click="$emit('undo', item)"
          />
        </Dropdown>
      </div>
      <div class="hidden shrink-0 sm:flex">
        <Button
          variant="outline"
          size="sm"
          @click="$emit('undo', item)"
        >
          Poništi
        </Button>
      </div>
    </template>
    <template v-if="item.type === 'payment'">
      <div class="flex shrink-0 sm:hidden">
        <Dropdown>
          <DropdownItem
            v-if="!item.is_paid && !item.is_paused"
            label="Označi kao plaćeno"
            :icon="CheckIcon"
            @click="$emit('markPaid', item)"
          />
          <DropdownItem
            v-if="!item.is_paid && item.recurrence_period !== 'one-time' && item.is_paused"
            label="Nastavi"
            :icon="PlayIcon"
            @click="$emit('togglePause', item)"
          />
          <DropdownItem
            v-if="!item.is_paid && item.recurrence_period !== 'one-time' && !item.is_paused"
            label="Pauziraj"
            :icon="PauseIcon"
            @click="$emit('togglePause', item)"
          />
          <DropdownItem
            v-if="item.recurrence_period !== 'one-time'"
            label="Istorija"
            :icon="ClockIcon"
            @click="$emit('openHistory', item)"
          />
          <DropdownItem
            label="Izmeni"
            :icon="PencilIcon"
            @click="$emit('edit', item)"
          />
          <DropdownItem
            label="Obriši"
            :icon="TrashIcon"
            variant="destructive"
            @click="$emit('delete', item)"
          />
        </Dropdown>
      </div>
      <div class="hidden shrink-0 gap-2 sm:flex">
        <template v-if="!item.is_paid && item.recurrence_period !== 'one-time'">
          <Button
            v-if="item.is_paused"
            variant="outline"
            size="sm"
            @click="$emit('togglePause', item)"
          >
            Nastavi
          </Button>
          <Button
            v-else
            variant="secondary"
            size="sm"
            @click="$emit('togglePause', item)"
          >
            Pauziraj
          </Button>
        </template>
        <template v-if="!item.is_paid && !item.is_paused">
          <Button
            variant="success"
            size="sm"
            @click="$emit('markPaid', item)"
          >
            Plaćeno
          </Button>
        </template>
        <Button
          v-if="item.recurrence_period !== 'one-time'"
          variant="outline"
          size="sm"
          @click="$emit('openHistory', item)"
        >
          <ClockIcon class="mr-1 h-4 w-4" />
          Istorija
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="$emit('edit', item)"
        >
          <PencilIcon class="mr-1 h-4 w-4" />
          Izmeni
        </Button>
        <Button
          variant="destructive"
          size="sm"
          @click="$emit('delete', item)"
        >
          <TrashIcon class="mr-1 h-4 w-4" />
          Obriši
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  ArrowUturnLeftIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';
import type { Payment, RecurrencePeriod } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Dropdown, DropdownItem } from '~/components/ui/dropdown';
import { formatAmount } from '~/utils/format';
import { formatDate, isOverdue } from '~/utils/date';

interface PaymentListItemType extends Payment {
  type: 'payment';
}

interface HistoryListItemType {
  type: 'history';
  id: string;
  payment_id: string;
  name: string;
  amount: number;
  due_date: string;
  paid_date: string;
  isLast: boolean;
}

interface UpcomingListItemType {
  type: 'upcoming';
  id: string;
  paymentId: string;
  name: string;
  amount: number;
  due_date: string;
  description: string | null;
  recurrence_period: RecurrencePeriod | null;
  remaining_occurrences: number | null;
}

export type PaymentListItem = PaymentListItemType | HistoryListItemType | UpcomingListItemType;

defineProps<{ item: PaymentListItem }>();

defineEmits<{
  markPaid: [item: PaymentListItemType];
  togglePause: [item: PaymentListItemType];
  openHistory: [item: PaymentListItemType];
  edit: [item: PaymentListItemType];
  delete: [item: PaymentListItemType];
  undo: [item: HistoryListItemType];
}>();
</script>

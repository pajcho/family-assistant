<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <span class="shrink-0 font-medium text-gray-900 dark:text-gray-100">{{ name }}</span>
    <span
      class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-none text-gray-500 dark:text-gray-400"
    >
      <span class="inline-flex items-center gap-1">
        <CakeIcon class="h-3.5 w-3.5 shrink-0" />
        {{ nextAge }}
      </span>
      <span class="inline-flex items-center gap-1">
        <CalendarIcon class="h-3.5 w-3.5 shrink-0" />
        {{ dateStr }}
      </span>
      <span
        v-if="!hideDays && daysUntil <= 30"
        class="inline-flex items-center gap-1"
      >
        <ClockIcon class="h-3.5 w-3.5 shrink-0" />
        {{ daysLabel }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { CakeIcon, CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline';
import { currentAge, daysUntilBirthday } from '~/utils/birthday';
import { formatDate } from '~/utils/date';

interface Props {
  name: string;
  birthDate: string;
  /** Kad true, ne prikazuje "za X dana" (koristi se kad se dani prikazuju posebno desno). */
  hideDays?: boolean;
}

const props = withDefaults(defineProps<Props>(), { hideDays: false });

const nextAge = computed(() => currentAge(props.birthDate) + 1);
const dateStr = computed(() => formatDate(props.birthDate));
const daysUntil = computed(() => daysUntilBirthday(props.birthDate));
const daysLabel = computed(() => {
  const d = daysUntil.value;
  if (d === 0) return 'danas';
  if (d === 1) return 'sutra';
  return `za ${d} dana`;
});
</script>

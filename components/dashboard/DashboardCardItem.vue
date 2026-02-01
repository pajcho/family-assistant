<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
    :class="variantClasses"
    @click="$emit('click')"
  >
    <span class="flex min-w-0 flex-1 items-center gap-2">
      <span class="truncate font-medium text-gray-900 dark:text-gray-100">{{ label }}</span>
      <span
        v-if="badgeIcon"
        class="shrink-0"
        :class="badgeIconClasses"
        :title="badgeIconTitle"
      >
        <component
          :is="badgeIcon"
          class="h-4 w-4"
        />
      </span>
      <span
        v-else-if="badge"
        class="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
        :class="badgeClasses"
      >
        {{ badge }}
      </span>
    </span>
    <span :class="valueClass">{{ value }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  label: string;
  value: string;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'red';
  badge?: string;
  /** Icon component (e.g. for overdue indicator). Shown instead of badge when set. */
  badgeIcon?: Component;
  /** Optional title/tooltip for badgeIcon. */
  badgeIconTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue',
  badge: undefined,
  badgeIcon: undefined,
  badgeIconTitle: undefined,
});

defineEmits<{ click: [] }>();

const variantClasses = computed(() => {
  const map = {
    blue: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
    amber: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50',
    emerald:
      'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50',
    purple: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50',
    red: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50',
  };
  return map[props.variant];
});

const valueClass = computed(() => {
  const map = {
    blue: 'text-blue-700 dark:text-blue-400',
    amber: 'text-amber-700 dark:text-amber-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    purple: 'text-purple-700 dark:text-purple-400',
    red: 'text-red-700 dark:text-red-400',
  };
  return map[props.variant];
});

const badgeClasses = computed(() => {
  if (props.variant === 'red') {
    return 'bg-red-200 text-red-800 dark:bg-red-800/60 dark:text-red-200';
  }
  return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
});

const badgeIconClasses = computed(() => {
  if (props.variant === 'red') {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-500 dark:text-gray-400';
});
</script>

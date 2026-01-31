<template>
  <button
    type="button"
    class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors"
    :class="variantClasses"
    @click="$emit('click')"
  >
    <span class="font-medium text-gray-900 dark:text-gray-100">{{ label }}</span>
    <span :class="valueClass">{{ value }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue',
});

defineEmits<{ click: [] }>();

const variantClasses = computed(() => {
  const map = {
    blue: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
    amber: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50',
    emerald:
      'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50',
    purple: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50',
  };
  return map[props.variant];
});

const valueClass = computed(() => {
  const map = {
    blue: 'text-blue-700 dark:text-blue-400',
    amber: 'text-amber-700 dark:text-amber-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    purple: 'text-purple-700 dark:text-purple-400',
  };
  return map[props.variant];
});
</script>

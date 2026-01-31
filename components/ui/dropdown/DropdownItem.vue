<template>
  <button
    type="button"
    class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
    :class="variantClass"
    @click="handleClick"
  >
    <component
      :is="icon"
      v-if="icon"
      class="h-4 w-4 shrink-0"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  label: string;
  icon?: Component;
  variant?: 'default' | 'destructive';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const emit = defineEmits<{ click: [] }>();

const variantClass = computed(() => {
  if (props.variant === 'destructive') {
    return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20';
  }
  return 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700';
});

function handleClick(): void {
  emit('click');
}
</script>

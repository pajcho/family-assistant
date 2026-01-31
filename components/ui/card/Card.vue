<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

const attrs = useAttrs();
const cardClass = computed(() =>
  cn(
    'rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
    attrs.class as string,
  ),
);
</script>

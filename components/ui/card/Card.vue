<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

const attrs = useAttrs();
const cardClass = computed(() =>
  cn('rounded-lg border border-gray-200 bg-white shadow-sm', attrs.class as string),
);
</script>

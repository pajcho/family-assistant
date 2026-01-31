<template>
  <label
    :for="forId"
    :class="labelClass"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface Props {
  for?: string;
}

const props = defineProps<Props>();
const attrs = useAttrs();
const forId = computed(() => props.for ?? undefined);
const labelClass = computed(() =>
  cn('text-sm font-medium leading-none text-gray-700 dark:text-gray-200', attrs.class as string),
);
</script>

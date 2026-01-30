<template>
  <NuxtLink
    :to="to"
    class="flex flex-col items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-row sm:gap-2 sm:px-2 sm:py-1.5"
    :class="
      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    "
  >
    <component
      :is="icon"
      class="h-5 w-5 shrink-0"
    />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  to: string;
  label: string;
  icon: Component;
}

const props = defineProps<Props>();

const route = useRoute();
const isActive = computed(() => {
  const path = route.path;
  if (props.to === '/') return path === '/';
  return path.startsWith(props.to);
});
</script>

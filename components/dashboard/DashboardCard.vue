<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="pb-2">
      <div class="flex items-center gap-2">
        <component
          :is="icon"
          class="h-5 w-5 shrink-0"
          :class="hasItems ? iconActiveClass : 'text-gray-400 dark:text-gray-500'"
        />
        <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
          {{ title }}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent class="flex flex-1 flex-col">
      <!-- Items list -->
      <div
        v-if="hasItems"
        class="mt-3 space-y-2"
      >
        <slot name="items" />
      </div>
      <p
        v-else
        class="mt-3 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ emptyMessage }}
      </p>

      <!-- Action buttons -->
      <div class="mt-auto flex flex-wrap gap-2 pt-4">
        <Button
          size="sm"
          @click="$emit('add')"
        >
          {{ addLabel }}
        </Button>
        <NuxtLink :to="viewAllLink">
          <Button
            variant="outline"
            size="sm"
          >
            Pogledaj sve
          </Button>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

interface Props {
  icon: Component;
  title: string;
  emptyMessage: string;
  addLabel: string;
  viewAllLink: string;
  hasItems: boolean;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue',
});

defineEmits<{ add: [] }>();

const iconActiveClass = computed(() => {
  const map = {
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };
  return map[props.variant];
});
</script>

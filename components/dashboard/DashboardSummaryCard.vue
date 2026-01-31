<template>
  <Card>
    <CardHeader class="pb-2">
      <div class="flex items-center gap-2">
        <component
          :is="icon"
          class="h-5 w-5 shrink-0"
          :class="iconClass"
        />
        <CardTitle class="text-sm font-medium text-gray-600">{{ title }}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div
        class="text-2xl font-bold"
        :class="valueClass"
      >
        {{ displayValue }}
      </div>
      <p
        v-if="subtitle"
        class="mt-1 text-xs text-gray-500"
      >
        {{ subtitle }}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <Button
          v-if="actionLabel"
          size="sm"
          @click="$emit('action')"
        >
          {{ actionLabel }}
        </Button>
        <NuxtLink
          v-if="to"
          :to="to"
        >
          <Button
            variant="outline"
            size="sm"
          >
            Pogledaj
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
  title: string;
  displayValue: string | number;
  subtitle?: string;
  icon: Component;
  variant?: 'default' | 'success' | 'warning' | 'muted';
  actionLabel?: string;
  to?: string;
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' });

defineEmits<{ action: [] }>();

const iconClass = computed(() => {
  const map = {
    default: 'text-gray-500',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    muted: 'text-gray-400',
  };
  return map[props.variant];
});

const valueClass = computed(() => {
  const map = {
    default: 'text-gray-900',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    muted: 'text-gray-500',
  };
  return map[props.variant];
});
</script>

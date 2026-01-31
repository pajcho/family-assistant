<template>
  <input
    :class="inputClass"
    :type="type"
    :value="modelValue"
    :disabled="disabled"
    v-bind="$attrs"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface Props {
  modelValue?: string;
  type?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const inputClass = computed(() =>
  cn(
    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-offset-gray-900',
    props.class,
  ),
);

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target?.value ?? '');
}
</script>

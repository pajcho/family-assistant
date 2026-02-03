<template>
  <div class="relative w-full">
    <input
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      v-bind="$attrs"
      @input="onInput"
      @change="onChange"
    />
    <button
      v-if="showClear"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900"
      :aria-label="clearLabel"
      :title="clearLabel"
      @click="onClear"
    >
      <XMarkIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { cn } from '~/utils/cn';

interface Props {
  modelValue?: string;
  type?: string;
  disabled?: boolean;
  class?: string;
  /** Label for the clear button (date/time inputs). Shown when value is set. */
  clearLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  clearLabel: 'Obriši',
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const showClear = computed(
  () =>
    !props.disabled &&
    (props.type === 'date' || props.type === 'time') &&
    (props.modelValue ?? '').trim() !== '',
);

const inputClass = computed(() =>
  cn(
    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-offset-gray-900',
    props.class,
  ),
);

function onClear(): void {
  emit('update:modelValue', '');
}

function syncValue(e: Event): void {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target?.value ?? '');
}

function onInput(e: Event): void {
  syncValue(e);
}

// iOS Safari often does not fire 'input' when user clears the native date/time picker;
// it does fire 'change' when the picker is dismissed, so we sync the value there too.
function onChange(e: Event): void {
  syncValue(e);
}
</script>

<template>
  <VueDatePicker
    :model-value="displayValue"
    :dark="isDark"
    model-type="format"
    :flow="flowSteps"
    :formats="{ input: 'HH:mm', preview: 'HH:mm' }"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :time-picker="true"
    :text-input="true"
    :input-attrs="inputAttrs"
    :input-class-name="inputClassName"
    :class="wrapperClass"
    auto-apply
    @update:model-value="onUpdate"
    :teleport="true"
  />
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { cn } from '~/utils/cn';
import { useTheme } from '~/composables/useTheme';

/** Time-only flow: show only the time picker panel. */
const flowSteps = { steps: ['time'] as const };

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  required?: boolean;
  class?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'HH:mm',
  disabled: false,
  clearable: false,
  required: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const { isDark } = useTheme();

/** Normalize to HH:mm; accepts HH:mm or HH:mm:ss from API. */
function normalizeTimeString(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) return trimmed;
  const h = Math.min(23, Math.max(0, Number.parseInt(match[1], 10)));
  const m = Math.min(59, Math.max(0, Number.parseInt(match[2], 10)));
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const displayValue = computed(() => normalizeTimeString(props.modelValue));

function onUpdate(value: Date | string | null | undefined): void {
  if (value == null || (typeof value === 'string' && !value.trim())) {
    emit('update:modelValue', '');
    return;
  }
  if (typeof value === 'string') {
    emit('update:modelValue', normalizeTimeString(value));
    return;
  }
  emit(
    'update:modelValue',
    `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`,
  );
}

const inputAttrs = computed(() => ({
  ...(props.id != null && props.id !== '' && { id: props.id }),
  ...(props.required && { required: true }),
}));

const inputClassName = computed(() =>
  cn(
    'dp-input-app h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:ring-offset-gray-900',
  ),
);

const wrapperClass = computed(() => cn('w-full', props.class));
</script>

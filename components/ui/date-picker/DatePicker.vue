<template>
  <VueDatePicker
    :model-value="displayValue"
    :dark="isDark"
    model-type="format"
    :formats="{ input: SERBIAN_FORMAT, preview: SERBIAN_FORMAT }"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :time-picker="false"
    :time-config="{ enableTimePicker: false }"
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
import { format, parse, isValid, parseISO } from 'date-fns';
import { cn } from '~/utils/cn';
import { useTheme } from '~/composables/useTheme';

const SERBIAN_FORMAT = 'dd.MM.yyyy';
const ISO_FORMAT = 'yyyy-MM-dd';

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
  modelValue: '',
  placeholder: 'dd.mm.gggg',
  disabled: false,
  clearable: false,
  required: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const { isDark } = useTheme();

/** Parent uses yyyy-MM-dd; picker shows dd.MM.yyyy. */
const displayValue = computed(() => {
  const trimmedValue = props.modelValue?.trim();
  if (!trimmedValue) return '';
  const parsedDate = parseISO(trimmedValue);
  return isValid(parsedDate) ? format(parsedDate, SERBIAN_FORMAT) : trimmedValue;
});

function onUpdate(value: string | null | undefined): void {
  if (!value || !value.trim()) {
    emit('update:modelValue', '');
    return;
  }
  const trimmedStr = String(value).trim();
  const parsedDate = parse(trimmedStr, SERBIAN_FORMAT, new Date());
  emit('update:modelValue', isValid(parsedDate) ? format(parsedDate, ISO_FORMAT) : '');
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

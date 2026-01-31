<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
  >
    <button
      type="button"
      class="flex items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      aria-label="Akcije"
      @click="toggle"
    >
      <EllipsisVerticalIcon class="h-5 w-5" />
    </button>
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        :class="
          placement === 'top' ? 'bottom-full mb-1 origin-bottom-right' : 'mt-1 origin-top-right'
        "
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline';
import { onClickOutside } from '@vueuse/core';

interface Props {
  placement?: 'top' | 'bottom';
}

withDefaults(defineProps<Props>(), { placement: 'bottom' });

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function toggle(): void {
  isOpen.value = !isOpen.value;
}

function close(): void {
  isOpen.value = false;
}

onClickOutside(dropdownRef, close);

defineExpose({ close });
</script>

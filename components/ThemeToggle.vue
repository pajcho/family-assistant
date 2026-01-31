<template>
  <div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
    <button
      type="button"
      class="rounded-md p-1.5 transition-colors"
      :class="
        mode === 'light'
          ? 'bg-white text-amber-500 shadow-sm dark:bg-gray-700'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      "
      aria-label="Svetla tema"
      @click="setMode('light')"
    >
      <SunIcon class="h-4 w-4" />
    </button>
    <button
      type="button"
      class="rounded-md p-1.5 transition-colors"
      :class="
        mode === 'dark'
          ? 'bg-white text-blue-500 shadow-sm dark:bg-gray-700'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      "
      aria-label="Tamna tema"
      @click="setMode('dark')"
    >
      <MoonIcon class="h-4 w-4" />
    </button>
    <button
      type="button"
      class="rounded-md p-1.5 transition-colors"
      :class="
        mode === 'auto'
          ? 'bg-white text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      "
      aria-label="Automatska tema"
      @click="setMode('auto')"
    >
      <ComputerDesktopIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline';
import { useTheme } from '~/composables/useTheme';

const { mode, setMode } = useTheme();
</script>

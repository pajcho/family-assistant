<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2">
      <TransitionGroup
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
        move-class="transition-transform duration-200"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
          :class="getTypeClasses(toast.type)"
        >
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts } = useToast();

function getTypeClasses(type: 'success' | 'error'): string {
  if (type === 'error') {
    return 'bg-red-600 text-white';
  }
  return 'bg-emerald-600 text-white';
}
</script>

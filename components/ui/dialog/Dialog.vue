<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="fixed inset-0 bg-black/50"
          aria-hidden="true"
          @click="$emit('update:open', false)"
        />
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="translate-y-4 scale-95 opacity-0 sm:translate-y-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0 sm:translate-y-0"
          appear
        >
          <div
            v-if="open"
            class="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:bg-gray-800 sm:max-w-lg sm:rounded-lg"
            @click.stop
          >
            <!-- Mobile drag handle -->
            <div class="flex justify-center py-2 sm:hidden">
              <div class="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  open: boolean;
  titleId?: string;
}

defineProps<Props>();
defineEmits<{ 'update:open': [value: boolean] }>();
</script>

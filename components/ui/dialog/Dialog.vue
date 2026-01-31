<template>
  <Teleport to="body">
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
      <div
        class="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-lg"
        @click.stop
      >
        <!-- Mobile drag handle -->
        <div class="flex justify-center py-2 sm:hidden">
          <div class="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <slot />
      </div>
    </div>
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

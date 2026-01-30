<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
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
        class="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl"
        @click.stop
      >
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

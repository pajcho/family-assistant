<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <div
      v-if="visible"
      class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
      :class="typeClasses"
    >
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

const props = defineProps<Props>();

const typeClasses = computed(() => {
  if (props.type === 'error') {
    return 'bg-red-600 text-white';
  }
  return 'bg-emerald-600 text-white';
});
</script>

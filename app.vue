<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastContainer />
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme';
import { ToastContainer } from '~/components/ui/toast';

// Initialize theme on client side
const { init } = useTheme();

onMounted(() => {
  init();
});
</script>

<template>
  <div class="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900">
    <AppNav v-if="showNav" />
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const showNav = computed(() => route.path !== '/login');
</script>

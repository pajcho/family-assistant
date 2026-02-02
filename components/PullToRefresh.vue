<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import PullToRefresh from 'pulltorefreshjs';

let ptr: { destroy: () => void } | null = null;

onMounted(() => {
  if (typeof window === 'undefined') return;
  if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;

  ptr = PullToRefresh.init({
    mainElement: 'body',
    triggerElement: 'body',
    onRefresh: () => {
      window.location.reload();
    },
    instructionsPullToRefresh: 'Povuci za osvežavanje',
    instructionsReleaseToRefresh: 'Otpusti',
    instructionsRefreshing: 'Osvežavanje…',
  });
});

onUnmounted(() => {
  if (ptr) {
    ptr.destroy();
    ptr = null;
  } else {
    PullToRefresh.destroyAll();
  }
});
</script>

<template>
  <div class="relative">
    <!-- Fixed indicator at top (visible when pulling or refreshing) -->
    <div
      class="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-center bg-gray-50 transition-transform duration-150 ease-out dark:bg-gray-900"
      :style="indicatorStyle"
    >
      <div
        class="flex flex-col items-center gap-1 py-3 text-gray-500 dark:text-gray-400"
        :class="{ 'opacity-0': pullDistance === 0 && !refreshing }"
      >
        <ArrowPathIcon
          class="h-6 w-6"
          :class="{ 'animate-spin': refreshing }"
        />
        <span class="text-xs font-medium">
          {{ refreshing ? 'Osvežavanje…' : pullDistance >= pullThreshold ? 'Otpušti' : 'Povuci' }}
        </span>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

const props = withDefaults(
  defineProps<{
    /** Async function to run on refresh (e.g. load data). Returned promise is awaited. */
    onRefresh: () => Promise<void>;
    /** Pull distance in px to trigger refresh. */
    pullThreshold?: number;
    /** Max pull distance in px for visual feedback. */
    maxPull?: number;
    /** Disable pull-to-refresh (e.g. when not on touch device). */
    disabled?: boolean;
  }>(),
  {
    pullThreshold: 72,
    maxPull: 120,
    disabled: false,
  },
);

const pullDistance = ref(0);
const refreshing = ref(false);
const touchStartY = ref(0);
const scrollStartY = ref(0);

const PULL_THRESHOLD = props.pullThreshold;
const MAX_PULL = props.maxPull;

const indicatorStyle = computed(() => {
  const y = pullDistance.value;
  if (y <= 0 && !refreshing.value) {
    return { transform: 'translateY(-100%)' };
  }
  const translate = refreshing.value ? 0 : Math.min(y, MAX_PULL);
  return { transform: `translateY(${translate}px)` };
});

function handleTouchStart(e: TouchEvent): void {
  if (props.disabled) return;
  touchStartY.value = e.touches[0].clientY;
  scrollStartY.value = typeof window !== 'undefined' ? window.scrollY : 0;
}

function handleTouchMove(e: TouchEvent): void {
  if (props.disabled || refreshing.value) return;
  if (scrollStartY.value > 0) return;

  const currentY = e.touches[0].clientY;
  const diff = currentY - touchStartY.value;

  if (diff > 0) {
    pullDistance.value = Math.min(diff, MAX_PULL);
    if (pullDistance.value > 10) {
      e.preventDefault();
    }
  }
}

function handleTouchEnd(): void {
  if (props.disabled) return;

  if (pullDistance.value >= PULL_THRESHOLD && !refreshing.value) {
    refreshing.value = true;
    pullDistance.value = 0;

    props.onRefresh().finally(() => {
      refreshing.value = false;
    });
  } else {
    pullDistance.value = 0;
  }

  touchStartY.value = 0;
  scrollStartY.value = 0;
}

const isTouchDevice = ref(false);

onMounted(() => {
  isTouchDevice.value =
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (!isTouchDevice.value) return;

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});
</script>

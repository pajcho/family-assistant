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
            ref="sheetRef"
            class="relative z-10 max-h-[90vh] w-full touch-pan-y overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:bg-gray-800 sm:max-w-lg sm:rounded-lg"
            :style="sheetStyle"
            @click.stop
            @touchstart.passive="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <!-- Mobile drag handle (swipe down from here to close) -->
            <div
              ref="handleRef"
              class="flex touch-none justify-center py-2 sm:hidden"
              @touchstart.passive="onTouchStart"
            >
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

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const BODY_LOCK_CLASS = 'dialog-open';
const DRAG_CLOSE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.4; // px/ms – quick flick down closes

const sheetRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const dragY = ref(0);
let touchStartY = 0;
let touchStartTime = 0;
let dragStartedFromHandle = false;

const sheetStyle = computed(() =>
  dragY.value > 0 ? { transform: `translateY(${dragY.value}px)` } : {},
);

function lockBodyScroll() {
  document.documentElement.classList.add(BODY_LOCK_CLASS);
  document.body.classList.add(BODY_LOCK_CLASS);
}

function unlockBodyScroll() {
  document.documentElement.classList.remove(BODY_LOCK_CLASS);
  document.body.classList.remove(BODY_LOCK_CLASS);
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) lockBodyScroll();
    else unlockBodyScroll();
  },
  { immediate: true },
);

onUnmounted(unlockBodyScroll);

function onTouchStart(e: TouchEvent) {
  if (window.matchMedia('(min-width: 640px)').matches) return;
  const handle = handleRef.value;
  dragStartedFromHandle = !!handle?.contains(e.target as Node);
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
  dragY.value = 0;
}

function onTouchMove(e: TouchEvent) {
  if (window.matchMedia('(min-width: 640px)').matches) return;
  if (!dragStartedFromHandle) return;
  if (dragY.value === 0 && e.touches[0].clientY <= touchStartY) return;
  const delta = e.touches[0].clientY - touchStartY;
  dragY.value = Math.max(0, delta);
  if (dragY.value > 0) e.preventDefault();
}

function onTouchEnd() {
  if (window.matchMedia('(min-width: 640px)').matches) return;
  if (!dragStartedFromHandle) return;
  const elapsed = Date.now() - touchStartTime;
  const velocity = elapsed > 0 ? dragY.value / elapsed : 0;
  const shouldClose = dragY.value >= DRAG_CLOSE_THRESHOLD || velocity >= VELOCITY_THRESHOLD;
  if (shouldClose) {
    emit('update:open', false);
  }
  dragY.value = 0;
}
</script>

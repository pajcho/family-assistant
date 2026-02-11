<template>
  <Dialog
    :open="open"
    :title-id="titleId"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        :id="titleId"
        class="text-lg font-semibold"
      >
        {{ title }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <p class="text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
    </DialogContent>
    <DialogFooter>
      <Button
        variant="outline"
        @click="$emit('update:open', false)"
      >
        Otkaži
      </Button>
      <Button
        variant="destructive"
        :disabled="loading"
        @click="$emit('confirm')"
      >
        {{ confirmLabel }}
      </Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  titleId?: string;
}

const props = withDefaults(defineProps<Props>(), { confirmLabel: 'Obriši', loading: false });

defineEmits<{ 'update:open': [value: boolean]; confirm: [] }>();

const titleId = computed(
  () =>
    props.titleId ??
    `confirm-${props.title
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')}`,
);
</script>

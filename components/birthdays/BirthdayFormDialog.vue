<template>
  <Dialog
    :open="open"
    title-id="birthday-dialog-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="birthday-dialog-title"
        class="text-lg font-semibold"
      >
        {{ birthday ? 'Izmeni rođendan' : 'Dodaj rođendan' }}
      </h2>
    </DialogHeader>
    <DialogContent>
      <div
        v-if="error"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        {{ error }}
      </div>
      <BirthdayForm
        :birthday="birthday"
        @submit="$emit('submit', $event)"
        @cancel="$emit('cancel')"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Birthday } from '~/types/database';
import { Dialog, DialogHeader, DialogContent } from '~/components/ui/dialog';
import BirthdayForm from '~/components/birthdays/BirthdayForm.vue';

interface Props {
  open: boolean;
  birthday: Birthday | null;
  error?: string;
}

defineProps<Props>();

defineEmits<{
  'update:open': [value: boolean];
  submit: [
    payload: {
      name: string;
      description: string | null;
      birth_date: string;
    },
  ];
  cancel: [];
}>();
</script>

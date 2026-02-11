<template>
  <Dialog
    :open="open"
    title-id="undo-payment-title"
    @update:open="$emit('update:open', $event)"
  >
    <DialogHeader>
      <h2
        id="undo-payment-title"
        class="text-lg font-semibold"
      >
        Poništi plaćanje
      </h2>
    </DialogHeader>
    <DialogContent>
      <p class="text-gray-600 dark:text-gray-400">
        Da li ste sigurni da želite da poništite poslednje plaćanje za "{{ paymentName }}"?
      </p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Ovo će obrisati zapis iz istorije i vratiti datum dospeća na prethodni mesec.
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
        Poništi
      </Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';

interface Props {
  open: boolean;
  paymentName: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), { loading: false });

defineEmits<{ 'update:open': [value: boolean]; confirm: [] }>();
</script>

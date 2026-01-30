<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div class="space-y-2">
      <Label for="name">Naziv *</Label>
      <Input
        id="name"
        v-model="form.name"
        required
        placeholder="npr. Novi laptop"
      />
    </div>
    <div class="space-y-2">
      <Label for="description">Opis</Label>
      <Input
        id="description"
        v-model="form.description"
        placeholder="detalji, specifikacije"
      />
    </div>
    <div class="space-y-2">
      <Label for="amount">Iznos (RSD) *</Label>
      <Input
        id="amount"
        v-model="form.amount"
        type="number"
        min="0"
        step="1"
        required
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        @click="$emit('cancel')"
      >
        Otkaži
      </Button>
      <Button
        type="submit"
        :disabled="saving"
      >
        {{ isEdit ? 'Sačuvaj izmene' : 'Dodaj' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Expense } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface Props {
  expense?: Expense | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [
    payload: {
      name: string;
      description?: string;
      amount: number;
    },
  ];
  cancel: [];
}>();

const isEdit = computed(() => !!props.expense?.id);

const form = reactive({
  name: props.expense?.name ?? '',
  description: props.expense?.description ?? '',
  amount: props.expense?.amount ?? 0,
});

watch(
  () => props.expense,
  (e) => {
    if (e) {
      form.name = e.name;
      form.description = e.description ?? '';
      form.amount = e.amount;
    }
  },
  { immediate: true },
);

const saving = ref(false);

function onSubmit(): void {
  if (!form.name.trim() || form.amount <= 0) return;
  saving.value = true;
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    amount: Number(form.amount),
  });
  saving.value = false;
}
</script>

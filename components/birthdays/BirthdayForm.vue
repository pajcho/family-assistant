<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div class="space-y-2">
      <Label for="name">Ime *</Label>
      <Input
        id="name"
        v-model="form.name"
        required
        placeholder="npr. Ana Petrović"
      />
    </div>
    <div class="space-y-2">
      <Label for="description">Opis (odnos)</Label>
      <Input
        id="description"
        v-model="form.description"
        placeholder="npr. Kolega sa posla"
      />
    </div>
    <div class="space-y-2">
      <Label for="birth_date">Datum rođenja *</Label>
      <DatePicker
        id="birth_date"
        v-model="form.birth_date"
        placeholder="Datum rođenja"
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
import type { Birthday } from '~/types/database';
import { Button } from '~/components/ui/button';
import { DatePicker } from '~/components/ui/date-picker';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface Props {
  birthday?: Birthday | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [
    payload: {
      name: string;
      description: string | null;
      birth_date: string;
    },
  ];
  cancel: [];
}>();

const isEdit = computed(() => !!props.birthday?.id);

const form = reactive({
  name: props.birthday?.name ?? '',
  description: props.birthday?.description ?? '',
  birth_date: props.birthday?.birth_date ?? '',
});

watch(
  () => props.birthday,
  (b) => {
    if (b) {
      form.name = b.name;
      form.description = b.description ?? '';
      form.birth_date = b.birth_date;
    }
  },
  { immediate: true },
);

const saving = ref(false);

function onSubmit(): void {
  if (!form.name.trim() || !form.birth_date) return;
  saving.value = true;
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || null,
    birth_date: form.birth_date,
  });
  saving.value = false;
}
</script>

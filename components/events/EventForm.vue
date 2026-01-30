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
        placeholder="npr. Marko rođendan"
      />
    </div>
    <div class="space-y-2">
      <Label for="description">Opis</Label>
      <Input
        id="description"
        v-model="form.description"
        placeholder="detalji događaja"
      />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="date">Datum *</Label>
        <Input
          id="date"
          v-model="form.date"
          type="date"
          required
        />
      </div>
      <div class="space-y-2">
        <Label for="start_time">Vreme *</Label>
        <Input
          id="start_time"
          v-model="form.start_time"
          type="time"
          required
        />
      </div>
    </div>
    <div class="space-y-2">
      <Label for="end_time">Završetak *</Label>
      <Input
        id="end_time"
        v-model="form.end_time"
        type="time"
        required
      />
    </div>
    <div class="space-y-2">
      <Label for="notes">Napomene (poklon, itd.)</Label>
      <Input
        id="notes"
        v-model="form.notes"
        placeholder="npr. Kupljena knjiga, ostalo za pakovanje"
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
import type { Event } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface Props {
  event?: Event | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [payload: Omit<Event, 'id' | 'family_id' | 'created_at' | 'updated_at'>];
  cancel: [];
}>();

const isEdit = computed(() => !!props.event?.id);

const form = reactive({
  name: props.event?.name ?? '',
  description: props.event?.description ?? '',
  date: props.event?.date ?? '',
  start_time: props.event?.start_time ?? '18:00',
  end_time: props.event?.end_time ?? '20:00',
  notes: props.event?.notes ?? '',
});

watch(
  () => props.event,
  (e) => {
    if (e) {
      form.name = e.name;
      form.description = e.description ?? '';
      form.date = e.date;
      form.start_time = e.start_time;
      form.end_time = e.end_time;
      form.notes = e.notes ?? '';
    }
  },
  { immediate: true },
);

const saving = ref(false);

function onSubmit(): void {
  if (!form.name.trim() || !form.date || !form.start_time || !form.end_time) return;
  saving.value = true;
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    date: form.date,
    start_time: form.start_time,
    end_time: form.end_time,
    notes: form.notes.trim() || undefined,
  });
  saving.value = false;
}
</script>

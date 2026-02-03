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
    <div class="space-y-2">
      <Label for="date">Datum *</Label>
      <Input
        id="date"
        v-model="form.date"
        type="date"
        required
      />
    </div>
    <div class="flex items-center gap-2">
      <input
        id="all_day"
        v-model="form.allDay"
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-500"
      />
      <Label
        for="all_day"
        class="cursor-pointer font-normal"
      >
        Ceo dan
      </Label>
    </div>
    <div
      v-if="!form.allDay"
      class="grid grid-cols-2 gap-4"
    >
      <div class="space-y-2">
        <Label for="start_time">Početak (opciono)</Label>
        <Input
          id="start_time"
          v-model="form.start_time"
          type="time"
        />
      </div>
      <div class="space-y-2">
        <Label for="end_time">Završetak (opciono)</Label>
        <Input
          id="end_time"
          v-model="form.end_time"
          type="time"
        />
      </div>
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
  allDay: !props.event ? false : props.event.start_time == null && props.event.end_time == null,
  start_time: props.event?.start_time ?? '',
  end_time: props.event?.end_time ?? '',
  notes: props.event?.notes ?? '',
});

watch(
  () => props.event,
  (e) => {
    if (e) {
      form.name = e.name;
      form.description = e.description ?? '';
      form.date = e.date;
      form.allDay = e.start_time == null && e.end_time == null;
      form.start_time = e.start_time ?? '';
      form.end_time = e.end_time ?? '';
      form.notes = e.notes ?? '';
    }
  },
  { immediate: true },
);

const saving = ref(false);

function onSubmit(): void {
  if (!form.name.trim() || !form.date) return;
  saving.value = true;
  const startTime = form.start_time.trim();
  const endTime = form.end_time.trim();
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    date: form.date,
    start_time: form.allDay ? null : startTime || null,
    end_time: form.allDay ? null : endTime || null,
    notes: form.notes.trim() || undefined,
  });
  saving.value = false;
}
</script>

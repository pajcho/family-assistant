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
        placeholder="npr. Internet račun"
      />
    </div>
    <div class="space-y-2">
      <Label for="description">Opis</Label>
      <Input
        id="description"
        v-model="form.description"
        placeholder="detalji plaćanja"
      />
    </div>
    <div class="grid grid-cols-2 gap-4">
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
      <div class="space-y-2">
        <Label for="due_date">Datum dospeća *</Label>
        <Input
          id="due_date"
          v-model="form.due_date"
          type="date"
          required
        />
      </div>
    </div>
    <div class="space-y-2">
      <Label>Tip</Label>
      <div class="flex flex-wrap gap-4">
        <label class="flex items-center gap-2">
          <input
            v-model="form.recurrence_period"
            type="radio"
            value="one-time"
            :disabled="hasHistory"
          />
          <span :class="{ 'text-gray-400': hasHistory }">Jednokratno</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            v-model="form.recurrence_period"
            type="radio"
            value="monthly"
            :disabled="hasHistory"
          />
          <span :class="{ 'text-gray-400': hasHistory }">Mesečno</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            v-model="form.recurrence_period"
            type="radio"
            value="limited"
            :disabled="hasHistory"
          />
          <span :class="{ 'text-gray-400': hasHistory }">Ograničeno</span>
        </label>
      </div>
      <p
        v-if="hasHistory"
        class="text-xs text-amber-600"
      >
        Tip plaćanja se ne može menjati jer postoji istorija plaćanja.
      </p>
    </div>
    <div
      v-if="form.recurrence_period === 'limited'"
      class="space-y-2"
    >
      <Label for="remaining">Preostalo uplata</Label>
      <Input
        id="remaining"
        v-model.number="form.remaining_occurrences"
        type="number"
        min="1"
        placeholder="npr. 4"
      />
    </div>
    <div
      v-if="isEdit && form.recurrence_period !== 'one-time'"
      class="space-y-2"
    >
      <label class="flex items-center gap-2">
        <input
          v-model="form.is_paused"
          type="checkbox"
          class="rounded border-gray-300"
        />
        <span class="text-sm text-gray-700">Pauziraj plaćanje</span>
      </label>
      <p
        v-if="form.is_paused"
        class="text-xs text-gray-500"
      >
        Dok je pauzirano, plaćanje se neće prikazivati kao dospelo.
      </p>
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
import type { Payment, RecurrencePeriod } from '~/types/database';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface Props {
  payment?: Payment | null;
  hasHistory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasHistory: false,
});

const emit = defineEmits<{
  submit: [
    payload: {
      name: string;
      description: string | null;
      amount: number;
      due_date: string;
      is_recurring: boolean;
      recurrence_period: RecurrencePeriod | null;
      remaining_occurrences?: number | null;
      is_paused?: boolean;
    },
  ];
  cancel: [];
}>();

const isEdit = computed(() => !!props.payment?.id);

const form = reactive({
  name: props.payment?.name ?? '',
  description: props.payment?.description ?? '',
  amount: props.payment?.amount ?? '',
  due_date: props.payment?.due_date ?? '',
  recurrence_period: (props.payment?.recurrence_period ?? 'one-time') as
    | RecurrencePeriod
    | 'one-time'
    | 'monthly'
    | 'limited',
  remaining_occurrences: props.payment?.remaining_occurrences ?? 4,
  is_paused: props.payment?.is_paused ?? false,
});

watch(
  () => props.payment,
  (p) => {
    if (p) {
      form.name = p.name;
      form.description = p.description ?? '';
      form.amount = p.amount;
      form.due_date = p.due_date;
      form.recurrence_period = (p.recurrence_period ?? 'one-time') as RecurrencePeriod;
      form.remaining_occurrences = p.remaining_occurrences ?? 4;
      form.is_paused = p.is_paused ?? false;
    }
  },
  { immediate: true },
);

const saving = ref(false);

function onSubmit(): void {
  const amountNum = Number(form.amount);
  if (!form.name.trim() || !form.due_date || !(amountNum > 0)) return;
  const isRecurring = form.recurrence_period !== 'one-time';
  saving.value = true;
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || null,
    amount: amountNum,
    due_date: form.due_date,
    is_recurring: isRecurring,
    recurrence_period: form.recurrence_period === 'one-time' ? 'one-time' : form.recurrence_period,
    remaining_occurrences:
      form.recurrence_period === 'limited' ? (form.remaining_occurrences ?? null) : null,
    is_paused: isRecurring ? form.is_paused : false,
  });
  saving.value = false;
}
</script>

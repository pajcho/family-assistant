<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Prijava</CardTitle>
        <CardDescription>Unesite email i lozinku za pristup.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-4"
          @submit.prevent="onSubmit"
        >
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="email@ primer.rs"
              required
              autocomplete="email"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Lozinka</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>
          <p
            v-if="errorMessage"
            class="text-sm text-red-600"
          >
            {{ errorMessage }}
          </p>
          <Button
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            Prijavi se
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

const { login } = useAuth();

async function onSubmit(): Promise<void> {
  errorMessage.value = '';
  loading.value = true;
  const { error } = await login(email.value, password.value);
  loading.value = false;
  if (error) {
    errorMessage.value = error.message ?? 'Greška pri prijavi.';
  }
}
</script>

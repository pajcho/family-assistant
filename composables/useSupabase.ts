import type { SupabaseClient } from '@supabase/supabase-js';

export function useSupabase(): SupabaseClient {
  const nuxtApp = useNuxtApp();
  const client = nuxtApp.$supabase as SupabaseClient | undefined;

  if (!client) {
    throw new Error(
      'Supabase client not initialized. Check that NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY are set in .env',
    );
  }

  return client;
}

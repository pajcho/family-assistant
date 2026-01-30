import type { SupabaseClient } from '@supabase/supabase-js';

export function useSupabase(): SupabaseClient {
  const config = useRuntimeConfig().public;
  const url = config.supabaseUrl as string;
  const key = config.supabaseAnonKey as string;

  if (!url || !key) {
    throw new Error('Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return useNuxtApp().$supabase as SupabaseClient;
}

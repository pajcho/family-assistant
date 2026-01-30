import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const url = config.supabaseUrl as string;
  const key = config.supabaseAnonKey as string;

  if (url && key) {
    const supabase = createClient(url, key);
    nuxtApp.provide('supabase', supabase);
  }
});

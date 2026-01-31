import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const url = config.supabaseUrl as string;
  const key = config.supabaseAnonKey as string;

  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.error(
      '[Supabase] Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env file.',
    );
    return;
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  nuxtApp.provide('supabase', supabase);
});

# Plugins

Nuxt plugins: run once at app init. Use for initializing clients or app-wide setup.

**Files**

- **`supabase.client.ts`** — creates and provides the Supabase client (env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`). Injected so composables can use `useSupabase()`.

**Conventions**

- Plugins run in order (Nuxt controls order). Use for SDKs, analytics, or global state that must exist before any page/composable.
- Prefer composables for reactive logic; use plugins for one-time setup and injection.

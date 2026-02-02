# Composables

Nuxt 3 composables: shared state and logic. Auto-imported (no explicit import in `.vue` or other composables).

**Conventions**

- Name: `useXxx.ts` (e.g. `useBirthdays`, `useAuth`, `useSupabase`).
- Export a single function that returns an object (methods, refs, computed).
- Use `useSupabase()` for DB; use `useProfile()` for `familyId` when data is family-scoped.
- Types: import from `~/types/database` (e.g. `Birthday`, `Event`, `Expense`).
- Return shape: prefer `{ data, error }` for async ops; keep errors as `Error | null`.

**Core composables**

- `useSupabase` — Supabase client.
- `useAuth` — auth state, sign in/out.
- `useProfile` — current user profile, `familyId`.
- `useTheme`, `useToast` — UI/UX helpers.

Domain composables: `useBirthdays`, `useEvents`, `useExpenses`, `usePayments` (CRUD + fetch for each domain).

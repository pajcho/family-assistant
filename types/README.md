# Types

Shared TypeScript types. Import explicitly, e.g. `import type { Birthday } from '~/types/database'`.

**Files**

- **`database.ts`** — domain types aligned with Supabase tables (e.g. `Birthday`, `Event`, `Expense`, `Payment`, `Family`, `Profile`). Use in composables, components, and utils when touching DB data.
- **`supabase.d.ts`** — Supabase-generated or hand-maintained types for the DB schema (tables, responses). Used by the Supabase client and composables.

**Conventions**

- Prefer `database.ts` for app code; use `supabase.d.ts` when you need raw schema types or generated types.
- Keep types in sync with `supabase/migrations/` when changing the schema.

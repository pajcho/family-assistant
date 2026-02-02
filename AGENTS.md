# Family Assistant — Agent instructions

**Project:** Web app for family life: events, payments, birthdays, expenses; Nuxt 3 + Supabase.

- **Package manager:** `pnpm`
- **Format/lint:** `pnpm fmt`, `pnpm lint`, `pnpm check` (oxfmt + oxlint; not ESLint/Prettier)

When making plans, follow [Plan mode](docs/agents/plan-mode.md).

**Project structure** — folder-level conventions and where to put things:

| Folder                                | Purpose                         | Conventions                     |
| ------------------------------------- | ------------------------------- | ------------------------------- |
| [composables/](composables/README.md) | Shared state & logic (useXxx)   | [README](composables/README.md) |
| [components/](components/README.md)   | Vue SFCs; feature folders + ui/ | [README](components/README.md)  |
| [pages/](pages/README.md)             | File-based routes               | [README](pages/README.md)       |
| [utils/](utils/README.md)             | Pure helpers (format, date, cn) | [README](utils/README.md)       |
| [layouts/](layouts/README.md)         | App shell (default)             | [README](layouts/README.md)     |
| [middleware/](middleware/README.md)   | Route guards (auth.global)      | [README](middleware/README.md)  |
| [plugins/](plugins/README.md)         | Init (Supabase client)          | [README](plugins/README.md)     |
| [types/](types/README.md)             | DB & Supabase types             | [README](types/README.md)       |
| [assets/](assets/README.md)           | Global CSS, static files        | [README](assets/README.md)      |

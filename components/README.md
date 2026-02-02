# Components

Vue 3 SFCs. Auto-imported in pages and layouts (no import path needed).

**Layout**

- **Feature folders** — one folder per domain: `birthdays/`, `dashboard/`, `events/`, `expenses/`, `payments/`. Put domain-specific components there (e.g. `BirthdayForm.vue`, `DashboardCard.vue`).
- **`ui/`** — shared primitives (shadcn-nuxt). One subfolder per primitive: `button/`, `card/`, `dialog/`, `dropdown/`, `input/`, `label/`, `toast/`. Each has a `*.vue` and usually an `index.ts` re-export.
- **Root-level** — app-wide: `AppNav.vue`, `AppNavLink.vue`, `PullToRefresh.vue`, `ThemeToggle.vue`.

**Conventions**

- Use UI building blocks from `components/ui` (e.g. `Card`, `CardHeader`, `Button`, `Input`).
- Use Heroicons via `@heroicons/vue` (e.g. `PlusIcon`, `CalendarIcon`).
- Prefer props + emits; use composables for data (e.g. `useExpenses()`, `useToast()`).
- Names: PascalCase. Dashboard cards: `DashboardXxxCard`; forms: `XxxForm`.

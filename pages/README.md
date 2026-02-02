# Pages

Nuxt file-based routing. Each `.vue` here becomes a route.

**Layout**

- **`index.vue`** — dashboard (home).
- **`login.vue`** — login (no auth layout).
- **Section folders** — `birthdays/`, `events/`, `expenses/`, `payments/`. Each has `index.vue` for that section’s list/page.

**Conventions**

- Use `layouts/default.vue` by default (nav + main content). Login is the main exception.
- Use composables for data and actions (e.g. `useExpenses()`, `useToast()`); use `formatAmount`, `formatDate` from `~/utils` where needed.
- Page-level components live in `components/<section>/` (e.g. forms, cards). Dialogs/popups often live next to the page or in the same section folder.

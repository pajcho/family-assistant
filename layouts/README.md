# Layouts

Nuxt layouts: wrapper around page content. Use via `definePageMeta({ layout: 'default' })` or rely on default.

**Files**

- **`default.vue`** — main app shell: nav (`AppNav`), theme toggle, main content area. Used by dashboard and section pages; login typically uses no layout or a minimal one.

**Conventions**

- One layout file = one layout name (filename without `.vue`). Add new layouts here when you need a distinct shell (e.g. `minimal.vue` for login/onboarding).

# Middleware

Nuxt route middleware. Runs before navigation.

**Files**

- **`auth.global.ts`** — global middleware (runs on every route). Handles auth: redirect to login when unauthenticated, or to home when already logged in on `/login`.

**Conventions**

- `.global.ts` = runs on every route. Non-global middleware runs only when declared in `definePageMeta` on a page.
- Use for auth checks, redirects, and route guards. Keep logic minimal; delegate to composables (e.g. `useAuth`) if needed.

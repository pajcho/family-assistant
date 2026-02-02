# Assets

Static assets and global styles. Referenced by path (e.g. in `app.vue` or Nuxt config) or imported where needed.

**Layout**

- **`css/main.css`** — global CSS (Tailwind directives, custom base styles). Typically imported once in `app.vue` or via Nuxt/Tailwind config.

**Conventions**

- Use for images, fonts, and global CSS. Component-scoped styles stay in `.vue` files. Prefer Tailwind in components; use `main.css` for base/reset and app-wide overrides.

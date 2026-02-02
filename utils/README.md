# Utils

Pure helpers: formatting, dates, classnames. Import explicitly where needed, e.g. `import { formatAmount } from '~/utils/format'`.

**Files**

- **`format.ts`** — `formatAmount(amount)` (RSD, `sr-Latn-RS` locale).
- **`date.ts`** — date helpers for display/parsing.
- **`cn.ts`** — classname merge (e.g. for Tailwind / component props).
- **`birthday.ts`**, **`event.ts`** — domain-specific helpers (e.g. next occurrence, sorting).

**Conventions**

- Keep functions pure and side-effect free.
- Prefer narrow, typed params and return values. Use `~/types/database` when types touch DB shapes.

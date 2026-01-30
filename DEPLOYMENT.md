# Family Assistant – Deployment

## GitHub Pages (static)

Aplikacija je konfigurisana za client-side rendering (CSR) i statički export za GitHub Pages.

### 1. Environment

Kreiraj `.env` u korenu projekta:

```env
NUXT_PUBLIC_SUPABASE_URL=https://tiokicffpbzqgrsqrkgt.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=<tvoj_anon_key>
NUXT_APP_BASE_URL=/family-assistant/
```

Za lokalni razvoj možeš koristiti `NUXT_APP_BASE_URL=/` (bez subpath-a).

### 2. Baza (Supabase)

1. U Supabase Dashboard → SQL Editor pokreni migraciju iz `supabase/migrations/20260130000000_initial_schema.sql`.
2. Uključi Realtime na tabelama: Events → Database → Replication → uključi `events`, `payments`, `birthdays`, `expenses`.
3. Kreiraj porodicu i korisnike skriptom (koristi **service role** key samo lokalno, nikad u frontendu):

```bash
export SUPABASE_URL=https://tiokicffpbzqgrsqrkgt.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
pnpm run setup-family
```

Skripta traži: naziv porodice, email i lozinku za dva korisnika. Nakon toga korisnici se prijavljuju na aplikaciju sa tim kredencijalima.

### 3. Build

```bash
pnpm install
pnpm run generate
```

Izlaz je u `.output/public/`.

### 4. GitHub Pages

1. Repozitorijum: `github.com/pajcho/family-assistant` (ili tvoj fork).
2. U Settings → Pages:
   - Source: **GitHub Actions** (preporučeno) ili **Deploy from a branch**.
   - Ako koristiš branch: izaberi branch (npr. `main`) i folder `/ (root)` ili `docs/`; ako koristiš `docs/`, u `nuxt.config.ts` postavi `app.baseURL` na base path repozitorijuma (npr. `/family-assistant/`).

3. Ako koristiš branch deploy: nakon build-a kopiraj sadržaj `.output/public` u root ili u `docs/` i push (npr. u `gh-pages` branch ili u `docs/` na main).

4. Ako koristiš GitHub Actions, kreiraj workflow koji radi `pnpm install`, `pnpm run generate`, pa uploaduje `.output/public` na GitHub Pages (npr. `actions/upload-pages-artifact` i `actions/deploy-pages`).

### 5. Base URL

Za GitHub Pages pod putanjom npr. `https://pajcho.github.io/family-assistant/` u `.env` i u build-u mora biti:

```env
NUXT_APP_BASE_URL=/family-assistant/
```

Da bi rute i resursi radili ispravno, `nuxt.config.ts` već koristi `process.env.NUXT_APP_BASE_URL ?? '/family-assistant/'`.

### 6. Provera

Lokalno nakon build-a:

```bash
pnpm run preview
```

Otvori navedeni URL (obično sa base path-om) i proveri prijavu i module.

# Family Assistant

A simple web app for managing family life: upcoming events, recurring payments, birthdays, and shared expenses. One dashboard shows what’s due soon; you can add, edit, and track everything from the same place.

**Features:** Dashboard with events (14-day view), payments (with history and pause), birthdays, and expenses. Mark payments as paid, undo last payment, filter by month. Dark mode, mobile-friendly layout, and optional family setup via a script.

**Tech:** [Nuxt 3](https://nuxt.com/) (Vue 3), [Supabase](https://supabase.com/) (auth + Postgres), Tailwind CSS, TypeScript.

**Run locally:** Copy `.env.example` to `.env`, set your Supabase URL and anon key, run migrations in the Supabase project, then `pnpm install` and `pnpm dev`. Use the `setup-family` script if you need to create a family and link your user.

**Deploy:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment notes.

Private project — use and adapt as you like.

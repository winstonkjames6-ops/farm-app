# FARM

FARM is a marketplace connecting parents/athletes with independent youth sports trainers. This repo is the full Next.js application — marketing site, auth, onboarding, dashboards, and admin tooling — backed by Supabase.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment

Create `.env.local` with your Supabase project credentials:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

### 3. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Payment processing (Stripe) is not yet live — see the "Not yet implemented" section below.

## What's here

- **Marketing site** — the public landing page (`app/page.tsx`, `components/landing/*`), plus static `/terms`, `/privacy`, and `/how-it-works` pages.
- **Auth** — email/password signup and login (`app/auth`, `app/login`, `app/signup`), password reset flow, and email verification.
- **Role-based onboarding** — separate guided flows for parents, trainers, and athletes (`app/onboarding/parent`, `app/onboarding/trainer`, `app/onboarding/athlete`, `app/onboarding/setup`). Parents can create child/athlete accounts via invite code (`app/child`) without the athlete needing their own login up front.
- **Trainer discovery** — a filterable trainer directory (`components/search/TrainerDirectory.tsx`) with sport, specialty, and rate filters, and individual trainer profile pages (`app/trainer/[slug]`).
- **Booking & scheduling** — session booking (`app/booking`), trainer availability presets, and a shared slot-generation module (`lib/scheduling.ts`) used by both the public booking page and the trainer's own schedule dashboard.
- **Dashboards** — role-specific dashboards under `app/dashboard`:
  - `dashboard/trainer` — schedule, earnings, profile, messages
  - `dashboard/athlete` — sessions, profile, messages
  - `dashboard/admin` — admin tooling and reports (gated by an `admin_roles` table check)
- **Discover feed** — a social feed of trainer/session posts (`components/DiscoverFeed.tsx`), with post upload, drafts, and saved posts.
- **Messaging & notifications** — in-app messaging (`app/messages`) and a notifications dropdown/page.
- **Reviews** — post-session rating and review flow (`app/review`).

## Backend

Supabase (Postgres + Auth) is the backend. Schema and RLS policy changes live as SQL migrations in `supabase/migrations/`. Key tables include `profiles`, `athletes`, `trainers`, `bookings`, `reviews`, `trainer_tags`, `posts`, and `admin_roles`.

Run migrations against your Supabase project with the Supabase CLI, or apply them via the Supabase dashboard/MCP tooling. There is no local Supabase stack checked into this repo — schema changes should be written as new timestamped migration files, not applied ad hoc.

## Not yet implemented

- **Payments** — Stripe is not integrated. No dependency exists in `package.json` and no payment code runs today; booking/payout copy throughout the app is written in future tense until this ships.
- Trainer payout scheduling and revenue split terms will be finalized alongside the Stripe integration.

## Tech stack

- Next.js 14 (App Router), React 18, TypeScript (strict mode)
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Tailwind CSS + inline styles (mixed, depending on the component's age)
- Framer Motion / GSAP for animation
- lucide-react for icons

## QA scripts

Ad hoc QA/screenshot scripts used during manual testing live in `/qa`, out of the way of the app source.

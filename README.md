# BM Winners

Personal tool for analysing Winner 16 forms: a realistic map and a spiritual map per team, the round board,
16 recommendations in form order, and a side table (20 columns for 2 forms, 4–5 bankers, 50 alternatives).
The work plan the system follows lives in `content/` (spec + status) and in the database (`decisions`, `rule_sets`, `params`).

## Stack
Next.js 16 (App Router, Cache Components, `src/proxy.ts`) · React 19 · Tailwind CSS 4 · Supabase (Postgres + RLS + email OTP) · Vercel.

## Modes
- **Demo** – no Supabase env vars: no login, demo predictions, a permanent banner. Fixtures/results are official.
- **Live** – env vars present: login required (one allow-listed email), all data from Supabase, RLS owner-only.

## First-time setup (owner)
1. Supabase → SQL: run `supabase/migrations/20261120000000_init.sql`, then `supabase/seed.sql`
   (or `npx supabase link --project-ref ukmdfudkubdedhntnhdz && npx supabase db push`).
2. Supabase → Auth → Users → *Add user* with your email; then Auth → Sign In / Providers → **disable "Allow new users to sign up"**.
3. Supabase → Auth → Email templates → Magic Link: include `{{ .Token }}` (6-digit code). Configure custom SMTP (built-in mail = 2/hour).
4. Supabase → Auth → URL configuration: Site URL `https://bmwinners.com`, redirect `https://bmwinners.com/**`.
5. Vercel: import `atiyaben-maker/bmwinners`, add the Supabase integration (syncs the keys), set `ALLOWED_EMAIL` and `NEXT_PUBLIC_SITE_URL`.
6. Vercel → Domains: add `bmwinners.com` + `www`; in Cloudflare create the A/CNAME records Vercel shows, **DNS only (grey cloud)**.
7. Sign in at `/login` — the first sign-in claims ownership (`claim_ownership()`), after which nobody else can.

## Quality gates
```
npm run typecheck   # TypeScript
npm test            # Vitest: engine (top-K exactness vs brute force, 20-column fill, bankers, RPS), gematria
npm run build
npm run test:e2e    # Playwright: 360/768/1280/1920 × every page — RTL, no overflow, axe WCAG 2.2 AA, keyboard tabs, headers
```
Set `CHROME_PATH` to reuse an installed Chrome if Playwright browsers can't be downloaded.

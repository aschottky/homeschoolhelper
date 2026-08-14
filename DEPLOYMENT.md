# Deployment — Vercel + Neon Postgres + Better Auth

The app is a Vite + React SPA with Vercel serverless functions under `/api`.
Everything runs on Vercel: hosting, API, auth (Better Auth), database (Neon
Postgres via the Vercel Marketplace), Stripe checkout + webhook, and password
reset emails (Resend).

## One-time setup

### 1. Vercel project
- Import the GitHub repo at https://vercel.com/new
- Framework preset: **Vite** (build `vite build`, output `dist`) — auto-detected
- `vercel.json` already contains the SPA rewrite so react-router deep links work

### 2. Neon Postgres
- Vercel → Storage (or Marketplace) → **Neon** → create database, connect to the project
- This injects `DATABASE_URL` into all environments
- Run the schema (order matters):
  ```bash
  psql "$DATABASE_URL" -f db/auth-schema.sql
  psql "$DATABASE_URL" -f db/schema.sql
  psql "$DATABASE_URL" -f db/seed-books.sql
  ```
  (or paste the files into the Neon SQL editor)

### 3. Better Auth
- Generate a secret: `openssl rand -base64 32`
- Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (e.g. `https://homeschoolhelper.app`)

### 4. Google OAuth (optional but wired up)
- Google Cloud Console → APIs & Services → Credentials → OAuth client (Web)
- Authorized redirect URIs:
  - `https://<your-domain>/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google` (for `vercel dev`)
- Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 5. Resend (password reset emails)
- https://resend.com → verify your sending domain → create API key
- Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `HomeschoolHelper <no-reply@homeschoolhelper.app>`)
- Without these, password reset silently no-ops (the reset URL is logged server-side)

### 6. Stripe
- Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` (monthly), `STRIPE_ANNUAL_PRICE_ID`, `SITE_URL`
- Dashboard → Developers → Webhooks → Add endpoint:
  `https://<your-domain>/api/stripe-webhook`
  with events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Set `STRIPE_WEBHOOK_SECRET` from the new endpoint

### 7. Make yourself admin (once, after your first signup)
```sql
update profiles set is_admin = true where email = 'you@example.com';
```

## Environment variables

| Variable | Scope | Notes |
|---|---|---|
| `DATABASE_URL` | server | set automatically by the Neon integration |
| `BETTER_AUTH_SECRET` | server | 32+ random bytes |
| `BETTER_AUTH_URL` | server | canonical origin, e.g. `https://homeschoolhelper.app` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | server | Google OAuth |
| `RESEND_API_KEY` / `EMAIL_FROM` | server | password reset emails |
| `STRIPE_SECRET_KEY` | server | |
| `STRIPE_PRICE_ID` / `STRIPE_ANNUAL_PRICE_ID` | server | subscription prices |
| `STRIPE_WEBHOOK_SECRET` | server | from the webhook endpoint |
| `SITE_URL` | server | used for Stripe success/cancel URLs |
| `VITE_STRIPE_PUBLISHABLE_KEY` | build | |
| `VITE_SITE_URL` | build | used for referral share links |
| `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_*` | build | AdSense (optional) |
| `VITE_AMAZON_TAG` | build | Amazon Associates tag (optional) |
| `VITE_DEMO_MODE` | build | `true` forces localStorage-only demo mode |

Also update `public/ads.txt` with your AdSense publisher ID.

## Local development

```bash
vercel link          # once
vercel env pull .env.local
vercel dev           # SPA + /api on http://localhost:3000
```

`npm run dev` (plain Vite) still works for UI-only work; set `VITE_DEMO_MODE=true`
in `.env` to use localStorage demo mode without a backend.

Stripe webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Architecture notes

- `/api/_lib/` holds shared server code (not deployed as functions):
  `db.js` (pg pool), `auth.js` (Better Auth config + profile-creation hook),
  `session.js` (requireUser/requireAdmin), `stripe.js`, `json.js`
- 8 serverless functions: `auth/[...all]`, `data/[resource]`, `public`,
  `admin`, `checkout`, `stripe-webhook`, `referrals`, `subscribe`
- Access control lives in the API layer (no RLS) — every data query is scoped
  to the session user; admin actions check `profiles.is_admin`
- The frontend keeps a localStorage "demo mode" when signed out or when
  `VITE_DEMO_MODE=true`

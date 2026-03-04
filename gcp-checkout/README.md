# Stripe Checkout – Google Cloud Function (2nd gen)

This function creates a Stripe Checkout session for premium upgrades. It runs on **Google Cloud Functions (2nd gen)**, which scale to **zero** when idle, so you only pay when the endpoint is called.

Auth is handled by verifying the **Supabase JWT** using Supabase’s **JWKS** (public keys). No call is made to Supabase’s Auth API, which avoids the session/401 issues seen with the Supabase Edge Function.

## Prerequisites

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`) installed and logged in
- A Google Cloud project with **billing** enabled
- Stripe and Supabase keys (same as before)

## Environment variables (secrets)

Set these when deploying. The function needs:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_… or sk_test_…) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the premium plan (price_…) |
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (from Project → Settings → API) |
| `SITE_URL` | App origin for redirects (e.g. `https://homeschoolhelper.app` or `http://localhost:5173`) |

## Deploy (2nd gen, scale-to-zero)

From the **project root** (parent of `gcp-checkout`):

```bash
# 1. Enable required APIs (one-time per project)
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# 2. Deploy the function (replace PROJECT_ID and REGION)
gcloud functions deploy createCheckoutSession \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=./gcp-checkout \
  --entry-point=createCheckoutSession \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars "SITE_URL=https://homeschoolhelper.app" \
  --set-secrets "STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_PRICE_ID=stripe-price-id:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest"
```

If you prefer **env vars** instead of Secret Manager for non-sensitive values:

```bash
gcloud functions deploy createCheckoutSession \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=./gcp-checkout \
  --entry-point=createCheckoutSession \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars "SITE_URL=https://homeschoolhelper.app,SUPABASE_URL=https://YOUR_REF.supabase.co,STRIPE_PRICE_ID=price_xxx,STRIPE_SECRET_KEY=sk_test_xxx,SUPABASE_SERVICE_ROLE_KEY=eyJ..."
```

After deploy, note the **trigger URL** (e.g. `https://us-central1-PROJECT_ID.cloudfunctions.net/createCheckoutSession`).

## Frontend configuration

In your app’s `.env` (or build env), set the checkout API URL to the Cloud Function URL:

```env
VITE_CHECKOUT_API_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/createCheckoutSession
```

If `VITE_CHECKOUT_API_URL` is set, the app uses this URL for “Upgrade to Premium” instead of the Supabase Edge Function.

## Local run (optional)

```bash
cd gcp-checkout
npm install
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_PRICE_ID=price_...
export SUPABASE_URL=https://YOUR_REF.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
export SITE_URL=http://localhost:5173
npx @google-cloud/functions-framework --target=createCheckoutSession --signature-type=http
```

Then set `VITE_CHECKOUT_API_URL=http://localhost:8080` in the frontend `.env` and test upgrade from the app.

## Cost

- **Cloud Functions (2nd gen)** scale to zero; you’re charged only for invocations and compute time.
- Free tier: 2M invocations/month; beyond that, pricing is per request and CPU/memory time.
- For low traffic (e.g. a few hundred upgrades per month), cost is typically negligible.

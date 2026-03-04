# Step-by-step: Test Upgrade to Premium locally

Follow these steps in order to test the Stripe upgrade flow on your machine.

---

## 1. Prerequisites

- Node.js and npm installed
- A **Supabase project** (same one you use in production or staging)
- A **Stripe account** in **test mode**
- **Supabase CLI** installed (for deploying the Edge Function):  
  https://supabase.com/docs/guides/cli

---

## 2. Create a Stripe product and price (if needed)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) and turn on **Test mode** (top right).
2. **Products** → **Add product**.
3. Name: e.g. "Homeschool Helper Premium". Add a **recurring** price (e.g. $9.99/month).
4. Copy the **Price ID** (starts with `price_...`). You’ll use it in Step 4.

---

## 3. Set up your local `.env`

In the **project root** (same folder as `package.json`), create or edit `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

- **VITE_SUPABASE_URL**: Supabase project URL (Dashboard → Settings → API).
- **VITE_SUPABASE_ANON_KEY**: Supabase anon/public key (Settings → API).
- **VITE_STRIPE_PUBLISHABLE_KEY**: Stripe **test** publishable key (Developers → API keys).

Save the file. Do **not** commit it (it should be in `.gitignore`).

---

## 4. Deploy the Edge Function and set secrets

The app calls the **deployed** Edge Function on Supabase. Deploy it and give it the keys it needs.

1. **Log in and link the project** (if not already):

   ```bash
   supabase login
   cd /path/to/homeschoolhelper
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   (`YOUR_PROJECT_REF` is the ID in your Supabase URL, e.g. `grxiobgsdxktupgptazu`.)

2. **Set secrets** for the function (Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; you add Stripe and redirect URL):

   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
   supabase secrets set STRIPE_PRICE_ID=price_xxxxxxxxxxxx
   supabase secrets set SITE_URL=http://localhost:5173
   ```

   - **STRIPE_SECRET_KEY**: Stripe **test** secret key (Developers → API keys).
   - **STRIPE_PRICE_ID**: The Price ID from Step 2.
   - **SITE_URL**: So Stripe redirects back to your local app after checkout.

3. **Deploy the checkout function**:

   ```bash
   supabase functions deploy create-checkout-session
   ```

   (Deploy `stripe-webhook` too when you want to test subscription updates:  
   `supabase functions deploy stripe-webhook` and set `STRIPE_WEBHOOK_SECRET`.)

---

## 5. Run the app locally

1. Install dependencies (if you haven’t):

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the URL shown (e.g. **http://localhost:5173**) in your browser.

---

## 6. Test the upgrade flow

1. **Sign in** with a user from the **same** Supabase project (the one you linked in Step 4).  
   If you don’t have one, create an account in the app (Sign In → Sign up).

2. Go to **Hours Tracker** (green “Dashboard” or “Sign In” button in the nav).

3. In the tracker sidebar, open **Upgrade** (or go to **Settings** and use the upgrade link if you prefer).

4. Click **“Upgrade to Premium”**.  
   - You should be sent to **Stripe Checkout** (Stripe’s hosted page).  
   - If you see a session/error message instead, check the browser console and the “Application” tab (e.g. clear site data and sign in again).

5. On the Stripe page, use a **test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date (e.g. 12/34)
   - CVC: any 3 digits
   - ZIP: any 5 digits

6. Complete payment. You should be redirected back to **http://localhost:5173/tracker/upgrade** with a success message and your account showing as Premium.

---

## 7. If something goes wrong

- **“Session expired or invalid” / “No authorization header”**  
  Sign out, sign in again, and try Upgrade once more. If it still fails, in DevTools → Application → Storage → “Clear site data”, then sign in again and retry.

- **“Missing Stripe configuration” / “Server configuration error”**  
  Redeploy the function and confirm secrets:  
  `supabase secrets list`  
  Then set any missing ones with `supabase secrets set ...` and redeploy:  
  `supabase functions deploy create-checkout-session`.

- **Redirect goes to the wrong URL**  
  Confirm `SITE_URL` is set to `http://localhost:5173` (Step 4) and that you restarted or redeployed after changing it.

- **Stripe webhook (subscription status)**  
  For local testing, use Stripe CLI to forward webhooks to your **deployed** webhook URL, or ignore webhook for a quick test; the checkout and redirect will still work.

---

## Quick checklist

- [ ] `.env` has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Supabase project has schema and `profiles` (and triggers) from your SQL
- [ ] `supabase secrets set` run for `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `SITE_URL`
- [ ] `supabase functions deploy create-checkout-session` run
- [ ] `npm run dev` and open http://localhost:5173
- [ ] Signed in with a user from that Supabase project
- [ ] Click Upgrade to Premium and use card `4242 4242 4242 4242`

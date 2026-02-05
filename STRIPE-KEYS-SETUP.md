# Stripe Keys Setup

## ✅ Added to `.env` file (Local Development)

The following has been added to your `.env` file:
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_oDtb7jXnu6WuNPagzCLYr0WBPWjgJ`

## ⚠️ IMPORTANT: Add to Supabase Edge Function Secrets

The **secret key** and **price ID** must be added to Supabase Edge Function secrets (NOT in .env):

1. Go to **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:

```
STRIPE_SECRET_KEY=sk_test_ATFWWFWjwyLckHZaWXtilg4WNYOgorOU
STRIPE_PRICE_ID=price_0Ssapo66Z8LcUYv7YLh1zrxc
```

## 🔒 Security Notes

- ✅ **Publishable Key** (`pk_...`) - Safe to expose in frontend code (already in `.env`)
- ❌ **Secret Key** (`sk_...`) - MUST stay server-side only (Supabase secrets)
- ✅ **Price ID** - Can be in Supabase secrets (used by Edge Functions)

## 📝 Cloudflare Pages Environment Variables

For production deployment, also add to Cloudflare Pages:

1. Go to **Cloudflare Dashboard** → **Pages** → Your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_oDtb7jXnu6WuNPagzCLYr0WBPWjgJ`

**Note**: The secret key should NEVER be added to Cloudflare - it only goes in Supabase secrets.

## ✅ Next Steps

1. Add the secrets to Supabase (see above)
2. Deploy Edge Functions: `supabase functions deploy create-checkout-session` and `supabase functions deploy stripe-webhook`
3. Test the payment flow!

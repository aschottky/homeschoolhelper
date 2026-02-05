# Stripe Payment Implementation - Step by Step

This document provides a complete walkthrough for implementing Stripe payments in your Homeschool Helper app.

## ✅ What's Already Done

1. ✅ Stripe.js package installed
2. ✅ Database schema updated (see `supabase-schema-stripe.sql`)
3. ✅ Edge Functions created (see `supabase/functions/`)
4. ✅ Frontend code updated (SubscriptionContext, Upgrade component, Stripe utility)
5. ✅ Setup guide created (see `STRIPE-SETUP.md`)

## 📋 Step-by-Step Implementation

### Step 1: Create Stripe Account & Get Keys

1. Go to https://stripe.com and create an account
2. Complete business verification
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_...`)
5. Copy your **Secret key** (starts with `sk_test_...`)

### Step 2: Create Product in Stripe

1. In Stripe Dashboard → **Products** → **Add product**
2. Name: "Homeschool Helper Premium"
3. Description: "Premium subscription with ad-free experience, free consultation, and priority support"
4. Pricing:
   - Type: **Recurring**
   - Price: **$9.99**
   - Billing period: **Monthly**
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`)

### Step 3: Update Database Schema

Run the SQL in `supabase-schema-stripe.sql` in your Supabase Dashboard:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `supabase-schema-stripe.sql`
3. Click **Run**

This adds:
- `stripe_subscription_id` column
- `subscription_status` column
- `subscription_end_date` column
- Indexes for performance

### Step 4: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 5: Login and Link Supabase Project

```bash
# Login to Supabase
supabase login

# Link your project (get project ref from Supabase Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 6: Add Stripe Secrets to Supabase

1. Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:
   - `STRIPE_SECRET_KEY` = `sk_test_...` (your Stripe secret key)
   - `STRIPE_PRICE_ID` = `price_...` (your Price ID from Step 2)
   - `STRIPE_WEBHOOK_SECRET` = we'll get this in Step 8

### Step 7: Deploy Edge Functions

```bash
# Deploy checkout function
supabase functions deploy create-checkout-session

# Deploy webhook function
supabase functions deploy stripe-webhook
```

### Step 8: Set Up Stripe Webhook

#### For Local Testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local function:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Add it to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

#### For Production:

1. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing secret** and add to Supabase secrets

### Step 9: Add Environment Variables

#### Local Development (.env file):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Cloudflare Pages:

1. Go to Cloudflare Dashboard → **Pages** → Your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (your publishable key)

### Step 10: Test the Integration

1. Start your dev server: `npm run dev`
2. Sign in to your app
3. Go to **Upgrade** page
4. Click **Upgrade to Premium**
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - ZIP: any 5 digits
6. Complete checkout
7. Verify subscription status updates in Supabase

## 🔍 Testing Checklist

- [ ] Can create checkout session
- [ ] Redirects to Stripe Checkout
- [ ] Can complete payment with test card
- [ ] Returns to app after payment
- [ ] Subscription status updates in database
- [ ] User sees Premium features after payment
- [ ] Webhook receives events
- [ ] Subscription cancellation works

## 🚨 Troubleshooting

### "Stripe not initialized"
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env` and Cloudflare

### "Failed to create checkout session"
- Verify Edge Function is deployed
- Check Supabase secrets are set correctly
- Check browser console for detailed error

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check webhook secret matches in Supabase
- Use Stripe Dashboard → Webhooks → Test webhook

### "Subscription not updating"
- Check webhook is receiving events
- Verify Edge Function logs in Supabase Dashboard
- Check database RLS policies allow updates

## 📝 Next Steps After Testing

1. **Switch to Live Mode**:
   - Get live API keys from Stripe
   - Update Supabase secrets with live keys
   - Update Cloudflare environment variable
   - Update webhook endpoint to production URL

2. **Add Customer Portal**:
   - Allow users to manage subscriptions
   - Add cancel subscription option
   - Add update payment method option

3. **Email Notifications**:
   - Configure Stripe email templates
   - Send welcome email on subscription
   - Send cancellation confirmation

4. **Analytics**:
   - Track conversion rates
   - Monitor subscription metrics
   - Set up revenue reporting

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

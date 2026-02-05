# Stripe Payment Integration Guide

This guide walks you through setting up Stripe payments for the Homeschool Helper app.

## Overview

We'll use:
- **Stripe Checkout** (hosted payment page) - easiest to implement and PCI compliant
- **Supabase Edge Functions** - serverless backend for secure API key handling
- **Stripe Webhooks** - to update subscription status automatically

## Step 1: Create Stripe Account

1. Go to https://stripe.com and sign up for an account
2. Complete the account setup (business details, bank account, etc.)
3. Once activated, you'll have access to your dashboard

## Step 2: Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)
3. Copy both keys - you'll need them later

**Important**: 
- Use **test mode** keys during development
- Switch to **live mode** keys when ready for production
- Never commit secret keys to git!

## Step 3: Create a Product and Price in Stripe

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Fill in:
   - **Name**: "Homeschool Helper Premium"
   - **Description**: "Premium subscription with ad-free experience, free consultation, and priority support"
3. Under **Pricing**, select:
   - **Recurring**: Yes
   - **Price**: $9.99
   - **Billing period**: Monthly
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_...`) - you'll need this

## Step 4: Update Database Schema

We need to add a `stripe_subscription_id` field to track active subscriptions:

```sql
-- Add stripe_subscription_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add subscription status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing'));

-- Add subscription end date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;
```

## Step 5: Set Up Supabase Edge Functions

We'll create two Edge Functions:
1. `create-checkout-session` - Creates a Stripe Checkout session
2. `stripe-webhook` - Handles Stripe webhook events

### Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

(Find your project ref in Supabase Dashboard → Settings → General → Reference ID)

### Initialize Edge Functions

```bash
supabase functions new create-checkout-session
supabase functions new stripe-webhook
```

## Step 6: Add Stripe Keys to Supabase Secrets

In Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:
   - `STRIPE_SECRET_KEY` = your Stripe secret key (sk_test_...)
   - `STRIPE_PRICE_ID` = your Price ID (price_...)
   - `STRIPE_WEBHOOK_SECRET` = we'll get this after setting up webhooks

## Step 7: Set Up Stripe Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```
   This will give you a webhook signing secret (starts with `whsec_...`)
4. For production, set the endpoint URL to:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Signing secret** and add it to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

## Step 8: Environment Variables

Add to your `.env` file (for local development):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Add to Cloudflare Pages environment variables:
- `VITE_STRIPE_PUBLISHABLE_KEY` = your Stripe publishable key

## Step 9: Install Stripe.js

```bash
npm install @stripe/stripe-js
```

## Next Steps

After completing these steps, we'll:
1. Create the Edge Functions code
2. Update the frontend to use Stripe Checkout
3. Update SubscriptionContext to check real subscription status
4. Test the payment flow

## Testing

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date, any CVC, any ZIP

## Production Checklist

Before going live:
- [ ] Switch Stripe to live mode
- [ ] Update API keys in Supabase secrets
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card (your own)
- [ ] Set up email notifications in Stripe
- [ ] Configure tax collection (if needed)
- [ ] Set up billing portal for customers

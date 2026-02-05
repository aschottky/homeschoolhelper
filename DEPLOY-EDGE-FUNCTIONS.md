# Deploy Edge Functions - Step by Step

## Step 1: Install Supabase CLI

On macOS, install via Homebrew:

```bash
brew install supabase/tap/supabase
```

If you don't have Homebrew, install it first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Alternative**: Download from https://github.com/supabase/cli/releases

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

## Step 3: Link Your Project

1. Go to **Supabase Dashboard** → **Settings** → **General**
2. Find your **Reference ID** (looks like `abcdefghijklmnop`)
3. Run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual reference ID.

## Step 4: Add Stripe Secrets to Supabase

**IMPORTANT**: Do this BEFORE deploying the functions!

1. Go to **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Click **Add new secret** for each:

   - **Name**: `STRIPE_SECRET_KEY`
     **Value**: `sk_test_ATFWWFWjwyLckHZaWXtilg4WNYOgorOU`

   - **Name**: `STRIPE_PRICE_ID`
     **Value**: `price_0Ssapo66Z8LcUYv7YLh1zrxc`

   - **Name**: `STRIPE_WEBHOOK_SECRET`
     **Value**: (We'll add this after setting up the webhook - leave empty for now or use a placeholder)

3. Click **Save** for each secret

## Step 5: Deploy Edge Functions

From your project directory, run:

```bash
# Deploy the checkout session function
supabase functions deploy create-checkout-session

# Deploy the webhook handler function
supabase functions deploy stripe-webhook
```

You should see success messages for each deployment.

## Step 6: Set Up Stripe Webhook (Production)

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**

2. **Endpoint URL**: 
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
   (Replace `YOUR_PROJECT_REF` with your Supabase project reference ID)

3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Click **Add endpoint**

5. Copy the **Signing secret** (starts with `whsec_...`)

6. Go back to **Supabase Dashboard** → **Edge Functions** → **Secrets**
7. Update `STRIPE_WEBHOOK_SECRET` with the signing secret you just copied

## Step 7: Verify Deployment

Check that your functions are deployed:

1. Go to **Supabase Dashboard** → **Edge Functions**
2. You should see:
   - `create-checkout-session`
   - `stripe-webhook`

## Step 8: Test the Integration

1. Start your dev server: `npm run dev`
2. Sign in to your app
3. Go to the **Upgrade** page
4. Click **Upgrade to Premium**
5. Use test card: `4242 4242 4242 4242`

## Troubleshooting

### "Command not found: supabase"
- Make sure Homebrew installation completed successfully
- Try: `brew install supabase/tap/supabase` again
- Or restart your terminal

### "Project not found" when linking
- Double-check your project reference ID
- Make sure you're logged in: `supabase login`

### "Function deployment failed"
- Check that secrets are added in Supabase Dashboard
- Verify the function files exist in `supabase/functions/`
- Check Supabase Dashboard → Edge Functions → Logs for errors

### "Webhook not receiving events"
- Verify webhook URL is correct (check your project ref)
- Make sure webhook secret matches in Supabase secrets
- Test webhook in Stripe Dashboard → Webhooks → Test webhook

## Next Steps

After successful deployment:
1. Test the payment flow with a test card
2. Verify subscription updates in Supabase database
3. Check webhook events in Stripe Dashboard
4. Add `VITE_STRIPE_PUBLISHABLE_KEY` to Cloudflare Pages environment variables

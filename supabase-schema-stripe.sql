-- Additional schema updates for Stripe integration
-- Run this SQL in your Supabase Dashboard: SQL Editor

-- Add stripe_subscription_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add subscription status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired'));

-- Add subscription end date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);

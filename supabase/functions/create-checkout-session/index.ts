// Supabase Edge Function: Create Stripe Checkout Session
// Uses Stripe REST API (fetch) to avoid Deno/Node compatibility issues with the Stripe SDK.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_API = 'https://api.stripe.com/v1'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function stripeFetch(secretKey: string, path: string, body: Record<string, string>) {
  const params = new URLSearchParams(body)
  return fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID')

    if (!stripeSecretKey || !stripePriceId) {
      throw new Error('Missing Stripe configuration')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Validate JWT and get user by calling Auth API directly (avoids Supabase client getUser() quirks in Deno)
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey,
      },
    })
    if (!userRes.ok) {
      const errBody = await userRes.json().catch(() => ({}))
      const msg = (errBody as { msg?: string }).msg ?? (userRes.status === 401 ? 'Invalid JWT' : 'Unauthorized')
      throw new Error(msg)
    }
    const authUser = (await userRes.json()) as { id: string; email?: string }
    const user = { id: authUser.id, email: authUser.email ?? '' }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    let { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw new Error('Failed to fetch profile')

    if (!profile) {
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert({ id: user.id, email: user.email ?? '' })
      if (insertError) throw new Error('Profile not found. Please sign out and sign in again.')
      const { data: newProfile, error: fetchAgain } = await supabaseClient
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .single()
      if (fetchAgain || !newProfile) throw new Error('Failed to create profile')
      profile = newProfile
    }

    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const custRes = await stripeFetch(stripeSecretKey, '/customers', {
        email: profile.email || user.email || '',
        'metadata[supabase_user_id]': user.id,
      })
      if (!custRes.ok) {
        const err = await custRes.json().catch(() => ({}))
        throw new Error((err as { error?: { message?: string } }).error?.message || 'Stripe customer creation failed')
      }
      const customer = await custRes.json() as { id: string }
      customerId = customer.id

      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://homeschoolhelper.app'
    const sessionRes = await stripeFetch(stripeSecretKey, '/checkout/sessions', {
      customer: customerId,
      mode: 'subscription',
      'line_items[0][price]': stripePriceId,
      'line_items[0][quantity]': '1',
      'payment_method_types[0]': 'card',
      success_url: `${siteUrl}/tracker?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tracker/upgrade?canceled=true`,
      'metadata[supabase_user_id]': user.id,
    })

    if (!sessionRes.ok) {
      const err = await sessionRes.json().catch(() => ({}))
      throw new Error((err as { error?: { message?: string } }).error?.message || 'Stripe checkout session failed')
    }

    const session = await sessionRes.json() as { id: string; url: string }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonError(message, 400)
  }
})

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

    let authHeader = req.headers.get('Authorization')
    let body: { access_token?: string } = {}
    try {
      body = (await req.json()) as { access_token?: string }
    } catch {
      /* body may be empty */
    }
    const tokenFromBody = body?.access_token?.trim()
    if (tokenFromBody) {
      authHeader = `Bearer ${tokenFromBody}`
    }
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('No authorization. Please sign out and sign in again, then try upgrading.', 401)
    }

    const supabaseUrl = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Server configuration error: missing Supabase URL or anon key')
    }
    if (!supabaseServiceKey) {
      throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set for Edge Function')
    }

    // Validate JWT using Supabase client getClaims (works with current JWT signing keys)
    const rawToken = authHeader.replace(/^Bearer\s+/i, '').trim()
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(rawToken)
    const claims = claimsData?.claims as { sub?: string; email?: string } | undefined
    if (claimsError || !claims?.sub) {
      throw new Error('Session expired or invalid. Please sign out and sign in again, then try upgrading.')
    }
    const user = { id: claims.sub, email: (claims.email as string) ?? '' }

    // Use service role for profile access so RLS and missing profile rows don't block checkout
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw new Error('Failed to load profile. Please try again or sign out and sign in.')

    if (!profile) {
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ id: user.id, email: user.email ?? '' })
      if (insertError) {
        throw new Error('Could not create profile. Please sign out and sign in again, then try upgrading.')
      }
      const { data: newProfile, error: fetchAgain } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .single()
      if (fetchAgain || !newProfile) throw new Error('Profile setup failed. Please sign out and sign in again.')
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

      await supabaseAdmin
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
      success_url: `${siteUrl}/tracker/upgrade?session_id={CHECKOUT_SESSION_ID}`,
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
    const isAuthError = /session expired|invalid|sign out and sign in/i.test(message)
    return jsonError(message, isAuthError ? 401 : 400)
  }
})

/**
 * Google Cloud Function (2nd gen): Create Stripe Checkout Session
 * Verifies Supabase JWT via JWKS (no Auth API call). Scale-to-zero when idle.
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function getEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function setCors(res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.set(k, v))
}

export async function createCheckoutSession(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sendError = (message, status = 400) => {
    setCors(res)
    res.status(status).json({ error: message })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      body = {}
    }
  }
  body = body || {}

  // ── Verify completed checkout session and activate subscription ──────────
  if (body.action === 'verify') {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      sendError('Server configuration error', 500)
      return
    }

    const sessionId = body.session_id
    if (!sessionId) {
      sendError('Missing session_id', 400)
      return
    }

    try {
      const stripe = new Stripe(stripeSecretKey)
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        sendError('Payment not completed', 402)
        return
      }

      const userId = session.metadata?.supabase_user_id
      if (!userId) {
        sendError('Session missing user metadata', 400)
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Get subscription end date from Stripe subscription if available
      let subscriptionEndDate = null
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString()
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          subscription_status: 'active',
          stripe_subscription_id: session.subscription || null,
          subscription_end_date: subscriptionEndDate,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Profile update error:', updateError)
        sendError('Failed to activate subscription. Contact support.', 500)
        return
      }

      setCors(res)
      res.status(200).json({ success: true, tier: 'premium' })
      return
    } catch (err) {
      console.error('Verify error:', err)
      sendError(err?.message || 'Verification failed', 500)
      return
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const stripeSecretKey = getEnv('STRIPE_SECRET_KEY')
    const stripePriceId = getEnv('STRIPE_PRICE_ID')
    const supabaseUrl = getEnv('SUPABASE_URL').replace(/\/$/, '')
    const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
    const siteUrl = process.env.SITE_URL || 'https://homeschoolhelper.app'

    let token = null
    const authHeader = req.headers?.authorization || req.headers?.Authorization
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
    if (!token && body.access_token) {
      token = String(body.access_token).trim()
    }
    if (!token) {
      sendError('No authorization. Please sign out and sign in again, then try upgrading.', 401)
      return
    }

    // Verify Supabase JWT using JWKS (no call to Supabase Auth API)
    const issuer = `${supabaseUrl}/auth/v1`
    const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`
    const JWKS = createRemoteJWKSet(new URL(jwksUrl))
    let payload
    try {
      const { payload: p } = await jwtVerify(token, JWKS, {
        issuer,
        audience: 'authenticated',
      })
      payload = p
    } catch (err) {
      console.error('JWT verify failed:', err?.message || err)
      sendError('Session expired or invalid. Please sign out and sign in again, then try upgrading.', 401)
      return
    }

    const userId = payload.sub
    const email = (payload.email || payload.user_metadata?.email || '').toString()
    if (!userId) {
      sendError('Invalid token: missing user id.')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      sendError('Failed to load profile. Please try again or sign out and sign in.')
      return
    }

    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, email: email || '' })
      if (insertError) {
        sendError('Could not create profile. Please sign out and sign in again, then try upgrading.')
        return
      }
      const { data: newProfile, error: fetchAgain } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .single()
      if (fetchAgain || !newProfile) {
        sendError('Profile setup failed. Please sign out and sign in again.')
        return
      }
      profile = newProfile
    }

    const stripe = new Stripe(stripeSecretKey)
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || email || '',
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      payment_method_types: ['card'],
      success_url: `${siteUrl}/tracker/upgrade?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tracker/upgrade?canceled=true`,
      metadata: { supabase_user_id: userId },
    })

    setCors(res)
    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err) {
    const message = err?.message || 'Unknown error'
    const isAuth = /session expired|invalid|sign out and sign in/i.test(message)
    sendError(message, isAuth ? 401 : 400)
  }
}

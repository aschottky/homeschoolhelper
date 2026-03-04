/**
 * Google Cloud Function (2nd gen): Homeschool Helper API
 * - Create Stripe Checkout Session
 * - Verify completed checkout & activate subscription
 * - Admin: list users, get billing history, update subscription
 *
 * Verifies Supabase JWT via JWKS. Scale-to-zero when idle (min-instances=1 keeps warm).
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

// Verify JWT and return { userId, email, payload }
async function verifyJWT(req, body, supabaseUrl) {
  let token = null
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7).trim()
  if (!token && body?.access_token) token = String(body.access_token).trim()
  if (!token) throw Object.assign(new Error('No authorization token provided.'), { status: 401 })

  const JWKS = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
  let payload
  try {
    const { payload: p } = await jwtVerify(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    })
    payload = p
  } catch {
    throw Object.assign(new Error('Session expired or invalid. Please sign out and sign in again.'), { status: 401 })
  }
  if (!payload.sub) throw Object.assign(new Error('Invalid token: missing user id.'), { status: 401 })
  return {
    userId: payload.sub,
    email: String(payload.email || payload.user_metadata?.email || ''),
    payload,
  }
}

// Verify caller is admin
async function requireAdmin(userId, supabase) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()
  if (!profile?.is_admin) {
    throw Object.assign(new Error('Forbidden: admin access required.'), { status: 403 })
  }
}

export async function createCheckoutSession(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const sendError = (message, status = 400) => { setCors(res); res.status(status).json({ error: message }) }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}') } catch { body = {} } }
  body = body || {}

  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    sendError('Server configuration error', 500); return
  }

  // ── Verify completed checkout session ──────────────────────────────────────
  if (body.action === 'verify') {
    if (!stripeSecretKey) { sendError('Server configuration error', 500); return }
    const { session_id } = body
    if (!session_id) { sendError('Missing session_id', 400); return }
    try {
      const stripe = new Stripe(stripeSecretKey)
      const session = await stripe.checkout.sessions.retrieve(session_id)
      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        sendError('Payment not completed', 402); return
      }
      const userId = session.metadata?.supabase_user_id
      if (!userId) { sendError('Session missing user metadata', 400); return }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      let subscriptionEndDate = null
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription)
        subscriptionEndDate = new Date(sub.current_period_end * 1000).toISOString()
      }
      const { error } = await supabase.from('profiles').update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        stripe_subscription_id: session.subscription || null,
        subscription_end_date: subscriptionEndDate,
      }).eq('id', userId)
      if (error) { sendError('Failed to activate subscription. Contact support.', 500); return }
      setCors(res); res.status(200).json({ success: true, tier: 'premium' }); return
    } catch (err) {
      sendError(err?.message || 'Verification failed', err?.status || 500); return
    }
  }

  // ── Admin: list all users ───────────────────────────────────────────────────
  if (body.action === 'admin-list-users') {
    try {
      const { userId } = await verifyJWT(req, body, supabaseUrl)
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await requireAdmin(userId, supabase)

      // Fetch all profiles
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, email, parent_name, is_admin, subscription_tier, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id, created_at, updated_at')
        .order('created_at', { ascending: false })
      if (profilesErr) throw new Error(profilesErr.message)

      // Fetch auth users list (email confirmed, created_at, last_sign_in)
      const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      if (authErr) throw new Error(authErr.message)

      const authMap = {}
      authData?.users?.forEach(u => { authMap[u.id] = u })

      const users = (profiles || []).map(p => ({
        ...p,
        auth_email: authMap[p.id]?.email || p.email || '',
        email_confirmed: !!authMap[p.id]?.email_confirmed_at,
        last_sign_in: authMap[p.id]?.last_sign_in_at || null,
        auth_created_at: authMap[p.id]?.created_at || p.created_at,
      }))

      setCors(res); res.status(200).json({ users }); return
    } catch (err) {
      sendError(err?.message || 'Failed to list users', err?.status || 500); return
    }
  }

  // ── Admin: get billing history for a user ──────────────────────────────────
  if (body.action === 'admin-billing-history') {
    try {
      const { userId } = await verifyJWT(req, body, supabaseUrl)
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await requireAdmin(userId, supabase)

      const { target_user_id } = body
      if (!target_user_id) { sendError('Missing target_user_id', 400); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, stripe_subscription_id, subscription_tier, subscription_status, subscription_end_date')
        .eq('id', target_user_id)
        .maybeSingle()

      if (!stripeSecretKey || !profile?.stripe_customer_id) {
        setCors(res); res.status(200).json({ invoices: [], subscription: null, profile }); return
      }

      const stripe = new Stripe(stripeSecretKey)
      const [invoicesRes, subscriptionRes] = await Promise.all([
        stripe.invoices.list({ customer: profile.stripe_customer_id, limit: 24 }),
        profile.stripe_subscription_id
          ? stripe.subscriptions.retrieve(profile.stripe_subscription_id).catch(() => null)
          : Promise.resolve(null),
      ])

      const invoices = invoicesRes.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount_paid: inv.amount_paid,
        amount_due: inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        created: inv.created,
        period_start: inv.period_start,
        period_end: inv.period_end,
        hosted_invoice_url: inv.hosted_invoice_url,
        description: inv.lines?.data?.[0]?.description || null,
      }))

      const subscription = subscriptionRes ? {
        id: subscriptionRes.id,
        status: subscriptionRes.status,
        current_period_start: subscriptionRes.current_period_start,
        current_period_end: subscriptionRes.current_period_end,
        cancel_at_period_end: subscriptionRes.cancel_at_period_end,
        canceled_at: subscriptionRes.canceled_at,
      } : null

      setCors(res); res.status(200).json({ invoices, subscription, profile }); return
    } catch (err) {
      sendError(err?.message || 'Failed to load billing history', err?.status || 500); return
    }
  }

  // ── Admin: update user subscription ───────────────────────────────────────
  if (body.action === 'admin-update-user') {
    try {
      const { userId } = await verifyJWT(req, body, supabaseUrl)
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await requireAdmin(userId, supabase)

      const { target_user_id, updates } = body
      if (!target_user_id || !updates) { sendError('Missing target_user_id or updates', 400); return }

      // Allowed fields admins can update
      const allowed = ['subscription_tier', 'subscription_status', 'subscription_end_date', 'is_admin', 'parent_name']
      const safeUpdates = {}
      allowed.forEach(k => { if (k in updates) safeUpdates[k] = updates[k] })

      if (Object.keys(safeUpdates).length === 0) { sendError('No valid fields to update', 400); return }

      // If upgrading to premium, also cancel any active Stripe subscription if downgrading
      if (safeUpdates.subscription_tier === 'free' && stripeSecretKey) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_subscription_id')
          .eq('id', target_user_id)
          .maybeSingle()
        if (profile?.stripe_subscription_id) {
          const stripe = new Stripe(stripeSecretKey)
          await stripe.subscriptions.cancel(profile.stripe_subscription_id).catch(() => {})
          safeUpdates.stripe_subscription_id = null
        }
      }

      const { error } = await supabase.from('profiles').update(safeUpdates).eq('id', target_user_id)
      if (error) throw new Error(error.message)

      setCors(res); res.status(200).json({ success: true }); return
    } catch (err) {
      sendError(err?.message || 'Failed to update user', err?.status || 500); return
    }
  }

  // ── Create Stripe Checkout Session ─────────────────────────────────────────
  try {
    const stripePriceId = getEnv('STRIPE_PRICE_ID')
    const siteUrl = process.env.SITE_URL || 'https://homeschoolhelper.app'
    if (!stripeSecretKey) throw new Error('Missing Stripe configuration')

    const { userId, email } = await verifyJWT(req, body, supabaseUrl)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      await supabase.from('profiles').insert({ id: userId, email: email || '' })
      const { data: newProfile } = await supabase
        .from('profiles').select('stripe_customer_id, email').eq('id', userId).single()
      profile = newProfile
    }

    const stripe = new Stripe(stripeSecretKey)
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || email || '',
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
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

    setCors(res); res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (err) {
    const message = err?.message || 'Unknown error'
    const status = err?.status || (/session expired|invalid|sign out/i.test(message) ? 401 : 400)
    sendError(message, status)
  }
}

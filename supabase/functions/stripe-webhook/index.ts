// Supabase Edge Function: Stripe Webhook Handler
// Uses raw fetch + manual signature verification to avoid Stripe SDK / Deno Node compatibility issues.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_API = 'https://api.stripe.com/v1'

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<{ valid: boolean; event?: Record<string, unknown> }> {
  const parts = signature.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2)
  const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3)
  if (!timestamp || !v1) return { valid: false }

  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload)
  )
  const expected = bufferToHex(sig)
  if (expected !== v1) return { valid: false }

  try {
    const event = JSON.parse(payload) as Record<string, unknown>
    return { valid: true, event }
  } catch {
    return { valid: false }
  }
}

async function stripeGet(secretKey: string, path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  if (!res.ok) throw new Error(`Stripe API error: ${res.status}`)
  return res.json() as Promise<Record<string, unknown>>
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response('No webhook secret', { status: 500 })
  }

  const { valid, event } = await verifyStripeSignature(body, signature, webhookSecret)
  if (!valid || !event) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

  const eventType = event.type as string
  const dataObj = (event.data as { object?: Record<string, unknown> })?.object

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = dataObj as { metadata?: { supabase_user_id?: string }; subscription?: string }
        const userId = session?.metadata?.supabase_user_id
        if (userId && session?.subscription) {
          const sub = await stripeGet(stripeSecretKey, `/subscriptions/${session.subscription}`)
          const status = sub.status as string
          const currentPeriodEnd = sub.current_period_end as number
          await supabaseClient
            .from('profiles')
            .update({
              subscription_tier: 'premium',
              subscription_status: status,
              stripe_subscription_id: sub.id,
              subscription_end_date: new Date(currentPeriodEnd * 1000).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = dataObj as { customer?: string; status?: string; current_period_end?: number }
        const customerId = subscription?.customer as string
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const isCanceled = eventType === 'customer.subscription.deleted' || subscription?.status === 'canceled'
          const endDate = subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null
          await supabaseClient
            .from('profiles')
            .update({
              subscription_tier: isCanceled ? 'free' : 'premium',
              subscription_status: isCanceled ? 'canceled' : (subscription?.status ?? 'active'),
              stripe_subscription_id: isCanceled ? null : (dataObj?.id ?? undefined),
              subscription_end_date: endDate,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = dataObj as { customer?: string; subscription?: string }
        const customerId = invoice?.customer as string
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile && invoice?.subscription) {
          const sub = await stripeGet(stripeSecretKey, `/subscriptions/${invoice.subscription}`)
          await supabaseClient
            .from('profiles')
            .update({
              subscription_tier: 'premium',
              subscription_status: sub.status as string,
              subscription_end_date: new Date((sub.current_period_end as number) * 1000).toISOString(),
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = dataObj as { customer?: string }
        const customerId = invoice?.customer as string
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabaseClient
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

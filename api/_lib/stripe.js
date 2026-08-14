import Stripe from 'stripe'
import { httpError } from './json.js'

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw httpError(500, 'Stripe is not configured')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Newer Stripe API versions report the billing period on subscription items
// rather than the subscription object itself — check both.
export function subscriptionPeriodEnd(sub) {
  const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

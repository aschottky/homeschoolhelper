import { pool } from './_lib/db.js'
import { json, httpError, handle } from './_lib/json.js'
import { requireUser } from './_lib/session.js'
import { getStripe, subscriptionPeriodEnd } from './_lib/stripe.js'

export async function POST(request) {
  return handle(async () => {
    const body = await request.json().catch(() => ({}))
    const user = await requireUser(request)
    const stripe = getStripe()

    // ── Verify completed checkout session ────────────────────────────────
    if (body.action === 'verify') {
      const { session_id } = body
      if (!session_id) throw httpError(400, 'Missing session_id')

      const session = await stripe.checkout.sessions.retrieve(session_id)
      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        throw httpError(402, 'Payment not completed')
      }
      const targetUserId = session.metadata?.user_id
      if (!targetUserId) throw httpError(400, 'Session missing user metadata')
      if (targetUserId !== user.id) throw httpError(403, 'This checkout session belongs to a different account')

      let subscriptionEndDate = null
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id || null
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        subscriptionEndDate = subscriptionPeriodEnd(sub)
      }
      await pool.query(
        `update profiles set
           subscription_tier = 'premium',
           subscription_status = 'active',
           stripe_subscription_id = $1,
           subscription_end_date = $2,
           updated_at = now()
         where id = $3`,
        [subscriptionId, subscriptionEndDate, targetUserId]
      )
      return json({ success: true, tier: 'premium' })
    }

    // ── Create Stripe Checkout Session ───────────────────────────────────
    const billingPeriod = body.billing_period === 'annual' ? 'annual' : 'monthly'
    let stripePriceId
    if (billingPeriod === 'annual') {
      stripePriceId = process.env.STRIPE_ANNUAL_PRICE_ID
      if (!stripePriceId) throw httpError(500, 'Annual billing is not configured. Set STRIPE_ANNUAL_PRICE_ID.')
    } else {
      stripePriceId = process.env.STRIPE_PRICE_ID
      if (!stripePriceId) throw httpError(500, 'Missing STRIPE_PRICE_ID')
    }
    const siteUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')

    let { rows: [profile] } = await pool.query(
      'select stripe_customer_id, email from profiles where id = $1',
      [user.id]
    )
    if (!profile) {
      const inserted = await pool.query(
        'insert into profiles (id, email) values ($1, $2) on conflict (id) do nothing returning stripe_customer_id, email',
        [user.id, user.email || '']
      )
      profile = inserted.rows[0] || { stripe_customer_id: null, email: user.email || '' }
    }

    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || '',
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await pool.query(
        'update profiles set stripe_customer_id = $1, updated_at = now() where id = $2',
        [customerId, user.id]
      )
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      payment_method_types: ['card'],
      success_url: `${siteUrl}/tracker/upgrade?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tracker/upgrade?canceled=true`,
      metadata: { user_id: user.id },
    })

    return json({ sessionId: session.id, url: session.url })
  })
}

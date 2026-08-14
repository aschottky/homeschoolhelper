import { pool } from './_lib/db.js'
import { getStripe, subscriptionPeriodEnd } from './_lib/stripe.js'

// Stripe webhook handler. Register this URL in the Stripe dashboard:
//   https://<domain>/api/stripe-webhook
// Events: checkout.session.completed, customer.subscription.updated,
//         customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed

async function profileIdByCustomer(customerId) {
  if (!customerId) return null
  const { rows } = await pool.query(
    'select id from profiles where stripe_customer_id = $1',
    [customerId]
  )
  return rows[0]?.id || null
}

export async function POST(request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('No signature', { status: 400 })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return new Response('No webhook secret', { status: 500 })

  const payload = await request.text()
  const stripe = getStripe()

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const dataObj = event.data?.object

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = dataObj?.metadata?.user_id
        const subscriptionId = typeof dataObj?.subscription === 'string'
          ? dataObj.subscription
          : dataObj?.subscription?.id || null
        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await pool.query(
            `update profiles set
               subscription_tier = 'premium',
               subscription_status = $1,
               stripe_subscription_id = $2,
               subscription_end_date = $3,
               updated_at = now()
             where id = $4`,
            [sub.status, sub.id, subscriptionPeriodEnd(sub), userId]
          )
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const profileId = await profileIdByCustomer(dataObj?.customer)
        if (profileId) {
          const isCanceled = event.type === 'customer.subscription.deleted' || dataObj?.status === 'canceled'
          await pool.query(
            `update profiles set
               subscription_tier = $1,
               subscription_status = $2,
               stripe_subscription_id = $3,
               subscription_end_date = $4,
               updated_at = now()
             where id = $5`,
            [
              isCanceled ? 'free' : 'premium',
              isCanceled ? 'canceled' : (dataObj?.status ?? 'active'),
              isCanceled ? null : (dataObj?.id ?? null),
              subscriptionPeriodEnd(dataObj),
              profileId,
            ]
          )
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const profileId = await profileIdByCustomer(dataObj?.customer)
        const subscriptionId = typeof dataObj?.subscription === 'string'
          ? dataObj.subscription
          : dataObj?.subscription?.id
            || dataObj?.parent?.subscription_details?.subscription
            || null
        if (profileId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await pool.query(
            `update profiles set
               subscription_tier = 'premium',
               subscription_status = $1,
               subscription_end_date = $2,
               updated_at = now()
             where id = $3`,
            [sub.status, subscriptionPeriodEnd(sub), profileId]
          )
        }
        break
      }

      case 'invoice.payment_failed': {
        const profileId = await profileIdByCustomer(dataObj?.customer)
        if (profileId) {
          await pool.query(
            `update profiles set subscription_status = 'past_due', updated_at = now() where id = $1`,
            [profileId]
          )
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

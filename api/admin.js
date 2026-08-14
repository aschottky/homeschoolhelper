import { pool } from './_lib/db.js'
import { json, httpError, handle } from './_lib/json.js'
import { requireAdmin } from './_lib/session.js'
import { getStripe, subscriptionPeriodEnd } from './_lib/stripe.js'

// Admin-only, action-dispatched endpoint (Better Auth session cookie + profiles.is_admin).
// Actions: admin-list-users, admin-billing-history, admin-update-user,
//          book-add/update/delete, resource-add/update/delete

const BOOK_FIELDS = ['title', 'author', 'illustrator', 'age_group', 'genre', 'description', 'sort_order']
const RESOURCE_FIELDS = ['category', 'count_label', 'items', 'color', 'link', 'sort_order']
const USER_UPDATE_FIELDS = ['subscription_tier', 'subscription_status', 'subscription_end_date', 'is_admin', 'parent_name']

function pick(source, fields) {
  const out = {}
  for (const f of fields) {
    if (source && f in source) out[f] = source[f]
  }
  return out
}

async function insertRow(table, fields, data) {
  const entries = Object.entries(pick(data, fields))
  if (entries.length === 0) throw httpError(400, 'No valid fields')
  const cols = entries.map(([k]) => k).join(', ')
  const params = entries.map((_, i) => `$${i + 1}`).join(', ')
  const values = entries.map(([k, v]) => (k === 'items' ? JSON.stringify(v) : v))
  const { rows: [row] } = await pool.query(
    `insert into ${table} (${cols}) values (${params}) returning *`,
    values
  )
  return row
}

async function updateRow(table, fields, id, updates) {
  const entries = Object.entries(pick(updates, fields))
  if (entries.length === 0) throw httpError(400, 'No valid fields to update')
  const sets = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ')
  const values = entries.map(([k, v]) => (k === 'items' ? JSON.stringify(v) : v))
  const { rows: [row] } = await pool.query(
    `update ${table} set ${sets}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  )
  if (!row) throw httpError(404, 'Not found')
  return row
}

export async function POST(request) {
  return handle(async () => {
    await requireAdmin(request)
    const body = await request.json()
    const { action } = body

    // ── Users ──────────────────────────────────────────────────────────────
    if (action === 'admin-list-users') {
      const { rows } = await pool.query(`
        select p.id, p.email, p.parent_name, p.is_admin, p.subscription_tier,
               p.subscription_status, p.subscription_end_date, p.stripe_customer_id,
               p.stripe_subscription_id, p.created_at, p.updated_at,
               coalesce(u.email, p.email, '') as auth_email,
               coalesce(u."emailVerified", false) as email_confirmed,
               s.last_sign_in,
               coalesce(u."createdAt", p.created_at) as auth_created_at
          from profiles p
          left join "user" u on u.id = p.id
          left join (
            select "userId", max("createdAt") as last_sign_in
              from "session" group by "userId"
          ) s on s."userId" = p.id
         order by p.created_at desc
      `)
      return json({ users: rows })
    }

    if (action === 'admin-billing-history') {
      const { target_user_id } = body
      if (!target_user_id) throw httpError(400, 'Missing target_user_id')

      const { rows: [profile] } = await pool.query(
        `select stripe_customer_id, stripe_subscription_id, subscription_tier,
                subscription_status, subscription_end_date
           from profiles where id = $1`,
        [target_user_id]
      )

      if (!process.env.STRIPE_SECRET_KEY || !profile?.stripe_customer_id) {
        return json({ invoices: [], subscription: null, profile: profile || null })
      }

      const stripe = getStripe()
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
        current_period_start: subscriptionRes.current_period_start
          ?? subscriptionRes.items?.data?.[0]?.current_period_start ?? null,
        current_period_end: subscriptionRes.current_period_end
          ?? subscriptionRes.items?.data?.[0]?.current_period_end ?? null,
        cancel_at_period_end: subscriptionRes.cancel_at_period_end,
        canceled_at: subscriptionRes.canceled_at,
      } : null

      return json({ invoices, subscription, profile })
    }

    if (action === 'admin-update-user') {
      const { target_user_id, updates } = body
      if (!target_user_id || !updates) throw httpError(400, 'Missing target_user_id or updates')

      const safeUpdates = pick(updates, USER_UPDATE_FIELDS)
      if (Object.keys(safeUpdates).length === 0) throw httpError(400, 'No valid fields to update')

      // On downgrade, cancel any active Stripe subscription
      if (safeUpdates.subscription_tier === 'free' && process.env.STRIPE_SECRET_KEY) {
        const { rows: [profile] } = await pool.query(
          'select stripe_subscription_id from profiles where id = $1',
          [target_user_id]
        )
        if (profile?.stripe_subscription_id) {
          await getStripe().subscriptions.cancel(profile.stripe_subscription_id).catch(() => {})
          safeUpdates.stripe_subscription_id = null
        }
      }

      const keys = Object.keys(safeUpdates)
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
      await pool.query(
        `update profiles set ${sets}, updated_at = now() where id = $1`,
        [target_user_id, ...keys.map(k => safeUpdates[k] === '' ? null : safeUpdates[k])]
      )
      return json({ success: true })
    }

    // ── Suggested books ────────────────────────────────────────────────────
    if (action === 'book-add') return json(await insertRow('suggested_books', BOOK_FIELDS, body.book))
    if (action === 'book-update') {
      if (!body.id) throw httpError(400, 'Missing id')
      return json(await updateRow('suggested_books', BOOK_FIELDS, body.id, body.updates))
    }
    if (action === 'book-delete') {
      if (!body.id) throw httpError(400, 'Missing id')
      await pool.query('delete from suggested_books where id = $1', [body.id])
      return json({ success: true })
    }

    // ── Resources ──────────────────────────────────────────────────────────
    if (action === 'resource-add') return json(await insertRow('resources', RESOURCE_FIELDS, body.resource))
    if (action === 'resource-update') {
      if (!body.id) throw httpError(400, 'Missing id')
      return json(await updateRow('resources', RESOURCE_FIELDS, body.id, body.updates))
    }
    if (action === 'resource-delete') {
      if (!body.id) throw httpError(400, 'Missing id')
      await pool.query('delete from resources where id = $1', [body.id])
      return json({ success: true })
    }

    throw httpError(400, 'Unknown action')
  })
}

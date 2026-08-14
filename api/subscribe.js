import { pool } from './_lib/db.js'
import { json, httpError, handle } from './_lib/json.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST { email, source? } -> add a landing-page newsletter subscriber
export async function POST(request) {
  return handle(async () => {
    const { email, source } = await request.json()
    const normalized = String(email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(normalized)) throw httpError(400, 'Please enter a valid email address.')

    const { rowCount } = await pool.query(
      `insert into email_subscribers (email, source)
       values ($1, $2) on conflict (email) do nothing`,
      [normalized, source || 'landing_page']
    )
    return json({ ok: true, duplicate: rowCount === 0 })
  })
}

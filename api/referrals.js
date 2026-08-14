import { pool } from './_lib/db.js'
import { json, httpError, handle } from './_lib/json.js'
import { requireUser } from './_lib/session.js'

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateReferralCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  }
  return s
}

// GET -> list the signed-in user's referral rewards
export async function GET(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { rows } = await pool.query(
      `select id, referred_id, reward_type, status, created_at
         from referral_rewards where referrer_id = $1
        order by created_at desc`,
      [user.id]
    )
    return json({ rewards: rows })
  })
}

// POST { action: 'ensure-code' } -> make sure the user has a referral code
// POST { action: 'apply', code } -> apply a referral code to the signed-in user
export async function POST(request) {
  return handle(async () => {
    const user = await requireUser(request)
    const { action, code } = await request.json()

    if (action === 'ensure-code') {
      const { rows } = await pool.query('select referral_code from profiles where id = $1', [user.id])
      if (rows[0]?.referral_code) return json({ referral_code: rows[0].referral_code })

      for (let attempt = 0; attempt < 12; attempt++) {
        const candidate = generateReferralCode()
        try {
          const { rows: updated } = await pool.query(
            `update profiles set referral_code = $1, updated_at = now()
              where id = $2 and referral_code is null returning referral_code`,
            [candidate, user.id]
          )
          if (updated[0]?.referral_code) return json({ referral_code: updated[0].referral_code })
          // referral_code was no longer null — another request set it; read it back
          const { rows: again } = await pool.query('select referral_code from profiles where id = $1', [user.id])
          if (again[0]?.referral_code) return json({ referral_code: again[0].referral_code })
        } catch (err) {
          if (err.code === '23505') continue // code collision, try another
          throw err
        }
      }
      throw httpError(500, 'Could not generate a referral code')
    }

    if (action === 'apply') {
      const normalized = String(code || '').trim().toUpperCase()
      if (normalized.length !== 6) return json({ applied: false })

      const { rows: [self] } = await pool.query('select referred_by from profiles where id = $1', [user.id])
      if (self?.referred_by) return json({ applied: false, reason: 'already_referred' })

      const { rows: [referrer] } = await pool.query(
        `select id from profiles
          where referral_code is not null
            and upper(trim(referral_code)) = $1 limit 1`,
        [normalized]
      )
      if (!referrer || referrer.id === user.id) return json({ applied: false, reason: 'invalid_code' })

      const { rowCount } = await pool.query(
        'update profiles set referred_by = $1, updated_at = now() where id = $2 and referred_by is null',
        [referrer.id, user.id]
      )
      if (!rowCount) return json({ applied: false, reason: 'already_referred' })

      try {
        await pool.query(
          `insert into referral_rewards (referrer_id, referred_id, reward_type, status)
           values ($1, $2, 'free_month', 'pending')`,
          [referrer.id, user.id]
        )
      } catch (err) {
        if (err.code !== '23505') throw err
      }
      return json({ applied: true })
    }

    throw httpError(400, 'Unknown action')
  })
}

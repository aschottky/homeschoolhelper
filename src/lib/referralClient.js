import { api } from './api'

export const PENDING_REFERRAL_KEY = 'pending_referral_code'

/** Normalize and persist ?ref= from any route (call from ReferralCapture). */
export function storeReferralCodeFromQuery(refParam) {
  if (refParam == null || refParam === '') return
  const code = String(refParam).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code.length !== 6) return
  sessionStorage.setItem(PENDING_REFERRAL_KEY, code)
}

/**
 * After login, attach referred_by and create the referral_rewards row if ?ref= was stored.
 * Code resolution, self-referral rejection, and reward insertion all happen server-side
 * in /api/referrals.
 *
 * TODO: Fulfill rewards (extend Stripe subscription, mark referral_rewards.status) server-side;
 *       the API only records pending rows for now.
 */
export async function applyPendingReferral(userId, refreshProfile) {
  const pending = sessionStorage.getItem(PENDING_REFERRAL_KEY)
  if (!pending) return

  try {
    const result = await api('/api/referrals', {
      method: 'POST',
      body: { action: 'apply', code: pending },
    })
    sessionStorage.removeItem(PENDING_REFERRAL_KEY)
    if (result?.applied) {
      await refreshProfile?.()
    }
  } catch (error) {
    console.error('referral apply failed', error)
  }
}

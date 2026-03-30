import { supabase } from './supabase'

export const PENDING_REFERRAL_KEY = 'pending_referral_code'

/** Normalize and persist ?ref= from any route (call from ReferralCapture). */
export function storeReferralCodeFromQuery(refParam) {
  if (refParam == null || refParam === '') return
  const code = String(refParam).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code.length !== 6) return
  sessionStorage.setItem(PENDING_REFERRAL_KEY, code)
}

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateReferralCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  }
  return s
}

/**
 * After login, attach referred_by and create referral_rewards row if ?ref= was stored.
 * Uses RPC to resolve code (RLS does not allow reading other users' profiles).
 *
 * TODO: Fulfill rewards (extend Stripe subscription, mark referral_rewards.status) server-side;
 *       client only records pending rows for now.
 */
export async function applyPendingReferral(userId, refreshProfile) {
  const pending = sessionStorage.getItem(PENDING_REFERRAL_KEY)
  if (!pending) return

  const { data: self, error: selfErr } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .maybeSingle()

  if (selfErr) {
    console.error('referral self profile failed', selfErr)
    return
  }

  if (self?.referred_by) {
    sessionStorage.removeItem(PENDING_REFERRAL_KEY)
    return
  }

  const code = pending.trim().toUpperCase()
  const { data: referrerId, error: rpcErr } = await supabase.rpc('get_profile_id_by_referral_code', {
    p_code: code,
  })

  if (rpcErr) {
    console.error('referral lookup failed', rpcErr)
    return
  }

  if (!referrerId || referrerId === userId) {
    sessionStorage.removeItem(PENDING_REFERRAL_KEY)
    return
  }

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ referred_by: referrerId })
    .eq('id', userId)
    .is('referred_by', null)

  if (upErr) {
    console.error('referred_by update failed', upErr)
    return
  }

  const { error: insErr } = await supabase.from('referral_rewards').insert({
    referrer_id: referrerId,
    referred_id: userId,
    reward_type: 'free_month',
    status: 'pending',
  })

  if (insErr && insErr.code !== '23505') {
    console.error('referral_rewards insert failed', insErr)
  }

  sessionStorage.removeItem(PENDING_REFERRAL_KEY)
  await refreshProfile?.()
}

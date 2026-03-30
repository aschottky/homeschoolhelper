/*
  Database (run in Supabase SQL editor):

  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
    ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

  CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id uuid REFERENCES public.profiles(id),
    referred_id uuid REFERENCES public.profiles(id),
    reward_type text DEFAULT 'free_month',
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS referral_rewards_referred_id_unique
    ON public.referral_rewards (referred_id);

  See supabase-schema.sql for RLS, indexes, and get_profile_id_by_referral_code().
*/

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { generateReferralCode } from '../../lib/referralClient'
import { Gift, Copy, Check, Mail, Facebook } from 'lucide-react'
import './Referrals.css'

const SITE_ORIGIN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://homeschoolhelper.app')

export default function Referrals() {
  const { user, profile, isConfigured, fetchProfile } = useAuth()
  const [referralCode, setReferralCode] = useState(profile?.referral_code || '')
  const [generating, setGenerating] = useState(false)
  const [copyOk, setCopyOk] = useState(false)
  const [rewards, setRewards] = useState([])
  const [loadRewardsError, setLoadRewardsError] = useState(null)

  const shareUrl =
    referralCode && SITE_ORIGIN
      ? `${String(SITE_ORIGIN).replace(/\/$/, '')}/?ref=${encodeURIComponent(referralCode)}`
      : ''

  const loadRewards = useCallback(async () => {
    if (!isConfigured || !user?.id) return
    setLoadRewardsError(null)
    const { data, error } = await supabase
      .from('referral_rewards')
      .select('id, referred_id, reward_type, status, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setLoadRewardsError(error.message)
      setRewards([])
      return
    }
    setRewards(data || [])
  }, [isConfigured, user?.id])

  useEffect(() => {
    setReferralCode(profile?.referral_code || '')
  }, [profile?.referral_code])

  useEffect(() => {
    loadRewards()
  }, [loadRewards])

  useEffect(() => {
    if (!isConfigured || !user?.id || profile?.referral_code) return

    let cancelled = false
    setGenerating(true)

    const ensureCode = async () => {
      try {
        for (let attempt = 0; attempt < 12; attempt++) {
          if (cancelled) return
          const code = generateReferralCode()
          const { data: updated, error } = await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', user.id)
            .is('referral_code', null)
            .select('referral_code')
            .maybeSingle()

          if (cancelled) return
          if (error?.code === '23505') continue
          if (error) {
            console.error('referral_code save failed', error)
            break
          }
          if (updated?.referral_code) {
            setReferralCode(updated.referral_code)
            await fetchProfile?.()
            return
          }
          const { data: row } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .maybeSingle()
          if (row?.referral_code) {
            setReferralCode(row.referral_code)
            return
          }
        }
      } finally {
        if (!cancelled) setGenerating(false)
      }
    }

    ensureCode()
    return () => {
      cancelled = true
    }
  }, [isConfigured, user?.id, profile?.referral_code, fetchProfile])

  const copyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const shareFacebook = () => {
    if (!shareUrl) return
    const u = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'noopener,noreferrer')
  }

  const shareEmail = () => {
    if (!shareUrl) return
    const subject = encodeURIComponent('Try Homeschool Helper — free month of Premium')
    const body = encodeURIComponent(
      `I thought you might like Homeschool Helper for tracking hours and records.\n\nUse my link for a free month of Premium when you sign up:\n${shareUrl}\n`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  if (!isConfigured) {
    return (
      <div className="referrals-page">
        <div className="referrals-card referrals-muted">
          <p>Referrals require a connected Supabase project. Configure your environment to use this feature.</p>
        </div>
      </div>
    )
  }

  const successfulReferrals = rewards.length
  const pendingRewards = rewards.filter((r) => r.status === 'pending').length
  const completedRewards = rewards.filter((r) => r.status === 'completed').length

  return (
    <div className="referrals-page">
      <div className="referrals-header">
        <div className="referrals-header-icon">
          <Gift size={28} />
        </div>
        <div>
          <h1>Refer a friend</h1>
          <p className="referrals-sub">
            Give a friend 1 free month of Premium. You get 1 free month for every friend who signs up.
          </p>
        </div>
      </div>

      {/* TODO: Apply free months via Stripe/backend when referral_rewards.status is fulfilled. */}

      <div className="referrals-card referrals-hero">
        <h2>Your link</h2>
        <p className="referrals-hint">Share: homeschoolhelper.app/?ref=YOURCODE (your code is generated below)</p>
        {generating && !referralCode ? (
          <p className="referrals-loading">Creating your referral code…</p>
        ) : (
          <>
            <div className="referrals-link-row">
              <code className="referrals-url">{shareUrl || '—'}</code>
              <button type="button" className="btn-referrals btn-referrals-primary" onClick={copyLink} disabled={!shareUrl}>
                {copyOk ? <Check size={18} /> : <Copy size={18} />}
                {copyOk ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className="referrals-actions">
              <button type="button" className="btn-referrals btn-referrals-outline" onClick={shareFacebook} disabled={!shareUrl}>
                <Facebook size={18} />
                Share on Facebook
              </button>
              <button type="button" className="btn-referrals btn-referrals-outline" onClick={shareEmail} disabled={!shareUrl}>
                <Mail size={18} />
                Email a friend
              </button>
            </div>
          </>
        )}
      </div>

      <div className="referrals-stats">
        <div className="referrals-stat-card">
          <span className="referrals-stat-value">{successfulReferrals}</span>
          <span className="referrals-stat-label">Friends who signed up with your link</span>
        </div>
        <div className="referrals-stat-card">
          <span className="referrals-stat-value">{completedRewards}</span>
          <span className="referrals-stat-label">Rewards earned (completed)</span>
        </div>
        <div className="referrals-stat-card">
          <span className="referrals-stat-value">{pendingRewards}</span>
          <span className="referrals-stat-label">Rewards pending fulfillment</span>
        </div>
      </div>

      {loadRewardsError && (
        <div className="referrals-card referrals-error">
          <p>Could not load rewards: {loadRewardsError}</p>
        </div>
      )}

      {rewards.length > 0 && (
        <div className="referrals-card">
          <h2>Reward activity</h2>
          <ul className="referrals-list">
            {rewards.map((r) => (
              <li key={r.id}>
                <span className={`referrals-badge referrals-badge--${r.status}`}>{r.status}</span>
                <span className="referrals-reward-meta">
                  {r.reward_type === 'free_month' ? 'Free month' : r.reward_type} ·{' '}
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

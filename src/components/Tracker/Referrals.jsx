// Referral schema lives in db/schema.sql (profiles.referral_code, referral_rewards).
// Code generation and application happen server-side in /api/referrals.

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Gift, Copy, Check, Mail, Facebook } from 'lucide-react'
import './Referrals.css'

const SITE_ORIGIN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : '')

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
    try {
      const data = await api('/api/referrals')
      setRewards(data?.rewards || [])
    } catch (error) {
      setLoadRewardsError(error.message)
      setRewards([])
    }
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
        const data = await api('/api/referrals', {
          method: 'POST',
          body: { action: 'ensure-code' },
        })
        if (cancelled) return
        if (data?.referral_code) {
          setReferralCode(data.referral_code)
          await fetchProfile?.()
        }
      } catch (error) {
        console.error('referral_code save failed', error)
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
          <p>Referrals require an account. This build is running in demo mode without a backend.</p>
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

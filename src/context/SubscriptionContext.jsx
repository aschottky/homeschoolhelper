import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'
import { isBackendConfigured } from '../lib/config'

const SubscriptionContext = createContext()

export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium'
}

export const TIER_BENEFITS = {
  [TIERS.FREE]: {
    name: 'Free',
    price: '$0',
    features: [
      'Unlimited children tracking',
      'Custom subjects',
      'Progress dashboard',
      'Hours history',
      'Curriculum suggestions',
      'Consultation requests'
    ],
    consultBenefit: null,
    consultDiscount: 0,
    hasAds: true
  },
  [TIERS.PREMIUM]: {
    name: 'Premium',
    price: '$9.99/month',
    monthlyPrice: '$9.99/month',
    annualPrice: '$79.99/year',
    annualSavings: 'Save $40/year (2 months free!)',
    features: [
      'Everything in Free',
      'Ad-free experience',
      'FREE 15-minute curriculum consult',
      '20% off future consultations',
      'Priority support',
      'Export reports & transcripts'
    ],
    consultBenefit: 'Free 15-minute consultation included',
    consultDiscount: 20,
    hasAds: false
  }
}

// Derive the effective tier from a profile row (snake_case from the API)
function tierFromProfile(profile) {
  if (profile?.subscription_tier !== 'premium') return TIERS.FREE

  const isActive = profile.subscription_status === 'active' ||
                   profile.subscription_status === 'trialing'

  if (profile.subscription_end_date) {
    const endDate = new Date(profile.subscription_end_date)
    const now = new Date()
    if (endDate < now && !isActive) return TIERS.FREE
    return TIERS.PREMIUM
  }
  return isActive ? TIERS.PREMIUM : TIERS.FREE
}

export function SubscriptionProvider({ children }) {
  const { user, profile, loading: authLoading, fetchProfile, isConfigured: authConfigured } = useAuth()
  const isBackendReady = isBackendConfigured() && authConfigured
  const [tier, setTier] = useState(TIERS.FREE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Derive subscription status from the auth profile, or localStorage in demo mode
  useEffect(() => {
    if (isBackendReady && user) {
      if (authLoading) return
      setTier(tierFromProfile(profile))
      setIsLoaded(true)
    } else {
      loadSubscriptionFromLocalStorage()
    }
  }, [user, profile, authLoading, isBackendReady])

  const loadSubscriptionFromLocalStorage = () => {
    const savedTier = localStorage.getItem('homeschool_tier')
    if (savedTier && Object.values(TIERS).includes(savedTier)) {
      setTier(savedTier)
    }
    setIsLoaded(true)
  }

  // Save to localStorage as fallback
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_tier', tier)
    }
  }, [tier, isLoaded])

  const upgradeToPremium = async () => {
    // This will be handled by the Upgrade component with Stripe Checkout
    // This function is kept for backward compatibility
    console.log('Use handleCheckout in Upgrade component instead')
  }

  const downgradeToFree = async () => {
    if (isBackendReady && user) {
      try {
        await api('/api/data/profile', {
          method: 'PATCH',
          body: { subscription_tier: 'free' }
        })
        setTier(TIERS.FREE)
        await fetchProfile()
      } catch (error) {
        console.error('Error downgrading:', error)
      }
    } else {
      setTier(TIERS.FREE)
    }
  }

  const refreshSubscription = async () => {
    if (isBackendReady && user) {
      await fetchProfile()
    }
  }

  const isPremium = tier === TIERS.PREMIUM
  const currentTierBenefits = TIER_BENEFITS[tier]

  const value = {
    tier,
    isPremium,
    currentTierBenefits,
    upgradeToPremium,
    downgradeToFree,
    refreshSubscription,
    TIERS,
    TIER_BENEFITS,
    isLoaded,
    loading: !isLoaded
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

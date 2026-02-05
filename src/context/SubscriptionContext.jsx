import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
    features: [
      'Everything in Free',
      'Ad-free experience',
      'FREE 15-minute curriculum consult',
      '20% off future consultations',
      'Priority support',
      'Export reports (coming soon)'
    ],
    consultBenefit: 'Free 15-minute consultation included',
    consultDiscount: 20,
    hasAds: false
  }
}

export function SubscriptionProvider({ children }) {
  const { user, isConfigured: authConfigured } = useAuth()
  const isSupabaseReady = isSupabaseConfigured() && authConfigured
  const [tier, setTier] = useState(TIERS.FREE)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load subscription status from Supabase or localStorage
  useEffect(() => {
    if (isSupabaseReady && user) {
      loadSubscriptionFromSupabase()
    } else {
      loadSubscriptionFromLocalStorage()
    }
  }, [user, isSupabaseReady])

  const loadSubscriptionFromSupabase = async () => {
    setLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading subscription:', error)
        loadSubscriptionFromLocalStorage()
        return
      }

      // Check if subscription is still active
      if (profile.subscription_tier === 'premium') {
        const isActive = profile.subscription_status === 'active' || 
                        profile.subscription_status === 'trialing'
        
        // Also check if subscription hasn't expired
        if (profile.subscription_end_date) {
          const endDate = new Date(profile.subscription_end_date)
          const now = new Date()
          if (endDate < now && !isActive) {
            setTier(TIERS.FREE)
          } else {
            setTier(TIERS.PREMIUM)
          }
        } else {
          setTier(isActive ? TIERS.PREMIUM : TIERS.FREE)
        }
      } else {
        setTier(TIERS.FREE)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
      loadSubscriptionFromLocalStorage()
    } finally {
      setLoading(false)
      setIsLoaded(true)
    }
  }

  const loadSubscriptionFromLocalStorage = () => {
    const savedTier = localStorage.getItem('homeschool_tier')
    if (savedTier && Object.values(TIERS).includes(savedTier)) {
      setTier(savedTier)
    }
    setLoading(false)
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
    if (isSupabaseReady && user) {
      // Update in Supabase (webhook will handle actual cancellation)
      try {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', user.id)
        setTier(TIERS.FREE)
      } catch (error) {
        console.error('Error downgrading:', error)
      }
    } else {
      setTier(TIERS.FREE)
    }
  }

  const refreshSubscription = async () => {
    if (isSupabaseReady && user) {
      await loadSubscriptionFromSupabase()
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
    loading
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

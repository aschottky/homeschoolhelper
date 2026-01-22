import { createContext, useContext, useState, useEffect } from 'react'

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
  const [tier, setTier] = useState(TIERS.FREE)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedTier = localStorage.getItem('homeschool_tier')
    if (savedTier && Object.values(TIERS).includes(savedTier)) {
      setTier(savedTier)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_tier', tier)
    }
  }, [tier, isLoaded])

  const upgradeToPremium = () => {
    // In a real app, this would handle payment
    setTier(TIERS.PREMIUM)
  }

  const downgradeToFree = () => {
    setTier(TIERS.FREE)
  }

  const isPremium = tier === TIERS.PREMIUM
  const currentTierBenefits = TIER_BENEFITS[tier]

  const value = {
    tier,
    isPremium,
    currentTierBenefits,
    upgradeToPremium,
    downgradeToFree,
    TIERS,
    TIER_BENEFITS,
    isLoaded
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

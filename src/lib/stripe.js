// Stripe Checkout utility — talks to the same-origin /api/checkout function,
// authenticated by the Better Auth session cookie.
import { loadStripe } from '@stripe/stripe-js'
import { api } from './api'
import { isBackendConfigured } from './config'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise = null

export const getStripe = () => {
  if (!stripePublishableKey) {
    console.warn('Stripe publishable key not configured')
    return null
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}

/**
 * @param {'monthly' | 'annual'} billingPeriod — selects Stripe price on the server (STRIPE_PRICE_ID vs STRIPE_ANNUAL_PRICE_ID)
 */
export const createCheckoutSession = async (billingPeriod = 'monthly') => {
  if (!isBackendConfigured()) {
    throw new Error('Checkout is not available in demo mode')
  }

  const data = await api('/api/checkout', {
    method: 'POST',
    body: { billing_period: billingPeriod === 'annual' ? 'annual' : 'monthly' },
  })

  if (!data?.sessionId) {
    throw new Error(data?.error || 'Invalid response from server')
  }

  return data
}

export const redirectToCheckout = async (billingPeriod = 'monthly') => {
  try {
    const sessionData = await createCheckoutSession(billingPeriod)

    if (sessionData.url) {
      window.location.href = sessionData.url
    } else {
      throw new Error('No checkout URL returned from server')
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

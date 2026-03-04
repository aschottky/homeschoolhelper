// Stripe Checkout utility
import { loadStripe } from '@stripe/stripe-js'
import { supabase, isSupabaseConfigured } from './supabase'

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

export const createCheckoutSession = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  const { data: { session: refreshed } } = await supabase.auth.refreshSession()
  const activeSession = refreshed ?? session
  const token = activeSession?.access_token
  if (!token) {
    throw new Error('No access token. Please sign out and sign in again.')
  }

  const checkoutApiUrl = import.meta.env.VITE_CHECKOUT_API_URL?.trim()
  const useGcpCheckout = !!checkoutApiUrl

  if (!useGcpCheckout) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE') || !anonKey) {
      throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or use VITE_CHECKOUT_API_URL for Google Cloud checkout.')
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const tokenRef = payload.ref
      const urlRef = supabaseUrl.replace('https://', '').split('.')[0]
      if (tokenRef != null && urlRef && tokenRef !== urlRef) {
        throw new Error(
        'Your saved session is for a different Supabase project. Clear this site’s data: DevTools → Application → Storage → Clear site data. Then reload, sign in again, and try upgrading.'
        )
      }
    } catch (e) {
      if (e.message?.includes('different Supabase project')) throw e
    }
    const authCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    })
    if (!authCheck.ok) {
      if (authCheck.status === 401) {
        throw new Error(
        'Session invalid for this project. Clear site data: open DevTools (F12) → Application → Storage → “Clear site data”. Then reload, sign in again, and try upgrading.'
        )
      }
      throw new Error('Auth check failed. Please sign out and sign in again.')
    }
  }

  const url = useGcpCheckout
    ? checkoutApiUrl
    : `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/create-checkout-session`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  if (!useGcpCheckout) {
    headers.apikey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ access_token: token }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    let message =
      data?.error ||
      data?.message ||
      (res.statusText && `HTTP ${res.status}: ${res.statusText}`) ||
      `Checkout failed (${res.status}). Check browser Network tab for details.`
    if (message.toLowerCase().includes('invalid jwt') || message.toLowerCase().includes('jwt')) {
      message = 'Your session expired or is invalid. Please sign out and sign in again, then try upgrading.'
    }
    console.error('Checkout session error:', res.status, res.statusText, data)
    throw new Error(message)
  }

  if (!data?.sessionId) {
    throw new Error(data?.error || 'Invalid response from server')
  }

  return data
}

export const redirectToCheckout = async () => {
  try {
    const sessionData = await createCheckoutSession()

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

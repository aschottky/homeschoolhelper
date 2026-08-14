import { createContext, useContext, useState, useEffect } from 'react'
import { authClient } from '../lib/authClient'
import { isBackendConfigured } from '../lib/config'
import { api } from '../lib/api'
import { applyPendingReferral } from '../lib/referralClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isConfigured] = useState(isBackendConfigured())
  const { data: sessionData, isPending } = authClient.useSession()
  const user = isConfigured ? (sessionData?.user ?? null) : null
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const loading = isConfigured && (isPending || profileLoading)

  // Fetch user profile from the API
  const fetchProfile = async () => {
    try {
      const data = await api('/api/data/profile')
      setProfile(data || null)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
      return null
    }
  }

  // Load the profile whenever the signed-in user changes
  useEffect(() => {
    if (!isConfigured || !user?.id) {
      setProfile(null)
      return
    }
    let cancelled = false
    setProfileLoading(true)
    api('/api/data/profile')
      .then((data) => {
        if (!cancelled) setProfile(data || null)
      })
      .catch((error) => {
        console.error('Error fetching profile:', error)
        if (!cancelled) setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isConfigured, user?.id])

  // Apply a pending ?ref= referral code once signed in
  useEffect(() => {
    if (!isConfigured || !user?.id || loading) return
    let cancelled = false
    ;(async () => {
      await applyPendingReferral(user.id, async () => {
        if (!cancelled) await fetchProfile()
      })
    })()
    return () => {
      cancelled = true
    }
  }, [isConfigured, user?.id, loading])

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: metadata.full_name || email.split('@')[0],
    })
    if (error) throw new Error(error.message || 'Sign up failed')
    return data
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) throw new Error(error.message || 'Sign in failed')
    return data
  }

  // Sign in with OAuth provider (Google)
  const signInWithProvider = async (provider) => {
    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: '/tracker/dashboard',
    })
    if (error) throw new Error(error.message || 'Sign in failed')
    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await authClient.signOut()
    if (error) throw new Error(error.message || 'Sign out failed')
    setProfile(null)
  }

  // Send password reset email (link lands on /reset-password)
  const resetPassword = async (email) => {
    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message || 'Password reset failed')
    return data
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    const data = await api('/api/data/profile', { method: 'PATCH', body: updates })
    setProfile(data)
    return data
  }

  const value = {
    user,
    profile,
    loading,
    isConfigured,
    isAdmin: !!profile?.is_admin,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile: () => user && fetchProfile(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

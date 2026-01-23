import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SupabaseDataProvider } from './context/SupabaseDataContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Resources from './components/Resources'
import Testimonials from './components/Testimonials'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import Tracker from './components/Tracker/Tracker'
import About from './components/About'
import Auth from './components/Auth/Auth'
import './App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const { user, loading, isConfigured } = useAuth()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Timeout fallback for loading state
  useEffect(() => {
    if (loading && isConfigured) {
      const timeout = setTimeout(() => {
        console.warn('Loading timeout - forcing render')
        setLoadingTimeout(true)
      }, 5000) // 5 second timeout (reduced from 10)

      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [loading, isConfigured])

  // Only show loading for tracker/auth pages, not homepage
  // Homepage should load immediately
  const isAuthRequiredPage = currentPage === 'tracker' || currentPage === 'auth'
  
  // Show loading state only for auth-required pages (but timeout after 5 seconds)
  if (loading && isConfigured && isAuthRequiredPage && !loadingTimeout) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '12px' }}>
          Taking longer than expected? <a href="/" style={{ color: 'var(--forest)', textDecoration: 'underline' }}>Refresh page</a>
        </p>
      </div>
    )
  }

  // Show auth page if requested
  if (currentPage === 'auth') {
    return (
      <Auth 
        onBack={() => setCurrentPage('home')} 
        onSuccess={() => setCurrentPage('tracker')}
      />
    )
  }

  if (currentPage === 'tracker') {
    return (
      <SubscriptionProvider>
        <SupabaseDataProvider>
          <Tracker onBack={() => setCurrentPage('home')} />
        </SupabaseDataProvider>
      </SubscriptionProvider>
    )
  }

  if (currentPage === 'about') {
    return <About onBack={() => setCurrentPage('home')} />
  }

  return (
    <div className="app">
      <Navbar 
        onOpenTracker={() => {
          // If Supabase is configured and no user, show auth
          // Otherwise go directly to tracker (demo mode)
          if (isConfigured && !user) {
            setCurrentPage('auth')
          } else {
            setCurrentPage('tracker')
          }
        }} 
        onOpenAbout={() => setCurrentPage('about')}
        onOpenAuth={() => setCurrentPage('auth')}
        isLoggedIn={!!user}
      />
      <main>
        <Hero onOpenTracker={() => {
          if (isConfigured && !user) {
            setCurrentPage('auth')
          } else {
            setCurrentPage('tracker')
          }
        }} />
        <Features />
        <Resources />
        <Testimonials />
        <CallToAction onOpenTracker={() => {
          if (isConfigured && !user) {
            setCurrentPage('auth')
          } else {
            setCurrentPage('tracker')
          }
        }} />
      </main>
      <Footer onOpenAbout={() => setCurrentPage('about')} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

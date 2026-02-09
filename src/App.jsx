import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SupabaseDataProvider } from './context/SupabaseDataContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Resources from './components/Resources'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import Tracker from './components/Tracker/Tracker'
import About from './components/About'
import LegalHelp from './components/LegalHelp'
import FeaturesPage from './components/FeaturesPage'
import Auth from './components/Auth/Auth'
import './App.css'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo(0, 0)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function TrackerGate({ children }) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!isConfigured) return children
  if (!loading && !user && location.pathname.startsWith('/tracker')) {
    navigate('/auth?redirect=' + encodeURIComponent(location.pathname + location.search), { replace: true })
    return null
  }
  return children
}

function AppContent() {
  const { user, loading, isConfigured } = useAuth()
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const location = useLocation()
  const isAuthRequiredPage = location.pathname === '/tracker' || location.pathname.startsWith('/tracker/') || location.pathname === '/auth'

  useEffect(() => {
    if (loading && isConfigured && isAuthRequiredPage) {
      const t = setTimeout(() => setLoadingTimeout(true), 5000)
      return () => clearTimeout(t)
    }
    setLoadingTimeout(false)
  }, [loading, isConfigured, isAuthRequiredPage])

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

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <SupabaseDataProvider>
            <div className="app">
              <Navbar />
              <main>
                <Hero />
                <Features />
                <Resources />
                <CallToAction />
              </main>
              <Footer />
            </div>
          </SupabaseDataProvider>
        } />
        <Route path="/about" element={
          <div className="app">
            <Navbar />
            <main><About /></main>
            <Footer />
          </div>
        } />
        <Route path="/legal-help" element={
          <div className="app">
            <Navbar />
            <main><LegalHelp /></main>
            <Footer />
          </div>
        } />
        <Route path="/features" element={
          <div className="app">
            <Navbar />
            <main><FeaturesPage /></main>
            <Footer />
          </div>
        } />
        <Route path="/auth" element={<Auth />} />
        <Route path="/tracker" element={<Navigate to="/tracker/dashboard" replace />} />
        <Route path="/tracker/:tab" element={
          <TrackerGate>
            <SubscriptionProvider>
              <SupabaseDataProvider>
                <Tracker />
              </SupabaseDataProvider>
            </SubscriptionProvider>
          </TrackerGate>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
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

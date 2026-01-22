import { useState } from 'react'
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

  // Show loading state while checking auth
  if (loading && isConfigured) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
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

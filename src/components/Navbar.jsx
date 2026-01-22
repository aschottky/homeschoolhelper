import { useState } from 'react'
import { BookOpen, Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar({ onOpenTracker, onOpenAbout, onOpenAuth, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut, user } = useAuth()

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <a href="#" className="logo">
          <BookOpen className="logo-icon" />
          <span className="logo-text">
            <span className="logo-home">Home</span>School Helper
          </span>
        </a>
        
        <nav className={`nav-links ${isOpen ? 'nav-open' : ''}`}>
          <a href="#features" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#resources" onClick={() => setIsOpen(false)}>Resources</a>
          <a href="#testimonials" onClick={() => setIsOpen(false)}>Stories</a>
          <button 
            className="nav-link-btn"
            onClick={() => {
              setIsOpen(false)
              onOpenAbout()
            }}
          >
            About Us
          </button>
          {isLoggedIn ? (
            <>
              <button 
                className="nav-link-btn user-btn"
                onClick={() => {
                  setIsOpen(false)
                  onOpenTracker()
                }}
              >
                <User size={18} />
                {user?.email?.split('@')[0]}
              </button>
              <button 
                className="nav-link-btn"
                onClick={async () => {
                  setIsOpen(false)
                  await signOut()
                }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <button 
              className="nav-link-btn"
              onClick={() => {
                setIsOpen(false)
                onOpenAuth?.()
              }}
            >
              <LogIn size={18} />
              Sign In
            </button>
          )}
          <button 
            className="nav-cta" 
            onClick={() => {
              setIsOpen(false)
              onOpenTracker()
            }}
          >
            Hours Tracker
          </button>
        </nav>

        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}

export default Navbar

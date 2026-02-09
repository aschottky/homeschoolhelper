import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const isLoggedIn = !!user

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
          <BookOpen className="logo-icon" />
          <span className="logo-text">
            <span className="logo-home">Home</span>School Helper
          </span>
        </Link>
        
        <nav className={`nav-links ${isOpen ? 'nav-open' : ''}`}>
          <Link to="/features" onClick={() => setIsOpen(false)}>Features</Link>
          <Link to="/about" className="nav-link-btn" onClick={() => setIsOpen(false)}>
            About Us
          </Link>
          <Link to="/legal-help" className="nav-link-btn" onClick={() => setIsOpen(false)}>
            Legal Help
          </Link>
          <Link 
            to={isLoggedIn ? '/tracker/dashboard' : '/auth'} 
            className="nav-cta" 
            onClick={() => setIsOpen(false)}
          >
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </Link>
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

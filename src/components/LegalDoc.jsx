import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './LegalDoc.css'

// Shared shell for Privacy Policy / Terms so both read identically.
function LegalDoc({ icon: Icon, title, lastUpdated, children }) {
  return (
    <div className="legaldoc-page">
      <nav className="legaldoc-nav">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </nav>

      <header className="legaldoc-header">
        {Icon && <Icon size={40} className="legaldoc-header-icon" />}
        <h1>{title}</h1>
        <p className="legaldoc-updated">Last updated: {lastUpdated}</p>
      </header>

      <div className="legaldoc-body">
        <div className="legaldoc-card">
          {children}
        </div>
      </div>
    </div>
  )
}

export default LegalDoc

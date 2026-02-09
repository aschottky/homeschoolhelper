import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>
        <div className="hero-blob hero-blob-3"></div>
        <div className="hero-pattern"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title animate-fade-in">
            Where learning feels like an <span className="highlight">adventure</span>
          </h1>
          
          <p className="hero-subtitle animate-fade-in">
            Track your homeschool hours with ease. Manage multiple children, 
            customize subjects, and monitor progress toward your educational goals.
          </p>
          
          <div className="hero-actions animate-fade-in">
            <Link to="/tracker/dashboard" className="btn btn-primary">
              Open Hours Tracker
              <ArrowRight className="btn-icon" />
            </Link>
            <a href="#features" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>

        <div className="hero-visual animate-fade-in animate-delay-3">
          <div className="visual-card visual-card-1">
            <div className="card-emoji">📚</div>
            <span>Language Arts</span>
          </div>
          <div className="visual-card visual-card-2">
            <div className="card-emoji">🔬</div>
            <span>Science</span>
          </div>
          <div className="visual-card visual-card-3">
            <div className="card-emoji">📐</div>
            <span>Mathematics</span>
          </div>
          <div className="visual-card visual-card-4">
            <div className="card-emoji">🌍</div>
            <span>History</span>
          </div>
          <div className="visual-center">
            <div className="center-icon">⏱️</div>
            <span>Track Hours</span>
            <span>By Subject</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

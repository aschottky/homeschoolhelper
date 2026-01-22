import { Sparkles, ArrowRight } from 'lucide-react'
import './Hero.css'

function Hero({ onOpenTracker }) {
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
          <div className="hero-badge animate-fade-in">
            <Sparkles className="badge-icon" />
            <span>Trusted by 10,000+ families</span>
          </div>
          
          <h1 className="hero-title animate-fade-in animate-delay-1">
            Where learning feels like an <span className="highlight">adventure</span>
          </h1>
          
          <p className="hero-subtitle animate-fade-in animate-delay-2">
            Track your homeschool hours with ease. Manage multiple children, 
            customize subjects, and monitor progress toward your educational goals.
          </p>
          
          <div className="hero-actions animate-fade-in animate-delay-3">
            <button onClick={onOpenTracker} className="btn btn-primary">
              Open Hours Tracker
              <ArrowRight className="btn-icon" />
            </button>
            <a href="#features" className="btn btn-secondary">
              Learn More
            </a>
          </div>
          
          <div className="hero-stats animate-fade-in animate-delay-4">
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Children Supported</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">Custom</span>
              <span className="stat-label">Subjects & Hours</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free & Local</span>
            </div>
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

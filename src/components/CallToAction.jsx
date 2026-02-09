import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import './CallToAction.css'

const benefits = [
  'Track multiple children',
  'Customize subjects & hours',
  'Data stored locally',
  'Completely free'
]

function CallToAction() {
  return (
    <section id="cta" className="cta">
      <div className="cta-pattern"></div>
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2>Ready to track your homeschool hours?</h2>
            <p>
              Start organizing your homeschool journey today. Add your children, 
              customize their subjects, set hour requirements, and track progress 
              all in one place.
            </p>
            <ul className="cta-benefits">
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <CheckCircle className="check-icon" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="cta-form-wrapper">
            <div className="cta-card">
              <h3>Start Tracking Now</h3>
              <p>No signup required. Your data is stored securely in your browser.</p>
              
              <div className="cta-features">
                <div className="cta-feature">
                  <span className="feature-icon">👨‍👩‍👧‍👦</span>
                  <span>Multiple Children</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">📚</span>
                  <span>Custom Subjects</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">⏱️</span>
                  <span>Hour Tracking</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-icon">📊</span>
                  <span>Progress Reports</span>
                </div>
              </div>

              <Link to="/tracker/dashboard" className="cta-submit">
                Open Hours Tracker
                <ArrowRight className="btn-icon" />
              </Link>
              <p className="form-disclaimer">
                All data is stored locally in your browser. Nothing is sent to any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction

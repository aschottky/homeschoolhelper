import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import './CallToAction.css'

const benefits = [
  'Track multiple children',
  'Cloud sync across devices',
  'Compliance-ready reports',
  'Free to start, upgrade anytime'
]

function CallToAction() {
  return (
    <section id="cta" className="cta">
      <div className="cta-pattern"></div>
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2>Start your homeschool tracking today</h2>
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
              <p>
                Sign up in 30 seconds. Free plan includes unlimited children
                and full hours tracking.
              </p>
              
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

              <Link to="/auth" className="cta-submit">
                Create Free Account
                <ArrowRight className="btn-icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction

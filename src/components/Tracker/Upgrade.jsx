import { useState, useEffect } from 'react'
import { useSubscription, TIERS, TIER_BENEFITS } from '../../context/SubscriptionContext'
import { useAuth } from '../../context/AuthContext'
import { redirectToCheckout } from '../../lib/stripe'
import { Check, X, Sparkles, Crown, Gift, Loader } from 'lucide-react'
import './Upgrade.css'

function Upgrade() {
  const { tier, isPremium, upgradeToPremium, downgradeToFree, refreshSubscription } = useSubscription()
  const { user, isConfigured } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  // Check for successful checkout return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    const canceled = urlParams.get('canceled')

    if (sessionId) {
      // Successful checkout - refresh subscription
      setCheckoutSuccess(true)
      refreshSubscription()
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (canceled) {
      setError('Checkout was canceled. You can try again anytime.')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [refreshSubscription])

  const handleCheckout = async () => {
    if (!user || !isConfigured) {
      setError('Please sign in to upgrade to Premium')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await redirectToCheckout()
      // User will be redirected to Stripe, so this won't execute
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="upgrade">
      <div className="upgrade-header">
        <h1>Choose Your Plan</h1>
        <p>Select the plan that works best for your homeschool journey</p>
        {checkoutSuccess && (
          <div className="checkout-success-message">
            <Check size={20} />
            <span>Payment successful! Your Premium subscription is now active.</span>
          </div>
        )}
        {error && (
          <div className="checkout-error-message">
            <X size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="plans-grid">
        {/* Free Plan */}
        <div className={`plan-card ${tier === TIERS.FREE ? 'current' : ''}`}>
          {tier === TIERS.FREE && <span className="current-badge">Current Plan</span>}
          <div className="plan-header">
            <h2>Free</h2>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">forever</span>
            </div>
          </div>
          <p className="plan-description">
            Get started with essential homeschool tracking features
          </p>
          <ul className="plan-features">
            <li><Check size={18} className="check" /> Unlimited children</li>
            <li><Check size={18} className="check" /> Custom subjects</li>
            <li><Check size={18} className="check" /> Hours tracking</li>
            <li><Check size={18} className="check" /> Progress dashboard</li>
            <li><Check size={18} className="check" /> Curriculum suggestions</li>
            <li><Check size={18} className="check" /> Consultation requests</li>
            <li><X size={18} className="x" /> Ad-free experience</li>
            <li><X size={18} className="x" /> Free consultation</li>
            <li><X size={18} className="x" /> Consultation discounts</li>
            <li><X size={18} className="x" /> Priority support</li>
          </ul>
          {tier === TIERS.FREE ? (
            <button className="plan-btn btn-current" disabled>
              Current Plan
            </button>
          ) : (
            <button className="plan-btn btn-secondary" onClick={downgradeToFree}>
              Switch to Free
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className={`plan-card premium ${tier === TIERS.PREMIUM ? 'current' : ''}`}>
          {tier === TIERS.PREMIUM && <span className="current-badge">Current Plan</span>}
          <div className="recommended-badge">
            <Crown size={14} />
            Recommended
          </div>
          <div className="plan-header">
            <h2>Premium</h2>
            <div className="plan-price">
              <span className="price">$9.99</span>
              <span className="period">/month</span>
            </div>
          </div>
          <p className="plan-description">
            The complete homeschool experience with exclusive benefits
          </p>
          <ul className="plan-features">
            <li><Check size={18} className="check" /> Everything in Free</li>
            <li className="highlight">
              <Sparkles size={18} className="sparkle" /> 
              <strong>Ad-free experience</strong>
            </li>
            <li className="highlight">
              <Gift size={18} className="gift" /> 
              <strong>FREE 15-min consultation</strong>
            </li>
            <li className="highlight">
              <Check size={18} className="check" /> 
              <strong>20% off consultations</strong>
            </li>
            <li><Check size={18} className="check" /> Priority support</li>
            <li><Check size={18} className="check" /> Export reports (coming soon)</li>
            <li><Check size={18} className="check" /> Early access to new features</li>
          </ul>
          {tier === TIERS.PREMIUM ? (
            <button className="plan-btn btn-current" disabled>
              Current Plan
            </button>
          ) : (
            <button 
              className="plan-btn btn-primary" 
              onClick={handleCheckout}
              disabled={loading || !user || !isConfigured}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinning" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Upgrade to Premium
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="comparison-section">
        <h2>Compare Plans</h2>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="feature-name">Feature</div>
            <div className="plan-col">Free</div>
            <div className="plan-col premium-col">Premium</div>
          </div>
          <div className="comparison-row">
            <div className="feature-name">Track unlimited children</div>
            <div className="plan-col"><Check size={18} /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row">
            <div className="feature-name">Custom subjects & hours</div>
            <div className="plan-col"><Check size={18} /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row">
            <div className="feature-name">Progress dashboard</div>
            <div className="plan-col"><Check size={18} /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row">
            <div className="feature-name">Curriculum suggestions</div>
            <div className="plan-col"><Check size={18} /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row">
            <div className="feature-name">Request consultations</div>
            <div className="plan-col"><Check size={18} /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row highlight-row">
            <div className="feature-name">Ad-free experience</div>
            <div className="plan-col"><X size={18} className="x" /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row highlight-row">
            <div className="feature-name">Free 15-minute consultation</div>
            <div className="plan-col"><X size={18} className="x" /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row highlight-row">
            <div className="feature-name">20% off all consultations</div>
            <div className="plan-col"><X size={18} className="x" /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
          <div className="comparison-row highlight-row">
            <div className="feature-name">Priority support</div>
            <div className="plan-col"><X size={18} className="x" /></div>
            <div className="plan-col premium-col"><Check size={18} /></div>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes! You can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>How does the free consultation work?</h4>
            <p>Premium members get one free 15-minute Quick Q&A consultation. Just select it when booking and the charge will be waived automatically.</p>
          </div>
          <div className="faq-item">
            <h4>Is my data safe?</h4>
            <p>All your tracking data is stored locally in your browser. We don't send your children's information to any server.</p>
          </div>
          <div className="faq-item">
            <h4>Can I switch plans?</h4>
            <p>You can upgrade to Premium or downgrade to Free at any time. Changes take effect immediately.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upgrade

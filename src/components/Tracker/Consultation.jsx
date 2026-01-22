import { useState } from 'react'
import { useSubscription, TIERS } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { Calendar, Clock, Check, Sparkles, Gift, Percent, Send, Video, Phone, MessageSquare } from 'lucide-react'
import './Consultation.css'

const CONSULT_TYPES = [
  {
    id: 'curriculum',
    name: 'Curriculum Planning',
    duration: '30 min',
    price: 45,
    description: 'Get personalized curriculum recommendations based on your child\'s learning style and goals.'
  },
  {
    id: 'assessment',
    name: 'Learning Assessment',
    duration: '45 min',
    price: 65,
    description: 'Comprehensive evaluation of your child\'s current level and recommendations for moving forward.'
  },
  {
    id: 'strategy',
    name: 'Homeschool Strategy',
    duration: '60 min',
    price: 85,
    description: 'Full planning session covering scheduling, curriculum, teaching methods, and goal setting.'
  },
  {
    id: 'quick',
    name: 'Quick Q&A',
    duration: '15 min',
    price: 25,
    description: 'Quick answers to specific questions about curriculum, methods, or challenges.'
  }
]

const MEETING_METHODS = [
  { id: 'video', name: 'Video Call', icon: Video },
  { id: 'phone', name: 'Phone Call', icon: Phone },
  { id: 'chat', name: 'Live Chat', icon: MessageSquare }
]

function Consultation() {
  const { isPremium, currentTierBenefits, upgradeToPremium, tier } = useSubscription()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    children: '',
    consultType: '',
    meetingMethod: 'video',
    preferredDate: '',
    preferredTime: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const selectedConsult = CONSULT_TYPES.find(c => c.id === formData.consultType)
  
  const calculatePrice = () => {
    if (!selectedConsult) return 0
    
    // Premium users get free 15 min consult
    if (isPremium && selectedConsult.id === 'quick') {
      return 0
    }
    
    // Premium users get 20% off
    if (isPremium) {
      return Math.round(selectedConsult.price * 0.8)
    }
    
    return selectedConsult.price
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would submit to a backend
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="consultation">
        <div className="consult-success">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2>Request Submitted!</h2>
          <p>Thank you for your consultation request. We'll contact you within 24 hours to confirm your appointment.</p>
          <div className="success-details">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Type:</strong> {selectedConsult?.name}</p>
            <p><strong>Preferred Date:</strong> {formData.preferredDate}</p>
            <p><strong>Method:</strong> {MEETING_METHODS.find(m => m.id === formData.meetingMethod)?.name}</p>
            {isPremium && selectedConsult?.id === 'quick' && (
              <p className="free-consult-badge"><Gift size={16} /> This consultation is FREE for Premium members!</p>
            )}
          </div>
          <button className="btn-tracker btn-primary" onClick={() => setSubmitted(false)}>
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="consultation">
      <div className="consult-header">
        <h1>Request a Curriculum Consultation</h1>
        <p>Get personalized guidance from our experienced homeschool consultants</p>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="consult-ad" />}

      <div className="consult-layout">
        <div className="consult-form-section">
          <form onSubmit={handleSubmit} className="consult-form">
            <div className="form-section">
              <h3>Your Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Children *</label>
                  <select
                    className="form-select"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">1 child</option>
                    <option value="2">2 children</option>
                    <option value="3">3 children</option>
                    <option value="4">4 children</option>
                    <option value="5+">5+ children</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Consultation Type *</h3>
              <div className="consult-types">
                {CONSULT_TYPES.map(type => {
                  const isFreeForPremium = isPremium && type.id === 'quick'
                  const discountedPrice = isPremium ? Math.round(type.price * 0.8) : type.price
                  
                  return (
                    <label 
                      key={type.id} 
                      className={`consult-type-card ${formData.consultType === type.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="consultType"
                        value={type.id}
                        checked={formData.consultType === type.id}
                        onChange={(e) => setFormData({ ...formData, consultType: e.target.value })}
                      />
                      <div className="card-content">
                        <div className="card-top">
                          <h4>{type.name}</h4>
                          <div className="card-pricing">
                            {isFreeForPremium ? (
                              <span className="price-free">FREE</span>
                            ) : isPremium ? (
                              <>
                                <span className="price-original">${type.price}</span>
                                <span className="price-discounted">${discountedPrice}</span>
                              </>
                            ) : (
                              <span className="price">${type.price}</span>
                            )}
                          </div>
                        </div>
                        <p>{type.description}</p>
                        <div className="card-meta">
                          <Clock size={14} />
                          <span>{type.duration}</span>
                          {isFreeForPremium && (
                            <span className="premium-badge"><Gift size={12} /> Premium Benefit</span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="form-section">
              <h3>Meeting Preference</h3>
              <div className="meeting-methods">
                {MEETING_METHODS.map(method => (
                  <label 
                    key={method.id}
                    className={`method-option ${formData.meetingMethod === method.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="meetingMethod"
                      value={method.id}
                      checked={formData.meetingMethod === method.id}
                      onChange={(e) => setFormData({ ...formData, meetingMethod: e.target.value })}
                    />
                    <method.icon size={20} />
                    <span>{method.name}</span>
                  </label>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time</label>
                  <select
                    className="form-select"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning (9am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                    <option value="evening">Evening (5pm - 8pm)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Tell Us More</h3>
              <div className="form-group">
                <label>What would you like help with?</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your homeschool goals, challenges, or specific questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-tracker btn-primary btn-lg submit-btn"
              disabled={!formData.name || !formData.email || !formData.consultType || !formData.children || !formData.preferredDate}
            >
              <Send size={20} />
              Submit Request
            </button>
          </form>
        </div>

        <div className="consult-sidebar">
          {selectedConsult && (
            <div className="price-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>{selectedConsult.name}</span>
                <span>${selectedConsult.price}</span>
              </div>
              {isPremium && selectedConsult.id === 'quick' && (
                <div className="summary-item discount">
                  <span><Gift size={14} /> Premium Free Consult</span>
                  <span>-${selectedConsult.price}</span>
                </div>
              )}
              {isPremium && selectedConsult.id !== 'quick' && (
                <div className="summary-item discount">
                  <span><Percent size={14} /> Premium Discount (20%)</span>
                  <span>-${Math.round(selectedConsult.price * 0.2)}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total</span>
                <span>${calculatePrice()}</span>
              </div>
            </div>
          )}

          {!isPremium && (
            <div className="upgrade-promo">
              <Sparkles size={24} />
              <h4>Upgrade to Premium</h4>
              <p>Get a FREE 15-minute consultation and 20% off all future appointments!</p>
              <ul>
                <li><Check size={16} /> Free 15-min consultation</li>
                <li><Check size={16} /> 20% off all consultations</li>
                <li><Check size={16} /> Ad-free experience</li>
                <li><Check size={16} /> Priority scheduling</li>
              </ul>
              <button className="btn-tracker btn-primary" onClick={upgradeToPremium}>
                Upgrade for $9.99/mo
              </button>
            </div>
          )}

          {isPremium && (
            <div className="premium-benefits">
              <Sparkles size={24} />
              <h4>Your Premium Benefits</h4>
              <ul>
                <li><Check size={16} /> Free 15-minute consultation</li>
                <li><Check size={16} /> 20% off all consultations</li>
                <li><Check size={16} /> Priority scheduling</li>
              </ul>
            </div>
          )}

          {!isPremium && <AdBanner variant="vertical" className="sidebar-ad" />}
        </div>
      </div>
    </div>
  )
}

export default Consultation

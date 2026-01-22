import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { 
  Settings as SettingsIcon, School, User, MapPin, Phone, Mail, 
  Save, CheckCircle, Building2
} from 'lucide-react'
import './Settings.css'

function Settings() {
  const { homeschoolProfile, updateHomeschoolProfile, userState, setUserState } = useData()
  const { isPremium } = useSubscription()
  
  const [formData, setFormData] = useState(homeschoolProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFormData(homeschoolProfile)
  }, [homeschoolProfile])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    updateHomeschoolProfile(formData)
    if (formData.state && formData.state !== userState) {
      setUserState(formData.state)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ]

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <h1>
            <SettingsIcon className="header-icon" />
            Homeschool Settings
          </h1>
          <p>Customize your homeschool profile for reports and records</p>
        </div>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="settings-ad" />}

      <form onSubmit={handleSave} className="settings-form">
        {/* Homeschool Identity */}
        <section className="settings-section">
          <div className="section-header">
            <School size={20} />
            <h2>Homeschool Identity</h2>
          </div>
          <p className="section-description">
            Give your homeschool a name that will appear on reports and official documents.
          </p>
          
          <div className="form-group featured">
            <label>
              <Building2 size={16} />
              Homeschool Name
            </label>
            <input
              type="text"
              className="form-input large"
              value={formData.homeschoolName}
              onChange={(e) => handleChange('homeschoolName', e.target.value)}
              placeholder="e.g., Smith Family Academy, Oak Grove Homeschool"
            />
            <span className="form-hint">
              This name will appear on college application reports and other official documents.
            </span>
          </div>
        </section>

        {/* Parent/Guardian Information */}
        <section className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2>Parent/Guardian Information</h2>
          </div>
          
          <div className="form-group">
            <label>Parent/Guardian Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Phone size={14} />
                Phone Number
              </label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>
                <Mail size={14} />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="settings-section">
          <div className="section-header">
            <MapPin size={20} />
            <h2>Address</h2>
          </div>
          
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <select
                className="form-select"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              >
                <option value="">Select state</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="settings-actions">
          <button type="submit" className={`btn-tracker btn-primary ${saved ? 'saved' : ''}`}>
            {saved ? (
              <>
                <CheckCircle size={18} />
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview */}
      {formData.homeschoolName && (
        <div className="profile-preview">
          <h3>Report Preview</h3>
          <div className="preview-card">
            <div className="preview-header">
              <h4>{formData.homeschoolName}</h4>
              {formData.parentName && <p className="preview-parent">{formData.parentName}, Administrator</p>}
            </div>
            {(formData.address || formData.city) && (
              <p className="preview-address">
                {formData.address && <span>{formData.address}</span>}
                {formData.city && formData.state && (
                  <span>{formData.city}, {formData.state} {formData.zip}</span>
                )}
              </p>
            )}
            {(formData.phone || formData.email) && (
              <p className="preview-contact">
                {formData.phone && <span>{formData.phone}</span>}
                {formData.phone && formData.email && <span> • </span>}
                {formData.email && <span>{formData.email}</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

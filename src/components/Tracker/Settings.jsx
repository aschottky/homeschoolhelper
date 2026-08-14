import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Settings as SettingsIcon, School, Users, MapPin, Phone, Mail, 
  Save, CheckCircle, Building2, Plus, Trash2, Edit2, X, Check
} from 'lucide-react'
import './Settings.css'

const GUARDIAN_ROLES = ['Parent', 'Guardian', 'Stepparent', 'Grandparent', 'Foster Parent', 'Other']

function Settings() {
  const { homeschoolProfile, updateHomeschoolProfile, userState, setUserState } = useData()
  
  const [formData, setFormData] = useState(homeschoolProfile)
  const [saved, setSaved] = useState(false)
  const [editingGuardianId, setEditingGuardianId] = useState(null)
  const [editGuardianData, setEditGuardianData] = useState({})
  const [showAddGuardian, setShowAddGuardian] = useState(false)
  const [newGuardian, setNewGuardian] = useState({ name: '', phone: '', email: '', role: 'Parent' })

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

  const guardians = formData.guardians || []

  const handleAddGuardian = () => {
    if (!newGuardian.name.trim()) return
    const updated = [...guardians, { ...newGuardian, id: crypto.randomUUID() }]
    handleChange('guardians', updated)
    setNewGuardian({ name: '', phone: '', email: '', role: 'Parent' })
    setShowAddGuardian(false)
  }

  const handleUpdateGuardian = (id) => {
    const updated = guardians.map(g => g.id === id ? { ...g, ...editGuardianData } : g)
    handleChange('guardians', updated)
    setEditingGuardianId(null)
    setEditGuardianData({})
  }

  const handleDeleteGuardian = (id) => {
    handleChange('guardians', guardians.filter(g => g.id !== id))
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
            <Users size={20} />
            <h2>Parents / Guardians</h2>
          </div>

          {guardians.length === 0 && (
            <p className="guardians-empty">No parents or guardians added yet.</p>
          )}

          <div className="guardians-list">
            {guardians.map((g, idx) => (
              <div key={g.id} className="guardian-card">
                {editingGuardianId === g.id ? (
                  <div className="guardian-edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editGuardianData.name ?? g.name}
                          onChange={e => setEditGuardianData(d => ({ ...d, name: e.target.value }))}
                          autoFocus
                        />
                      </div>
                      <div className="form-group" style={{ maxWidth: '160px' }}>
                        <label>Role</label>
                        <select
                          className="form-select"
                          value={editGuardianData.role ?? g.role}
                          onChange={e => setEditGuardianData(d => ({ ...d, role: e.target.value }))}
                        >
                          {GUARDIAN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label><Phone size={13} /> Phone</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={editGuardianData.phone ?? g.phone}
                          onChange={e => setEditGuardianData(d => ({ ...d, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="form-group">
                        <label><Mail size={13} /> Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={editGuardianData.email ?? g.email}
                          onChange={e => setEditGuardianData(d => ({ ...d, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="guardian-edit-actions">
                      <button type="button" className="btn-tracker btn-primary btn-sm" onClick={() => handleUpdateGuardian(g.id)}>
                        <Check size={15} /> Save
                      </button>
                      <button type="button" className="btn-tracker btn-secondary btn-sm" onClick={() => { setEditingGuardianId(null); setEditGuardianData({}) }}>
                        <X size={15} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="guardian-view">
                    <div className="guardian-avatar">{g.name.charAt(0).toUpperCase()}</div>
                    <div className="guardian-info">
                      <div className="guardian-name-row">
                        <strong>{g.name}</strong>
                        <span className="guardian-role-badge">{g.role || 'Parent'}</span>
                        {idx === 0 && <span className="guardian-primary-badge">Primary</span>}
                      </div>
                      <div className="guardian-contacts">
                        {g.phone && <span><Phone size={12} /> {g.phone}</span>}
                        {g.email && <span><Mail size={12} /> {g.email}</span>}
                      </div>
                    </div>
                    <div className="guardian-actions">
                      <button
                        type="button"
                        className="btn-tracker btn-secondary btn-icon-only"
                        title="Edit"
                        onClick={() => { setEditingGuardianId(g.id); setEditGuardianData({ name: g.name, phone: g.phone, email: g.email, role: g.role }) }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-tracker btn-danger btn-icon-only"
                        title="Remove"
                        onClick={() => handleDeleteGuardian(g.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showAddGuardian ? (
            <div className="guardian-card guardian-add-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newGuardian.name}
                    onChange={e => setNewGuardian(g => ({ ...g, name: e.target.value }))}
                    placeholder="Full name"
                    autoFocus
                  />
                </div>
                <div className="form-group" style={{ maxWidth: '160px' }}>
                  <label>Role</label>
                  <select
                    className="form-select"
                    value={newGuardian.role}
                    onChange={e => setNewGuardian(g => ({ ...g, role: e.target.value }))}
                  >
                    {GUARDIAN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><Phone size={13} /> Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={newGuardian.phone}
                    onChange={e => setNewGuardian(g => ({ ...g, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label><Mail size={13} /> Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newGuardian.email}
                    onChange={e => setNewGuardian(g => ({ ...g, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="guardian-edit-actions">
                <button type="button" className="btn-tracker btn-primary btn-sm" onClick={handleAddGuardian} disabled={!newGuardian.name.trim()}>
                  <Plus size={15} /> Add Guardian
                </button>
                <button type="button" className="btn-tracker btn-secondary btn-sm" onClick={() => { setShowAddGuardian(false); setNewGuardian({ name: '', phone: '', email: '', role: 'Parent' }) }}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-tracker btn-secondary guardian-add-btn" onClick={() => setShowAddGuardian(true)}>
              <Plus size={16} /> Add Parent / Guardian
            </button>
          )}
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
              {guardians.length > 0 && (
                <p className="preview-parent">
                  {guardians.map((g, i) => (
                    <span key={g.id}>{i > 0 ? ' • ' : ''}{g.name}{g.role ? `, ${g.role}` : ''}</span>
                  ))}
                </p>
              )}
            </div>
            {(formData.address || formData.city) && (
              <p className="preview-address">
                {formData.address && <span>{formData.address}</span>}
                {formData.city && formData.state && (
                  <span>{formData.city}, {formData.state} {formData.zip}</span>
                )}
              </p>
            )}
            {guardians[0] && (guardians[0].phone || guardians[0].email) && (
              <p className="preview-contact">
                {guardians[0].phone && <span>{guardians[0].phone}</span>}
                {guardians[0].phone && guardians[0].email && <span> • </span>}
                {guardians[0].email && <span>{guardians[0].email}</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

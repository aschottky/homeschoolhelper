import { useState } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'
import { STATE_REQUIREMENTS, COMPLIANCE_LEVELS, STATES_LIST } from '../../data/stateRequirements'
import AdBanner from '../Ads/AdBanner'
import { MapPin, ExternalLink, Clock, Calendar, BookOpen, AlertCircle, Check, Sparkles, Lock } from 'lucide-react'
import './StateRequirements.css'

function StateRequirements() {
  const { isPremium, upgradeToPremium } = useSubscription()
  const [selectedState, setSelectedState] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const selectedStateData = selectedState ? STATE_REQUIREMENTS[selectedState] : null

  const filteredStates = STATES_LIST.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getComplianceInfo = (level) => COMPLIANCE_LEVELS[level] || COMPLIANCE_LEVELS.low

  return (
    <div className="state-requirements">
      <div className="state-header">
        <div className="header-content">
          <h1>Homeschool Requirements by State</h1>
          <p>Find the laws and requirements for homeschooling in your state</p>
        </div>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="state-ad" />}

      <div className="state-layout">
        <div className="state-selector-section">
          <div className="selector-card">
            <h3><MapPin size={20} /> Select Your State</h3>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="states-list">
              {filteredStates.map(state => {
                const compliance = getComplianceInfo(state.complianceLevel)
                return (
                  <button
                    key={state.code}
                    className={`state-item ${selectedState === state.code ? 'selected' : ''}`}
                    onClick={() => setSelectedState(state.code)}
                  >
                    <span className="state-name">{state.name}</span>
                    <span 
                      className="compliance-dot"
                      style={{ background: compliance.color }}
                      title={compliance.label}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="compliance-legend">
            <h4>Regulation Levels</h4>
            {Object.entries(COMPLIANCE_LEVELS).map(([key, value]) => (
              <div key={key} className="legend-item">
                <span className="legend-dot" style={{ background: value.color }} />
                <div className="legend-text">
                  <span className="legend-label">{value.label}</span>
                  <span className="legend-desc">{value.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="state-details-section">
          {selectedStateData ? (
            <div className="state-details-card">
              <div className="state-details-header">
                <div className="state-title">
                  <h2>{selectedStateData.name}</h2>
                  <span 
                    className="compliance-badge"
                    style={{ background: getComplianceInfo(selectedStateData.complianceLevel).color }}
                  >
                    {getComplianceInfo(selectedStateData.complianceLevel).label}
                  </span>
                </div>
                <a 
                  href={selectedStateData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="state-link"
                >
                  Official Website <ExternalLink size={16} />
                </a>
              </div>

              <div className="requirements-grid">
                <div className="requirement-box">
                  <div className="req-icon">
                    <Clock size={24} />
                  </div>
                  <div className="req-content">
                    <span className="req-label">Annual Hours</span>
                    <span className="req-value">
                      {selectedStateData.hoursRequired 
                        ? `${selectedStateData.hoursRequired} hours` 
                        : 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="requirement-box">
                  <div className="req-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="req-content">
                    <span className="req-label">School Days</span>
                    <span className="req-value">
                      {selectedStateData.daysRequired 
                        ? `${selectedStateData.daysRequired} days` 
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedStateData.notes && (
                <div className="state-notes">
                  <AlertCircle size={18} />
                  <p>{selectedStateData.notes}</p>
                </div>
              )}

              {selectedStateData.subjects && selectedStateData.subjects.length > 0 && (
                <div className="required-subjects">
                  <h4><BookOpen size={18} /> Required Subjects</h4>
                  <div className="subjects-tags">
                    {selectedStateData.subjects.map((subject, i) => (
                      <span key={i} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Feature: Recommended Hours */}
              <div className={`recommended-hours ${!isPremium ? 'locked' : ''}`}>
                <div className="recommended-header">
                  <h4>
                    <Sparkles size={18} />
                    Recommended Hours Breakdown
                  </h4>
                  {!isPremium && (
                    <span className="premium-tag">
                      <Lock size={12} /> Premium
                    </span>
                  )}
                </div>

                {selectedStateData.recommendedHours && isPremium ? (
                  <div className="hours-breakdown">
                    {Object.entries(selectedStateData.recommendedHours).map(([subject, hours]) => (
                      <div key={subject} className="hours-item">
                        <span className="hours-subject">{subject}</span>
                        <span className="hours-value">{hours} hrs</span>
                      </div>
                    ))}
                    <div className="hours-total">
                      <span>Total</span>
                      <span>
                        {Object.values(selectedStateData.recommendedHours).reduce((a, b) => a + b, 0)} hrs
                      </span>
                    </div>
                  </div>
                ) : selectedStateData.recommendedHours && !isPremium ? (
                  <div className="upgrade-prompt">
                    <p>Upgrade to Premium to see recommended hour breakdowns and auto-fill subjects when adding children.</p>
                    <button className="btn-tracker btn-primary" onClick={upgradeToPremium}>
                      <Sparkles size={16} />
                      Upgrade to Premium
                    </button>
                  </div>
                ) : (
                  <p className="no-data">Hour breakdown not available for this state. We recommend following general guidelines.</p>
                )}
              </div>

              {/* Premium Auto-Setup Feature */}
              {isPremium && selectedStateData.recommendedHours && (
                <div className="auto-setup-feature">
                  <Check size={20} />
                  <div>
                    <strong>Premium Benefit Active!</strong>
                    <p>When you add a new child, their subjects will be automatically configured with {selectedStateData.name}'s recommended hours.</p>
                  </div>
                </div>
              )}

              <div className="disclaimer">
                <AlertCircle size={16} />
                <p>
                  <strong>Disclaimer:</strong> This information is provided as a general guide only. 
                  Homeschool laws change frequently. Always verify current requirements with your 
                  state's department of education or consult with a homeschool legal organization.
                </p>
              </div>
            </div>
          ) : (
            <div className="no-state-selected">
              <MapPin size={48} />
              <h3>Select a State</h3>
              <p>Choose your state from the list to view homeschool requirements and recommendations.</p>
            </div>
          )}
        </div>
      </div>

      <div className="resources-section">
        <h3>Helpful Resources</h3>
        <div className="resources-grid">
          <a href="https://hslda.org/legal" target="_blank" rel="noopener noreferrer" className="resource-card">
            <h4>HSLDA</h4>
            <p>Home School Legal Defense Association - state law summaries</p>
            <ExternalLink size={16} />
          </a>
          <a href="https://a2zhomeschooling.com/laws/" target="_blank" rel="noopener noreferrer" className="resource-card">
            <h4>A2Z Homeschooling</h4>
            <p>Comprehensive homeschool law information by state</p>
            <ExternalLink size={16} />
          </a>
          <a href="https://responsiblehomeschooling.org/state-by-state/" target="_blank" rel="noopener noreferrer" className="resource-card">
            <h4>CRHE</h4>
            <p>Coalition for Responsible Home Education state guides</p>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default StateRequirements

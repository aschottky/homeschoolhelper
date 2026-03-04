import { useState } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { STATES_LIST, STATE_REQUIREMENTS } from '../../data/stateRequirements'
import { Plus, Trash2, Edit2, Check, X, Settings, ChevronDown, ChevronUp, MapPin, Sparkles, Lock, Calendar, GraduationCap, User, AlertTriangle } from 'lucide-react'
import './ChildManager.css'

// Calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Format age display
const formatAge = (birthDate) => {
  const age = calculateAge(birthDate)
  if (age === null) return null
  
  if (age === 0) {
    const today = new Date()
    const birth = new Date(birthDate)
    const monthDiff = today.getMonth() - birth.getMonth() + (today.getFullYear() - birth.getFullYear()) * 12
    if (monthDiff === 0) {
      const dayDiff = today.getDate() - birth.getDate()
      return dayDiff === 0 ? 'Newborn' : `${dayDiff} day${dayDiff !== 1 ? 's' : ''} old`
    }
    return `${monthDiff} month${monthDiff !== 1 ? 's' : ''} old`
  }
  
  return `${age} year${age !== 1 ? 's' : ''} old`
}

function ChildManager() {
  const { 
    children, 
    userState,
    setUserState,
    addChild, 
    updateChild, 
    deleteChild,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectHours
  } = useData()

  const { isPremium, upgradeToPremium } = useSubscription()

  const [newChildName, setNewChildName] = useState('')
  const [newChildState, setNewChildState] = useState(userState || '')
  const [newChildBirthDate, setNewChildBirthDate] = useState('')
  const [newChildGrade, setNewChildGrade] = useState('')
  const [useStateHours, setUseStateHours] = useState(isPremium)
  const [trackHours, setTrackHours] = useState(true) // Default to tracking hours
  const [showTrackingPrompt, setShowTrackingPrompt] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [editChildData, setEditChildData] = useState({ name: '', birthDate: '', gradeLevel: '' })
  const [expandedChild, setExpandedChild] = useState(null)
  const [newSubject, setNewSubject] = useState({ name: '', requiredHours: '', color: '#8FB39A', schoolworkReminderFrequency: '' })
  const [editingSubject, setEditingSubject] = useState(null)

  // Check if child is under mandatory tracking age (typically 6-7 years old)
  const isUnderMandatoryTrackingAge = () => {
    if (!newChildBirthDate || !newChildState) return false
    
    const age = calculateAge(newChildBirthDate)
    if (age === null) return false
    
    // Most states require tracking starting at age 6 or 7 (compulsory education age)
    // Default to 6 if state doesn't specify
    const mandatoryAge = STATE_REQUIREMENTS[newChildState]?.mandatoryTrackingAge || 6
    return age < mandatoryAge
  }

  const handleAddChild = async (e) => {
    e.preventDefault()
    if (!newChildName.trim()) return

    // Check if we need to prompt about tracking
    const underAge = isUnderMandatoryTrackingAge()
    if (underAge && !showTrackingPrompt) {
      setShowTrackingPrompt(true)
      return
    }

    // Create child with or without subjects based on trackHours
    const child = await addChild(
      newChildName.trim(), 
      trackHours && isPremium && useStateHours, 
      newChildState || null,
      newChildBirthDate || null,
      newChildGrade || null,
      trackHours // Pass whether to create subjects
    )
    
    setNewChildName('')
    setNewChildBirthDate('')
    setNewChildGrade('')
    setTrackHours(true) // Reset for next child
    setShowTrackingPrompt(false)
    
    if (newChildState && !userState) {
      setUserState(newChildState)
    }
    
    if (trackHours) {
      setExpandedChild(child.id)
    }
  }

  const handleUpdateChild = (childId) => {
    if (editChildData.name.trim()) {
      updateChild(childId, {
        name: editChildData.name.trim(),
        birthDate: editChildData.birthDate || null,
        gradeLevel: editChildData.gradeLevel || null
      })
      setEditingChild(null)
      setEditChildData({ name: '', birthDate: '', gradeLevel: '' })
    }
  }

  const handleAddSubject = (childId) => {
    if (newSubject.name.trim() && newSubject.requiredHours) {
      addSubject(
        childId, 
        newSubject.name.trim(), 
        newSubject.requiredHours, 
        newSubject.color,
        newSubject.schoolworkReminderFrequency || null
      )
      setNewSubject({ name: '', requiredHours: '', color: '#8FB39A', schoolworkReminderFrequency: '' })
    }
  }

  const selectedStateData = newChildState ? STATE_REQUIREMENTS[newChildState] : null
  const hasRecommendedHours = selectedStateData?.recommendedHours

  const colorOptions = [
    '#2D5A4A', '#E8A87C', '#8FB39A', '#D4896A', '#5A8F7B', '#C4A484',
    '#6B8E7B', '#B58863', '#4A7C6B', '#D9A678'
  ]

  return (
    <div className="child-manager">
      <div className="tracker-section">
        <div className="tracker-section-header">
          <h2>Manage Children</h2>
        </div>

        <form onSubmit={handleAddChild} className="add-child-form">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Child's Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter child's name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                <MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                State
              </label>
              <select
                className="form-select"
                value={newChildState}
                onChange={(e) => setNewChildState(e.target.value)}
              >
                <option value="">Select state</option>
                {STATES_LIST.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Birth Date
              </label>
              <input
                type="date"
                className="form-input"
                value={newChildBirthDate}
                onChange={(e) => setNewChildBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                <GraduationCap size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Grade Level
              </label>
              <select
                className="form-select"
                value={newChildGrade}
                onChange={(e) => setNewChildGrade(e.target.value)}
              >
                <option value="">Select grade</option>
                <option value="Early Learner">Early Learner</option>
                <option value="Pre-K">Pre-K</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="1st Grade">1st Grade</option>
                <option value="2nd Grade">2nd Grade</option>
                <option value="3rd Grade">3rd Grade</option>
                <option value="4th Grade">4th Grade</option>
                <option value="5th Grade">5th Grade</option>
                <option value="6th Grade">6th Grade</option>
                <option value="7th Grade">7th Grade</option>
                <option value="8th Grade">8th Grade</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
              </select>
            </div>
          </div>

          {newChildState && hasRecommendedHours && (
            <div className={`state-hours-option ${!isPremium ? 'locked' : ''}`}>
              {isPremium ? (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useStateHours}
                    onChange={(e) => setUseStateHours(e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  <span>
                    <strong>Auto-fill {selectedStateData.name}'s recommended hours</strong>
                    <small>Subjects will be pre-configured with state-specific hour requirements</small>
                  </span>
                  <Sparkles size={16} className="premium-icon" />
                </label>
              ) : (
                <div className="premium-upsell">
                  <div className="upsell-content">
                    <Lock size={18} />
                    <div>
                      <strong>Premium Feature</strong>
                      <p>Upgrade to automatically configure subjects with {selectedStateData.name}'s recommended hours</p>
                    </div>
                  </div>
                  <button type="button" className="btn-tracker btn-primary btn-sm" onClick={upgradeToPremium}>
                    <Sparkles size={14} />
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          )}

          {newChildState && hasRecommendedHours && isPremium && useStateHours && (
            <div className="preview-hours">
              <h4>Hours that will be set:</h4>
              <div className="preview-grid">
                {Object.entries(selectedStateData.recommendedHours).map(([subject, hours]) => (
                  <div key={subject} className="preview-item">
                    <span>{subject}</span>
                    <span>{hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

              <button type="submit" className="btn-tracker btn-primary" disabled={!newChildName.trim()}>
                <Plus size={20} />
                Add Child
              </button>
            </form>

            {/* Tracking Prompt Modal */}
            {showTrackingPrompt && (
              <div className="tracking-prompt-modal">
                <div className="tracking-prompt-content">
                  <div className="tracking-prompt-header">
                    <AlertTriangle size={24} className="prompt-icon" />
                    <h3>Track School Hours?</h3>
                  </div>
                  <div className="tracking-prompt-body">
                    <p>
                      <strong>{newChildName}</strong> is under {STATE_REQUIREMENTS[newChildState]?.name || 'your state'}'s mandatory tracking age 
                      ({STATE_REQUIREMENTS[newChildState]?.mandatoryTrackingAge || 6} years old).
                    </p>
                    <p>
                      Would you like to track school hours for this child? You can still create their profile to track 
                      outdoor hours and read-aloud books even if you choose not to track school hours.
                    </p>
                    <div className="tracking-options">
                      <label className="tracking-option">
                        <input
                          type="radio"
                          name="trackHours"
                          checked={trackHours}
                          onChange={() => setTrackHours(true)}
                        />
                        <span className="radio-custom" />
                        <div>
                          <strong>Yes, track school hours</strong>
                          <small>Subjects and required hours will be set up</small>
                        </div>
                      </label>
                      <label className="tracking-option">
                        <input
                          type="radio"
                          name="trackHours"
                          checked={!trackHours}
                          onChange={() => setTrackHours(false)}
                        />
                        <span className="radio-custom" />
                        <div>
                          <strong>No, skip hour tracking</strong>
                          <small>Profile will be created for outdoor hours and read-alouds only</small>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="tracking-prompt-actions">
                    <button
                      type="button"
                      className="btn-tracker btn-secondary"
                      onClick={() => {
                        setShowTrackingPrompt(false)
                        setTrackHours(true)
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-tracker btn-primary"
                      onClick={async () => {
                        const child = await addChild(
                          newChildName.trim(), 
                          trackHours && isPremium && useStateHours, 
                          newChildState || null,
                          newChildBirthDate || null,
                          newChildGrade || null,
                          trackHours
                        )
                        
                        setNewChildName('')
                        setNewChildBirthDate('')
                        setNewChildGrade('')
                        setTrackHours(true)
                        setShowTrackingPrompt(false)
                        
                        if (newChildState && !userState) {
                          setUserState(newChildState)
                        }
                        
                        if (trackHours) {
                          setExpandedChild(child.id)
                        }
                      }}
                    >
                      <Check size={18} />
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

      {children.length === 0 ? (
        <div className="tracker-section">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Plus size={40} />
            </div>
            <h3>No children added yet</h3>
            <p>Add your first child above to start tracking their homeschool hours.</p>
          </div>
        </div>
      ) : (
        <div className="children-list">
          {children.map(child => (
            <div key={child.id} className="tracker-section child-section">
              <div className="child-row">
                {editingChild === child.id ? (
                  <div className="edit-child-form">
                    <div className="form-row">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Name"
                        value={editChildData.name}
                        onChange={(e) => setEditChildData({ ...editChildData, name: e.target.value })}
                        autoFocus
                      />
                      <input
                        type="date"
                        className="form-input"
                        placeholder="Birth Date"
                        value={editChildData.birthDate || ''}
                        onChange={(e) => setEditChildData({ ...editChildData, birthDate: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <select
                        className="form-select"
                        value={editChildData.gradeLevel || ''}
                        onChange={(e) => setEditChildData({ ...editChildData, gradeLevel: e.target.value })}
                      >
                        <option value="">Select grade</option>
                        <option value="Early Learner">Early Learner</option>
                        <option value="Pre-K">Pre-K</option>
                        <option value="Kindergarten">Kindergarten</option>
                        <option value="1st Grade">1st Grade</option>
                        <option value="2nd Grade">2nd Grade</option>
                        <option value="3rd Grade">3rd Grade</option>
                        <option value="4th Grade">4th Grade</option>
                        <option value="5th Grade">5th Grade</option>
                        <option value="6th Grade">6th Grade</option>
                        <option value="7th Grade">7th Grade</option>
                        <option value="8th Grade">8th Grade</option>
                        <option value="9th Grade">9th Grade</option>
                        <option value="10th Grade">10th Grade</option>
                        <option value="11th Grade">11th Grade</option>
                        <option value="12th Grade">12th Grade</option>
                      </select>
                    </div>
                    <div className="edit-actions">
                      <button 
                        className="btn-tracker btn-primary btn-sm"
                        onClick={() => handleUpdateChild(child.id)}
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button 
                        className="btn-tracker btn-secondary btn-sm"
                        onClick={() => {
                          setEditingChild(null)
                          setEditChildData({ name: '', birthDate: '', gradeLevel: '' })
                        }}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="child-name-row">
                      <div className="child-avatar-sm">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="child-name-info">
                        <h3>{child.name}</h3>
                        <div className="child-meta">
                          {child.birthDate && (
                            <span className="child-meta-item">
                              <User size={12} />
                              {formatAge(child.birthDate)}
                            </span>
                          )}
                          {child.gradeLevel && (
                            <span className="child-meta-item">
                              <GraduationCap size={12} />
                              {child.gradeLevel}
                            </span>
                          )}
                          {child.stateCode && (
                            <span className="child-state-badge">
                              <MapPin size={12} />
                              {STATE_REQUIREMENTS[child.stateCode]?.name || child.stateCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="subject-count">{child.subjects.length} subjects</span>
                    </div>
                    <div className="child-actions">
                      <button 
                        className="btn-tracker btn-secondary btn-icon-only"
                        onClick={() => {
                          setEditingChild(child.id)
                          setEditChildData({ 
                            name: child.name,
                            birthDate: child.birthDate || '',
                            gradeLevel: child.gradeLevel || ''
                          })
                        }}
                        title="Edit child info"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="btn-tracker btn-secondary btn-icon-only"
                        onClick={() => setExpandedChild(expandedChild === child.id ? null : child.id)}
                        title="Manage subjects"
                      >
                        <Settings size={18} />
                        {expandedChild === child.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button 
                        className="btn-tracker btn-danger btn-icon-only"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${child.name}? All their hours will be removed.`)) {
                            deleteChild(child.id)
                          }
                        }}
                        title="Delete child"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {expandedChild === child.id && (
                <div className="subjects-manager">
                  <h4>Subjects & Required Hours</h4>
                  
                  <div className="subjects-list">
                    {child.subjects.map(subject => (
                      <div key={subject.id} className="subject-row">
                        {editingSubject === subject.id ? (
                          <div className="edit-subject-form">
                            <input
                              type="text"
                              className="form-input"
                              defaultValue={subject.name}
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  updateSubject(child.id, subject.id, { name: e.target.value.trim() })
                                }
                              }}
                            />
                            <input
                              type="number"
                              className="form-input hours-input"
                              defaultValue={subject.requiredHours}
                              min="1"
                              onBlur={(e) => {
                                if (e.target.value) {
                                  updateSubject(child.id, subject.id, { requiredHours: Number(e.target.value) })
                                }
                              }}
                            />
                            <select
                              className="form-select reminder-select"
                              value={subject.schoolworkReminderFrequency || ''}
                              onChange={(e) => {
                                updateSubject(child.id, subject.id, { 
                                  schoolworkReminderFrequency: e.target.value || null 
                                })
                              }}
                            >
                              <option value="">No reminder</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Biweekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            <div className="color-picker-inline">
                              {colorOptions.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`color-option ${subject.color === color ? 'active' : ''}`}
                                  style={{ background: color }}
                                  onClick={() => updateSubject(child.id, subject.id, { color })}
                                />
                              ))}
                            </div>
                            <button 
                              className="btn-tracker btn-primary btn-sm"
                              onClick={() => setEditingSubject(null)}
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="subject-info">
                              <span className="subject-color" style={{ background: subject.color }} />
                              <span className="subject-name">{subject.name}</span>
                              <span className="subject-required">{subject.requiredHours} hrs required</span>
                              <span className="subject-logged">
                                {getSubjectHours(child.id, subject.id).toFixed(1)} hrs logged
                              </span>
                              {subject.schoolworkReminderFrequency && (
                                <span className="subject-reminder-badge">
                                  📸 {subject.schoolworkReminderFrequency === 'weekly' ? 'Weekly' : 
                                       subject.schoolworkReminderFrequency === 'biweekly' ? 'Biweekly' : 'Monthly'} reminder
                                </span>
                              )}
                            </div>
                            <div className="subject-actions">
                              <button 
                                className="btn-tracker btn-secondary btn-sm"
                                onClick={() => setEditingSubject(subject.id)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="btn-tracker btn-danger btn-sm"
                                onClick={() => {
                                  if (confirm(`Delete ${subject.name}? All logged hours for this subject will be removed.`)) {
                                    deleteSubject(child.id, subject.id)
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="add-subject-form">
                    <h5>Add New Subject</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Subject name"
                          value={newSubject.name}
                          onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ maxWidth: '150px' }}>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Hours"
                          min="1"
                          value={newSubject.requiredHours}
                          onChange={(e) => setNewSubject({ ...newSubject, requiredHours: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Schoolwork Reminder</label>
                      <select
                        className="form-select"
                        value={newSubject.schoolworkReminderFrequency}
                        onChange={(e) => setNewSubject({ ...newSubject, schoolworkReminderFrequency: e.target.value })}
                      >
                        <option value="">No reminder</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="color-picker">
                      <span>Color:</span>
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${newSubject.color === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => setNewSubject({ ...newSubject, color })}
                        />
                      ))}
                    </div>
                    <button 
                      className="btn-tracker btn-primary"
                      onClick={() => handleAddSubject(child.id)}
                      disabled={!newSubject.name.trim() || !newSubject.requiredHours}
                    >
                      <Plus size={18} />
                      Add Subject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChildManager

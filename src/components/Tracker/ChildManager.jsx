import { useState } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { STATES_LIST, STATE_REQUIREMENTS } from '../../data/stateRequirements'
import { Plus, Trash2, Edit2, Check, X, Settings, ChevronDown, ChevronUp, MapPin, Sparkles, Lock } from 'lucide-react'
import './ChildManager.css'

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
  const [useStateHours, setUseStateHours] = useState(isPremium)
  const [editingChild, setEditingChild] = useState(null)
  const [editChildName, setEditChildName] = useState('')
  const [expandedChild, setExpandedChild] = useState(null)
  const [newSubject, setNewSubject] = useState({ name: '', requiredHours: '', color: '#8FB39A' })
  const [editingSubject, setEditingSubject] = useState(null)

  const handleAddChild = (e) => {
    e.preventDefault()
    if (newChildName.trim()) {
      const child = addChild(
        newChildName.trim(), 
        isPremium && useStateHours, 
        newChildState || null
      )
      setNewChildName('')
      if (newChildState && !userState) {
        setUserState(newChildState)
      }
      setExpandedChild(child.id)
    }
  }

  const handleUpdateChild = (childId) => {
    if (editChildName.trim()) {
      updateChild(childId, editChildName.trim())
      setEditingChild(null)
      setEditChildName('')
    }
  }

  const handleAddSubject = (childId) => {
    if (newSubject.name.trim() && newSubject.requiredHours) {
      addSubject(childId, newSubject.name.trim(), newSubject.requiredHours, newSubject.color)
      setNewSubject({ name: '', requiredHours: '', color: '#8FB39A' })
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
              <label>Child's Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter child's name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
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
                    <input
                      type="text"
                      className="form-input"
                      value={editChildName}
                      onChange={(e) => setEditChildName(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="btn-tracker btn-primary btn-sm"
                      onClick={() => handleUpdateChild(child.id)}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="btn-tracker btn-secondary btn-sm"
                      onClick={() => {
                        setEditingChild(null)
                        setEditChildName('')
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="child-name-row">
                      <div className="child-avatar-sm">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="child-name-info">
                        <h3>{child.name}</h3>
                        {child.stateCode && (
                          <span className="child-state-badge">
                            <MapPin size={12} />
                            {STATE_REQUIREMENTS[child.stateCode]?.name || child.stateCode}
                          </span>
                        )}
                      </div>
                      <span className="subject-count">{child.subjects.length} subjects</span>
                    </div>
                    <div className="child-actions">
                      <button 
                        className="btn-tracker btn-secondary btn-icon-only"
                        onClick={() => {
                          setEditingChild(child.id)
                          setEditChildName(child.name)
                        }}
                        title="Edit name"
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

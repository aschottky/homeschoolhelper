import { useState, useMemo } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { Clock, Check, BookOpen, Users } from 'lucide-react'
import './LogHours.css'

function LogHours() {
  const { children, logHours, getSubjectHours } = useData()
  const [selectedChildren, setSelectedChildren] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)

  // Get selected children data
  const selectedChildrenData = useMemo(() => {
    return children.filter(c => selectedChildren.includes(c.id))
  }, [children, selectedChildren])

  // Get common subjects across all selected children
  const commonSubjects = useMemo(() => {
    if (selectedChildrenData.length === 0) return []
    if (selectedChildrenData.length === 1) return selectedChildrenData[0].subjects
    
    // Find subjects that exist for all selected children (by name)
    const firstChildSubjects = selectedChildrenData[0].subjects.map(s => s.name)
    const common = firstChildSubjects.filter(subjectName => 
      selectedChildrenData.every(child => 
        child.subjects.some(s => s.name === subjectName)
      )
    )
    
    // Return subject objects from the first child that match common names
    return selectedChildrenData[0].subjects.filter(s => common.includes(s.name))
  }, [selectedChildrenData])

  // Toggle child selection
  const toggleChild = (childId) => {
    setSelectedChildren(prev => 
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    )
    // Clear subject if no children selected or subject not available for new selection
    if (selectedChildren.includes(childId) && selectedChildren.length === 1) {
      setSelectedSubject('')
    } else if (selectedSubject) {
      // Check if subject is still valid for remaining children
      const remaining = selectedChildren.includes(childId)
        ? selectedChildren.filter(id => id !== childId)
        : [...selectedChildren, childId]
      const remainingData = children.filter(c => remaining.includes(c.id))
      const stillValid = remainingData.some(child =>
        child.subjects.some(s => s.id === selectedSubject)
      )
      if (!stillValid) {
        setSelectedSubject('')
      }
    }
  }

  // Select all children
  const selectAll = () => {
    setSelectedChildren(children.map(c => c.id))
  }

  // Deselect all children
  const deselectAll = () => {
    setSelectedChildren([])
    setSelectedSubject('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const totalHours = (Number(hours) || 0) + (Number(minutes) || 0) / 60
    
    if (selectedChildren.length > 0 && selectedSubject && totalHours > 0) {
      // Get the subject name from the selected subject
      const selectedSubjectName = selectedChildrenData.length === 1
        ? selectedChildrenData[0].subjects.find(s => s.id === selectedSubject)?.name
        : commonSubjects.find(cs => cs.id === selectedSubject)?.name
      
      if (!selectedSubjectName) return
      
      // Log hours for each selected child
      // Find the subject ID for each child by matching the subject name
      const promises = selectedChildrenData.map(async (child) => {
        const subject = child.subjects.find(s => s.name === selectedSubjectName)
        if (subject) {
          return logHours(child.id, subject.id, totalHours, date, notes)
        }
        return null
      })

      await Promise.all(promises.filter(p => p !== null))
      
      // Reset form but keep children selected
      setSelectedSubject('')
      setHours('')
      setMinutes('')
      setNotes('')
      setSuccess(true)
      
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  // Filter to only show children with subjects
  const childrenWithSubjects = children.filter(child => child.subjects && child.subjects.length > 0)

  if (childrenWithSubjects.length === 0) {
    return (
      <div className="log-hours">
        <div className="tracker-section">
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={40} />
            </div>
            <h3>No children with subjects to log hours for</h3>
            <p>
              {children.length === 0 
                ? 'Add children first in the Children tab to start logging their study hours.'
                : 'Add subjects to children in the Children tab to start logging hours. Children without subjects can still track outdoor hours and read-aloud books.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="log-hours">
      <div className="tracker-section">
        <div className="tracker-section-header">
          <h2>Log Study Hours</h2>
        </div>

        {success && (
          <div className="success-message">
            <Check size={20} />
            {selectedChildren.length > 1 
              ? `Hours logged successfully for ${selectedChildren.length} children!`
              : 'Hours logged successfully!'
            }
          </div>
        )}

        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-group">
            <div className="children-selector-header">
              <label>Select Children</label>
              <div className="select-actions">
                <button 
                  type="button" 
                  className="select-all-btn"
                  onClick={selectAll}
                  disabled={selectedChildren.length === children.length}
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  className="deselect-all-btn"
                  onClick={deselectAll}
                  disabled={selectedChildren.length === 0}
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="children-checkbox-grid">
              {childrenWithSubjects.map(child => (
                <label key={child.id} className="child-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedChildren.includes(child.id)}
                    onChange={() => toggleChild(child.id)}
                  />
                  <span className="checkbox-custom" />
                  <span className="child-name">{child.name}</span>
                  {child.gradeLevel && (
                    <span className="child-grade">{child.gradeLevel}</span>
                  )}
                </label>
              ))}
            </div>
            {selectedChildren.length === 0 && (
              <p className="form-hint">Select one or more children to log hours</p>
            )}
          </div>

          <div className="form-group">
            <label>Subject</label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              disabled={selectedChildren.length === 0}
            >
              <option value="">Select a subject</option>
              {selectedChildrenData.length === 1 ? (
                // Single child selected - show all their subjects
                selectedChildrenData[0]?.subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))
              ) : (
                // Multiple children selected - show only common subjects
                commonSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))
              )}
            </select>
            {selectedChildren.length > 1 && commonSubjects.length === 0 && (
              <p className="form-hint">No common subjects found. Select children with matching subjects.</p>
            )}
            {selectedChildren.length > 1 && commonSubjects.length > 0 && (
              <p className="form-hint">Showing subjects that all selected children have in common.</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hours</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Minutes</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="What did they work on today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-tracker btn-primary btn-lg"
            disabled={selectedChildren.length === 0 || !selectedSubject || (!hours && !minutes)}
          >
            <Clock size={20} />
            {selectedChildren.length > 1 ? (
              <>Log Hours for {selectedChildren.length} Children</>
            ) : (
              <>Log Hours</>
            )}
          </button>
        </form>
      </div>

      {selectedChildrenData.length > 0 && selectedSubject && (
        <div className="tracker-section subject-preview">
          <div className="preview-header">
            <h3>Current Progress</h3>
            {selectedChildrenData.length > 1 && (
              <p className="preview-subtitle">Showing progress for {selectedChildrenData.length} children</p>
            )}
          </div>
          {selectedChildrenData.length === 1 ? (
            // Single child preview
            (() => {
              const child = selectedChildrenData[0]
              const subject = child.subjects.find(s => s.id === selectedSubject)
              if (!subject) return null
              const logged = getSubjectHours(child.id, selectedSubject)
              const progress = Math.min(100, (logged / subject.requiredHours) * 100)
              
              return (
                <div className="preview-content">
                  <div className="preview-subject">
                    <span className="subject-color" style={{ background: subject.color }} />
                    <span className="subject-name">{subject.name}</span>
                  </div>
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span className="stat-value">{logged.toFixed(1)}</span>
                      <span className="stat-label">Hours Logged</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-value">{subject.requiredHours}</span>
                      <span className="stat-label">Hours Required</span>
                    </div>
                    <div className="preview-stat">
                      <span className="stat-value">{(subject.requiredHours - logged).toFixed(1)}</span>
                      <span className="stat-label">Hours Remaining</span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '16px' }}>
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%`, background: subject.color }}
                    />
                  </div>
                  <p className="progress-text">{progress.toFixed(1)}% complete</p>
                </div>
              )
            })()
          ) : (
            // Multiple children preview
            <div className="multi-child-preview">
              {(() => {
                const selectedSubjectName = commonSubjects.find(cs => cs.id === selectedSubject)?.name
                if (!selectedSubjectName) return null
                
                return selectedChildrenData.map(child => {
                  const subject = child.subjects.find(s => s.name === selectedSubjectName)
                  if (!subject) return null
                  const logged = getSubjectHours(child.id, subject.id)
                  const progress = Math.min(100, (logged / subject.requiredHours) * 100)
                  
                  return (
                    <div key={child.id} className="child-progress-item">
                      <div className="child-progress-header">
                        <span className="child-progress-name">{child.name}</span>
                        <span className="child-progress-percent">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '12px' }}>
                        <div 
                          className="progress-fill"
                          style={{ width: `${progress}%`, background: subject.color }}
                        />
                      </div>
                      <div className="child-progress-stats">
                        <span>{logged.toFixed(1)} / {subject.requiredHours} hours</span>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      )}

      <div className="quick-log">
        <h3>Quick Log</h3>
        <p>Click a subject to quickly log time for today</p>
        <div className="quick-log-grid">
          {children.map(child => (
            <div key={child.id} className="quick-log-child">
              <h4>{child.name}</h4>
              <div className="quick-log-subjects">
                {child.subjects.map(subject => {
                  const logged = getSubjectHours(child.id, subject.id)
                  const progress = Math.min(100, (logged / subject.requiredHours) * 100)
                  
                  return (
                    <button
                      key={subject.id}
                      className="quick-log-btn"
                      onClick={() => {
                        if (!selectedChildren.includes(child.id)) {
                          setSelectedChildren([child.id])
                        }
                        setSelectedSubject(subject.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <span className="subject-color" style={{ background: subject.color }} />
                      <span className="subject-name">{subject.name}</span>
                      <span className="subject-progress">{progress.toFixed(0)}%</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LogHours

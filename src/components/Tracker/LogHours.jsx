import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { Clock, Check, BookOpen, Play, Pause, Square, AlertCircle, ShieldCheck, Timer } from 'lucide-react'
import './LogHours.css'

const REMINDER_INTERVAL_SEC = 30 * 60 // 30 minutes

function formatTimerDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function LogHours() {
  const { children, logHours, getSubjectHours } = useData()
  const [selectedChildren, setSelectedChildren] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)

  // ── Timer state ──────────────────────────────────────────────
  const [timerChild, setTimerChild] = useState('')
  const [timerSubject, setTimerSubject] = useState('')
  const [timerState, setTimerState] = useState('idle') // 'idle' | 'running' | 'paused'
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [timerNotes, setTimerNotes] = useState('')

  const intervalRef = useRef(null)
  const reminderRef = useRef(null)
  const lastReminderAt = useRef(0)

  const tick = useCallback(() => {
    setTimerSeconds(s => {
      const next = s + 1
      // Fire 30-min reminder
      if (next - lastReminderAt.current >= REMINDER_INTERVAL_SEC && next > 0) {
        lastReminderAt.current = next
        setShowReminderModal(true)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerState, tick])

  const startTimer = () => {
    if (!timerChild || !timerSubject) return
    setTimerState('running')
  }

  const pauseTimer = () => setTimerState('paused')

  const resumeTimer = () => setTimerState('running')

  const stopTimer = () => {
    setTimerState('paused')
    if (timerSeconds > 0) setShowApprovalModal(true)
  }

  const cancelTimer = () => {
    setTimerState('idle')
    setTimerSeconds(0)
    lastReminderAt.current = 0
    setShowApprovalModal(false)
    setShowReminderModal(false)
    setTimerNotes('')
  }

  const approveAndLog = async () => {
    const totalHours = timerSeconds / 3600
    if (totalHours < 1 / 60) return // less than 1 minute, skip
    const child = children.find(c => c.id === timerChild)
    const subject = child?.subjects.find(s => s.id === timerSubject)
    if (!child || !subject) return
    await logHours(child.id, subject.id, totalHours, new Date().toISOString().split('T')[0], timerNotes)
    setShowApprovalModal(false)
    cancelTimer()
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  // Subjects available for selected timer child
  const timerChildData = children.find(c => c.id === timerChild)
  const timerSubjectData = timerChildData?.subjects.find(s => s.id === timerSubject)

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

      {/* ── 30-minute Check-In Modal ── */}
      {showReminderModal && (
        <div className="timer-modal-overlay">
          <div className="timer-modal reminder-modal">
            <div className="timer-modal-icon">⏰</div>
            <h3>Still working?</h3>
            <p>
              You've been studying for <strong>{Math.floor(timerSeconds / 60)} minutes</strong>.
              {timerChildData && timerSubjectData && (
                <> Great job, <strong>{timerChildData.name}</strong>!</>
              )}
            </p>
            <div className="timer-modal-actions">
              <button
                className="btn-tracker btn-primary"
                onClick={() => setShowReminderModal(false)}
              >
                <Play size={16} /> Yes, keep going!
              </button>
              <button
                className="btn-tracker btn-secondary"
                onClick={() => { setShowReminderModal(false); stopTimer() }}
              >
                <Square size={16} /> I'm done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Parent Approval Modal ── */}
      {showApprovalModal && (
        <div className="timer-modal-overlay">
          <div className="timer-modal approval-modal">
            <div className="approval-icon">
              <ShieldCheck size={40} />
            </div>
            <h3>Parent Approval Required</h3>
            <div className="approval-summary">
              <div className="approval-time">{formatTimerDisplay(timerSeconds)}</div>
              <p>
                {timerChildData?.name} worked on <strong>{timerSubjectData?.name}</strong>
              </p>
            </div>
            <p className="approval-instructions">
              Please hand the device to a parent or guardian to approve logging these hours.
            </p>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label>Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="What did they work on?"
                value={timerNotes}
                onChange={e => setTimerNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="timer-modal-actions">
              <button className="btn-tracker btn-primary btn-lg approval-btn" onClick={approveAndLog}>
                <ShieldCheck size={20} /> Approve &amp; Log Hours
              </button>
              <button className="btn-tracker btn-secondary" onClick={() => setShowApprovalModal(false)}>
                Not yet — keep timing
              </button>
              <button className="btn-tracker btn-danger btn-sm" onClick={cancelTimer}>
                Cancel &amp; discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Study Timer ── */}
      <div className="tracker-section timer-section">
        <div className="tracker-section-header">
          <Timer size={20} />
          <h2>Study Timer</h2>
        </div>
        <p className="timer-intro">Start the timer when your child begins studying. A parent will approve the hours when done.</p>

        {timerState === 'idle' ? (
          <div className="timer-setup">
            <div className="form-row">
              <div className="form-group">
                <label>Child</label>
                <select
                  className="form-select"
                  value={timerChild}
                  onChange={e => { setTimerChild(e.target.value); setTimerSubject('') }}
                >
                  <option value="">Select child…</option>
                  {childrenWithSubjects.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select
                  className="form-select"
                  value={timerSubject}
                  onChange={e => setTimerSubject(e.target.value)}
                  disabled={!timerChild}
                >
                  <option value="">Select subject…</option>
                  {timerChildData?.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="btn-tracker btn-primary btn-lg timer-start-btn"
              onClick={startTimer}
              disabled={!timerChild || !timerSubject}
            >
              <Play size={20} /> Start Timer
            </button>
          </div>
        ) : (
          <div className="timer-running">
            <div className={`timer-display ${timerState === 'running' ? 'ticking' : 'paused'}`}>
              {formatTimerDisplay(timerSeconds)}
            </div>
            <div className="timer-context">
              {timerChildData && (
                <span className="timer-child-badge" style={{ background: timerChildData.color || 'var(--forest)' }}>
                  {timerChildData.name}
                </span>
              )}
              {timerSubjectData && (
                <span className="timer-subject-badge" style={{ borderColor: timerSubjectData.color }}>
                  <span className="subject-dot" style={{ background: timerSubjectData.color }} />
                  {timerSubjectData.name}
                </span>
              )}
            </div>
            <div className="timer-controls">
              {timerState === 'running' ? (
                <button className="btn-tracker btn-secondary timer-btn" onClick={pauseTimer}>
                  <Pause size={18} /> Pause
                </button>
              ) : (
                <button className="btn-tracker btn-primary timer-btn" onClick={resumeTimer}>
                  <Play size={18} /> Resume
                </button>
              )}
              <button className="btn-tracker btn-success timer-btn" onClick={stopTimer}>
                <Square size={18} /> Done
              </button>
              <button className="btn-tracker btn-danger timer-btn-sm" onClick={cancelTimer} title="Cancel and discard">
                Cancel
              </button>
            </div>
            {timerState === 'paused' && (
              <p className="timer-paused-hint">Timer paused — tap Resume to continue or Done to log hours.</p>
            )}
          </div>
        )}
      </div>

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

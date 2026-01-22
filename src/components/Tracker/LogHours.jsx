import { useState } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { Clock, Check, BookOpen } from 'lucide-react'
import './LogHours.css'

function LogHours() {
  const { children, logHours, getSubjectHours } = useData()
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedChildData = children.find(c => c.id === selectedChild)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const totalHours = (Number(hours) || 0) + (Number(minutes) || 0) / 60
    
    if (selectedChild && selectedSubject && totalHours > 0) {
      logHours(selectedChild, selectedSubject, totalHours, date, notes)
      
      // Reset form but keep child selected
      setSelectedSubject('')
      setHours('')
      setMinutes('')
      setNotes('')
      setSuccess(true)
      
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (children.length === 0) {
    return (
      <div className="log-hours">
        <div className="tracker-section">
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={40} />
            </div>
            <h3>No children to log hours for</h3>
            <p>Add children first in the Children tab to start logging their study hours.</p>
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
            Hours logged successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-row">
            <div className="form-group">
              <label>Child</label>
              <select
                className="form-select"
                value={selectedChild}
                onChange={(e) => {
                  setSelectedChild(e.target.value)
                  setSelectedSubject('')
                }}
                required
              >
                <option value="">Select a child</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                disabled={!selectedChild}
              >
                <option value="">Select a subject</option>
                {selectedChildData?.subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
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
            disabled={!selectedChild || !selectedSubject || (!hours && !minutes)}
          >
            <Clock size={20} />
            Log Hours
          </button>
        </form>
      </div>

      {selectedChildData && selectedSubject && (
        <div className="tracker-section subject-preview">
          <div className="preview-header">
            <h3>Current Progress</h3>
          </div>
          {(() => {
            const subject = selectedChildData.subjects.find(s => s.id === selectedSubject)
            if (!subject) return null
            const logged = getSubjectHours(selectedChild, selectedSubject)
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
          })()}
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
                        setSelectedChild(child.id)
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

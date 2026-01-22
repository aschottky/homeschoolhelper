import { useState } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { Trash2, Calendar, Clock, Filter, FileText } from 'lucide-react'
import './HoursHistory.css'

function HoursHistory() {
  const { children, hourLogs, deleteLog, getLogs } = useData()
  const [filterChild, setFilterChild] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  const selectedChild = children.find(c => c.id === filterChild)

  const getFilteredLogs = () => {
    let logs = [...hourLogs]
    
    if (filterChild) {
      logs = logs.filter(log => log.childId === filterChild)
    }
    
    if (filterSubject) {
      logs = logs.filter(log => log.subjectId === filterSubject)
    }
    
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const filteredLogs = getFilteredLogs()

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId)
    return child?.name || 'Unknown'
  }

  const getSubjectInfo = (childId, subjectId) => {
    const child = children.find(c => c.id === childId)
    const subject = child?.subjects.find(s => s.id === subjectId)
    return subject || { name: 'Unknown', color: '#8FB39A' }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = log.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
    return groups
  }, {})

  if (children.length === 0) {
    return (
      <div className="hours-history">
        <div className="tracker-section">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={40} />
            </div>
            <h3>No history yet</h3>
            <p>Add children and log some hours to see your history here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hours-history">
      <div className="tracker-section">
        <div className="tracker-section-header">
          <h2>Hours History</h2>
          <span className="log-count">{filteredLogs.length} entries</span>
        </div>

        <div className="filters">
          <Filter size={18} />
          <select
            className="form-select filter-select"
            value={filterChild}
            onChange={(e) => {
              setFilterChild(e.target.value)
              setFilterSubject('')
            }}
          >
            <option value="">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>

          <select
            className="form-select filter-select"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            disabled={!filterChild}
          >
            <option value="">All Subjects</option>
            {selectedChild?.subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="tracker-section">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={40} />
            </div>
            <h3>No hours logged yet</h3>
            <p>Start logging study hours to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="history-timeline">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <div key={date} className="history-day">
              <div className="day-header">
                <Calendar size={18} />
                <span>{formatDate(date)}</span>
                <span className="day-total">
                  {formatHours(logs.reduce((t, l) => t + l.hours, 0))} total
                </span>
              </div>
              
              <div className="day-logs">
                {logs.map(log => {
                  const subject = getSubjectInfo(log.childId, log.subjectId)
                  
                  return (
                    <div key={log.id} className="log-entry">
                      <div className="log-color" style={{ background: subject.color }} />
                      <div className="log-details">
                        <div className="log-main">
                          <span className="log-child">{getChildName(log.childId)}</span>
                          <span className="log-separator">•</span>
                          <span className="log-subject">{subject.name}</span>
                        </div>
                        {log.notes && (
                          <p className="log-notes">{log.notes}</p>
                        )}
                      </div>
                      <div className="log-hours">
                        {formatHours(log.hours)}
                      </div>
                      <button
                        className="btn-tracker btn-danger btn-sm btn-delete"
                        onClick={() => {
                          if (confirm('Delete this log entry?')) {
                            deleteLog(log.id)
                          }
                        }}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLogs.length > 0 && (
        <div className="history-summary">
          <div className="summary-card">
            <span className="summary-value">
              {formatHours(filteredLogs.reduce((t, l) => t + l.hours, 0))}
            </span>
            <span className="summary-label">Total Hours</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{filteredLogs.length}</span>
            <span className="summary-label">Log Entries</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{Object.keys(groupedLogs).length}</span>
            <span className="summary-label">Days Logged</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HoursHistory

import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { 
  Sun, Plus, Trash2, Calendar, Clock, MapPin, TreePine, 
  Mountain, Bike, Bird, Leaf, Footprints, Tent, Fish,
  Cloud, Sunrise, Filter
} from 'lucide-react'
import './OutdoorHours.css'

const ACTIVITY_TYPES = [
  { id: 'nature-walk', name: 'Nature Walk', icon: Footprints, color: '#8FB39A' },
  { id: 'hiking', name: 'Hiking', icon: Mountain, color: '#5A8F7B' },
  { id: 'biking', name: 'Biking', icon: Bike, color: '#E8A87C' },
  { id: 'bird-watching', name: 'Bird Watching', icon: Bird, color: '#6B8E7B' },
  { id: 'gardening', name: 'Gardening', icon: Leaf, color: '#2D5A4A' },
  { id: 'camping', name: 'Camping', icon: Tent, color: '#D4896A' },
  { id: 'fishing', name: 'Fishing', icon: Fish, color: '#4A7C6B' },
  { id: 'field-trip', name: 'Field Trip', icon: MapPin, color: '#C4A484' },
  { id: 'outdoor-pe', name: 'Outdoor PE', icon: Sun, color: '#E8A87C' },
  { id: 'nature-study', name: 'Nature Study', icon: TreePine, color: '#8FB39A' },
  { id: 'weather-observation', name: 'Weather Observation', icon: Cloud, color: '#6B8E7B' },
  { id: 'other', name: 'Other Outdoor Activity', icon: Sunrise, color: '#B58863' }
]

function OutdoorHours() {
  const { children } = useData()
  const { isPremium } = useSubscription()

  const [outdoorLogs, setOutdoorLogs] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [filterChild, setFilterChild] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLog, setNewLog] = useState({
    childId: '',
    activityType: '',
    hours: '',
    minutes: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  })

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('homeschool_outdoor_hours')
    if (saved) {
      setOutdoorLogs(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('homeschool_outdoor_hours', JSON.stringify(outdoorLogs))
  }, [outdoorLogs])

  // Add new outdoor log
  const handleAddLog = (e) => {
    e.preventDefault()
    
    const totalHours = (Number(newLog.hours) || 0) + (Number(newLog.minutes) || 0) / 60
    
    if (!newLog.childId || !newLog.activityType || totalHours <= 0) {
      alert('Please fill in all required fields')
      return
    }

    const log = {
      id: Date.now().toString(),
      childId: newLog.childId,
      activityType: newLog.activityType,
      hours: totalHours,
      date: newLog.date,
      location: newLog.location,
      notes: newLog.notes,
      createdAt: new Date().toISOString()
    }

    setOutdoorLogs(prev => [log, ...prev])
    setNewLog({
      childId: newLog.childId,
      activityType: '',
      hours: '',
      minutes: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  // Delete log
  const deleteLog = (logId) => {
    if (confirm('Delete this outdoor activity log?')) {
      setOutdoorLogs(prev => prev.filter(log => log.id !== logId))
    }
  }

  // Get filtered logs
  const getFilteredLogs = () => {
    let logs = [...outdoorLogs]
    if (filterChild) {
      logs = logs.filter(log => log.childId === filterChild)
    }
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const filteredLogs = getFilteredLogs()

  // Calculate stats
  const getTotalHours = (childId = null) => {
    const logs = childId 
      ? outdoorLogs.filter(l => l.childId === childId)
      : outdoorLogs
    return logs.reduce((total, log) => total + log.hours, 0)
  }

  const getActivityBreakdown = (childId = null) => {
    const logs = childId 
      ? outdoorLogs.filter(l => l.childId === childId)
      : outdoorLogs
    
    const breakdown = {}
    logs.forEach(log => {
      if (!breakdown[log.activityType]) {
        breakdown[log.activityType] = 0
      }
      breakdown[log.activityType] += log.hours
    })
    return breakdown
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  const getChildName = (childId) => {
    return children.find(c => c.id === childId)?.name || 'Unknown'
  }

  const getActivityInfo = (activityType) => {
    return ACTIVITY_TYPES.find(a => a.id === activityType) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]
  }

  const activityBreakdown = getActivityBreakdown(filterChild || null)

  return (
    <div className="outdoor-hours">
      <div className="outdoor-header">
        <div className="header-content">
          <h1>Outdoor Hours Tracker</h1>
          <p>Track outdoor learning, nature activities, and field trips</p>
        </div>
        <button 
          className="btn-tracker btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Log Outdoor Time
        </button>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="outdoor-ad" />}

      {/* Stats Section */}
      <div className="outdoor-stats">
        <div className="stat-card total">
          <Sun size={32} />
          <div className="stat-info">
            <span className="stat-value">{formatHours(getTotalHours(filterChild || null))}</span>
            <span className="stat-label">Total Outdoor Hours</span>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={24} />
          <div className="stat-info">
            <span className="stat-value">{filteredLogs.length}</span>
            <span className="stat-label">Activities Logged</span>
          </div>
        </div>
        <div className="stat-card">
          <TreePine size={24} />
          <div className="stat-info">
            <span className="stat-value">{Object.keys(activityBreakdown).length}</span>
            <span className="stat-label">Activity Types</span>
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      {Object.keys(activityBreakdown).length > 0 && (
        <div className="activity-breakdown">
          <h3>Activity Breakdown</h3>
          <div className="breakdown-grid">
            {Object.entries(activityBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([activityType, hours]) => {
                const activity = getActivityInfo(activityType)
                const ActivityIcon = activity.icon
                return (
                  <div key={activityType} className="breakdown-item">
                    <div className="activity-icon" style={{ background: activity.color }}>
                      <ActivityIcon size={18} />
                    </div>
                    <div className="activity-info">
                      <span className="activity-name">{activity.name}</span>
                      <span className="activity-hours">{formatHours(hours)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-section">
        <Filter size={18} />
        <select
          className="form-select"
          value={filterChild}
          onChange={(e) => setFilterChild(e.target.value)}
        >
          <option value="">All Children</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Sun size={48} />
          </div>
          <h3>No outdoor activities logged yet</h3>
          <p>Start tracking your outdoor learning time by clicking "Log Outdoor Time" above.</p>
        </div>
      ) : (
        <div className="logs-list">
          {filteredLogs.map(log => {
            const activity = getActivityInfo(log.activityType)
            const ActivityIcon = activity.icon
            
            return (
              <div key={log.id} className="log-card">
                <div className="log-icon" style={{ background: activity.color }}>
                  <ActivityIcon size={24} />
                </div>
                <div className="log-content">
                  <div className="log-header">
                    <h4>{activity.name}</h4>
                    <span className="log-hours">{formatHours(log.hours)}</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-child">{getChildName(log.childId)}</span>
                    <span className="log-date">
                      <Calendar size={14} />
                      {new Date(log.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {log.location && (
                      <span className="log-location">
                        <MapPin size={14} />
                        {log.location}
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="log-notes">{log.notes}</p>
                  )}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteLog(log.id)}
                  title="Delete log"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Sun size={20} /> Log Outdoor Activity</h3>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddLog} className="outdoor-form">
              <div className="form-group">
                <label>Child *</label>
                <select
                  className="form-select"
                  value={newLog.childId}
                  onChange={(e) => setNewLog({ ...newLog, childId: e.target.value })}
                  required
                >
                  <option value="">Select a child</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Activity Type *</label>
                <div className="activity-selector">
                  {ACTIVITY_TYPES.map(activity => {
                    const ActivityIcon = activity.icon
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        className={`activity-option ${newLog.activityType === activity.id ? 'selected' : ''}`}
                        onClick={() => setNewLog({ ...newLog, activityType: activity.id })}
                        style={{ '--activity-color': activity.color }}
                      >
                        <ActivityIcon size={20} />
                        <span>{activity.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newLog.hours}
                    onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                    placeholder="0"
                    min="0"
                    max="24"
                  />
                </div>
                <div className="form-group">
                  <label>Minutes</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newLog.minutes}
                    onChange={(e) => setNewLog({ ...newLog, minutes: e.target.value })}
                    placeholder="0"
                    min="0"
                    max="59"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newLog.location}
                  onChange={(e) => setNewLog({ ...newLog, location: e.target.value })}
                  placeholder="e.g., Local park, Backyard, Nature reserve"
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder="What did you observe or learn?"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-tracker btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-tracker btn-primary">
                  <Plus size={18} />
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutdoorHours

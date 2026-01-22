import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { getHighestBadge, BADGE_DEFINITIONS } from './Badges'
import AdBanner from '../Ads/AdBanner'
import { Users, Clock, Target, TrendingUp, Plus, Trophy } from 'lucide-react'
import './Dashboard.css'

function Dashboard({ onNavigate }) {
  const { children, getSubjectHours, getChildTotalHours, getSubjectProgress } = useData()
  const { isPremium } = useSubscription()

  const totalHoursLogged = children.reduce((total, child) => total + getChildTotalHours(child.id), 0)
  
  const totalRequiredHours = children.reduce((total, child) => 
    total + child.subjects.reduce((subTotal, subject) => subTotal + subject.requiredHours, 0), 0
  )

  const overallProgress = totalRequiredHours > 0 
    ? Math.round((totalHoursLogged / totalRequiredHours) * 100) 
    : 0

  // Count total badges earned
  const totalBadges = children.reduce((total, child) => {
    return total + child.subjects.reduce((subTotal, subject) => {
      const hours = getSubjectHours(child.id, subject.id)
      const badges = BADGE_DEFINITIONS.filter(b => b.requirement(hours, subject.requiredHours))
      return subTotal + badges.length
    }, 0)
  }, 0)

  if (children.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={40} />
          </div>
          <h3>Welcome to Hours Tracker!</h3>
          <p>Start by adding your children to track their homeschool hours by subject.</p>
          <button className="btn-tracker btn-primary" onClick={() => onNavigate('children')}>
            <Plus size={20} />
            Add Your First Child
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Track your homeschool progress at a glance</p>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="dashboard-ad" />}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(45, 90, 74, 0.1)' }}>
            <Users size={24} style={{ color: 'var(--forest)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{children.length}</span>
            <span className="stat-label">{children.length === 1 ? 'Child' : 'Children'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232, 168, 124, 0.15)' }}>
            <Clock size={24} style={{ color: 'var(--terracotta)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalHoursLogged.toFixed(1)}</span>
            <span className="stat-label">Hours Logged</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(143, 179, 154, 0.2)' }}>
            <Target size={24} style={{ color: 'var(--sage)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalRequiredHours}</span>
            <span className="stat-label">Hours Required</span>
          </div>
        </div>

        <div 
          className="stat-card stat-card-clickable" 
          onClick={() => onNavigate('badges')}
          title="View all badges"
        >
          <div className="stat-icon" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
            <Trophy size={24} style={{ color: '#D4A700' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalBadges}</span>
            <span className="stat-label">Badges Earned</span>
          </div>
        </div>
      </div>

      <div className="children-progress">
        {children.map((child, index) => {
          const childTotal = getChildTotalHours(child.id)
          const childRequired = child.subjects.reduce((t, s) => t + s.requiredHours, 0)
          const childProgress = childRequired > 0 ? (childTotal / childRequired) * 100 : 0

          // Count badges for this child
          const childBadges = child.subjects.reduce((total, subject) => {
            const hours = getSubjectHours(child.id, subject.id)
            const badges = BADGE_DEFINITIONS.filter(b => b.requirement(hours, subject.requiredHours))
            return total + badges.length
          }, 0)

          return (
            <div key={child.id}>
              <div className="child-card">
                <div className="child-header">
                  <div className="child-avatar">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="child-info">
                    <h3>{child.name}</h3>
                    <p>{childTotal.toFixed(1)} / {childRequired} hours ({Math.round(childProgress)}%)</p>
                  </div>
                  {childBadges > 0 && (
                    <button 
                      className="child-badges-btn"
                      onClick={() => onNavigate('badges')}
                      title="View badges"
                    >
                      <Trophy size={16} />
                      <span>{childBadges}</span>
                    </button>
                  )}
                </div>

                <div className="child-overall-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min(100, childProgress)}%`,
                        background: 'var(--forest)'
                      }}
                    />
                  </div>
                </div>

                <div className="subjects-grid">
                  {child.subjects.map(subject => {
                    const hours = getSubjectHours(child.id, subject.id)
                    const progress = getSubjectProgress(child.id, subject.id)
                    const highestBadge = getHighestBadge(hours, subject.requiredHours)

                    return (
                      <div key={subject.id} className="subject-item">
                        <div className="subject-header">
                          <span 
                            className="subject-color" 
                            style={{ background: subject.color }}
                          />
                          <span className="subject-name">{subject.name}</span>
                          {highestBadge && (
                            <span 
                              className="subject-badge"
                              style={{ background: highestBadge.color }}
                              title={`${highestBadge.name}: ${highestBadge.description}`}
                            >
                              <highestBadge.icon size={12} />
                            </span>
                          )}
                          <span className="subject-hours">
                            {hours.toFixed(1)} / {subject.requiredHours}h
                          </span>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${progress}%`,
                              background: subject.color
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button 
                  className="btn-tracker btn-secondary btn-sm child-log-btn"
                  onClick={() => onNavigate('log')}
                >
                  <Plus size={16} />
                  Log Hours for {child.name}
                </button>
              </div>

              {/* Show ad after every 2nd child for free users */}
              {!isPremium && (index + 1) % 2 === 0 && index < children.length - 1 && (
                <AdBanner variant="horizontal" className="child-ad" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard

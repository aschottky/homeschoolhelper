import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { Trophy, Star, Target, Zap, Award, Crown, Flame, BookOpen, Medal, Sparkles } from 'lucide-react'
import './Badges.css'

// Badge definitions
export const BADGE_DEFINITIONS = [
  {
    id: 'first_hour',
    name: 'First Steps',
    description: 'Log your first hour of learning',
    icon: Star,
    color: '#8FB39A',
    requirement: (hours, required) => hours >= 1
  },
  {
    id: 'quarter_way',
    name: 'Making Progress',
    description: 'Complete 25% of required hours',
    icon: Target,
    color: '#E8A87C',
    requirement: (hours, required) => required > 0 && (hours / required) >= 0.25
  },
  {
    id: 'halfway',
    name: 'Halfway Hero',
    description: 'Complete 50% of required hours',
    icon: Zap,
    color: '#D4896A',
    requirement: (hours, required) => required > 0 && (hours / required) >= 0.5
  },
  {
    id: 'three_quarters',
    name: 'Almost There',
    description: 'Complete 75% of required hours',
    icon: Award,
    color: '#5A8F7B',
    requirement: (hours, required) => required > 0 && (hours / required) >= 0.75
  },
  {
    id: 'complete',
    name: 'Goal Achieved!',
    description: 'Complete 100% of required hours',
    icon: Trophy,
    color: '#2D5A4A',
    requirement: (hours, required) => required > 0 && (hours / required) >= 1
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Log 125% or more of required hours',
    icon: Crown,
    color: '#C4A484',
    requirement: (hours, required) => required > 0 && (hours / required) >= 1.25
  }
]

// Special badges for overall achievements
export const SPECIAL_BADGES = [
  {
    id: 'first_subject_complete',
    name: 'Subject Master',
    description: 'Complete all hours for any subject',
    icon: BookOpen,
    color: '#2D5A4A'
  },
  {
    id: 'all_subjects_started',
    name: 'Well Rounded',
    description: 'Log at least 1 hour in every subject',
    icon: Sparkles,
    color: '#E8A87C'
  },
  {
    id: 'dedication',
    name: 'Dedicated Learner',
    description: 'Log hours on 10 different days',
    icon: Flame,
    color: '#D4896A'
  },
  {
    id: 'all_complete',
    name: 'Year Complete',
    description: 'Complete all required hours for all subjects',
    icon: Medal,
    color: '#FFD700'
  }
]

export function getBadgesForSubject(hours, requiredHours) {
  return BADGE_DEFINITIONS.filter(badge => badge.requirement(hours, requiredHours))
}

export function getHighestBadge(hours, requiredHours) {
  const earned = getBadgesForSubject(hours, requiredHours)
  return earned.length > 0 ? earned[earned.length - 1] : null
}

function Badges() {
  const { children, getSubjectHours, hourLogs } = useData()
  const { isPremium } = useSubscription()

  // Calculate all earned badges across all children
  const getAllBadges = () => {
    const badgesByChild = []
    
    children.forEach(child => {
      const childBadges = {
        child,
        subjectBadges: [],
        specialBadges: []
      }
      
      let completedSubjects = 0
      let startedSubjects = 0
      
      child.subjects.forEach(subject => {
        const hours = getSubjectHours(child.id, subject.id)
        const earned = getBadgesForSubject(hours, subject.requiredHours)
        
        if (hours > 0) startedSubjects++
        if (hours >= subject.requiredHours) completedSubjects++
        
        if (earned.length > 0) {
          childBadges.subjectBadges.push({
            subject,
            badges: earned,
            hours,
            requiredHours: subject.requiredHours
          })
        }
      })
      
      // Check special badges
      if (completedSubjects > 0) {
        childBadges.specialBadges.push(SPECIAL_BADGES[0]) // Subject Master
      }
      if (startedSubjects === child.subjects.length && child.subjects.length > 0) {
        childBadges.specialBadges.push(SPECIAL_BADGES[1]) // Well Rounded
      }
      if (completedSubjects === child.subjects.length && child.subjects.length > 0) {
        childBadges.specialBadges.push(SPECIAL_BADGES[3]) // Year Complete
      }
      
      // Check dedication badge (10 unique days)
      const childLogs = hourLogs.filter(log => log.childId === child.id)
      const uniqueDays = new Set(childLogs.map(log => log.date))
      if (uniqueDays.size >= 10) {
        childBadges.specialBadges.push(SPECIAL_BADGES[2]) // Dedication
      }
      
      badgesByChild.push(childBadges)
    })
    
    return badgesByChild
  }

  const allBadges = getAllBadges()
  const totalBadges = allBadges.reduce((total, child) => {
    const subjectBadgeCount = child.subjectBadges.reduce((t, sb) => t + sb.badges.length, 0)
    return total + subjectBadgeCount + child.specialBadges.length
  }, 0)

  if (children.length === 0) {
    return (
      <div className="badges-page">
        <div className="badges-empty">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Trophy size={40} />
            </div>
            <h3>No badges yet!</h3>
            <p>Add children and start logging hours to earn achievement badges.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="badges-page">
      <div className="badges-header">
        <div className="header-content">
          <h1>Achievement Badges</h1>
          <p>Celebrate your learning milestones!</p>
        </div>
        <div className="total-badges">
          <Trophy size={24} />
          <span>{totalBadges} Badges Earned</span>
        </div>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="badges-ad" />}

      {/* Badge Legend */}
      <div className="badge-legend">
        <h3>Badge Milestones</h3>
        <div className="legend-grid">
          {BADGE_DEFINITIONS.map(badge => (
            <div key={badge.id} className="legend-item">
              <div className="legend-badge" style={{ background: badge.color }}>
                <badge.icon size={16} />
              </div>
              <div className="legend-info">
                <span className="legend-name">{badge.name}</span>
                <span className="legend-desc">{badge.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges by Child */}
      <div className="children-badges">
        {allBadges.map(({ child, subjectBadges, specialBadges }) => (
          <div key={child.id} className="child-badges-card">
            <div className="child-badges-header">
              <div className="child-avatar">
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div className="child-info">
                <h3>{child.name}</h3>
                <p>
                  {subjectBadges.reduce((t, sb) => t + sb.badges.length, 0) + specialBadges.length} badges earned
                </p>
              </div>
            </div>

            {/* Special Badges */}
            {specialBadges.length > 0 && (
              <div className="special-badges-section">
                <h4>🏆 Special Achievements</h4>
                <div className="badges-row">
                  {specialBadges.map(badge => (
                    <div key={badge.id} className="badge-item special" style={{ '--badge-color': badge.color }}>
                      <div className="badge-icon">
                        <badge.icon size={24} />
                      </div>
                      <span className="badge-name">{badge.name}</span>
                      <span className="badge-desc">{badge.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Badges */}
            {subjectBadges.length > 0 ? (
              <div className="subject-badges-section">
                <h4>📚 Subject Progress</h4>
                {subjectBadges.map(({ subject, badges, hours, requiredHours }) => (
                  <div key={subject.id} className="subject-badge-row">
                    <div className="subject-info">
                      <span className="subject-color" style={{ background: subject.color }} />
                      <span className="subject-name">{subject.name}</span>
                      <span className="subject-progress">
                        {hours.toFixed(1)} / {requiredHours} hrs ({Math.round((hours / requiredHours) * 100)}%)
                      </span>
                    </div>
                    <div className="earned-badges">
                      {badges.map(badge => (
                        <div 
                          key={badge.id} 
                          className="mini-badge" 
                          style={{ background: badge.color }}
                          title={`${badge.name}: ${badge.description}`}
                        >
                          <badge.icon size={14} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-badges-yet">
                <p>Keep learning to earn badges! 🌟</p>
              </div>
            )}

            {/* Unearned badges preview */}
            <div className="upcoming-badges">
              <h4>🎯 Next Goals</h4>
              <div className="upcoming-grid">
                {child.subjects.slice(0, 3).map(subject => {
                  const hours = getSubjectHours(child.id, subject.id)
                  const progress = hours / subject.requiredHours
                  const nextBadge = BADGE_DEFINITIONS.find(b => !b.requirement(hours, subject.requiredHours))
                  
                  if (!nextBadge) return null
                  
                  const targetPercent = nextBadge.id === 'first_hour' ? 0 :
                    nextBadge.id === 'quarter_way' ? 25 :
                    nextBadge.id === 'halfway' ? 50 :
                    nextBadge.id === 'three_quarters' ? 75 :
                    nextBadge.id === 'complete' ? 100 : 125
                  
                  const hoursNeeded = (targetPercent / 100 * subject.requiredHours) - hours
                  
                  return (
                    <div key={subject.id} className="upcoming-item">
                      <div className="upcoming-badge locked" style={{ '--badge-color': nextBadge.color }}>
                        <nextBadge.icon size={18} />
                      </div>
                      <div className="upcoming-info">
                        <span className="upcoming-subject">{subject.name}</span>
                        <span className="upcoming-goal">
                          {hoursNeeded.toFixed(1)} more hrs for "{nextBadge.name}"
                        </span>
                      </div>
                    </div>
                  )
                }).filter(Boolean)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Badges

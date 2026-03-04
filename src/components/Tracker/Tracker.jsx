import { useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useData } from '../../context/SupabaseDataContext'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'
import Dashboard from './Dashboard'
import Admin from './Admin'
import FamilyProfile from './FamilyProfile'
import LogHours from './LogHours'
import HoursHistory from './HoursHistory'
import Badges from './Badges'
import Grades from './Grades'
import ReadAlouds from './ReadAlouds'
import OutdoorHours from './OutdoorHours'
import ExpenseTracker from './ExpenseTracker'
import AlternativeActivities from './AlternativeActivities'
import VolunteerExtracurricular from './VolunteerExtracurricular'
import IDCards from './IDCards'
import StateRequirements from './StateRequirements'
import Curriculum from './Curriculum'
import Consultation from './Consultation'
// Settings is now rendered inside FamilyProfile
import Upgrade from './Upgrade'
import SchoolworkReminder from './SchoolworkReminder'
import { LayoutDashboard, Users, Clock, History, Trophy, GraduationCap, BookOpen, Sun, Lightbulb, Heart, CreditCard, MapPin, BookMarked, MessageSquare, Crown, Sparkles, Shield, DollarSign, LogOut } from 'lucide-react'
import './Tracker.css'

const BASE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'family-profile', label: 'Family Profile', icon: Users },
  { id: 'log', label: 'Log Hours', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'read-alouds', label: 'Read-Alouds', icon: BookOpen },
  { id: 'outdoor', label: 'Outdoor Hours', icon: Sun },
  { id: 'expenses', label: 'Expenses', icon: DollarSign },
  { id: 'activities', label: 'Activity Ideas', icon: Lightbulb },
  { id: 'volunteer', label: 'Volunteer/EC', icon: Heart },
  { id: 'id-cards', label: 'ID Cards', icon: CreditCard },
  { id: 'state', label: 'State Laws', icon: MapPin },
  { id: 'curriculum', label: 'Curriculum', icon: BookMarked },
  { id: 'consultation', label: 'Consult', icon: MessageSquare },
]

const VALID_TABS = new Set(['dashboard', 'family-profile', 'children', 'settings', 'log', 'history', 'badges', 'grades', 'read-alouds', 'outdoor', 'expenses', 'activities', 'volunteer', 'id-cards', 'state', 'curriculum', 'consultation', 'admin', 'upgrade'])

function Tracker() {
  const { tab: urlTab } = useParams()
  const navigate = useNavigate()
  const { children, homeschoolProfile } = useData()
  const { user, isAdmin, signOut } = useAuth()
  const displayName = homeschoolProfile?.homeschoolName?.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const { isPremium, tier } = useSubscription()

  const activeTab = useMemo(() => {
    if (urlTab && VALID_TABS.has(urlTab)) return urlTab
    return 'dashboard'
  }, [urlTab])

  useEffect(() => {
    if (urlTab && !VALID_TABS.has(urlTab)) {
      navigate('/tracker/dashboard', { replace: true })
    }
  }, [urlTab, navigate])

  const setActiveTab = (tab) => navigate('/tracker/' + tab)

  const TABS = useMemo(() => {
    const tabs = [...BASE_TABS]
    if (isAdmin) {
      tabs.push({ id: 'admin', label: 'Admin', icon: Shield })
    }
    return tabs
  }, [isAdmin])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'family-profile':
        return <FamilyProfile />
      // Legacy redirects — old bookmarks land here then bounce
      case 'children':
      case 'settings':
        navigate('/tracker/family-profile', { replace: true })
        return null
      case 'log':
        return <LogHours />
      case 'history':
        return <HoursHistory />
      case 'badges':
        return <Badges />
      case 'grades':
        return <Grades />
      case 'read-alouds':
        return <ReadAlouds />
      case 'outdoor':
        return <OutdoorHours />
      case 'expenses':
        return <ExpenseTracker />
      case 'activities':
        return <AlternativeActivities />
      case 'volunteer':
        return <VolunteerExtracurricular onNavigateToUpgrade={() => setActiveTab('upgrade')} />
      case 'id-cards':
        return <IDCards onNavigateToUpgrade={() => setActiveTab('upgrade')} />
      case 'state':
        return <StateRequirements />
      case 'curriculum':
        return <Curriculum onNavigateToConsult={() => setActiveTab('consultation')} />
      case 'consultation':
        return <Consultation />
      case 'admin':
        return <Admin />
      case 'upgrade':
        return <Upgrade />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="tracker">
      <div className="tracker-sidebar">
        {displayName && (
          <div className="sidebar-header">
            <p className="sidebar-display-name">{displayName}</p>
          </div>
        )}

        <nav className="sidebar-nav">
          {TABS.map(tab => (
            <Link
              key={tab.id}
              to={'/tracker/' + tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-tier">
          {isPremium ? (
            <div className="tier-badge premium">
              <Crown size={16} />
              <span>Premium</span>
            </div>
          ) : (
            <Link to="/tracker/upgrade" className="tier-upgrade">
              <Sparkles size={16} />
              <span>Upgrade to Premium</span>
            </Link>
          )}
          <Link 
            to="/tracker/upgrade"
            className="manage-plan-link"
          >
            {isPremium ? 'Manage Plan' : 'Compare Plans'}
          </Link>
        </div>

        <div className="sidebar-help">
          <p>💡 Tip: Start by adding your children, then customize their subjects and required hours.</p>
        </div>

        <button
          type="button"
          className="sidebar-signout"
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="tracker-main">
        {renderContent()}
      </div>
      <SchoolworkReminder />
    </div>
  )
}

export default Tracker

import { useState, useMemo } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'
import Dashboard from './Dashboard'
import Admin from './Admin'
import ChildManager from './ChildManager'
import LogHours from './LogHours'
import HoursHistory from './HoursHistory'
import Badges from './Badges'
import Grades from './Grades'
import ReadAlouds from './ReadAlouds'
import OutdoorHours from './OutdoorHours'
import AlternativeActivities from './AlternativeActivities'
import VolunteerExtracurricular from './VolunteerExtracurricular'
import IDCards from './IDCards'
import StateRequirements from './StateRequirements'
import Curriculum from './Curriculum'
import Consultation from './Consultation'
import Settings from './Settings'
import Upgrade from './Upgrade'
import SchoolworkReminder from './SchoolworkReminder'
import { LayoutDashboard, Users, Clock, History, Trophy, GraduationCap, BookOpen, Sun, Lightbulb, Heart, CreditCard, MapPin, BookMarked, MessageSquare, Settings as SettingsIcon, Crown, ArrowLeft, Sparkles, Shield } from 'lucide-react'
import './Tracker.css'

const BASE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'children', label: 'Children', icon: Users },
  { id: 'log', label: 'Log Hours', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'read-alouds', label: 'Read-Alouds', icon: BookOpen },
  { id: 'outdoor', label: 'Outdoor Hours', icon: Sun },
  { id: 'activities', label: 'Activity Ideas', icon: Lightbulb },
  { id: 'volunteer', label: 'Volunteer/EC', icon: Heart },
  { id: 'id-cards', label: 'ID Cards', icon: CreditCard },
  { id: 'state', label: 'State Laws', icon: MapPin },
  { id: 'curriculum', label: 'Curriculum', icon: BookMarked },
  { id: 'consultation', label: 'Consult', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

function Tracker({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { children } = useData()
  const { isAdmin } = useAuth()
  const { isPremium, tier } = useSubscription()

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
      case 'children':
        return <ChildManager />
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
      case 'settings':
        return <Settings />
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
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        
        <div className="sidebar-header">
          <h2>Hours Tracker</h2>
          <p>{children.length} {children.length === 1 ? 'child' : 'children'}</p>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-tier">
          {isPremium ? (
            <div className="tier-badge premium">
              <Crown size={16} />
              <span>Premium</span>
            </div>
          ) : (
            <button className="tier-upgrade" onClick={() => setActiveTab('upgrade')}>
              <Sparkles size={16} />
              <span>Upgrade to Premium</span>
            </button>
          )}
          <button 
            className="manage-plan-link"
            onClick={() => setActiveTab('upgrade')}
          >
            {isPremium ? 'Manage Plan' : 'Compare Plans'}
          </button>
        </div>

        <div className="sidebar-help">
          <p>💡 Tip: Start by adding your children, then customize their subjects and required hours.</p>
        </div>
      </div>

      <div className="tracker-main">
        {renderContent()}
      </div>
      <SchoolworkReminder />
    </div>
  )
}

export default Tracker

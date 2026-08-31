import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
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
import Schedule from './Schedule'
import Consultation from './Consultation'
import Reports from './Reports'
// Settings is now rendered inside FamilyProfile
import Upgrade from './Upgrade'
import Referrals from './Referrals'
import SchoolworkReminder from './SchoolworkReminder'
import {
  LayoutDashboard, Users, Clock, History, Trophy, GraduationCap, BookOpen, Sun, Lightbulb,
  Heart, CreditCard, MapPin, BookMarked, MessageSquare, Crown, Sparkles, Shield, DollarSign,
  LogOut, FileText, Gift, MoreHorizontal, X, CalendarDays,
} from 'lucide-react'
import './Tracker.css'

// Everyday tracking tools — always visible, same order on mobile and desktop.
// "Children" (family-profile) is deliberately #2: nothing else in the app is
// usable until a child exists, so it sits right after Dashboard.
const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'family-profile', label: 'Children', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'log', label: 'Log Hours', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'read-alouds', label: 'Read-Alouds', icon: BookOpen },
  { id: 'outdoor', label: 'Outdoor Hours', icon: Sun },
  { id: 'expenses', label: 'Expenses', icon: DollarSign },
  { id: 'curriculum', label: 'Curriculum', icon: BookMarked },
  { id: 'activities', label: 'Activity Ideas', icon: Lightbulb },
  { id: 'volunteer', label: 'Volunteer/EC', icon: Heart },
  { id: 'id-cards', label: 'ID Cards', icon: CreditCard },
  { id: 'state', label: 'State Laws', icon: MapPin },
]

// Growth / paid-upsell / account-management items. Real, but not what a
// brand-new user needs to see before they've set anything up — grouped
// separately and (on mobile, where space is scarce) tucked behind "More".
const BASE_SECONDARY_TABS = [
  { id: 'consultation', label: 'Consult', icon: MessageSquare, badge: 'Paid' },
  { id: 'referrals', label: 'Refer a Friend', icon: Gift },
]

const VALID_TABS = new Set(['dashboard', 'referrals', 'family-profile', 'children', 'settings', 'schedule', 'log', 'history', 'reports', 'badges', 'grades', 'read-alouds', 'outdoor', 'expenses', 'activities', 'volunteer', 'id-cards', 'state', 'curriculum', 'consultation', 'admin', 'upgrade'])

function TrackerNavLink({ tab, active, dot, onClick }) {
  return (
    <Link
      to={'/tracker/' + tab.id}
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-item-icon-wrap">
        <tab.icon size={20} />
        {dot && <span className="nav-item-dot" aria-hidden="true" />}
      </span>
      <span>{tab.label}</span>
      {tab.badge && <span className="nav-item-badge">{tab.badge}</span>}
    </Link>
  )
}

function Tracker() {
  const { tab: urlTab } = useParams()
  const navigate = useNavigate()
  const { children, homeschoolProfile } = useData()
  const { user, isAdmin, signOut } = useAuth()
  const displayName = homeschoolProfile?.homeschoolName?.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const { isPremium } = useSubscription()
  const hasChildren = children.length > 0

  const [showMore, setShowMore] = useState(false)
  const navScrollRef = useRef(null)
  const [navScroll, setNavScroll] = useState({ left: false, right: false })

  const activeTab = useMemo(() => {
    if (urlTab && VALID_TABS.has(urlTab)) return urlTab
    return 'dashboard'
  }, [urlTab])

  useEffect(() => {
    if (urlTab && !VALID_TABS.has(urlTab)) {
      navigate('/tracker/dashboard', { replace: true })
    }
  }, [urlTab, navigate])

  // Close the mobile "More" sheet whenever navigation happens elsewhere
  // (e.g. a dashboard shortcut button), and lock page scroll while it's open.
  useEffect(() => {
    setShowMore(false)
  }, [activeTab])

  useEffect(() => {
    if (!showMore) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setShowMore(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [showMore])

  const updateNavScroll = useCallback(() => {
    const el = navScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setNavScroll({
      left: scrollLeft > 4,
      right: scrollLeft < scrollWidth - clientWidth - 4,
    })
  }, [])

  useEffect(() => {
    updateNavScroll()
    const el = navScrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateNavScroll, { passive: true })
    window.addEventListener('resize', updateNavScroll)
    return () => {
      el.removeEventListener('scroll', updateNavScroll)
      window.removeEventListener('resize', updateNavScroll)
    }
  }, [updateNavScroll])

  const secondaryTabs = useMemo(() => {
    const tabs = [...BASE_SECONDARY_TABS]
    if (isAdmin) {
      tabs.push({ id: 'admin', label: 'Admin', icon: Shield })
    }
    return tabs
  }, [isAdmin])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'referrals':
        return <Referrals />
      case 'family-profile':
        return <FamilyProfile />
      // Legacy redirects — old bookmarks land here then bounce
      case 'children':
      case 'settings':
        navigate('/tracker/family-profile', { replace: true })
        return null
      case 'schedule':
        return <Schedule />
      case 'log':
        return <LogHours />
      case 'history':
        return <HoursHistory />
      case 'reports':
        return <Reports />
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

  const setActiveTab = (tab) => navigate('/tracker/' + tab)

  const handleSignOut = async () => {
    setShowMore(false)
    await signOut()
    navigate('/')
  }

  const tierBlock = isPremium ? (
    <div className="tier-badge premium">
      <Crown size={16} />
      <span>Premium</span>
    </div>
  ) : (
    <Link to="/tracker/upgrade" className="tier-upgrade" onClick={() => setShowMore(false)}>
      <Sparkles size={16} />
      <span>Upgrade to Premium</span>
    </Link>
  )

  return (
    <div className="tracker">
      {/* Desktop fixed sidebar — hidden on mobile in favor of the sticky top bar below */}
      <div className="tracker-sidebar">
        {displayName && (
          <div className="sidebar-header">
            <p className="sidebar-display-name">{displayName}</p>
          </div>
        )}

        <nav className="sidebar-nav">
          {PRIMARY_TABS.map(tab => (
            <TrackerNavLink
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              dot={tab.id === 'family-profile' && !hasChildren}
            />
          ))}

          <div className="sidebar-nav-divider">
            <span>Extras</span>
          </div>

          {secondaryTabs.map(tab => (
            <TrackerNavLink key={tab.id} tab={tab} active={activeTab === tab.id} />
          ))}
        </nav>

        <div className="sidebar-tier">
          {tierBlock}
          <Link to="/tracker/upgrade" className="manage-plan-link">
            {isPremium ? 'Manage Plan' : 'Compare Plans'}
          </Link>
        </div>

        <button
          type="button"
          className="sidebar-signout"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Mobile sticky top bar — real labels, scroll fade, and a "More" sheet for the rest */}
      <div className="mobile-topbar">
        <div
          className={`mobile-topbar-scroll ${navScroll.left ? 'fade-left' : ''} ${navScroll.right ? 'fade-right' : ''}`}
          ref={navScrollRef}
        >
          {PRIMARY_TABS.map(tab => (
            <TrackerNavLink
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              dot={tab.id === 'family-profile' && !hasChildren}
            />
          ))}
        </div>
        <button
          type="button"
          className="mobile-more-trigger"
          onClick={() => setShowMore(true)}
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </div>

      {showMore && (
        <div className="mobile-more-overlay" onClick={() => setShowMore(false)}>
          <div className="mobile-more-sheet" onClick={e => e.stopPropagation()}>
            <div className="mobile-more-sheet-header">
              <div>
                <h3>More</h3>
                {displayName && <p className="mobile-more-sheet-subtitle">{displayName}</p>}
              </div>
              <button
                type="button"
                className="mobile-more-close"
                onClick={() => setShowMore(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mobile-more-section-title">Extras</p>
            <div className="mobile-more-section">
              {secondaryTabs.map(tab => (
                <TrackerNavLink
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tab.id}
                  onClick={() => setShowMore(false)}
                />
              ))}
            </div>

            <p className="mobile-more-section-title">Account</p>
            <div className="mobile-more-section">
              {tierBlock}
              <Link to="/tracker/upgrade" className="manage-plan-link" onClick={() => setShowMore(false)}>
                {isPremium ? 'Manage Plan' : 'Compare Plans'}
              </Link>
              <button type="button" className="sidebar-signout" onClick={handleSignOut}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tracker-main">
        {!hasChildren && activeTab !== 'dashboard' && activeTab !== 'family-profile' && (
          <div className="childless-nudge">
            <Users size={20} />
            <p>
              You haven't added a child yet.{' '}
              <Link to="/tracker/family-profile">Add your first child</Link> to start tracking.
            </p>
          </div>
        )}
        {renderContent()}
      </div>
      <SchoolworkReminder />
    </div>
  )
}

export default Tracker

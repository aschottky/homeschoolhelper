import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, History, Trophy, GraduationCap, BookOpen, Sun,
  DollarSign, Lightbulb, Heart, CreditCard, MapPin, BookMarked, MessageSquare,
  ArrowRight, ArrowLeft
} from 'lucide-react'
import './FeaturesPage.css'

const PREVIEWS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'See at a glance how each child is doing toward their required hours. Quick links to log time, view badges, and check progress.',
    path: '/tracker/dashboard',
  },
  {
    id: 'children',
    icon: Users,
    title: 'Children & subjects',
    description: 'Add your kids, set custom subjects, and define required hours per subject. Everything else in the tracker builds on this.',
    path: '/tracker/children',
  },
  {
    id: 'log',
    icon: Clock,
    title: 'Log hours',
    description: 'Log learning time by child and subject with optional notes. Minutes roll up into your dashboard and history.',
    path: '/tracker/log',
  },
  {
    id: 'history',
    icon: History,
    title: 'History',
    description: 'View and filter past entries. See exactly when and what was logged for records and review.',
    path: '/tracker/history',
  },
  {
    id: 'badges',
    icon: Trophy,
    title: 'Badges',
    description: 'Earn badges as your children hit hour milestones. A simple way to celebrate progress.',
    path: '/tracker/badges',
  },
  {
    id: 'grades',
    icon: GraduationCap,
    title: 'Grades',
    description: 'Track grades by subject and term. Optional premium feature for keeping report cards in one place.',
    path: '/tracker/grades',
  },
  {
    id: 'read-alouds',
    icon: BookOpen,
    title: 'Read-alouds',
    description: 'Log read-aloud time and track suggested books. Great for language arts and building a reading habit.',
    path: '/tracker/read-alouds',
  },
  {
    id: 'outdoor',
    icon: Sun,
    title: 'Outdoor hours',
    description: 'Log outdoor and nature time by activity type—hiking, gardening, field trips—with optional notes.',
    path: '/tracker/outdoor',
  },
  {
    id: 'expenses',
    icon: DollarSign,
    title: 'Expense tracker',
    description: 'Track homeschool spending by category. Totals by year and category for budgeting and tax prep; export to CSV.',
    path: '/tracker/expenses',
  },
  {
    id: 'activities',
    icon: Lightbulb,
    title: 'Activity ideas',
    description: 'Browse ideas for learning activities when you need inspiration. Filter by subject and age.',
    path: '/tracker/activities',
  },
  {
    id: 'volunteer',
    icon: Heart,
    title: 'Volunteer & extracurricular',
    description: 'Log volunteer and extracurricular hours. Useful for high school transcripts and college applications.',
    path: '/tracker/volunteer',
  },
  {
    id: 'id-cards',
    icon: CreditCard,
    title: 'ID cards',
    description: 'Generate printable student ID-style cards for discounts and identification. Premium feature.',
    path: '/tracker/id-cards',
  },
  {
    id: 'state',
    icon: MapPin,
    title: 'State laws',
    description: 'Quick reference for homeschool requirements by state. Stay compliant with your local rules.',
    path: '/tracker/state',
  },
  {
    id: 'curriculum',
    icon: BookMarked,
    title: 'Curriculum',
    description: 'Organize and plan your curriculum. Link to premium consultation for personalized guidance.',
    path: '/tracker/curriculum',
  },
  {
    id: 'consultation',
    icon: MessageSquare,
    title: 'Consultation',
    description: 'Connect with curriculum experts for personalized advice. Premium feature.',
    path: '/tracker/consultation',
  },
]

function FeaturesPage() {
  return (
    <div className="features-page">
      <nav className="features-nav">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </nav>

      <header className="features-page-header">
        <div className="header-content">
          <h1>Features</h1>
          <p>Previews of what you can do in the Hours Tracker</p>
        </div>
      </header>

      <main className="features-page-content">
        <p className="features-page-intro">
          The tracker is one place for hours, grades, read-alouds, outdoor time, expenses, and more.
          Each area below links straight into the app so you can try it.
        </p>

        <div className="previews-grid">
          {PREVIEWS.map((preview) => {
            const Icon = preview.icon
            return (
              <div key={preview.id} className="preview-card">
                <div className="preview-icon-wrap">
                  <Icon className="preview-icon" size={28} />
                </div>
                <h3>{preview.title}</h3>
                <p>{preview.description}</p>
                <Link to={preview.path} className="preview-link">
                  Try it in Tracker
                  <ArrowRight size={18} />
                </Link>
              </div>
            )
          })}
        </div>

        <div className="features-page-cta">
          <Link to="/tracker/dashboard" className="btn-tracker btn-primary">
            Open Hours Tracker
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    </div>
  )
}

export default FeaturesPage

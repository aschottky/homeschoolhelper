import { Link } from 'react-router-dom'
import { Calendar, BookMarked, Shield, Lightbulb, BarChart3, HeartHandshake } from 'lucide-react'
import './Features.css'

const features = [
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Create custom schedules that adapt to your family\'s rhythm. No rigid timetables—learn when it works best for you.',
    color: 'terracotta'
  },
  {
    icon: BookMarked,
    title: 'Curated Curriculum',
    description: 'Access hand-picked curricula for every learning style and age group, from classical to project-based approaches.',
    color: 'forest'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. Track hours and records without social features, forums, or sharing—just your family\'s homeschool records.',
    color: 'sage'
  },
  {
    icon: Lightbulb,
    title: 'Learning Resources',
    description: 'We may offer worksheets, activities, videos, and lesson resources in the future. Stay tuned.',
    color: 'terracotta'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your child\'s growth with intuitive tracking tools. Celebrate milestones and identify opportunities.',
    color: 'forest'
  },
  {
    icon: HeartHandshake,
    title: 'Expert Guidance',
    description: 'Get personalized advice from experienced homeschool educators and certified curriculum specialists.',
    color: 'sage'
  }
]

function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header">
          <span className="section-tag">Features</span>
          <h2>Everything you need to <span className="highlight">thrive</span></h2>
          <p className="section-subtitle">
            We've thought through every aspect of your homeschool journey, 
            so you can focus on what matters most—your children.
          </p>
          <Link to="/features" className="features-explore-link">
            Explore all features →
          </Link>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card feature-${feature.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                <feature.icon className="feature-icon" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

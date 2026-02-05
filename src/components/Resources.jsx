import { ArrowUpRight, BookOpen, FlaskConical, Globe, Music, Calculator, Palette } from 'lucide-react'
import { useData } from '../context/SupabaseDataContext'
import './Resources.css'

const ICONS = [BookOpen, Calculator, FlaskConical, Globe, Palette, Music]

const DEFAULT_RESOURCES = [
  { icon: BookOpen, category: 'Language Arts', count: '120+ Resources', items: ['Reading comprehension', 'Creative writing', 'Grammar & vocabulary'], color: 'terracotta' },
  { icon: Calculator, category: 'Mathematics', count: '95+ Resources', items: ['Problem solving', 'Mental math', 'Geometry & algebra'], color: 'forest' },
  { icon: FlaskConical, category: 'Science', count: '85+ Resources', items: ['Hands-on experiments', 'Nature studies', 'Earth & space'], color: 'sage' },
  { icon: Globe, category: 'History & Geography', count: '75+ Resources', items: ['World cultures', 'Timeline activities', 'Map skills'], color: 'terracotta' },
  { icon: Palette, category: 'Arts & Crafts', count: '60+ Resources', items: ['Drawing tutorials', 'Craft projects', 'Art history'], color: 'forest' },
  { icon: Music, category: 'Music & Movement', count: '45+ Resources', items: ['Instrument basics', 'Music theory', 'Dance & PE'], color: 'sage' }
]

function Resources() {
  const { resources: dbResources } = useData()
  const resources = dbResources?.length > 0
    ? dbResources.map((r, i) => ({
        icon: ICONS[i % ICONS.length],
        category: r.category,
        count: r.countLabel || '',
        items: Array.isArray(r.items) ? r.items : [],
        color: r.color || 'sage',
        link: r.link
      }))
    : DEFAULT_RESOURCES

  return (
    <section id="resources" className="resources">
      <div className="resources-bg"></div>
      <div className="container">
        <div className="resources-content">
          <div className="resources-header">
            <span className="section-tag">Resources</span>
            <h2>A library that grows <span className="highlight">with you</span></h2>
            <p className="section-subtitle">
              From preschool to high school, our comprehensive resource library 
              covers every subject and learning style imaginable.
            </p>
            <a href="#" className="btn btn-primary">
              Browse All Resources
              <ArrowUpRight className="btn-icon" />
            </a>
          </div>

          <div className="resources-grid">
            {resources.map((resource, index) => (
              <div 
                key={resource.id || index} 
                className={`resource-card resource-${resource.color}`}
              >
                <div className="resource-header">
                  <div className="resource-icon-wrapper">
                    <resource.icon className="resource-icon" />
                  </div>
                  {resource.count && <span className="resource-count">{resource.count}</span>}
                </div>
                <h3>{resource.category}</h3>
                <ul className="resource-items">
                  {resource.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <a href={resource.link || '#'} className="resource-link">
                  Explore <ArrowUpRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Resources

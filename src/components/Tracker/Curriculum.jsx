import { useState } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { BookOpen, Star, ExternalLink, Filter, GraduationCap, Sparkles } from 'lucide-react'
import './Curriculum.css'

const CURRICULUM_DATA = [
  {
    id: 1,
    name: 'Math-U-See',
    subject: 'Mathematics',
    grades: 'K-12',
    style: 'Mastery-based',
    description: 'Manipulative-based program that builds understanding through a concrete, sequential approach.',
    rating: 4.8,
    price: '$$',
    tags: ['Hands-on', 'Sequential', 'Video lessons']
  },
  {
    id: 2,
    name: 'All About Reading',
    subject: 'Language Arts',
    grades: 'Pre-K - 4',
    style: 'Orton-Gillingham',
    description: 'Multisensory reading program with scripted lessons and engaging activities.',
    rating: 4.9,
    price: '$$$',
    tags: ['Multisensory', 'Scripted', 'Phonics-based']
  },
  {
    id: 3,
    name: 'Story of the World',
    subject: 'History',
    grades: '1-8',
    style: 'Narrative',
    description: 'Four-volume world history series that reads like a story with accompanying activities.',
    rating: 4.7,
    price: '$',
    tags: ['Read-aloud', 'Activity guide', 'Chronological']
  },
  {
    id: 4,
    name: 'Real Science 4 Kids',
    subject: 'Science',
    grades: 'K-8',
    style: 'Inquiry-based',
    description: 'Introduces real scientific concepts with hands-on experiments and clear explanations.',
    rating: 4.6,
    price: '$$',
    tags: ['Experiments', 'Secular', 'Colorful']
  },
  {
    id: 5,
    name: 'IEW Writing',
    subject: 'Language Arts',
    grades: '3-12',
    style: 'Structured',
    description: 'Institute for Excellence in Writing teaches composition through models and structure.',
    rating: 4.5,
    price: '$$$',
    tags: ['Video instruction', 'Structured', 'Progressive']
  },
  {
    id: 6,
    name: 'Teaching Textbooks',
    subject: 'Mathematics',
    grades: '3-12',
    style: 'Self-paced',
    description: 'Computer-based math with video lessons, automatic grading, and step-by-step solutions.',
    rating: 4.4,
    price: '$$',
    tags: ['Digital', 'Self-grading', 'Independent']
  },
  {
    id: 7,
    name: 'Apologia Science',
    subject: 'Science',
    grades: 'K-12',
    style: 'Conversational',
    description: 'Christian-based science curriculum with a conversational tone and notebooking activities.',
    rating: 4.7,
    price: '$$',
    tags: ['Faith-based', 'Notebooking', 'Thorough']
  },
  {
    id: 8,
    name: 'Beautiful Feet Books',
    subject: 'History',
    grades: 'K-12',
    style: 'Literature-based',
    description: 'History through living books approach with study guides and timelines.',
    rating: 4.6,
    price: '$$',
    tags: ['Living books', 'Charlotte Mason', 'Literature']
  },
  {
    id: 9,
    name: 'Masterpiece Society Studio',
    subject: 'Art',
    grades: 'All ages',
    style: 'Video-based',
    description: 'Art curriculum featuring various mediums and techniques with video instruction.',
    rating: 4.8,
    price: '$$',
    tags: ['Video lessons', 'Multi-medium', 'Project-based']
  },
  {
    id: 10,
    name: 'Life of Fred',
    subject: 'Mathematics',
    grades: '1-12',
    style: 'Story-based',
    description: 'Math concepts taught through the story of Fred, making abstract concepts relatable.',
    rating: 4.3,
    price: '$',
    tags: ['Story format', 'Engaging', 'Supplement']
  }
]

const SUBJECTS = ['All', 'Mathematics', 'Language Arts', 'Science', 'History', 'Art']
const STYLES = ['All', 'Mastery-based', 'Self-paced', 'Literature-based', 'Hands-on', 'Video-based']

function Curriculum({ onNavigateToConsult }) {
  const { isPremium } = useSubscription()
  const [filterSubject, setFilterSubject] = useState('All')
  const [filterStyle, setFilterStyle] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCurricula = CURRICULUM_DATA.filter(curr => {
    const matchesSubject = filterSubject === 'All' || curr.subject === filterSubject
    const matchesStyle = filterStyle === 'All' || curr.style.toLowerCase().includes(filterStyle.toLowerCase())
    const matchesSearch = searchQuery === '' || 
      curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curr.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSubject && matchesStyle && matchesSearch
  })

  return (
    <div className="curriculum">
      <div className="curriculum-header">
        <div className="header-content">
          <h1>Curriculum Suggestions</h1>
          <p>Explore our curated collection of top-rated homeschool curricula</p>
        </div>
        <button className="btn-tracker btn-primary" onClick={onNavigateToConsult}>
          <GraduationCap size={20} />
          Request Curriculum Consult
        </button>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="curriculum-ad" />}

      <div className="curriculum-filters">
        <Filter size={18} />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search curricula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="form-select"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          {SUBJECTS.map(subject => (
            <option key={subject} value={subject}>{subject === 'All' ? 'All Subjects' : subject}</option>
          ))}
        </select>
        <select 
          className="form-select"
          value={filterStyle}
          onChange={(e) => setFilterStyle(e.target.value)}
        >
          {STYLES.map(style => (
            <option key={style} value={style}>{style === 'All' ? 'All Styles' : style}</option>
          ))}
        </select>
      </div>

      <div className="curriculum-grid">
        {filteredCurricula.map((curr, index) => (
          <div key={curr.id} className="curriculum-card">
            <div className="card-header">
              <div className="card-icon">
                <BookOpen size={24} />
              </div>
              <div className="card-meta">
                <span className="card-subject">{curr.subject}</span>
                <span className="card-grades">Grades {curr.grades}</span>
              </div>
            </div>
            
            <h3>{curr.name}</h3>
            <p className="card-style">{curr.style}</p>
            <p className="card-description">{curr.description}</p>
            
            <div className="card-tags">
              {curr.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <div className="card-footer">
              <div className="card-rating">
                <Star size={16} className="star-icon" />
                <span>{curr.rating}</span>
              </div>
              <span className="card-price">{curr.price}</span>
              <button className="card-link">
                Learn More <ExternalLink size={14} />
              </button>
            </div>

            {/* Show ad after every 4th card for free users */}
            {!isPremium && (index + 1) % 4 === 0 && index < filteredCurricula.length - 1 && (
              <div className="inline-ad-wrapper">
                <AdBanner variant="inline" />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCurricula.length === 0 && (
        <div className="no-results">
          <Sparkles size={48} />
          <h3>No curricula found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}

      <div className="curriculum-cta">
        <div className="cta-content">
          <h2>Not sure which curriculum is right for you?</h2>
          <p>Our experienced consultants can help you find the perfect fit for your family's needs, learning styles, and goals.</p>
          <button className="btn-tracker btn-primary btn-lg" onClick={onNavigateToConsult}>
            <GraduationCap size={20} />
            Schedule a Curriculum Consultation
          </button>
          {isPremium && (
            <p className="premium-note">
              <Sparkles size={16} />
              As a Premium member, your first 15-minute consultation is FREE!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Curriculum

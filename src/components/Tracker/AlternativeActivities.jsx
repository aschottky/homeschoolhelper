import { useState } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { 
  Lightbulb, ChefHat, TreePine, Palette, Music, Gamepad2, 
  Hammer, Flower2, Film, MapPin, ShoppingCart, Dumbbell,
  BookOpen, Microscope, Calculator, Globe, Pen, Users,
  Heart, Sparkles, Search, Filter, Clock, CheckCircle2
} from 'lucide-react'
import './AlternativeActivities.css'

const SUBJECTS = [
  { id: 'math', name: 'Math', icon: Calculator, color: '#6366f1' },
  { id: 'science', name: 'Science', icon: Microscope, color: '#10b981' },
  { id: 'language', name: 'Language Arts', icon: Pen, color: '#f59e0b' },
  { id: 'reading', name: 'Reading', icon: BookOpen, color: '#8b5cf6' },
  { id: 'social', name: 'Social Studies', icon: Globe, color: '#3b82f6' },
  { id: 'art', name: 'Art', icon: Palette, color: '#ec4899' },
  { id: 'music', name: 'Music', icon: Music, color: '#14b8a6' },
  { id: 'pe', name: 'Physical Ed', icon: Dumbbell, color: '#ef4444' },
  { id: 'life', name: 'Life Skills', icon: Heart, color: '#f97316' },
]

const ALTERNATIVE_ACTIVITIES = [
  {
    id: 'baking',
    name: 'Baking & Cooking',
    icon: ChefHat,
    color: '#D4896A',
    description: 'Following recipes teaches measurements, fractions, and chemical reactions.',
    subjects: ['math', 'science', 'reading', 'life'],
    examples: [
      'Measure ingredients using fractions (½ cup, ¼ tsp)',
      'Double or halve a recipe (multiplication/division)',
      'Observe chemical reactions (baking soda + vinegar, yeast rising)',
      'Read and follow recipe instructions',
      'Learn about nutrition and food groups',
      'Practice kitchen safety and hygiene'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-90 min'
  },
  {
    id: 'nature-walk',
    name: 'Nature Walks & Hikes',
    icon: TreePine,
    color: '#5A8F7B',
    description: 'Exploring outdoors teaches biology, ecology, and observation skills.',
    subjects: ['science', 'pe', 'art'],
    examples: [
      'Identify plants, trees, and flowers',
      'Observe and track wildlife',
      'Learn about ecosystems and habitats',
      'Collect specimens for nature journals',
      'Sketch plants and animals',
      'Track weather patterns and seasons'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-120 min'
  },
  {
    id: 'gardening',
    name: 'Gardening',
    icon: Flower2,
    color: '#2D5A4A',
    description: 'Growing plants teaches biology, responsibility, and patience.',
    subjects: ['science', 'math', 'life'],
    examples: [
      'Learn plant life cycles and photosynthesis',
      'Measure garden plots and plant spacing',
      'Track growth with measurements and charts',
      'Study soil composition and nutrients',
      'Learn about pollinators and beneficial insects',
      'Plan and budget for seeds and supplies'
    ],
    ageRange: 'All ages',
    timeEstimate: '20-60 min'
  },
  {
    id: 'building',
    name: 'Building & Construction',
    icon: Hammer,
    color: '#8B7355',
    description: 'Building projects teach engineering, math, and problem-solving.',
    subjects: ['math', 'science', 'art'],
    examples: [
      'Build with LEGO, blocks, or K\'Nex',
      'Construct birdhouses or simple furniture',
      'Create marble runs or Rube Goldberg machines',
      'Design and build bridges from popsicle sticks',
      'Learn about structural integrity and weight distribution',
      'Use measurements and angles in construction'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-120 min'
  },
  {
    id: 'art-projects',
    name: 'Art Projects',
    icon: Palette,
    color: '#C4A484',
    description: 'Creating art teaches history, culture, and fine motor skills.',
    subjects: ['art', 'social', 'science'],
    examples: [
      'Study famous artists and recreate their styles',
      'Learn about color theory and mixing',
      'Explore art from different cultures and time periods',
      'Create pottery or sculptures (geometry, 3D shapes)',
      'Make natural dyes from plants',
      'Learn perspective and proportions'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-90 min'
  },
  {
    id: 'music',
    name: 'Music & Instruments',
    icon: Music,
    color: '#6B8E7B',
    description: 'Music teaches math patterns, history, and cultural appreciation.',
    subjects: ['music', 'math', 'social'],
    examples: [
      'Learn an instrument (rhythm, timing, fractions)',
      'Study music from different cultures and eras',
      'Compose simple songs or melodies',
      'Learn to read sheet music (patterns, counting)',
      'Explore the physics of sound',
      'Sing folk songs and learn their historical context'
    ],
    ageRange: 'All ages',
    timeEstimate: '15-60 min'
  },
  {
    id: 'board-games',
    name: 'Board Games & Puzzles',
    icon: Gamepad2,
    color: '#E8A87C',
    description: 'Strategic games teach math, logic, and critical thinking.',
    subjects: ['math', 'social', 'language'],
    examples: [
      'Play math-focused games (Monopoly, Life)',
      'Strategy games (Chess, Settlers of Catan)',
      'Word games (Scrabble, Boggle, Bananagrams)',
      'Geography games (Ticket to Ride)',
      'Logic puzzles and Sudoku',
      'Cooperative games for teamwork skills'
    ],
    ageRange: 'Varies by game',
    timeEstimate: '20-90 min'
  },
  {
    id: 'documentaries',
    name: 'Educational Videos',
    icon: Film,
    color: '#7C6B8E',
    description: 'Quality documentaries and videos bring subjects to life.',
    subjects: ['science', 'social', 'art', 'music'],
    examples: [
      'Nature documentaries (Planet Earth, etc.)',
      'Historical documentaries and docudramas',
      'Science shows (Bill Nye, SciShow)',
      'Virtual museum tours',
      'How-it\'s-made videos',
      'Biographies of historical figures'
    ],
    ageRange: 'All ages',
    timeEstimate: '20-60 min'
  },
  {
    id: 'field-trips',
    name: 'Field Trips',
    icon: MapPin,
    color: '#B58863',
    description: 'Real-world experiences make learning memorable and meaningful.',
    subjects: ['science', 'social', 'art', 'life'],
    examples: [
      'Museums (science, art, history, children\'s)',
      'Zoos, aquariums, and nature centers',
      'Historical sites and landmarks',
      'Factories and business tours',
      'Farms and orchting',
      'Libraries and author events'
    ],
    ageRange: 'All ages',
    timeEstimate: '1-4 hours'
  },
  {
    id: 'grocery-shopping',
    name: 'Grocery Shopping',
    icon: ShoppingCart,
    color: '#4A7C6B',
    description: 'Shopping trips teach budgeting, nutrition, and real-world math.',
    subjects: ['math', 'life', 'reading', 'science'],
    examples: [
      'Create shopping lists and meal plans',
      'Compare prices and calculate unit costs',
      'Stay within a budget',
      'Read nutrition labels',
      'Learn about food origins and seasons',
      'Practice making change and counting money'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-90 min'
  },
  {
    id: 'sports',
    name: 'Sports & Exercise',
    icon: Dumbbell,
    color: '#ef4444',
    description: 'Physical activities teach health, teamwork, and perseverance.',
    subjects: ['pe', 'math', 'science'],
    examples: [
      'Team sports (soccer, basketball, baseball)',
      'Individual sports (swimming, martial arts, gymnastics)',
      'Track statistics and calculate averages',
      'Learn about anatomy and muscle groups',
      'Study physics of motion in sports',
      'Set goals and track improvement'
    ],
    ageRange: 'All ages',
    timeEstimate: '30-120 min'
  },
  {
    id: 'community-service',
    name: 'Community Service',
    icon: Users,
    color: '#8FB39A',
    description: 'Volunteering teaches citizenship, empathy, and social responsibility.',
    subjects: ['social', 'life', 'language'],
    examples: [
      'Volunteer at food banks or shelters',
      'Visit nursing homes or hospitals',
      'Participate in community clean-ups',
      'Help neighbors with yard work or errands',
      'Organize donation drives',
      'Write letters to soldiers or seniors'
    ],
    ageRange: 'All ages',
    timeEstimate: '1-3 hours'
  }
]

function AlternativeActivities() {
  const { isPremium } = useSubscription()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [expandedActivity, setExpandedActivity] = useState(null)

  // Filter activities
  const filteredActivities = ALTERNATIVE_ACTIVITIES.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || activity.subjects.includes(selectedSubject)
    return matchesSearch && matchesSubject
  })

  const getSubjectInfo = (subjectId) => {
    return SUBJECTS.find(s => s.id === subjectId)
  }

  return (
    <div className="alternative-activities">
      <div className="activities-header">
        <div className="header-content">
          <h1>
            <Lightbulb className="header-icon" />
            Alternative Learning Activities
          </h1>
          <p>Creative ways to fill school hours with everyday experiences</p>
        </div>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="activities-ad" />}

      {/* Info Banner */}
      <div className="info-banner">
        <Sparkles size={20} />
        <div>
          <strong>Learning happens everywhere!</strong>
          <p>Many everyday activities can count toward your required school hours. 
             Use these suggestions to add variety to your homeschool day.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="subject-filters">
          <Filter size={18} />
          <button
            className={`subject-filter ${!selectedSubject ? 'active' : ''}`}
            onClick={() => setSelectedSubject('')}
          >
            All Subjects
          </button>
          {SUBJECTS.map(subject => {
            const SubjectIcon = subject.icon
            return (
              <button
                key={subject.id}
                className={`subject-filter ${selectedSubject === subject.id ? 'active' : ''}`}
                onClick={() => setSelectedSubject(selectedSubject === subject.id ? '' : subject.id)}
                style={{ '--subject-color': subject.color }}
              >
                <SubjectIcon size={14} />
                {subject.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="activities-grid">
        {filteredActivities.map(activity => {
          const ActivityIcon = activity.icon
          const isExpanded = expandedActivity === activity.id
          
          return (
            <div 
              key={activity.id} 
              className={`activity-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
            >
              <div className="activity-header">
                <div className="activity-icon" style={{ background: activity.color }}>
                  <ActivityIcon size={28} />
                </div>
                <div className="activity-title">
                  <h3>{activity.name}</h3>
                  <div className="activity-meta">
                    <span><Clock size={14} /> {activity.timeEstimate}</span>
                    <span>{activity.ageRange}</span>
                  </div>
                </div>
              </div>

              <p className="activity-description">{activity.description}</p>

              <div className="activity-subjects">
                <span className="subjects-label">Counts toward:</span>
                <div className="subject-tags">
                  {activity.subjects.map(subjectId => {
                    const subject = getSubjectInfo(subjectId)
                    if (!subject) return null
                    const SubjectIcon = subject.icon
                    return (
                      <span 
                        key={subjectId} 
                        className="subject-tag"
                        style={{ '--tag-color': subject.color }}
                      >
                        <SubjectIcon size={12} />
                        {subject.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              {isExpanded && (
                <div className="activity-examples">
                  <h4>Ideas & Examples:</h4>
                  <ul>
                    {activity.examples.map((example, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={16} />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="expand-btn">
                {isExpanded ? 'Show Less' : 'See Ideas'}
              </button>
            </div>
          )
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="empty-state">
          <Search size={48} />
          <h3>No activities found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="tips-section">
        <h2>Tips for Logging Alternative Activities</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-number">1</div>
            <h4>Document the Learning</h4>
            <p>Take photos, keep a journal, or create a portfolio of completed projects to show what was learned.</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">2</div>
            <h4>Connect to Standards</h4>
            <p>Note which skills or concepts are being practiced during each activity.</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">3</div>
            <h4>Be Consistent</h4>
            <p>Log hours promptly after activities while details are fresh in your mind.</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">4</div>
            <h4>Follow Your State Laws</h4>
            <p>Check your state's requirements for what counts toward instructional hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlternativeActivities

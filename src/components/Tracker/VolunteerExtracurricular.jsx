import { useState, useEffect, useRef } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { 
  Heart, Award, Plus, Trash2, Calendar, Clock, MapPin, 
  Building2, Trophy, Music, Palette, Users, Dumbbell,
  BookOpen, Globe, Code, Mic, Camera, Theater, ChevronDown,
  FileText, Printer, Download, Edit2, Check, X, GraduationCap,
  Crown, Sparkles, CheckCircle2
} from 'lucide-react'
import './VolunteerExtracurricular.css'

const VOLUNTEER_CATEGORIES = [
  { id: 'community', name: 'Community Service', icon: Users },
  { id: 'religious', name: 'Religious/Faith-Based', icon: Heart },
  { id: 'environmental', name: 'Environmental', icon: Globe },
  { id: 'healthcare', name: 'Healthcare', icon: Heart },
  { id: 'education', name: 'Education/Tutoring', icon: BookOpen },
  { id: 'animal', name: 'Animal Welfare', icon: Heart },
  { id: 'political', name: 'Political/Civic', icon: Building2 },
  { id: 'other', name: 'Other', icon: Heart },
]

const EXTRACURRICULAR_CATEGORIES = [
  { id: 'sports', name: 'Sports/Athletics', icon: Dumbbell },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'art', name: 'Visual Arts', icon: Palette },
  { id: 'theater', name: 'Theater/Drama', icon: Theater },
  { id: 'debate', name: 'Debate/Speech', icon: Mic },
  { id: 'academic', name: 'Academic Clubs', icon: BookOpen },
  { id: 'stem', name: 'STEM/Robotics', icon: Code },
  { id: 'journalism', name: 'Journalism/Media', icon: Camera },
  { id: 'leadership', name: 'Leadership/Government', icon: Award },
  { id: 'cultural', name: 'Cultural', icon: Globe },
  { id: 'other', name: 'Other', icon: Trophy },
]

const GRADE_LEVELS = ['9th Grade', '10th Grade', '11th Grade', '12th Grade']

function VolunteerExtracurricular({ onNavigateToUpgrade }) {
  const { children, homeschoolProfile } = useData()
  const { isPremium } = useSubscription()
  
  const [activeTab, setActiveTab] = useState('volunteer')
  const [selectedChild, setSelectedChild] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [volunteerLogs, setVolunteerLogs] = useState([])
  const [extracurricularLogs, setExtracurricularLogs] = useState([])
  
  const reportRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    childId: '',
    category: '',
    organization: '',
    role: '',
    description: '',
    startDate: '',
    endDate: '',
    hours: '',
    hoursPerWeek: '',
    weeksPerYear: '',
    gradeLevel: [],
    achievements: '',
    supervisorName: '',
    supervisorContact: '',
    ongoing: false
  })

  // Load from localStorage
  useEffect(() => {
    const savedVolunteer = localStorage.getItem('homeschool_volunteer_hours')
    const savedExtracurricular = localStorage.getItem('homeschool_extracurricular')
    if (savedVolunteer) setVolunteerLogs(JSON.parse(savedVolunteer))
    if (savedExtracurricular) setExtracurricularLogs(JSON.parse(savedExtracurricular))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('homeschool_volunteer_hours', JSON.stringify(volunteerLogs))
  }, [volunteerLogs])

  useEffect(() => {
    localStorage.setItem('homeschool_extracurricular', JSON.stringify(extracurricularLogs))
  }, [extracurricularLogs])

  // Reset form
  const resetForm = () => {
    setFormData({
      childId: selectedChild || '',
      category: '',
      organization: '',
      role: '',
      description: '',
      startDate: '',
      endDate: '',
      hours: '',
      hoursPerWeek: '',
      weeksPerYear: '',
      gradeLevel: [],
      achievements: '',
      supervisorName: '',
      supervisorContact: '',
      ongoing: false
    })
    setEditingItem(null)
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const item = {
      id: editingItem?.id || Date.now().toString(),
      ...formData,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (activeTab === 'volunteer') {
      if (editingItem) {
        setVolunteerLogs(prev => prev.map(v => v.id === item.id ? item : v))
      } else {
        setVolunteerLogs(prev => [item, ...prev])
      }
    } else {
      if (editingItem) {
        setExtracurricularLogs(prev => prev.map(e => e.id === item.id ? item : e))
      } else {
        setExtracurricularLogs(prev => [item, ...prev])
      }
    }

    setShowAddForm(false)
    resetForm()
  }

  // Delete item
  const handleDelete = (id, type) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      if (type === 'volunteer') {
        setVolunteerLogs(prev => prev.filter(v => v.id !== id))
      } else {
        setExtracurricularLogs(prev => prev.filter(e => e.id !== id))
      }
    }
  }

  // Edit item
  const handleEdit = (item, type) => {
    setActiveTab(type)
    setFormData(item)
    setEditingItem(item)
    setShowAddForm(true)
  }

  // Toggle grade level
  const toggleGradeLevel = (grade) => {
    setFormData(prev => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(grade)
        ? prev.gradeLevel.filter(g => g !== grade)
        : [...prev.gradeLevel, grade]
    }))
  }

  // Get filtered logs
  const getFilteredLogs = (logs) => {
    if (!selectedChild) return logs
    return logs.filter(log => log.childId === selectedChild)
  }

  // Calculate totals
  const getTotalVolunteerHours = (childId = null) => {
    const logs = childId 
      ? volunteerLogs.filter(v => v.childId === childId)
      : volunteerLogs
    return logs.reduce((total, log) => total + (Number(log.hours) || 0), 0)
  }

  // Get child name
  const getChildName = (childId) => {
    return children.find(c => c.id === childId)?.name || 'Unknown'
  }

  // Get category info
  const getCategoryInfo = (categoryId, type) => {
    const categories = type === 'volunteer' ? VOLUNTEER_CATEGORIES : EXTRACURRICULAR_CATEGORIES
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1]
  }

  // Print report
  const handlePrint = () => {
    window.print()
  }

  const filteredVolunteer = getFilteredLogs(volunteerLogs)
  const filteredExtracurricular = getFilteredLogs(extracurricularLogs)

  // Premium gate for non-premium users
  if (!isPremium) {
    return (
      <div className="volunteer-extracurricular">
        <div className="ve-header">
          <div className="header-content">
            <h1>Volunteer & Extracurricular</h1>
            <p>Track activities for college applications and personal growth</p>
          </div>
        </div>

        <div className="premium-gate">
          <div className="premium-icon">
            <Crown size={48} />
          </div>
          <h2>Premium Feature</h2>
          <p>
            Upgrade to Premium to track volunteer hours and extracurricular activities, 
            and generate professional reports for college applications.
          </p>
          
          <div className="premium-features">
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Track volunteer service hours
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Log extracurricular activities
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Record achievements & awards
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Printable college application reports
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Track by grade level (9th-12th)
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Supervisor contact information
            </div>
          </div>

          <button 
            className="btn-tracker btn-primary"
            onClick={onNavigateToUpgrade}
          >
            <Sparkles size={18} />
            Upgrade to Premium
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="volunteer-extracurricular">
      <div className="ve-header">
        <div className="header-content">
          <h1>Volunteer & Extracurricular</h1>
          <p>Track activities for college applications and personal growth</p>
        </div>
        <div className="header-actions">
          {selectedChild && (
            <button 
              className="btn-tracker btn-secondary"
              onClick={() => setShowReport(true)}
            >
              <FileText size={18} />
              View Report
            </button>
          )}
          <button 
            className="btn-tracker btn-primary"
            onClick={() => { resetForm(); setShowAddForm(true); }}
          >
            <Plus size={20} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Child Selector */}
      <div className="child-selector">
        <label>Select Student:</label>
        <select
          className="form-select"
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
        >
          <option value="">All Students</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="ve-stats">
        <div className="stat-card volunteer">
          <Heart size={28} />
          <div className="stat-info">
            <span className="stat-value">{getTotalVolunteerHours(selectedChild || null)}</span>
            <span className="stat-label">Volunteer Hours</span>
          </div>
        </div>
        <div className="stat-card extracurricular">
          <Award size={28} />
          <div className="stat-info">
            <span className="stat-value">{filteredExtracurricular.length}</span>
            <span className="stat-label">Activities</span>
          </div>
        </div>
        <div className="stat-card">
          <Building2 size={28} />
          <div className="stat-info">
            <span className="stat-value">
              {new Set([...filteredVolunteer, ...filteredExtracurricular].map(l => l.organization)).size}
            </span>
            <span className="stat-label">Organizations</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ve-tabs">
        <button 
          className={`tab ${activeTab === 'volunteer' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteer')}
        >
          <Heart size={18} />
          Volunteer Service ({filteredVolunteer.length})
        </button>
        <button 
          className={`tab ${activeTab === 'extracurricular' ? 'active' : ''}`}
          onClick={() => setActiveTab('extracurricular')}
        >
          <Award size={18} />
          Extracurricular ({filteredExtracurricular.length})
        </button>
      </div>

      {/* Content */}
      <div className="ve-content">
        {activeTab === 'volunteer' ? (
          filteredVolunteer.length === 0 ? (
            <div className="empty-state">
              <Heart size={48} />
              <h3>No volunteer service logged yet</h3>
              <p>Track community service hours for college applications and personal growth.</p>
              <button className="btn-tracker btn-primary" onClick={() => { resetForm(); setShowAddForm(true); }}>
                <Plus size={18} /> Add Volunteer Service
              </button>
            </div>
          ) : (
            <div className="entries-list">
              {filteredVolunteer.map(entry => {
                const category = getCategoryInfo(entry.category, 'volunteer')
                const CategoryIcon = category.icon
                return (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-icon volunteer">
                      <CategoryIcon size={24} />
                    </div>
                    <div className="entry-content">
                      <div className="entry-header">
                        <h4>{entry.organization}</h4>
                        <span className="entry-hours">{entry.hours} hours</span>
                      </div>
                      <p className="entry-role">{entry.role}</p>
                      <p className="entry-description">{entry.description}</p>
                      <div className="entry-meta">
                        <span><Calendar size={14} /> {entry.startDate} - {entry.ongoing ? 'Present' : entry.endDate}</span>
                        {!selectedChild && <span><Users size={14} /> {getChildName(entry.childId)}</span>}
                        {entry.gradeLevel.length > 0 && (
                          <span><GraduationCap size={14} /> {entry.gradeLevel.join(', ')}</span>
                        )}
                      </div>
                      {entry.achievements && (
                        <div className="entry-achievements">
                          <Trophy size={14} /> {entry.achievements}
                        </div>
                      )}
                    </div>
                    <div className="entry-actions">
                      <button onClick={() => handleEdit(entry, 'volunteer')} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(entry.id, 'volunteer')} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          filteredExtracurricular.length === 0 ? (
            <div className="empty-state">
              <Award size={48} />
              <h3>No extracurricular activities logged yet</h3>
              <p>Track sports, clubs, arts, and other activities for your portfolio.</p>
              <button className="btn-tracker btn-primary" onClick={() => { resetForm(); setShowAddForm(true); }}>
                <Plus size={18} /> Add Activity
              </button>
            </div>
          ) : (
            <div className="entries-list">
              {filteredExtracurricular.map(entry => {
                const category = getCategoryInfo(entry.category, 'extracurricular')
                const CategoryIcon = category.icon
                return (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-icon extracurricular">
                      <CategoryIcon size={24} />
                    </div>
                    <div className="entry-content">
                      <div className="entry-header">
                        <h4>{entry.organization}</h4>
                        <span className="entry-time">
                          {entry.hoursPerWeek && entry.weeksPerYear 
                            ? `${entry.hoursPerWeek}hr/wk, ${entry.weeksPerYear}wk/yr`
                            : entry.hours ? `${entry.hours} hours` : ''}
                        </span>
                      </div>
                      <p className="entry-role">{entry.role}</p>
                      <p className="entry-description">{entry.description}</p>
                      <div className="entry-meta">
                        <span><Calendar size={14} /> {entry.startDate} - {entry.ongoing ? 'Present' : entry.endDate}</span>
                        {!selectedChild && <span><Users size={14} /> {getChildName(entry.childId)}</span>}
                        {entry.gradeLevel.length > 0 && (
                          <span><GraduationCap size={14} /> {entry.gradeLevel.join(', ')}</span>
                        )}
                      </div>
                      {entry.achievements && (
                        <div className="entry-achievements">
                          <Trophy size={14} /> {entry.achievements}
                        </div>
                      )}
                    </div>
                    <div className="entry-actions">
                      <button onClick={() => handleEdit(entry, 'extracurricular')} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(entry.id, 'extracurricular')} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => { setShowAddForm(false); resetForm(); }}>
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {activeTab === 'volunteer' ? <Heart size={20} /> : <Award size={20} />}
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'volunteer' ? 'Volunteer Service' : 'Extracurricular Activity'}
              </h3>
              <button className="close-btn" onClick={() => { setShowAddForm(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="ve-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Student *</label>
                  <select
                    className="form-select"
                    value={formData.childId}
                    onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                    required
                  >
                    <option value="">Select student</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {(activeTab === 'volunteer' ? VOLUNTEER_CATEGORIES : EXTRACURRICULAR_CATEGORIES).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Organization/Activity Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g., Local Food Bank, Varsity Soccer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Position/Role *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Volunteer Coordinator, Team Captain"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your responsibilities and contributions..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date {formData.ongoing ? '(Ongoing)' : '*'}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.ongoing}
                    required={!formData.ongoing}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.ongoing}
                    onChange={(e) => setFormData({ ...formData, ongoing: e.target.checked, endDate: '' })}
                  />
                  <span>This activity is ongoing</span>
                </label>
              </div>

              <div className="form-group">
                <label>Grade Level(s) Participated</label>
                <div className="grade-selector">
                  {GRADE_LEVELS.map(grade => (
                    <button
                      key={grade}
                      type="button"
                      className={`grade-btn ${formData.gradeLevel.includes(grade) ? 'selected' : ''}`}
                      onClick={() => toggleGradeLevel(grade)}
                    >
                      {formData.gradeLevel.includes(grade) && <Check size={14} />}
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'volunteer' ? (
                <div className="form-group">
                  <label>Total Hours *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Total hours served"
                    min="0"
                    required
                  />
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-group">
                    <label>Hours per Week</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.hoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                      placeholder="e.g., 10"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weeks per Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.weeksPerYear}
                      onChange={(e) => setFormData({ ...formData, weeksPerYear: e.target.value })}
                      placeholder="e.g., 40"
                      min="0"
                      max="52"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Achievements/Awards (optional)</label>
                <textarea
                  className="form-textarea"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="List any awards, recognitions, or notable achievements..."
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Supervisor Name (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="Contact person name"
                  />
                </div>
                <div className="form-group">
                  <label>Supervisor Contact (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.supervisorContact}
                    onChange={(e) => setFormData({ ...formData, supervisorContact: e.target.value })}
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-tracker btn-secondary" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-tracker btn-primary">
                  {editingItem ? <Check size={18} /> : <Plus size={18} />}
                  {editingItem ? 'Update' : 'Add'} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && selectedChild && (
        <div className="modal-overlay report-overlay" onClick={() => setShowReport(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="report-toolbar no-print">
              <h3><FileText size={20} /> College Application Report</h3>
              <div className="toolbar-actions">
                <button className="btn-tracker btn-secondary" onClick={handlePrint}>
                  <Printer size={18} /> Print
                </button>
                <button className="close-btn" onClick={() => setShowReport(false)}>×</button>
              </div>
            </div>

            <div className="report-content" ref={reportRef}>
              <div className="report-header">
                {homeschoolProfile.homeschoolName && (
                  <div className="school-info">
                    <h1 className="school-name">{homeschoolProfile.homeschoolName}</h1>
                    {homeschoolProfile.parentName && (
                      <p className="school-admin">{homeschoolProfile.parentName}, Administrator</p>
                    )}
                    {(homeschoolProfile.address || homeschoolProfile.city) && (
                      <p className="school-address">
                        {homeschoolProfile.address && <span>{homeschoolProfile.address}<br /></span>}
                        {homeschoolProfile.city && homeschoolProfile.state && (
                          <span>{homeschoolProfile.city}, {homeschoolProfile.state} {homeschoolProfile.zip}</span>
                        )}
                      </p>
                    )}
                    {(homeschoolProfile.phone || homeschoolProfile.email) && (
                      <p className="school-contact">
                        {homeschoolProfile.phone}{homeschoolProfile.phone && homeschoolProfile.email && ' • '}{homeschoolProfile.email}
                      </p>
                    )}
                  </div>
                )}
                <h2 className="report-title">Activities & Service Record</h2>
                <div className="student-info">
                  <h3>{getChildName(selectedChild)}</h3>
                  <p>{homeschoolProfile.homeschoolName ? 'Student' : 'Homeschool Student'}</p>
                </div>
              </div>

              {/* Extracurricular Section */}
              <section className="report-section">
                <h3>Extracurricular Activities</h3>
                {filteredExtracurricular.length === 0 ? (
                  <p className="no-entries">No extracurricular activities recorded.</p>
                ) : (
                  <div className="report-entries">
                    {filteredExtracurricular.map((entry, idx) => (
                      <div key={entry.id} className="report-entry">
                        <div className="entry-number">{idx + 1}</div>
                        <div className="entry-details">
                          <div className="entry-title">
                            <strong>{entry.organization}</strong>
                            <span className="entry-category">{getCategoryInfo(entry.category, 'extracurricular').name}</span>
                          </div>
                          <div className="entry-role-line">
                            <em>{entry.role}</em>
                            {entry.gradeLevel.length > 0 && (
                              <span className="grade-badges">
                                {entry.gradeLevel.map(g => g.replace(' Grade', '')).join(', ')}
                              </span>
                            )}
                          </div>
                          <p className="entry-desc">{entry.description}</p>
                          <div className="entry-stats">
                            <span><strong>Duration:</strong> {entry.startDate} - {entry.ongoing ? 'Present' : entry.endDate}</span>
                            {entry.hoursPerWeek && entry.weeksPerYear && (
                              <span><strong>Time:</strong> {entry.hoursPerWeek} hr/week, {entry.weeksPerYear} weeks/year</span>
                            )}
                          </div>
                          {entry.achievements && (
                            <p className="entry-awards"><strong>Achievements:</strong> {entry.achievements}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Volunteer Section */}
              <section className="report-section">
                <h3>Community Service & Volunteer Work</h3>
                <div className="total-hours-badge">
                  Total Volunteer Hours: <strong>{getTotalVolunteerHours(selectedChild)}</strong>
                </div>
                {filteredVolunteer.length === 0 ? (
                  <p className="no-entries">No volunteer service recorded.</p>
                ) : (
                  <div className="report-entries">
                    {filteredVolunteer.map((entry, idx) => (
                      <div key={entry.id} className="report-entry">
                        <div className="entry-number">{idx + 1}</div>
                        <div className="entry-details">
                          <div className="entry-title">
                            <strong>{entry.organization}</strong>
                            <span className="entry-hours-badge">{entry.hours} hours</span>
                          </div>
                          <div className="entry-role-line">
                            <em>{entry.role}</em>
                            {entry.gradeLevel.length > 0 && (
                              <span className="grade-badges">
                                {entry.gradeLevel.map(g => g.replace(' Grade', '')).join(', ')}
                              </span>
                            )}
                          </div>
                          <p className="entry-desc">{entry.description}</p>
                          <div className="entry-stats">
                            <span><strong>Duration:</strong> {entry.startDate} - {entry.ongoing ? 'Present' : entry.endDate}</span>
                          </div>
                          {entry.achievements && (
                            <p className="entry-awards"><strong>Achievements:</strong> {entry.achievements}</p>
                          )}
                          {entry.supervisorName && (
                            <p className="entry-contact">
                              <strong>Supervisor:</strong> {entry.supervisorName}
                              {entry.supervisorContact && ` (${entry.supervisorContact})`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="report-footer">
                <p>Generated on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerExtracurricular

import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdBanner from '../Ads/AdBanner'
import { 
  GraduationCap, Plus, Save, FileText, Calendar, Settings, 
  ChevronDown, ChevronUp, Trash2, Image, Lock, Sparkles,
  Download, Printer, Award
} from 'lucide-react'
import './Grades.css'

const GRADING_SCALES = {
  letter: {
    name: 'Letter Grades (A-F)',
    grades: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
    getGPA: (grade) => {
      const gpaMap = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 }
      return gpaMap[grade] || 0
    }
  },
  percentage: {
    name: 'Percentage (0-100)',
    grades: null,
    getGPA: (grade) => {
      const num = parseFloat(grade)
      if (num >= 93) return 4.0
      if (num >= 90) return 3.7
      if (num >= 87) return 3.3
      if (num >= 83) return 3.0
      if (num >= 80) return 2.7
      if (num >= 77) return 2.3
      if (num >= 73) return 2.0
      if (num >= 70) return 1.7
      if (num >= 67) return 1.3
      if (num >= 63) return 1.0
      if (num >= 60) return 0.7
      return 0.0
    }
  },
  passFail: {
    name: 'Pass/Fail',
    grades: ['Pass', 'Fail', 'In Progress'],
    getGPA: () => null
  }
}

const GRADING_PERIODS = {
  quarters: { name: 'Quarters', periods: ['Q1', 'Q2', 'Q3', 'Q4'] },
  semesters: { name: 'Semesters', periods: ['Semester 1', 'Semester 2'] },
  trimesters: { name: 'Trimesters', periods: ['Trimester 1', 'Trimester 2', 'Trimester 3'] }
}

function Grades() {
  const { children, getSubjectHours } = useData()
  const { isPremium, upgradeToPremium } = useSubscription()

  const [gradesData, setGradesData] = useState({})
  const [settings, setSettings] = useState({
    gradingScale: 'letter',
    gradingPeriod: 'quarters',
    schoolYear: new Date().getFullYear().toString()
  })
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showReportCard, setShowReportCard] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const savedGrades = localStorage.getItem('homeschool_grades')
    const savedSettings = localStorage.getItem('homeschool_grade_settings')
    if (savedGrades) setGradesData(JSON.parse(savedGrades))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('homeschool_grades', JSON.stringify(gradesData))
  }, [gradesData])

  useEffect(() => {
    localStorage.setItem('homeschool_grade_settings', JSON.stringify(settings))
  }, [settings])

  // Set default period
  useEffect(() => {
    if (!selectedPeriod && settings.gradingPeriod) {
      setSelectedPeriod(GRADING_PERIODS[settings.gradingPeriod].periods[0])
    }
  }, [settings.gradingPeriod, selectedPeriod])

  const selectedChildData = children.find(c => c.id === selectedChild)
  const currentScale = GRADING_SCALES[settings.gradingScale]
  const currentPeriods = GRADING_PERIODS[settings.gradingPeriod]

  // Get grade for a subject
  const getGrade = (childId, subjectId, period) => {
    return gradesData[childId]?.[period]?.[subjectId]?.grade || ''
  }

  // Get notes for a subject
  const getNotes = (childId, subjectId, period) => {
    return gradesData[childId]?.[period]?.[subjectId]?.notes || ''
  }

  // Get work samples for a subject
  const getWorkSamples = (childId, subjectId, period) => {
    return gradesData[childId]?.[period]?.[subjectId]?.workSamples || []
  }

  // Set grade for a subject
  const setGrade = (childId, subjectId, period, grade) => {
    setGradesData(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [period]: {
          ...prev[childId]?.[period],
          [subjectId]: {
            ...prev[childId]?.[period]?.[subjectId],
            grade,
            updatedAt: new Date().toISOString()
          }
        }
      }
    }))
  }

  // Set notes for a subject
  const setNotes = (childId, subjectId, period, notes) => {
    setGradesData(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [period]: {
          ...prev[childId]?.[period],
          [subjectId]: {
            ...prev[childId]?.[period]?.[subjectId],
            notes
          }
        }
      }
    }))
  }

  // Add work sample
  const addWorkSample = (childId, subjectId, period, sample) => {
    setGradesData(prev => {
      const existing = prev[childId]?.[period]?.[subjectId]?.workSamples || []
      return {
        ...prev,
        [childId]: {
          ...prev[childId],
          [period]: {
            ...prev[childId]?.[period],
            [subjectId]: {
              ...prev[childId]?.[period]?.[subjectId],
              workSamples: [...existing, { ...sample, id: Date.now(), addedAt: new Date().toISOString() }]
            }
          }
        }
      }
    })
  }

  // Delete work sample
  const deleteWorkSample = (childId, subjectId, period, sampleId) => {
    setGradesData(prev => {
      const existing = prev[childId]?.[period]?.[subjectId]?.workSamples || []
      return {
        ...prev,
        [childId]: {
          ...prev[childId],
          [period]: {
            ...prev[childId]?.[period],
            [subjectId]: {
              ...prev[childId]?.[period]?.[subjectId],
              workSamples: existing.filter(s => s.id !== sampleId)
            }
          }
        }
      }
    })
  }

  // Handle image upload
  const handleImageUpload = (childId, subjectId, period, event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      addWorkSample(childId, subjectId, period, {
        type: 'image',
        name: file.name,
        data: e.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  // Calculate GPA for a period
  const calculatePeriodGPA = (childId, period) => {
    if (!selectedChildData || settings.gradingScale === 'passFail') return null
    
    let totalPoints = 0
    let count = 0
    
    selectedChildData.subjects.forEach(subject => {
      const grade = getGrade(childId, subject.id, period)
      if (grade) {
        const gpa = currentScale.getGPA(grade)
        if (gpa !== null) {
          totalPoints += gpa
          count++
        }
      }
    })
    
    return count > 0 ? (totalPoints / count).toFixed(2) : null
  }

  // Print report card
  const printReportCard = () => {
    window.print()
  }

  if (!isPremium) {
    return (
      <div className="grades">
        <div className="grades-header">
          <h1>Grades & Report Cards</h1>
          <p>Track grades and generate report cards for each student</p>
        </div>

        <div className="premium-gate">
          <div className="gate-icon">
            <Lock size={48} />
          </div>
          <h2>Premium Feature</h2>
          <p>Upgrade to Premium to access the grading and report card system:</p>
          <ul>
            <li><GraduationCap size={18} /> Enter grades for each subject by quarter or semester</li>
            <li><FileText size={18} /> Generate printable report cards</li>
            <li><Image size={18} /> Store work samples and screenshots</li>
            <li><Award size={18} /> Track GPA automatically</li>
          </ul>
          <button className="btn-tracker btn-primary btn-lg" onClick={upgradeToPremium}>
            <Sparkles size={20} />
            Upgrade to Premium
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grades">
      <div className="grades-header">
        <div className="header-content">
          <h1>Grades & Report Cards</h1>
          <p>Track grades and generate report cards for each student</p>
        </div>
        <button 
          className="btn-tracker btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Grading Settings</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label>School Year</label>
              <input
                type="text"
                className="form-input"
                value={settings.schoolYear}
                onChange={(e) => setSettings({ ...settings, schoolYear: e.target.value })}
                placeholder="2024-2025"
              />
            </div>
            <div className="form-group">
              <label>Grading Scale</label>
              <select
                className="form-select"
                value={settings.gradingScale}
                onChange={(e) => setSettings({ ...settings, gradingScale: e.target.value })}
              >
                {Object.entries(GRADING_SCALES).map(([key, scale]) => (
                  <option key={key} value={key}>{scale.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Grading Period</label>
              <select
                className="form-select"
                value={settings.gradingPeriod}
                onChange={(e) => {
                  setSettings({ ...settings, gradingPeriod: e.target.value })
                  setSelectedPeriod(GRADING_PERIODS[e.target.value].periods[0])
                }}
              >
                {Object.entries(GRADING_PERIODS).map(([key, period]) => (
                  <option key={key} value={key}>{period.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Child & Period Selector */}
      <div className="selector-section">
        <div className="selector-row">
          <div className="form-group">
            <label>Student</label>
            <select
              className="form-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="">Select a student</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Grading Period</label>
            <select
              className="form-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {currentPeriods.periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          {selectedChild && (
            <button 
              className="btn-tracker btn-primary"
              onClick={() => setShowReportCard(true)}
            >
              <FileText size={18} />
              View Report Card
            </button>
          )}
        </div>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h3>No students added</h3>
          <p>Add students in the Children tab to start entering grades.</p>
        </div>
      ) : !selectedChild ? (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h3>Select a Student</h3>
          <p>Choose a student above to enter their grades.</p>
        </div>
      ) : (
        <div className="grades-entry">
          <div className="grades-summary">
            <div className="summary-item">
              <span className="summary-label">Student</span>
              <span className="summary-value">{selectedChildData?.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Period</span>
              <span className="summary-value">{selectedPeriod}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">School Year</span>
              <span className="summary-value">{settings.schoolYear}</span>
            </div>
            {settings.gradingScale !== 'passFail' && (
              <div className="summary-item gpa">
                <span className="summary-label">Period GPA</span>
                <span className="summary-value">
                  {calculatePeriodGPA(selectedChild, selectedPeriod) || '—'}
                </span>
              </div>
            )}
          </div>

          <div className="subjects-grades">
            {selectedChildData?.subjects.map(subject => {
              const grade = getGrade(selectedChild, subject.id, selectedPeriod)
              const notes = getNotes(selectedChild, subject.id, selectedPeriod)
              const workSamples = getWorkSamples(selectedChild, subject.id, selectedPeriod)
              const hours = getSubjectHours(selectedChild, subject.id)
              const isExpanded = expandedSubject === subject.id

              return (
                <div key={subject.id} className="subject-grade-card">
                  <div 
                    className="subject-grade-header"
                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  >
                    <div className="subject-info">
                      <span className="subject-color" style={{ background: subject.color }} />
                      <span className="subject-name">{subject.name}</span>
                      <span className="subject-hours">{hours.toFixed(1)} hrs logged</span>
                    </div>
                    <div className="grade-input-wrapper">
                      {currentScale.grades ? (
                        <select
                          className="grade-select"
                          value={grade}
                          onChange={(e) => setGrade(selectedChild, subject.id, selectedPeriod, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">—</option>
                          {currentScale.grades.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          className="grade-input"
                          value={grade}
                          onChange={(e) => setGrade(selectedChild, subject.id, selectedPeriod, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="0-100"
                          min="0"
                          max="100"
                        />
                      )}
                      <button className="expand-btn">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="subject-grade-details">
                      <div className="form-group">
                        <label>Teacher Notes / Comments</label>
                        <textarea
                          className="form-textarea"
                          value={notes}
                          onChange={(e) => setNotes(selectedChild, subject.id, selectedPeriod, e.target.value)}
                          placeholder="Add notes about the student's progress, achievements, or areas for improvement..."
                          rows={3}
                        />
                      </div>

                      <div className="work-samples-section">
                        <div className="samples-header">
                          <h4><Image size={16} /> Work Samples</h4>
                          <label className="upload-btn">
                            <Plus size={16} />
                            Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(selectedChild, subject.id, selectedPeriod, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>

                        {workSamples.length > 0 ? (
                          <div className="samples-grid">
                            {workSamples.map(sample => (
                              <div key={sample.id} className="sample-item">
                                {sample.type === 'image' && (
                                  <img src={sample.data} alt={sample.name} />
                                )}
                                <div className="sample-info">
                                  <span className="sample-name">{sample.name}</span>
                                  <button
                                    className="delete-sample"
                                    onClick={() => deleteWorkSample(selectedChild, subject.id, selectedPeriod, sample.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-samples">No work samples added yet. Upload images of student work to include in the portfolio.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {showReportCard && selectedChild && selectedChildData && (
        <div className="modal-overlay" onClick={() => setShowReportCard(false)}>
          <div className="report-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-actions no-print">
              <button className="btn-tracker btn-secondary" onClick={() => setShowReportCard(false)}>
                Close
              </button>
              <button className="btn-tracker btn-primary" onClick={printReportCard}>
                <Printer size={18} />
                Print Report Card
              </button>
            </div>

            <div className="report-card" id="report-card">
              <div className="report-header">
                <div className="school-info">
                  <h1>HomeSchool Helper</h1>
                  <p>Official Report Card</p>
                </div>
                <div className="report-meta">
                  <p><strong>School Year:</strong> {settings.schoolYear}</p>
                  <p><strong>Grading Period:</strong> {selectedPeriod}</p>
                </div>
              </div>

              <div className="student-info-section">
                <h2>{selectedChildData.name}</h2>
                {selectedChildData.stateCode && (
                  <p>State: {selectedChildData.stateCode}</p>
                )}
              </div>

              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Hours</th>
                    <th>Grade</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChildData.subjects.map(subject => {
                    const grade = getGrade(selectedChild, subject.id, selectedPeriod)
                    const notes = getNotes(selectedChild, subject.id, selectedPeriod)
                    const hours = getSubjectHours(selectedChild, subject.id)
                    
                    return (
                      <tr key={subject.id}>
                        <td>{subject.name}</td>
                        <td>{hours.toFixed(1)}</td>
                        <td className="grade-cell">{grade || '—'}</td>
                        <td className="notes-cell">{notes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {settings.gradingScale !== 'passFail' && (
                <div className="gpa-section">
                  <strong>Period GPA:</strong> {calculatePeriodGPA(selectedChild, selectedPeriod) || 'N/A'}
                </div>
              )}

              <div className="report-footer">
                <div className="signature-line">
                  <span>Parent/Teacher Signature</span>
                  <div className="line"></div>
                </div>
                <div className="signature-line">
                  <span>Date</span>
                  <div className="line short"></div>
                </div>
              </div>

              <p className="report-disclaimer">
                This report card was generated by HomeSchool Helper on {new Date().toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Grades

import { useState, useRef } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { 
  CreditCard, User, GraduationCap, Printer, Upload, Camera,
  Crown, Sparkles, CheckCircle2, School, Calendar, Shield,
  X, Plus, Trash2
} from 'lucide-react'
import './IDCards.css'

function IDCards({ onNavigateToUpgrade }) {
  const { children, homeschoolProfile } = useData()
  const { isPremium } = useSubscription()
  
  const [studentPhotos, setStudentPhotos] = useState({})
  const [teacherPhoto, setTeacherPhoto] = useState(null)
  const [selectedCards, setSelectedCards] = useState([])
  const [showPrintView, setShowPrintView] = useState(false)
  const [customTeacherName, setCustomTeacherName] = useState('')
  const [customTeacherTitle, setCustomTeacherTitle] = useState('Administrator / Teacher')
  const [schoolYear, setSchoolYear] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    // If after July, use current year - next year, otherwise last year - current year
    if (month >= 6) {
      return `${year}-${year + 1}`
    }
    return `${year - 1}-${year}`
  })
  
  const fileInputRef = useRef(null)
  const [uploadTarget, setUploadTarget] = useState(null)

  // Premium gate
  if (!isPremium) {
    return (
      <div className="id-cards-page">
        <div className="id-header">
          <div className="header-content">
            <h1>
              <CreditCard className="header-icon" />
              Student & Teacher IDs
            </h1>
            <p>Create professional ID cards for your homeschool</p>
          </div>
        </div>

        <div className="premium-gate">
          <div className="premium-icon">
            <Crown size={48} />
          </div>
          <h2>Premium Feature</h2>
          <p>
            Upgrade to Premium to create professional student and teacher ID cards 
            for your homeschool that can be printed and laminated.
          </p>
          
          <div className="premium-features">
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Student ID cards for each child
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Teacher/Administrator IDs
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Custom photo uploads
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Your homeschool name & branding
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              Print-ready for laminating
            </div>
            <div className="premium-feature">
              <CheckCircle2 size={18} />
              School year & ID numbers
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

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (uploadTarget === 'teacher') {
          setTeacherPhoto(reader.result)
        } else if (uploadTarget) {
          setStudentPhotos(prev => ({
            ...prev,
            [uploadTarget]: reader.result
          }))
        }
      }
      reader.readAsDataURL(file)
    }
    setUploadTarget(null)
  }

  const triggerUpload = (target) => {
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

  const removePhoto = (target) => {
    if (target === 'teacher') {
      setTeacherPhoto(null)
    } else {
      setStudentPhotos(prev => {
        const updated = { ...prev }
        delete updated[target]
        return updated
      })
    }
  }

  // Toggle card selection for printing
  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  // Select all cards
  const selectAllCards = () => {
    const allIds = ['teacher', ...children.map(c => c.id)]
    setSelectedCards(allIds)
  }

  // Generate ID number
  const generateIdNumber = (seed) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return `${schoolYear.replace('-', '')}-${String(hash).padStart(4, '0').slice(-4)}`
  }

  // Print selected cards
  const handlePrint = () => {
    if (selectedCards.length === 0) {
      alert('Please select at least one card to print')
      return
    }
    setShowPrintView(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const schoolName = homeschoolProfile.homeschoolName || 'Homeschool'
  const teacherName = customTeacherName || homeschoolProfile.parentName || 'Teacher'

  return (
    <div className="id-cards-page">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="id-header">
        <div className="header-content">
          <h1>
            <CreditCard className="header-icon" />
            Student & Teacher IDs
          </h1>
          <p>Create professional ID cards for your homeschool</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-tracker btn-secondary"
            onClick={selectAllCards}
          >
            Select All
          </button>
          <button 
            className="btn-tracker btn-primary"
            onClick={handlePrint}
            disabled={selectedCards.length === 0}
          >
            <Printer size={18} />
            Print Selected ({selectedCards.length})
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="id-settings">
        <div className="setting-group">
          <label>School Year</label>
          <input
            type="text"
            className="form-input"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            placeholder="2024-2025"
          />
        </div>
        <div className="setting-group">
          <label>Teacher/Admin Name</label>
          <input
            type="text"
            className="form-input"
            value={customTeacherName}
            onChange={(e) => setCustomTeacherName(e.target.value)}
            placeholder={homeschoolProfile.parentName || 'Enter name'}
          />
        </div>
        <div className="setting-group">
          <label>Teacher Title</label>
          <input
            type="text"
            className="form-input"
            value={customTeacherTitle}
            onChange={(e) => setCustomTeacherTitle(e.target.value)}
            placeholder="Administrator / Teacher"
          />
        </div>
      </div>

      {!homeschoolProfile.homeschoolName && (
        <div className="warning-banner">
          <School size={18} />
          <span>Add your homeschool name in <strong>Settings</strong> for a more professional look on your ID cards.</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="cards-grid">
        {/* Teacher Card */}
        <div className={`id-card-wrapper ${selectedCards.includes('teacher') ? 'selected' : ''}`}>
          <div className="card-checkbox">
            <input
              type="checkbox"
              checked={selectedCards.includes('teacher')}
              onChange={() => toggleCardSelection('teacher')}
              id="select-teacher"
            />
            <label htmlFor="select-teacher">Select for printing</label>
          </div>
          
          <div className="id-card teacher">
            <div className="card-header">
              <div className="school-badge">
                <Shield size={16} />
              </div>
              <div className="school-name">{schoolName}</div>
              <div className="card-type">TEACHER / ADMINISTRATOR</div>
            </div>
            
            <div className="card-body">
              <div 
                className="photo-area"
                onClick={() => triggerUpload('teacher')}
              >
                {teacherPhoto ? (
                  <>
                    <img src={teacherPhoto} alt="Teacher" />
                    <button 
                      className="remove-photo"
                      onClick={(e) => { e.stopPropagation(); removePhoto('teacher'); }}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="photo-placeholder">
                    <Camera size={24} />
                    <span>Add Photo</span>
                  </div>
                )}
              </div>
              
              <div className="card-info">
                <div className="card-name">{teacherName}</div>
                <div className="card-title">{customTeacherTitle}</div>
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{generateIdNumber('teacher-' + teacherName)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{schoolYear}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <div className="footer-text">Official Homeschool Identification</div>
            </div>
          </div>
        </div>

        {/* Student Cards */}
        {children.map(child => (
          <div 
            key={child.id}
            className={`id-card-wrapper ${selectedCards.includes(child.id) ? 'selected' : ''}`}
          >
            <div className="card-checkbox">
              <input
                type="checkbox"
                checked={selectedCards.includes(child.id)}
                onChange={() => toggleCardSelection(child.id)}
                id={`select-${child.id}`}
              />
              <label htmlFor={`select-${child.id}`}>Select for printing</label>
            </div>
            
            <div className="id-card student">
              <div className="card-header">
                <div className="school-badge">
                  <GraduationCap size={16} />
                </div>
                <div className="school-name">{schoolName}</div>
                <div className="card-type">STUDENT</div>
              </div>
              
              <div className="card-body">
                <div 
                  className="photo-area"
                  onClick={() => triggerUpload(child.id)}
                >
                  {studentPhotos[child.id] ? (
                    <>
                      <img src={studentPhotos[child.id]} alt={child.name} />
                      <button 
                        className="remove-photo"
                        onClick={(e) => { e.stopPropagation(); removePhoto(child.id); }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="photo-placeholder">
                      <Camera size={24} />
                      <span>Add Photo</span>
                    </div>
                  )}
                </div>
                
                <div className="card-info">
                  <div className="card-name">{child.name}</div>
                  <div className="card-title">Student</div>
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{generateIdNumber(child.id)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Year:</span>
                      <span className="detail-value">{schoolYear}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="footer-text">Official Homeschool Identification</div>
              </div>
            </div>
          </div>
        ))}

        {children.length === 0 && (
          <div className="no-students">
            <User size={32} />
            <p>Add children in the <strong>Children</strong> section to create student IDs.</p>
          </div>
        )}
      </div>

      {/* Print Tips */}
      <div className="print-tips">
        <h3>Printing Tips</h3>
        <ul>
          <li>Print on cardstock for best results</li>
          <li>Standard ID card size is 3.375" × 2.125" (credit card size)</li>
          <li>Use a laminator after printing for durability</li>
          <li>Consider using a hole punch and lanyard for easy carrying</li>
        </ul>
      </div>

      {/* Print View (hidden until printing) */}
      {showPrintView && (
        <div className="print-view">
          <div className="print-cards">
            {selectedCards.includes('teacher') && (
              <div className="print-card teacher">
                <div className="card-header">
                  <div className="school-badge">
                    <Shield size={14} />
                  </div>
                  <div className="school-name">{schoolName}</div>
                  <div className="card-type">TEACHER / ADMINISTRATOR</div>
                </div>
                
                <div className="card-body">
                  <div className="photo-area">
                    {teacherPhoto ? (
                      <img src={teacherPhoto} alt="Teacher" />
                    ) : (
                      <div className="photo-placeholder print">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <div className="card-name">{teacherName}</div>
                    <div className="card-title">{customTeacherTitle}</div>
                    <div className="card-details">
                      <div className="detail-row">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{generateIdNumber('teacher-' + teacherName)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">{schoolYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="footer-text">Official Homeschool Identification</div>
                </div>
              </div>
            )}

            {children.filter(c => selectedCards.includes(c.id)).map(child => (
              <div key={child.id} className="print-card student">
                <div className="card-header">
                  <div className="school-badge">
                    <GraduationCap size={14} />
                  </div>
                  <div className="school-name">{schoolName}</div>
                  <div className="card-type">STUDENT</div>
                </div>
                
                <div className="card-body">
                  <div className="photo-area">
                    {studentPhotos[child.id] ? (
                      <img src={studentPhotos[child.id]} alt={child.name} />
                    ) : (
                      <div className="photo-placeholder print">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <div className="card-name">{child.name}</div>
                    <div className="card-title">Student</div>
                    <div className="card-details">
                      <div className="detail-row">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{generateIdNumber(child.id)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">{schoolYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="footer-text">Official Homeschool Identification</div>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="close-print-view no-print"
            onClick={() => setShowPrintView(false)}
          >
            Close Print View
          </button>
        </div>
      )}
    </div>
  )
}

export default IDCards

import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react'
import './SchoolworkReminder.css'

function SchoolworkReminder() {
  const { children, getLastSchoolworkUpload } = useData()
  const [reminders, setReminders] = useState([])
  const [showUpload, setShowUpload] = useState(null) // { childId, subjectId }

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const newReminders = []

      children.forEach(child => {
        child.subjects.forEach(subject => {
          if (!subject.schoolworkReminderFrequency) return

          const lastUpload = getLastSchoolworkUpload(child.id, subject.id)
          const daysSinceUpload = lastUpload 
            ? Math.floor((now - lastUpload) / (1000 * 60 * 60 * 24))
            : Infinity

          let shouldRemind = false
          let daysUntilNext = 0

          switch (subject.schoolworkReminderFrequency) {
            case 'weekly':
              shouldRemind = daysSinceUpload >= 7
              daysUntilNext = 7 - (daysSinceUpload % 7)
              break
            case 'biweekly':
              shouldRemind = daysSinceUpload >= 14
              daysUntilNext = 14 - (daysSinceUpload % 14)
              break
            case 'monthly':
              shouldRemind = daysSinceUpload >= 30
              daysUntilNext = 30 - (daysSinceUpload % 30)
              break
          }

          if (shouldRemind) {
            newReminders.push({
              childId: child.id,
              childName: child.name,
              subjectId: subject.id,
              subjectName: subject.name,
              subjectColor: subject.color,
              frequency: subject.schoolworkReminderFrequency,
              daysSinceUpload,
              daysUntilNext
            })
          }
        })
      })

      setReminders(newReminders)
    }

    checkReminders()
    // Check reminders daily
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [children, getLastSchoolworkUpload])

  if (reminders.length === 0) return null

  return (
    <div className="schoolwork-reminders">
      {reminders.map(reminder => (
        <div key={`${reminder.childId}-${reminder.subjectId}`} className="reminder-card">
          <div className="reminder-header">
            <div className="reminder-subject">
              <span 
                className="reminder-color" 
                style={{ background: reminder.subjectColor }}
              />
              <div>
                <h4>{reminder.childName} - {reminder.subjectName}</h4>
                <p>
                  {reminder.daysSinceUpload === Infinity 
                    ? 'No schoolwork uploaded yet'
                    : `Last upload: ${reminder.daysSinceUpload} day${reminder.daysSinceUpload !== 1 ? 's' : ''} ago`
                  }
                </p>
              </div>
            </div>
            <button
              className="reminder-close"
              onClick={() => setReminders(prev => prev.filter(r => 
                !(r.childId === reminder.childId && r.subjectId === reminder.subjectId)
              ))}
            >
              <X size={18} />
            </button>
          </div>
          <div className="reminder-actions">
            <button
              className="btn-tracker btn-primary"
              onClick={() => setShowUpload({ childId: reminder.childId, subjectId: reminder.subjectId })}
            >
              <Camera size={18} />
              Upload Schoolwork
            </button>
            <button
              className="btn-tracker btn-secondary"
              onClick={() => setReminders(prev => prev.filter(r => 
                !(r.childId === reminder.childId && r.subjectId === reminder.subjectId)
              ))}
            >
              Remind Me Later
            </button>
          </div>
        </div>
      ))}

      {showUpload && (
        <SchoolworkUpload
          childId={showUpload.childId}
          subjectId={showUpload.subjectId}
          onClose={() => {
            setShowUpload(null)
            // Remove reminder after upload
            setReminders(prev => prev.filter(r => 
              !(r.childId === showUpload.childId && r.subjectId === showUpload.subjectId)
            ))
          }}
        />
      )}
    </div>
  )
}

// SchoolworkUpload component
function SchoolworkUpload({ childId, subjectId, onClose }) {
  const { children, addSchoolworkSample } = useData()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)

  const child = children.find(c => c.id === childId)
  const subject = child?.subjects.find(s => s.id === subjectId)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !preview) return

    setUploading(true)
    try {
      await addSchoolworkSample(
        childId,
        subjectId,
        preview, // Base64 encoded image
        selectedFile.name,
        selectedFile.size,
        notes
      )
      onClose()
    } catch (error) {
      console.error('Error uploading schoolwork:', error)
      alert('Failed to upload schoolwork. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="schoolwork-upload-modal">
      <div className="upload-modal-content">
        <div className="upload-modal-header">
          <h3>
            <ImageIcon size={20} />
            Upload Schoolwork
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {child && subject && (
          <div className="upload-subject-info">
            <span className="subject-color" style={{ background: subject.color }} />
            <span>{child.name} - {subject.name}</span>
          </div>
        )}
        <div className="upload-form">
          <div className="upload-area">
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" />
                <button
                  className="remove-preview"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="upload-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Upload size={32} />
                <p>Click or drag to upload</p>
                <span>PNG, JPG up to 10MB</span>
              </label>
            )}
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add notes about this work..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="upload-actions">
            <button
              className="btn-tracker btn-secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              className="btn-tracker btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolworkReminder

import { useEffect, useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useTimer, formatTimerDisplay } from '../../context/TimerContext'
import { todayStr } from '../../lib/scheduler'

// Parent sign-off after "Done". Rendered by the tracker (which has the
// family's data) so it appears on whichever tab you're on.
function TimerApproval() {
  const { children, logHours } = useData()
  const { timer, elapsed, keepTiming, cancel } = useTimer()
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    if (!logged) return
    const t = setTimeout(() => setLogged(false), 3000)
    return () => clearTimeout(t)
  }, [logged])

  if (!timer.awaitingApproval) {
    return logged ? (
      <div className="timer-toast" role="status">
        <Check size={18} /> Hours logged successfully!
      </div>
    ) : null
  }

  const approve = async () => {
    const totalHours = elapsed / 3600
    if (totalHours < 1 / 60) {
      return setError('Less than a minute was timed — keep timing or discard it.')
    }
    const child = children.find((c) => c.id === timer.childId)
    const subject = child?.subjects.find((s) => s.id === timer.subjectId)
    if (!child || !subject) {
      return setError(`${timer.childName}'s ${timer.subjectName} subject no longer exists.`)
    }
    setError('')
    setSaving(true)
    try {
      await logHours(child.id, subject.id, totalHours, todayStr(), notes)
      setNotes('')
      cancel()
      setLogged(true)
    } catch (err) {
      setError(err.message || 'Could not log the hours.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="timer-modal-overlay">
      <div className="timer-modal approval-modal">
        <div className="approval-icon">
          <ShieldCheck size={40} />
        </div>
        <h3>Parent Approval Required</h3>
        <div className="approval-summary">
          <div className="approval-time">{formatTimerDisplay(elapsed)}</div>
          <p>
            {timer.childName} worked on <strong>{timer.subjectName}</strong>
          </p>
        </div>
        <p className="approval-instructions">
          Please hand the device to a parent or guardian to approve logging these hours.
        </p>
        <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label>Notes (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="What did they work on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        {error && <p className="timer-approval-error">{error}</p>}
        <div className="timer-modal-actions">
          <button className="btn-tracker btn-primary btn-lg approval-btn" onClick={approve} disabled={saving}>
            <ShieldCheck size={20} /> {saving ? 'Logging…' : <>Approve &amp; Log Hours</>}
          </button>
          <button className="btn-tracker btn-secondary" onClick={keepTiming}>
            Not yet — keep timing
          </button>
          <button className="btn-tracker btn-danger btn-sm" onClick={cancel}>
            Cancel &amp; discard
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimerApproval

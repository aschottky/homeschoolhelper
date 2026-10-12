import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Play, Pause, Square, PictureInPicture2, Timer, X } from 'lucide-react'
import { useTimer, formatTimerDisplay } from '../../context/TimerContext'
import '../Tracker/LogHours.css'
import './Timer.css'

const LOG_PATH = '/tracker/log'

// Compact timer used by the floating dock and the pop-out window.
function TimerFace({ compact = false, onDone, extra }) {
  const { timer, elapsed, isRunning, pause, resume } = useTimer()
  return (
    <div className={`timer-face ${compact ? 'compact' : ''}`}>
      <div className="timer-face-top">
        <span className={`timer-face-time ${isRunning ? 'ticking' : 'paused'}`}>
          {formatTimerDisplay(elapsed)}
        </span>
        {extra}
      </div>
      <div className="timer-face-context">
        <span className="timer-face-child" style={{ background: timer.childColor || 'var(--forest)' }}>
          {timer.childName}
        </span>
        <span className="timer-face-subject">
          <span className="timer-face-dot" style={{ background: timer.subjectColor || 'var(--sage)' }} />
          {timer.subjectName}
        </span>
        {!isRunning && <span className="timer-face-paused">Paused</span>}
      </div>
      <div className="timer-face-controls">
        {isRunning ? (
          <button type="button" className="timer-face-btn" onClick={pause}>
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button type="button" className="timer-face-btn primary" onClick={resume}>
            <Play size={16} /> Resume
          </button>
        )}
        <button type="button" className="timer-face-btn done" onClick={onDone}>
          <Square size={16} /> Done
        </button>
      </div>
    </div>
  )
}

function ReminderPrompt({ onDone }) {
  const { elapsed, timer, dismissReminder } = useTimer()
  return (
    <div className="timer-modal reminder-modal">
      <div className="timer-modal-icon">⏰</div>
      <h3>Still working?</h3>
      <p>
        You've been studying for <strong>{Math.floor(elapsed / 60)} minutes</strong>.
        {timer.childName && <> Great job, <strong>{timer.childName}</strong>!</>}
      </p>
      <div className="timer-modal-actions">
        <button type="button" className="btn-tracker btn-primary" onClick={dismissReminder}>
          <Play size={16} /> Yes, keep going!
        </button>
        <button type="button" className="btn-tracker btn-secondary" onClick={onDone}>
          <Square size={16} /> I'm done
        </button>
      </div>
    </div>
  )
}

// What renders inside the pop-out window.
function PopOutPanel({ onDone }) {
  const { timer, showReminder } = useTimer()
  if (timer.awaitingApproval) {
    return (
      <div className="timer-popout">
        <TimerFace onDone={onDone} />
        <p className="timer-popout-note">
          Waiting for a parent to approve these hours in the main window.
        </p>
      </div>
    )
  }
  return (
    <div className="timer-popout">
      {showReminder ? <ReminderPrompt onDone={onDone} /> : <TimerFace onDone={onDone} />}
    </div>
  )
}

// Mounted once for the whole site: the 30-minute check-in, the floating
// dock shown on every page except Log Hours, and the pop-out window.
function GlobalTimer() {
  const { isIdle, showReminder, finish, popOut, popOutWindow, closePopOut, canPopOut } = useTimer()
  const location = useLocation()
  const navigate = useNavigate()
  const onLogPage = location.pathname === LOG_PATH

  if (isIdle) return null

  // Approval needs the family's data, which only the tracker loads.
  const done = () => {
    finish()
    if (!location.pathname.startsWith('/tracker/')) navigate(LOG_PATH)
    if (popOutWindow) window.focus()
  }

  return (
    <>
      {showReminder && (
        <div className="timer-modal-overlay">
          <ReminderPrompt onDone={done} />
        </div>
      )}

      {!onLogPage && !popOutWindow && (
        <div className="timer-dock" role="region" aria-label="Study timer">
          <TimerFace
            compact
            onDone={done}
            extra={(
              <span className="timer-dock-actions">
                {canPopOut && (
                  <button type="button" className="timer-dock-icon" title="Pop out timer"
                    aria-label="Pop out timer" onClick={popOut}>
                    <PictureInPicture2 size={16} />
                  </button>
                )}
                <Link to={LOG_PATH} className="timer-dock-icon" title="Open timer" aria-label="Open timer">
                  <Timer size={16} />
                </Link>
              </span>
            )}
          />
        </div>
      )}

      {popOutWindow && !onLogPage && (
        <div className="timer-dock timer-dock-mini">
          <span>Timer popped out</span>
          <button type="button" className="timer-dock-icon" title="Bring timer back"
            aria-label="Bring timer back into the page" onClick={closePopOut}>
            <X size={16} />
          </button>
        </div>
      )}

      {popOutWindow && createPortal(<PopOutPanel onDone={done} />, popOutWindow.document.body)}
    </>
  )
}

export default GlobalTimer

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// The study timer lives here, above the router, so it keeps running while
// you browse the rest of the site. State is stored as timestamps (not a
// ticking counter) in localStorage: it survives page changes and reloads,
// stays accurate when a background tab's timers are throttled, and syncs
// across open tabs.

const STORAGE_KEY = 'homeschool_study_timer'
export const REMINDER_INTERVAL_SEC = 30 * 60 // 30 minutes

const IDLE = {
  status: 'idle', // 'idle' | 'running' | 'paused'
  childId: '',
  childName: '',
  childColor: '',
  subjectId: '',
  subjectName: '',
  subjectColor: '',
  startedAt: null, // ms timestamp of the current running stretch
  accumulated: 0, // seconds banked before the current stretch
  lastReminderAt: 0, // elapsed seconds when the last check-in fired
  awaitingApproval: false,
}

export function formatTimerDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function loadTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && saved.status && saved.status !== 'idle') return { ...IDLE, ...saved }
  } catch {
    // unreadable or blocked storage: start fresh
  }
  return IDLE
}

function elapsedOf(timer, now) {
  if (timer.status !== 'running' || !timer.startedAt) return timer.accumulated
  return timer.accumulated + Math.max(0, Math.floor((now - timer.startedAt) / 1000))
}

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const [timer, setTimer] = useState(loadTimer)
  const [now, setNow] = useState(() => Date.now())
  const [showReminder, setShowReminder] = useState(false)
  // The popped-out window (Document Picture-in-Picture or a plain popup).
  const [popOutWindow, setPopOutWindow] = useState(null)

  useEffect(() => {
    try {
      if (timer.status === 'idle') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
    } catch {
      // storage unavailable: the timer still works for this page
    }
  }, [timer])

  // Another tab started, paused or finished the timer.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setTimer(loadTimer())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Tick once a second while running. When popped out, tick on the pop-out
  // window's clock: it stays visible, so the browser won't throttle it the
  // way it throttles a hidden tab.
  useEffect(() => {
    if (timer.status !== 'running') return
    const host = popOutWindow && !popOutWindow.closed ? popOutWindow : window
    setNow(Date.now())
    const id = host.setInterval(() => setNow(Date.now()), 1000)
    return () => host.clearInterval(id)
  }, [timer.status, popOutWindow])

  const elapsed = elapsedOf(timer, now)

  // 30-minute "still working?" check-in.
  useEffect(() => {
    if (timer.status !== 'running') return
    if (elapsed - timer.lastReminderAt >= REMINDER_INTERVAL_SEC) {
      setTimer((t) => ({ ...t, lastReminderAt: elapsed }))
      setShowReminder(true)
    }
  }, [elapsed, timer.status, timer.lastReminderAt])

  const start = useCallback((child, subject) => {
    if (!child || !subject) return
    setTimer({
      ...IDLE,
      status: 'running',
      childId: child.id,
      childName: child.name,
      childColor: child.color || '',
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color || '',
      startedAt: Date.now(),
    })
    setNow(Date.now())
  }, [])

  const pause = useCallback(() => {
    setTimer((t) => t.status === 'running'
      ? { ...t, status: 'paused', accumulated: elapsedOf(t, Date.now()), startedAt: null }
      : t)
  }, [])

  const resume = useCallback(() => {
    setTimer((t) => t.status === 'paused'
      ? { ...t, status: 'running', startedAt: Date.now(), awaitingApproval: false }
      : t)
    setNow(Date.now())
  }, [])

  // "Done": pause and hand over to a parent for approval.
  const finish = useCallback(() => {
    setShowReminder(false)
    setTimer((t) => {
      if (t.status === 'idle') return t
      const accumulated = elapsedOf(t, Date.now())
      return { ...t, status: 'paused', accumulated, startedAt: null, awaitingApproval: accumulated > 0 }
    })
  }, [])

  const keepTiming = useCallback(() => {
    setTimer((t) => ({ ...t, awaitingApproval: false }))
  }, [])

  const cancel = useCallback(() => {
    setShowReminder(false)
    setTimer(IDLE)
  }, [])

  const closePopOut = useCallback(() => {
    if (popOutWindow && !popOutWindow.closed) popOutWindow.close()
    setPopOutWindow(null)
  }, [popOutWindow])

  // Nothing left to show once the timer is logged or discarded.
  useEffect(() => {
    if (timer.status === 'idle' && popOutWindow) closePopOut()
  }, [timer.status, popOutWindow, closePopOut])

  // Open the timer in its own small window. Chrome/Edge get a Document
  // Picture-in-Picture window that floats above every other app; other
  // browsers get a regular popup window. Returns false if it was blocked.
  const popOut = useCallback(async () => {
    if (popOutWindow && !popOutWindow.closed) {
      popOutWindow.focus()
      return true
    }
    let win = null
    try {
      if ('documentPictureInPicture' in window) {
        win = await window.documentPictureInPicture.requestWindow({ width: 320, height: 260 })
      }
    } catch {
      win = null
    }
    if (!win) {
      win = window.open('', 'homeschool-study-timer', 'popup,width=340,height=300')
      if (!win) return false
      win.document.body.innerHTML = ''
    }
    win.document.title = 'Study Timer'
    copyStyles(document, win.document)
    win.document.body.className = 'timer-popout-body'
    // pagehide covers both PiP and popups being closed by the user.
    win.addEventListener('pagehide', () => setPopOutWindow(null))
    setPopOutWindow(win)
    return true
  }, [popOutWindow])

  // A plain popup outlives a reload of this page; close it with us. Also
  // notice a popup closed without a pagehide event reaching us.
  useEffect(() => {
    if (!popOutWindow) return
    const onUnload = () => { if (!popOutWindow.closed) popOutWindow.close() }
    window.addEventListener('pagehide', onUnload)
    const watch = setInterval(() => {
      if (popOutWindow.closed) setPopOutWindow(null)
    }, 1000)
    return () => {
      window.removeEventListener('pagehide', onUnload)
      clearInterval(watch)
    }
  }, [popOutWindow])

  const value = {
    timer,
    elapsed,
    isIdle: timer.status === 'idle',
    isRunning: timer.status === 'running',
    showReminder,
    dismissReminder: () => setShowReminder(false),
    start,
    pause,
    resume,
    finish,
    keepTiming,
    cancel,
    popOut,
    closePopOut,
    popOutWindow,
    canPopOut: typeof window !== 'undefined'
      && ('documentPictureInPicture' in window || typeof window.open === 'function'),
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

// Carry the page's styles (inline <style> in dev, <link> in production,
// plus web fonts) into the pop-out document.
function copyStyles(fromDoc, toDoc) {
  for (const sheet of [...fromDoc.styleSheets]) {
    try {
      const css = [...sheet.cssRules].map((rule) => rule.cssText).join('\n')
      const style = toDoc.createElement('style')
      style.textContent = css
      toDoc.head.appendChild(style)
    } catch {
      // Cross-origin sheets (Google Fonts) can't be read; link them instead.
      if (sheet.href) {
        const link = toDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        toDoc.head.appendChild(link)
      }
    }
  }
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimer must be used within a TimerProvider')
  return context
}

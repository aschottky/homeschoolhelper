import { useState, useMemo, useRef, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
  Palmtree, Clock, CheckCircle2, StickyNote,
} from 'lucide-react'
import {
  DAY_LABELS, todayStr, addDays, toDate, isScheduledDay,
  sessionForDate, activityForDate, activityKey, projectedFinish,
  scheduleProgress, describeRecurrence, isScheduleFinished, lastCompletionDate,
} from '../../lib/scheduler'
import './Schedule.css'

// Default school year: today through the coming May 31.
function defaultYearEnd() {
  const now = new Date()
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear()
  return `${year}-05-31`
}

function prettyDate(dateStr) {
  return toDate(dateStr).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function shortDate(dateStr) {
  return toDate(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ORDINALS = [[1, 'First'], [2, 'Second'], [3, 'Third'], [4, 'Fourth'], [-1, 'Last']]

const UNIT_PRESETS = ['Lesson', 'Unit', 'Chapter']

// Palette for subjects created here (Children tab uses the same family).
const SUBJECT_COLORS = ['#2D5A4A', '#E8A87C', '#8FB39A', '#D4896A', '#5A8F7B', '#C4A484', '#6B8E7B', '#B58863']

// subject === null means "create a new subject along with its schedule".
function ScheduleEditor({ child, subject, schedule, onSave, onDelete, onClose }) {
  const [subjectName, setSubjectName] = useState('')
  const [title, setTitle] = useState(schedule?.title || '')
  const savedLabel = schedule?.unitLabel || 'Lesson'
  const [unitPreset, setUnitPreset] = useState(
    schedule?.kind === 'activity' ? 'activity'
      : UNIT_PRESETS.includes(savedLabel) ? savedLabel : 'Other'
  )
  const [customUnit, setCustomUnit] = useState(UNIT_PRESETS.includes(savedLabel) ? '' : savedLabel)
  const [days, setDays] = useState(schedule?.daysOfWeek?.length ? schedule.daysOfWeek : [1, 3, 5])
  const [repeat, setRepeat] = useState(
    schedule ? (schedule.freq === 'monthly' ? 'monthly' : `w${schedule.intervalWeeks || 1}`) : 'w1'
  )
  const [monthOrdinal, setMonthOrdinal] = useState(schedule?.monthOrdinal ?? 1)
  const [monthWeekday, setMonthWeekday] = useState(schedule?.monthWeekday ?? 2)
  const isActivity = unitPreset === 'activity'
  const [startDate, setStartDate] = useState(schedule?.startDate || todayStr())
  const [endDate, setEndDate] = useState(schedule?.endDate || defaultYearEnd())
  const [startLesson, setStartLesson] = useState(schedule?.startLesson ?? 1)
  const [perSession, setPerSession] = useState(schedule?.lessonsPerSession ?? 1)
  const [totalLessons, setTotalLessons] = useState(schedule?.totalLessons ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleDay = (d) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  const submit = async (e) => {
    e.preventDefault()
    const freq = repeat === 'monthly' ? 'monthly' : 'weekly'
    if (!subject && !subjectName.trim()) return setError('Give the subject a name.')
    if (freq === 'weekly' && days.length === 0) return setError('Pick at least one day of the week.')
    if (!startDate || !endDate || endDate <= startDate) {
      return setError('The school year needs a start date before its end date.')
    }
    const total = isActivity || totalLessons === '' ? null : Number(totalLessons)
    if (total != null && total < Number(startLesson)) {
      return setError('Total can’t be lower than the starting number.')
    }
    const unitLabel = isActivity ? 'Lesson'
      : unitPreset === 'Other' ? (customUnit.trim() || 'Lesson') : unitPreset
    setError('')
    setSaving(true)
    try {
      await onSave({
        subjectName: subjectName.trim(),
        title: title.trim(),
        kind: isActivity ? 'activity' : 'numbered',
        unitLabel,
        freq,
        intervalWeeks: freq === 'weekly' ? Number(repeat.slice(1)) : 1,
        monthOrdinal: freq === 'monthly' ? Number(monthOrdinal) : null,
        monthWeekday: freq === 'monthly' ? Number(monthWeekday) : null,
        daysOfWeek: freq === 'weekly' ? [...days].sort((a, b) => a - b) : [],
        startDate,
        endDate,
        startLesson: isActivity ? 1 : Math.max(1, Number(startLesson) || 1),
        lessonsPerSession: isActivity ? 1 : Math.max(1, Number(perSession) || 1),
        totalLessons: total,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save the schedule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h3>{subject
            ? `${schedule ? 'Edit' : 'Set up'} schedule — ${subject.name}`
            : 'Add subject'}</h3>
          <button type="button" className="btn-icon-only" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <p className="schedule-modal-subtitle">{child.name}</p>

        <form onSubmit={submit}>
          {!subject && (
            <div className="form-group">
              <label>Subject name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Reading"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="form-group">
            <label>{isActivity ? 'Label (what shows on the checklist)' : 'Curriculum (optional)'}</label>
            <input
              type="text"
              className="form-input"
              placeholder={isActivity ? 'e.g. Flying a kite' : 'e.g. Saxon Math 5/4'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Counted as</label>
              <select className="form-select" value={unitPreset}
                onChange={(e) => setUnitPreset(e.target.value)}>
                {UNIT_PRESETS.map((u) => <option key={u} value={u}>{u}s</option>)}
                <option value="Other">Other…</option>
                <option value="activity">No numbers — just an activity</option>
              </select>
            </div>
            {unitPreset === 'Other' && (
              <div className="form-group">
                <label>Custom label</label>
                <input type="text" className="form-input" placeholder="e.g. Worksheet"
                  value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Repeats</label>
            <select className="form-select" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option value="w1">Weekly</option>
              <option value="w2">Every 2 weeks</option>
              <option value="w3">Every 3 weeks</option>
              <option value="w4">Every 4 weeks</option>
              <option value="monthly">Monthly (a weekday of the month)</option>
            </select>
          </div>

          {repeat !== 'monthly' ? (
            <div className="form-group">
              <label>{repeat === 'w1' ? 'Days of the week' : 'Days of the week (in repeating weeks)'}</label>
              <div className="day-chips">
                {DAY_LABELS.map((label, d) => (
                  <button
                    key={d}
                    type="button"
                    className={`day-chip ${days.includes(d) ? 'selected' : ''}`}
                    onClick={() => toggleDay(d)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {repeat !== 'w1' && (
                <p className="schedule-field-hint">
                  Repeating weeks are counted from the week of the start date.
                </p>
              )}
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Which occurrence</label>
                <select className="form-select" value={monthOrdinal}
                  onChange={(e) => setMonthOrdinal(Number(e.target.value))}>
                  {ORDINALS.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weekday</label>
                <select className="form-select" value={monthWeekday}
                  onChange={(e) => setMonthWeekday(Number(e.target.value))}>
                  {DAY_FULL.map((lbl, d) => <option key={d} value={d}>{lbl}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>School year starts</label>
              <input type="date" className="form-input" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>School year ends</label>
              <input type="date" className="form-input" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {!isActivity && (
            <div className="form-row">
              <div className="form-group">
                <label>Start at {unitPreset === 'Other' ? (customUnit.trim() || 'lesson').toLowerCase() : unitPreset.toLowerCase()}</label>
                <input type="number" min="1" className="form-input" value={startLesson}
                  onChange={(e) => setStartLesson(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Per session</label>
                <input type="number" min="1" className="form-input" value={perSession}
                  onChange={(e) => setPerSession(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Total (optional)</label>
                <input type="number" min="1" className="form-input" placeholder="e.g. 120"
                  value={totalLessons} onChange={(e) => setTotalLessons(e.target.value)} />
              </div>
            </div>
          )}

          {error && <p className="schedule-form-error">{error}</p>}

          <div className="schedule-modal-actions">
            {schedule && (
              <button
                type="button"
                className="btn-tracker btn-danger"
                onClick={async () => { await onDelete(); onClose() }}
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
            <div className="schedule-modal-actions-right">
              <button type="button" className="btn-tracker btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-tracker btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function HourPromptModal({ subjectName, label, date, onLog, onSkip }) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const total = (Number(hours) || 0) + (Number(minutes) || 0) / 60

  const submit = async (e) => {
    e.preventDefault()
    if (total <= 0) return
    setSaving(true)
    try {
      await onLog(total, notes.trim() || label)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal schedule-modal-sm">
        <div className="schedule-modal-header">
          <h3><CheckCircle2 size={20} /> {label} done!</h3>
        </div>
        <p className="schedule-modal-subtitle">
          Log hours for {subjectName} on {shortDate(date)}?
        </p>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Hours</label>
              <input type="number" min="0" step="1" className="form-input" value={hours}
                onChange={(e) => setHours(e.target.value)} placeholder="0" autoFocus />
            </div>
            <div className="form-group">
              <label>Minutes</label>
              <input type="number" min="0" max="59" step="1" className="form-input" value={minutes}
                onChange={(e) => setMinutes(e.target.value)} placeholder="45" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input type="text" className="form-input" value={notes}
              onChange={(e) => setNotes(e.target.value)} placeholder={label} />
          </div>
          <div className="schedule-modal-actions">
            <button type="button" className="btn-tracker btn-secondary" onClick={onSkip}>
              Skip
            </button>
            <button type="submit" className="btn-tracker btn-primary" disabled={total <= 0 || saving}>
              <Clock size={16} /> {saving ? 'Logging…' : 'Log hours'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BreaksCard() {
  const { scheduleBreaks, addScheduleBreak, deleteScheduleBreak } = useData()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !start || !end || end < start) return
    await addScheduleBreak(name.trim(), start, end)
    setName(''); setStart(''); setEnd(''); setAdding(false)
  }

  return (
    <div className="tracker-section schedule-breaks">
      <div className="tracker-section-header">
        <h3><Palmtree size={20} /> Breaks &amp; holidays</h3>
        {!adding && (
          <button type="button" className="btn-tracker btn-secondary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add break
          </button>
        )}
      </div>
      {scheduleBreaks.length === 0 && !adding && (
        <p className="schedule-muted">No breaks yet. Add Thanksgiving, Christmas, spring break…
          scheduled lessons skip right over them.</p>
      )}
      {scheduleBreaks.length > 0 && (
        <ul className="breaks-list">
          {[...scheduleBreaks].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((b) => (
            <li key={b.id}>
              <span className="break-name">{b.name}</span>
              <span className="break-dates">{shortDate(b.startDate)} – {shortDate(b.endDate)}</span>
              <button type="button" className="btn-icon-only" aria-label={`Delete ${b.name}`}
                onClick={() => deleteScheduleBreak(b.id)}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {adding && (
        <form className="break-form" onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" placeholder="Christmas break"
                value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>First day off</label>
              <input type="date" className="form-input" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last day off</label>
              <input type="date" className="form-input" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="schedule-modal-actions-right">
            <button type="button" className="btn-tracker btn-secondary btn-sm" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-tracker btn-primary btn-sm">Save break</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Calendar views ──────────────────────────────────────────────
// One entry per subject meeting on a date, with how much of the
// session was actually checked off that day.
function dayItemsFor(childSchedules, dateStr, completions, breaks, today = todayStr()) {
  const items = []
  for (const s of childSchedules) {
    if (!isScheduledDay(s, dateStr, breaks)) continue

    // Activities don't roll forward — a missed one stays missed.
    if (s.kind === 'activity') {
      const done = completions.filter((c) => c.scheduleId === s.id && c.completedOn === dateStr).length
      items.push({ schedule: s, done, expected: 1 })
      continue
    }

    // Numbered curricula auto-roll, so a day only counts when a lesson is
    // actually done there or genuinely still due there (per the projection).
    // This keeps a short plan from painting the whole month with "planned".
    const session = sessionForDate(s, dateStr, completions, breaks, today)
    if (!session) continue
    if (session.type === 'future') {
      if (session.lessons.length === 0) continue
      items.push({ schedule: s, done: 0, expected: session.lessons.length })
    } else if (session.type === 'today') {
      const done = session.done.length
      const upcoming = session.upcoming.length
      if (done === 0 && upcoming === 0) continue
      items.push({ schedule: s, done, expected: done + upcoming })
    } else { // past — only actual completions count; unfilled days rolled forward
      const done = session.done.length
      if (done === 0) continue
      items.push({ schedule: s, done, expected: done })
    }
  }
  return items
}

function itemState(item, dateStr, today) {
  if (item.done >= item.expected) return 'done'
  if (item.done > 0) return 'partial'
  return dateStr < today ? 'missed' : 'upcoming'
}

// Worst state wins, so a day's single color is honest at a glance.
const STATE_RANK = { missed: 3, partial: 2, done: 1, upcoming: 0 }
function dayAggregate(items, dateStr, today) {
  if (items.length === 0) return null
  let worst = 'done'
  let all = true
  for (const it of items) {
    const st = itemState(it, dateStr, today)
    if (st !== 'done') all = false
    if (STATE_RANK[st] > STATE_RANK[worst]) worst = st
  }
  if (dateStr >= today && worst !== 'partial' && !all) return 'upcoming'
  return all ? 'done' : worst
}

const pad2 = (n) => String(n).padStart(2, '0')

function monthCells(year, month) {
  const cells = []
  const startPad = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad2(month + 1)}-${pad2(d)}`)
  return cells
}

function CalendarLegend() {
  return (
    <div className="cal-legend">
      <span><i className="cal-dot done" /> Done</span>
      <span><i className="cal-dot partial" /> Partial</span>
      <span><i className="cal-dot missed" /> Missed</span>
      <span><i className="cal-dot upcoming" /> Planned</span>
      <span><i className="cal-dot break" /> Break</span>
    </div>
  )
}

function MonthView({ childSchedules, lessonCompletions, scheduleBreaks, viewDate, setViewDate, openDay, today }) {
  const year = Number(viewDate.slice(0, 4))
  const month = Number(viewDate.slice(5, 7)) - 1
  const label = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const cells = monthCells(year, month)

  const navMonth = (delta) => {
    const d = new Date(year, month + delta, 1)
    setViewDate(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`)
  }

  // Month summary over school days that have already happened.
  let complete = 0, partial = 0, missed = 0, planned = 0
  const infoByDate = new Map()
  for (const dateStr of cells) {
    if (!dateStr) continue
    const items = dayItemsFor(childSchedules, dateStr, lessonCompletions, scheduleBreaks, today)
    if (items.length === 0) continue
    infoByDate.set(dateStr, items)
    const agg = dayAggregate(items, dateStr, today)
    if (dateStr >= today) { planned++; continue }
    if (agg === 'done') complete++
    else if (agg === 'partial') partial++
    else missed++
  }

  return (
    <div className="cal-month">
      <div className="schedule-day-nav">
        <button type="button" className="btn-icon-only" aria-label="Previous month" onClick={() => navMonth(-1)}>
          <ChevronLeft size={20} />
        </button>
        <div className="schedule-day-label"><strong>{label}</strong></div>
        <button type="button" className="btn-icon-only" aria-label="Next month" onClick={() => navMonth(1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="cal-weekdays">
        {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <span key={`pad${i}`} className="cal-cell empty" />
          const brk = scheduleBreaks.find((b) => dateStr >= b.startDate && dateStr <= b.endDate)
          const items = infoByDate.get(dateStr) || []
          const hasMissed = !brk && dateStr < today
            && items.some((it) => itemState(it, dateStr, today) === 'missed')
          return (
            <button
              key={dateStr}
              type="button"
              className={[
                'cal-cell',
                dateStr === today ? 'today' : '',
                brk ? 'break' : '',
                hasMissed ? 'missed-day' : '',
              ].join(' ')}
              title={brk ? `Break: ${brk.name}` : items.map((it) =>
                `${it.schedule.subjectName}: ${it.done}/${it.expected}`).join('\n') || undefined}
              onClick={() => openDay(dateStr)}
            >
              <span className="cal-cell-num">{Number(dateStr.slice(8, 10))}</span>
              {!brk && items.length > 0 && (
                <span className="cal-dots">
                  {items.map((it) => (
                    <i key={it.schedule.id}
                      className={`cal-dot ${itemState(it, dateStr, today)}`}
                      style={{ '--subject-color': it.schedule.subjectColor }} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="cal-summary">
        {complete + partial + missed === 0 && planned === 0
          ? 'No school days scheduled this month.'
          : <>
              {complete + partial + missed > 0 && (
                <>So far: <strong>{complete}</strong> complete
                {partial > 0 && <>, <strong className="cal-summary-partial">{partial}</strong> partial</>}
                {missed > 0 && <>, <strong className="cal-summary-missed">{missed}</strong> missed</>}
                {'. '}</>
              )}
              {planned > 0 && <>{planned} school day{planned === 1 ? '' : 's'} still ahead this month.</>}
            </>}
      </p>
      <CalendarLegend />
    </div>
  )
}

function YearView({ childSchedules, lessonCompletions, scheduleBreaks, viewDate, setViewDate, openMonth, today }) {
  const year = Number(viewDate.slice(0, 4))

  return (
    <div className="cal-year">
      <div className="schedule-day-nav">
        <button type="button" className="btn-icon-only" aria-label="Previous year"
          onClick={() => setViewDate(`${year - 1}-01-01`)}>
          <ChevronLeft size={20} />
        </button>
        <div className="schedule-day-label"><strong>{year}</strong></div>
        <button type="button" className="btn-icon-only" aria-label="Next year"
          onClick={() => setViewDate(`${year + 1}-01-01`)}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="year-grid">
        {Array.from({ length: 12 }, (_, month) => {
          const cells = monthCells(year, month)
          const name = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short' })
          return (
            <button key={month} type="button" className="mini-month"
              onClick={() => openMonth(`${year}-${pad2(month + 1)}-01`)}>
              <span className="mini-month-name">{name}</span>
              <span className="mini-grid">
                {cells.map((dateStr, i) => {
                  if (!dateStr) return <i key={`p${i}`} className="mini-day empty" />
                  const brk = isBreak(dateStr, scheduleBreaks)
                  const items = brk ? [] : dayItemsFor(childSchedules, dateStr, lessonCompletions, scheduleBreaks, today)
                  const agg = brk ? 'break' : dayAggregate(items, dateStr, today)
                  return (
                    <i key={dateStr}
                      className={`mini-day ${agg || ''} ${dateStr === today ? 'today' : ''}`} />
                  )
                })}
              </span>
            </button>
          )
        })}
      </div>
      <CalendarLegend />
    </div>
  )
}

const isBreak = (dateStr, breaks) => breaks.some((b) => dateStr >= b.startDate && dateStr <= b.endDate)

function Schedule() {
  const {
    children, schedules, scheduleBreaks, lessonCompletions,
    saveSchedule, deleteSchedule, completeLesson, uncompleteLesson, logHours, addSubject,
  } = useData()

  const today = todayStr()
  const [childId, setChildId] = useState(children[0]?.id || '')
  const [viewDate, setViewDate] = useState(today)
  const [viewMode, setViewMode] = useState('day')
  const [editingSubject, setEditingSubject] = useState(null)
  const [hourPrompt, setHourPrompt] = useState(null)
  const [noteEditing, setNoteEditing] = useState(null) // completion id
  const [noteDraft, setNoteDraft] = useState('')
  const promptedRef = useRef(new Set())

  const startNote = (c) => {
    setNoteEditing(c.id)
    setNoteDraft(c.notes || '')
  }

  const saveNote = async (schedule, c) => {
    setNoteEditing(null)
    // '' deliberately clears the note; re-posting keeps the completion date.
    await completeLesson(schedule.id, c.lessonNumber, c.completedOn, noteDraft.trim())
  }

  // Keep a valid child selected as children load/change.
  useEffect(() => {
    if (!children.some((c) => c.id === childId) && children.length > 0) {
      setChildId(children[0].id)
    }
  }, [children, childId])

  const child = children.find((c) => c.id === childId)

  const childSchedules = useMemo(
    () => schedules.filter((s) => s.childId === childId),
    [schedules, childId]
  )

  const scheduleBySubject = useMemo(() => {
    const map = new Map()
    childSchedules.forEach((s) => map.set(s.subjectId, s))
    return map
  }, [childSchedules])

  // Calendar views want the subject's name/color on each schedule.
  const enrichedSchedules = useMemo(() => {
    if (!child) return []
    return childSchedules.map((s) => {
      const subject = child.subjects.find((sub) => sub.id === s.subjectId)
      return {
        ...s,
        subjectName: subject?.name || 'Subject',
        subjectColor: subject?.color || '#8FB39A',
      }
    })
  }, [child, childSchedules])

  // The day's checklist: one entry per scheduled subject meeting on viewDate.
  const dayItems = useMemo(() => {
    if (!child) return []
    return child.subjects
      .map((subject) => {
        const schedule = scheduleBySubject.get(subject.id)
        if (!schedule) return null
        if (schedule.kind === 'activity') {
          const activity = activityForDate(schedule, viewDate, lessonCompletions, scheduleBreaks, today)
          return activity ? { subject, schedule, activity } : null
        }
        const session = sessionForDate(schedule, viewDate, lessonCompletions, scheduleBreaks, today)
        if (!session) return null
        // Once finished, drop the card from every scheduled day EXCEPT the day
        // the last lesson was checked off — that day gets the celebration.
        if (isScheduleFinished(schedule, lessonCompletions)) {
          const finishDay = lastCompletionDate(schedule, lessonCompletions)
          if (viewDate !== finishDay) return null
          return { subject, schedule, session, finished: true }
        }
        // Future days the plan is projected to have already completed: nothing
        // to show, so don't render an empty card.
        if (session.type === 'future' && session.lessons.length === 0) return null
        return { subject, schedule, session }
      })
      .filter(Boolean)
  }, [child, scheduleBySubject, viewDate, lessonCompletions, scheduleBreaks, today])

  const viewBreak = scheduleBreaks.find((b) => viewDate >= b.startDate && viewDate <= b.endDate)

  const tick = async (schedule, subject, lessonNumber, label) => {
    await completeLesson(schedule.id, lessonNumber, viewDate)
    const key = `${subject.id}:${viewDate}`
    if (!promptedRef.current.has(key)) {
      promptedRef.current.add(key)
      setHourPrompt({ schedule, subject, label })
    }
  }

  const activityLabel = (schedule, subject) => schedule.title || subject.name

  if (children.length === 0) {
    return (
      <div className="tracker-section">
        <div className="empty-state">
          <div className="empty-state-icon"><CalendarDays size={36} /></div>
          <h3>No children yet</h3>
          <p>Add a child first — then give each subject its own lesson schedule.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-page">
      <div className="tracker-section">
        <div className="tracker-section-header">
          <h2><CalendarDays size={24} /> Schedule</h2>
        </div>

        {children.length > 1 && (
          <div className="schedule-child-chips">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`child-chip ${c.id === childId ? 'selected' : ''}`}
                style={{ '--chip-color': c.color || '#8FB39A' }}
                onClick={() => setChildId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="schedule-view-toggle" role="tablist">
          {['day', 'month', 'year'].map((mode) => (
            <button key={mode} type="button" role="tab"
              aria-selected={viewMode === mode}
              className={`view-toggle-btn ${viewMode === mode ? 'selected' : ''}`}
              onClick={() => setViewMode(mode)}>
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {viewMode === 'month' && (
          <MonthView
            childSchedules={enrichedSchedules}
            lessonCompletions={lessonCompletions}
            scheduleBreaks={scheduleBreaks}
            viewDate={viewDate}
            setViewDate={setViewDate}
            openDay={(d) => { setViewDate(d); setViewMode('day') }}
            today={today}
          />
        )}

        {viewMode === 'year' && (
          <YearView
            childSchedules={enrichedSchedules}
            lessonCompletions={lessonCompletions}
            scheduleBreaks={scheduleBreaks}
            viewDate={viewDate}
            setViewDate={setViewDate}
            openMonth={(d) => { setViewDate(d); setViewMode('month') }}
            today={today}
          />
        )}

        {viewMode === 'day' && (
        <>
        <div className="schedule-day-nav">
          <button type="button" className="btn-icon-only" aria-label="Previous day"
            onClick={() => setViewDate(addDays(viewDate, -1))}>
            <ChevronLeft size={20} />
          </button>
          <div className="schedule-day-label">
            <strong>{viewDate === today ? 'Today' : prettyDate(viewDate)}</strong>
            {viewDate === today && <span>{prettyDate(viewDate)}</span>}
            {viewDate !== today && (
              <button type="button" className="schedule-today-link" onClick={() => setViewDate(today)}>
                Back to today
              </button>
            )}
          </div>
          <button type="button" className="btn-icon-only" aria-label="Next day"
            onClick={() => setViewDate(addDays(viewDate, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>

        {viewBreak && (
          <div className="schedule-break-banner">
            <Palmtree size={18} /> School break: {viewBreak.name}
          </div>
        )}

        {!viewBreak && dayItems.length === 0 && (
          <p className="schedule-muted schedule-day-empty">
            {childSchedules.length === 0
              ? 'No schedules set up yet — add one below to see lessons here.'
              : `No lessons scheduled for ${child?.name || 'this child'} on this day.`}
          </p>
        )}

        <div className="schedule-day-list">
          {dayItems.map(({ subject, schedule, session, activity, finished }) => (
            <div key={subject.id} className={`schedule-day-item ${finished ? 'finished' : ''}`}
              style={{ '--subject-color': subject.color || '#8FB39A' }}>
              <div className="schedule-day-item-head">
                <span className="subject-dot" />
                <span className="subject-name">{subject.name}</span>
                {!activity && schedule.title && <span className="subject-curriculum">{schedule.title}</span>}
              </div>

              {activity ? (
                <ul className="lesson-list">
                  {activity.comp ? (
                    <li className="lesson-row done">
                      <div className="lesson-row-main">
                        <button type="button" className="lesson-checkbox checked"
                          aria-label={`Un-check ${activityLabel(schedule, subject)}`}
                          onClick={() => uncompleteLesson(activity.comp.id)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <span>{activityLabel(schedule, subject)}</span>
                        <button type="button"
                          className={`lesson-note-btn ${activity.comp.notes ? 'has-note' : ''}`}
                          aria-label={activity.comp.notes ? 'Edit note' : 'Add note'}
                          onClick={() => startNote(activity.comp)}>
                          <StickyNote size={15} />
                        </button>
                      </div>
                      {noteEditing === activity.comp.id ? (
                        <form className="lesson-note-edit"
                          onSubmit={(e) => { e.preventDefault(); saveNote(schedule, activity.comp) }}>
                          <input type="text" className="form-input" autoFocus
                            placeholder="e.g. Windy day at the park"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onBlur={() => saveNote(schedule, activity.comp)}
                            onKeyDown={(e) => { if (e.key === 'Escape') setNoteEditing(null) }} />
                        </form>
                      ) : (
                        activity.comp.notes && (
                          <button type="button" className="lesson-note-text" onClick={() => startNote(activity.comp)}>
                            {activity.comp.notes}
                          </button>
                        )
                      )}
                    </li>
                  ) : activity.type === 'future' ? (
                    <li className="lesson-row projected">
                      <span className="lesson-checkbox ghost" aria-hidden="true" />
                      <span>{activityLabel(schedule, subject)}</span>
                      <span className="lesson-tag">planned</span>
                    </li>
                  ) : (
                    <li className="lesson-row">
                      <div className="lesson-row-main">
                        <button type="button" className="lesson-checkbox"
                          aria-label={`Mark ${activityLabel(schedule, subject)} done`}
                          onClick={() => tick(schedule, subject, activityKey(viewDate), activityLabel(schedule, subject))} />
                        <span>{activityLabel(schedule, subject)}</span>
                        {activity.type === 'past' && <span className="lesson-tag">not done</span>}
                      </div>
                    </li>
                  )}
                </ul>
              ) : session.type === 'future' ? (
                <ul className="lesson-list">
                  {session.lessons.map((n) => (
                    <li key={n} className="lesson-row projected">
                      <span className="lesson-checkbox ghost" aria-hidden="true" />
                      <span>{schedule.unitLabel} {n}</span>
                      <span className="lesson-tag">projected</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="lesson-list">
                  {session.done.map((c) => (
                    <li key={`d${c.lessonNumber}`} className="lesson-row done">
                      <div className="lesson-row-main">
                        <button type="button" className="lesson-checkbox checked"
                          aria-label={`Un-check ${schedule.unitLabel.toLowerCase()} ${c.lessonNumber}`}
                          onClick={() => uncompleteLesson(c.id)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <span>{schedule.unitLabel} {c.lessonNumber}</span>
                        <button type="button"
                          className={`lesson-note-btn ${c.notes ? 'has-note' : ''}`}
                          aria-label={c.notes ? 'Edit note' : 'Add note'}
                          onClick={() => startNote(c)}>
                          <StickyNote size={15} />
                        </button>
                      </div>
                      {noteEditing === c.id ? (
                        <form className="lesson-note-edit"
                          onSubmit={(e) => { e.preventDefault(); saveNote(schedule, c) }}>
                          <input type="text" className="form-input" autoFocus
                            placeholder="e.g. The Very Hungry Caterpillar"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onBlur={() => saveNote(schedule, c)}
                            onKeyDown={(e) => { if (e.key === 'Escape') setNoteEditing(null) }} />
                        </form>
                      ) : (
                        c.notes && (
                          <button type="button" className="lesson-note-text" onClick={() => startNote(c)}>
                            {c.notes}
                          </button>
                        )
                      )}
                    </li>
                  ))}
                  {session.upcoming.map((n) => (
                    <li key={`u${n}`} className="lesson-row">
                      <div className="lesson-row-main">
                        <button type="button" className="lesson-checkbox"
                          aria-label={`Mark ${schedule.unitLabel.toLowerCase()} ${n} done`}
                          onClick={() => tick(schedule, subject, n, `${schedule.unitLabel} ${n}`)} />
                        <span>{schedule.unitLabel} {n}</span>
                        {session.type === 'past' && <span className="lesson-tag">not done</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {finished && (
                <div className="schedule-finished-banner">
                  🎉 Curriculum complete — every {schedule.unitLabel.toLowerCase()} done!
                </div>
              )}
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {child && (
        <div className="tracker-section">
          <div className="tracker-section-header">
            <h3>Subject schedules — {child.name}</h3>
          </div>
          {child.subjects.length === 0 && (
            <p className="schedule-muted">No subjects yet — add one below to start scheduling.</p>
          )}
          <ul className="schedule-config-list">
            {child.subjects.map((subject) => {
              const schedule = scheduleBySubject.get(subject.id)
              if (!schedule) {
                return (
                  <li key={subject.id} className="schedule-config-row">
                    <span className="subject-dot" style={{ '--subject-color': subject.color || '#8FB39A' }} />
                    <div className="schedule-config-info">
                      <span className="subject-name">{subject.name}</span>
                      <span className="schedule-muted">Not scheduled</span>
                    </div>
                    <button type="button" className="btn-tracker btn-secondary btn-sm"
                      onClick={() => setEditingSubject(subject)}>
                      <Plus size={16} /> Add schedule
                    </button>
                  </li>
                )
              }
              const progress = scheduleProgress(schedule, lessonCompletions)
              const finish = projectedFinish(schedule, lessonCompletions, scheduleBreaks, today)
              const isActivity = schedule.kind === 'activity'
              return (
                <li key={subject.id} className="schedule-config-row">
                  <span className="subject-dot" style={{ '--subject-color': subject.color || '#8FB39A' }} />
                  <div className="schedule-config-info">
                    <span className="subject-name">
                      {subject.name}
                      {schedule.title && <span className="subject-curriculum">{schedule.title}</span>}
                    </span>
                    <span className="schedule-config-meta">
                      {describeRecurrence(schedule)}
                      {isActivity ? ' · activity' : (
                        <>
                          {' · '}
                          {progress.nextLesson
                            ? `next ${schedule.unitLabel.toLowerCase()} ${progress.nextLesson}`
                            : `all ${schedule.unitLabel.toLowerCase()}s done`}
                          {schedule.totalLessons ? ` of ${schedule.totalLessons}` : ''}
                          {schedule.lessonsPerSession > 1 ? ` · ${schedule.lessonsPerSession}/session` : ''}
                          {finish?.date && (
                            <span className={finish.pastYearEnd ? 'finish-warn' : 'finish-ok'}>
                              {' · '}finishes ~{shortDate(finish.date)}
                              {finish.pastYearEnd ? ' (past year end!)' : ''}
                            </span>
                          )}
                          {finish?.done && ' · complete 🎉'}
                        </>
                      )}
                    </span>
                  </div>
                  <button type="button" className="btn-icon-only" aria-label={`Edit ${subject.name} schedule`}
                    onClick={() => setEditingSubject(subject)}>
                    <Pencil size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="btn-tracker btn-secondary btn-sm schedule-add-subject"
            onClick={() => setEditingSubject('new')}>
            <Plus size={16} /> Add subject
          </button>
        </div>
      )}

      <BreaksCard />

      {editingSubject && child && (
        <ScheduleEditor
          child={child}
          subject={editingSubject === 'new' ? null : editingSubject}
          schedule={editingSubject === 'new' ? null : (scheduleBySubject.get(editingSubject.id) || null)}
          onSave={async (form) => {
            if (editingSubject === 'new') {
              const color = SUBJECT_COLORS[child.subjects.length % SUBJECT_COLORS.length]
              const subject = await addSubject(child.id, form.subjectName, 0, color)
              return saveSchedule(child.id, subject.id, form)
            }
            return saveSchedule(child.id, editingSubject.id, form)
          }}
          onDelete={() => {
            if (editingSubject === 'new') return Promise.resolve()
            const s = scheduleBySubject.get(editingSubject.id)
            return s ? deleteSchedule(s.id) : Promise.resolve()
          }}
          onClose={() => setEditingSubject(null)}
        />
      )}

      {hourPrompt && child && (
        <HourPromptModal
          subjectName={hourPrompt.subject.name}
          label={hourPrompt.label}
          date={viewDate}
          onLog={async (hours, notes) => {
            await logHours(child.id, hourPrompt.subject.id, hours, viewDate, notes)
            setHourPrompt(null)
          }}
          onSkip={() => setHourPrompt(null)}
        />
      )}
    </div>
  )
}

export default Schedule

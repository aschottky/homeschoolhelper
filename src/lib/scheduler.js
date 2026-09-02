// Pure date/projection logic for per-subject lesson schedules.
//
// Core idea: lessons are never pinned to dates. Each scheduled day serves the
// next uncompleted lessons, so a missed day automatically rolls the whole
// plan forward — "bumping" needs no user action and no stored state.
//
// All dates are 'YYYY-MM-DD' strings compared lexicographically; Date objects
// are only built at local noon so day-of-week math never crosses a DST edge.

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`)
}

export function fmtDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr() {
  return fmtDate(new Date())
}

export function addDays(dateStr, days) {
  const d = toDate(dateStr)
  d.setDate(d.getDate() + days)
  return fmtDate(d)
}

export function dayOfWeek(dateStr) {
  return toDate(dateStr).getDay()
}

export function isBreakDay(dateStr, breaks) {
  return breaks.some((b) => dateStr >= b.startDate && dateStr <= b.endDate)
}

// Which occurrence of its weekday a date is within its month: 1..5,
// plus -1 when it's the last such weekday of the month.
export function weekdayOrdinal(dateStr) {
  const d = toDate(dateStr)
  const ordinal = Math.ceil(d.getDate() / 7)
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const isLast = d.getDate() + 7 > daysInMonth
  return { ordinal, isLast }
}

// Does the date match the schedule's recurrence pattern? (ignores the
// start/end range — projections walk past endDate on purpose)
export function matchesPattern(schedule, dateStr, breaks) {
  if (isBreakDay(dateStr, breaks)) return false
  const dow = dayOfWeek(dateStr)

  if (schedule.freq === 'monthly') {
    if (dow !== schedule.monthWeekday) return false
    const { ordinal, isLast } = weekdayOrdinal(dateStr)
    return schedule.monthOrdinal === -1 ? isLast : ordinal === schedule.monthOrdinal
  }

  // weekly: right weekday, and the right week when repeating every N weeks
  if (!schedule.daysOfWeek.includes(dow)) return false
  const interval = schedule.intervalWeeks || 1
  if (interval > 1) {
    // Anchor on the Sunday of the week containing startDate.
    const anchor = toDate(schedule.startDate)
    anchor.setDate(anchor.getDate() - anchor.getDay())
    const weeks = Math.floor(Math.round((toDate(dateStr) - anchor) / 86400000) / 7)
    if (weeks < 0 || weeks % interval !== 0) return false
  }
  return true
}

// Is this a day the subject meets? (pattern match, inside the year)
export function isScheduledDay(schedule, dateStr, breaks) {
  if (dateStr < schedule.startDate || dateStr > schedule.endDate) return false
  return matchesPattern(schedule, dateStr, breaks)
}

// Stable per-date completion key for activity schedules: 2026-09-02 -> 20260902.
// Reuses the (schedule_id, lesson_number) uniqueness for one-tick-per-day.
export function activityKey(dateStr) {
  return Number(dateStr.replace(/-/g, ''))
}

// Next `count` uncompleted lesson numbers, starting from startLesson.
// Stops at totalLessons when the curriculum has a known end.
export function nextLessons(schedule, completedSet, count) {
  const lessons = []
  let n = schedule.startLesson
  const max = schedule.totalLessons
    ? schedule.startLesson + schedule.totalLessons  // generous upper bound
    : schedule.startLesson + 10000
  while (lessons.length < count && n <= max) {
    if (schedule.totalLessons && n > schedule.totalLessons) break
    if (!completedSet.has(n)) lessons.push(n)
    n++
  }
  return lessons
}

// What this subject looks like on a given date:
//   null                                → not a scheduled day
//   { type: 'past',   done, upcoming }  → checked off that day + backfillable next lessons
//   { type: 'today',  done, upcoming }  → checked so far + next up (auto-rolled)
//   { type: 'future', lessons }         → projection assuming no more missed days
// Activity schedules ("Flying a kite" every other Tuesday): one checkbox per
// scheduled day, keyed by activityKey(date) instead of a lesson number.
export function activityForDate(schedule, dateStr, completions, breaks, today = todayStr()) {
  if (!isScheduledDay(schedule, dateStr, breaks)) return null
  const comp = completions.find(
    (c) => c.scheduleId === schedule.id && c.completedOn === dateStr
  ) || null
  const type = dateStr < today ? 'past' : dateStr === today ? 'today' : 'future'
  return { type, comp }
}

export function sessionForDate(schedule, dateStr, completions, breaks, today = todayStr()) {
  if (!isScheduledDay(schedule, dateStr, breaks)) return null
  const mine = completions.filter((c) => c.scheduleId === schedule.id)
  const completedSet = new Set(mine.map((c) => c.lessonNumber))
  const onDate = (d) => mine
    .filter((c) => c.completedOn === d)
    .sort((a, b) => a.lessonNumber - b.lessonNumber)

  if (dateStr <= today) {
    const done = onDate(dateStr)
    const slots = Math.max(0, schedule.lessonsPerSession - done.length)
    return {
      type: dateStr === today ? 'today' : 'past',
      done,
      upcoming: nextLessons(schedule, completedSet, slots),
    }
  }
  const doneToday = onDate(today)

  // Future: walk scheduled days from today to the target date, dealing
  // lessonsPerSession uncompleted lessons per day (today gets only its
  // remaining slots).
  let queue = nextLessons(schedule, completedSet, 10000)
  let d = today < schedule.startDate ? schedule.startDate : today
  let guard = 0
  while (d < dateStr && guard++ < 800) {
    if (isScheduledDay(schedule, d, breaks)) {
      const cap = d === today
        ? Math.max(0, schedule.lessonsPerSession - doneToday.length)
        : schedule.lessonsPerSession
      queue = queue.slice(cap)
    }
    d = addDays(d, 1)
  }
  return { type: 'future', lessons: queue.slice(0, schedule.lessonsPerSession) }
}

// When does the curriculum finish at the current pace? Needs totalLessons.
// Walks past endDate if necessary so "you won't make it" is visible.
export function projectedFinish(schedule, completions, breaks, today = todayStr()) {
  if (schedule.kind === 'activity' || !schedule.totalLessons) return null
  const mine = completions.filter((c) => c.scheduleId === schedule.id)
  const completedSet = new Set(mine.map((c) => c.lessonNumber))
  let remaining = 0
  for (let n = schedule.startLesson; n <= schedule.totalLessons; n++) {
    if (!completedSet.has(n)) remaining++
  }
  if (remaining === 0) return { date: null, done: true, pastYearEnd: false }

  const doneToday = mine.filter((c) => c.completedOn === today).length
  let d = today < schedule.startDate ? schedule.startDate : today
  let guard = 0
  // Beyond endDate the recurrence pattern continues but breaks still apply.
  while (guard++ < 1500) {
    if (matchesPattern(schedule, d, breaks)) {
      const cap = d === today
        ? Math.max(0, schedule.lessonsPerSession - doneToday)
        : schedule.lessonsPerSession
      remaining -= cap
      if (remaining <= 0) {
        return { date: d, done: false, pastYearEnd: d > schedule.endDate }
      }
    }
    d = addDays(d, 1)
  }
  return null
}

// Human-readable recurrence, e.g. "Mon · Wed · Fri", "Every other week: Tue",
// "3rd Wed of the month".
export function describeRecurrence(schedule) {
  if (schedule.freq === 'monthly') {
    const ord = schedule.monthOrdinal === -1
      ? 'Last'
      : ['', '1st', '2nd', '3rd', '4th'][schedule.monthOrdinal] || `${schedule.monthOrdinal}th`
    return `${ord} ${DAY_LABELS[schedule.monthWeekday] ?? '?'} of the month`
  }
  const days = [...schedule.daysOfWeek].sort((a, b) => a - b).map((d) => DAY_LABELS[d]).join(' · ')
  const interval = schedule.intervalWeeks || 1
  if (interval === 1) return days
  if (interval === 2) return `Every other week: ${days}`
  return `Every ${interval} weeks: ${days}`
}

// Completed-lesson count and the next lesson number, for "Lesson 17 of 120".
export function scheduleProgress(schedule, completions) {
  const mine = completions.filter((c) => c.scheduleId === schedule.id)
  const completedSet = new Set(mine.map((c) => c.lessonNumber))
  const [next] = nextLessons(schedule, completedSet, 1)
  return { completedCount: mine.length, nextLesson: next ?? null }
}

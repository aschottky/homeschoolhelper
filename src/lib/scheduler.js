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

// Is this a day the subject meets? (right weekday, inside the year, not a break)
export function isScheduledDay(schedule, dateStr, breaks) {
  if (dateStr < schedule.startDate || dateStr > schedule.endDate) return false
  if (!schedule.daysOfWeek.includes(dayOfWeek(dateStr))) return false
  return !isBreakDay(dateStr, breaks)
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
  if (!schedule.totalLessons) return null
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
  // Beyond endDate the weekday pattern continues but breaks still apply.
  const meets = (day) =>
    schedule.daysOfWeek.includes(dayOfWeek(day)) && !isBreakDay(day, breaks)
  while (guard++ < 1500) {
    if (meets(d)) {
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

// Completed-lesson count and the next lesson number, for "Lesson 17 of 120".
export function scheduleProgress(schedule, completions) {
  const mine = completions.filter((c) => c.scheduleId === schedule.id)
  const completedSet = new Set(mine.map((c) => c.lessonNumber))
  const [next] = nextLessons(schedule, completedSet, 1)
  return { completedCount: mine.length, nextLesson: next ?? null }
}

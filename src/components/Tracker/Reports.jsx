import { useState, useMemo, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { Link } from 'react-router-dom'
import {
  FileText,
  Download,
  Sparkles,
  Calendar,
  User,
  GraduationCap,
  ClipboardList
} from 'lucide-react'
import './Reports.css'

const GRADING_PERIODS = {
  quarters: { name: 'Quarters', periods: ['Q1', 'Q2', 'Q3', 'Q4'] },
  semesters: { name: 'Semesters', periods: ['Semester 1', 'Semester 2'] },
  trimesters: { name: 'Trimesters', periods: ['Trimester 1', 'Trimester 2', 'Trimester 3'] }
}

function defaultDateRange() {
  const today = new Date()
  const end = today.toISOString().split('T')[0]
  const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
  return { start, end }
}

function loadGradeStorage() {
  try {
    const gradesRaw = localStorage.getItem('homeschool_grades')
    const settingsRaw = localStorage.getItem('homeschool_grade_settings')
    const gradesData = gradesRaw ? JSON.parse(gradesRaw) : {}
    const gradeSettings = settingsRaw
      ? JSON.parse(settingsRaw)
      : { gradingScale: 'letter', gradingPeriod: 'quarters', schoolYear: String(new Date().getFullYear()) }
    return { gradesData, gradeSettings }
  } catch {
    return {
      gradesData: {},
      gradeSettings: { gradingScale: 'letter', gradingPeriod: 'quarters', schoolYear: String(new Date().getFullYear()) }
    }
  }
}

function getGradeForSubject(gradesData, childId, period, subjectId) {
  return gradesData[childId]?.[period]?.[subjectId]?.grade || '—'
}

function sumHoursInRange(hourLogs, childId, subjectId, start, end) {
  return hourLogs
    .filter(
      log =>
        log.childId === childId &&
        log.subjectId === subjectId &&
        log.date >= start &&
        log.date <= end
    )
    .reduce((sum, log) => sum + Number(log.hours || 0), 0)
}

function sumHoursByChildInRange(hourLogs, childId, start, end) {
  return hourLogs
    .filter(log => log.childId === childId && log.date >= start && log.date <= end)
    .reduce((sum, log) => sum + Number(log.hours || 0), 0)
}

function buildDailyAttendance(hourLogs, childId, start, end) {
  const byDate = {}
  hourLogs
    .filter(log => log.childId === childId && log.date >= start && log.date <= end)
    .forEach(log => {
      const d = log.date
      byDate[d] = (byDate[d] || 0) + Number(log.hours || 0)
    })
  const dates = Object.keys(byDate).sort()
  const byMonth = {}
  dates.forEach(d => {
    const key = d.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push({ date: d, hours: byDate[d] })
  })
  return { byMonth, dates }
}

function formatMonthKey(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function primaryParentLine(profile) {
  if (!profile) return ''
  const g = profile.guardians
  if (Array.isArray(g) && g.length > 0) {
    return g.map(x => x.name).filter(Boolean).join(', ')
  }
  return profile.parentName || ''
}

/** Shared document chrome for print + preview */
function ReportDocument({
  title,
  subtitle,
  homeschoolName,
  childName,
  dateRangeLabel,
  childrenContent,
  footerNote
}) {
  const generated = new Date().toLocaleString()
  return (
    <div className="report-doc">
      <header className="report-doc-header">
        {homeschoolName ? <div className="report-doc-school">{homeschoolName}</div> : null}
        <h1 className="report-doc-title">{title}</h1>
        {subtitle ? <p className="report-doc-subtitle">{subtitle}</p> : null}
        <div className="report-doc-meta">
          {childName ? <span><strong>Student:</strong> {childName}</span> : null}
          {dateRangeLabel ? <span><strong>Period:</strong> {dateRangeLabel}</span> : null}
        </div>
      </header>
      <div className="report-doc-body">{childrenContent}</div>
      <footer className="report-doc-footer">
        <span>{footerNote || 'Homeschool Helper'}</span>
        <span>Generated {generated}</span>
      </footer>
    </div>
  )
}

function ProgressTable({ child, hourLogs, start, end }) {
  const rows = child.subjects.map(subject => {
    const logged = sumHoursInRange(hourLogs, child.id, subject.id, start, end)
    const required = subject.requiredHours || 0
    const pct = required > 0 ? Math.round((logged / required) * 1000) / 10 : 0
    return (
      <tr key={subject.id}>
        <td>
          <span className="report-subject-dot" style={{ background: subject.color }} />
          {subject.name}
        </td>
        <td className="report-num">{logged.toFixed(1)}</td>
        <td className="report-num">{required}</td>
        <td className="report-num">{pct}%</td>
      </tr>
    )
  })
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Hours (period)</th>
          <th>Required</th>
          <th>% of requirement</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function TranscriptTable({ child, gradesData, period, getSubjectHours }) {
  const rows = child.subjects.map(subject => {
    const grade = getGradeForSubject(gradesData, child.id, period, subject.id)
    const hrs = getSubjectHours(child.id, subject.id)
    return (
      <tr key={subject.id}>
        <td>{subject.name}</td>
        <td className="report-num">{grade}</td>
        <td className="report-num">{hrs.toFixed(1)}</td>
      </tr>
    )
  })
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Grade</th>
          <th>Hours logged</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function AttendanceTables({ byMonth }) {
  const keys = Object.keys(byMonth).sort()
  if (keys.length === 0) {
    return <p className="report-empty">No attendance entries in this date range.</p>
  }
  return keys.map(ym => (
    <div key={ym} className="report-month-block">
      <h3 className="report-month-title">{formatMonthKey(ym)}</h3>
      <table className="report-table report-table-compact">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {byMonth[ym].map(({ date, hours }) => (
            <tr key={date}>
              <td>{date}</td>
              <td className="report-num">{hours.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))
}

export default function Reports() {
  const { children, hourLogs, getSubjectHours, getChildTotalHours, homeschoolProfile } = useData()
  const { isPremium, upgradeToPremium } = useSubscription()

  const [reportType, setReportType] = useState('progress')
  const [{ start: rangeStart, end: rangeEnd }, setRange] = useState(defaultDateRange)
  const [selectedChild, setSelectedChild] = useState('')
  const [transcriptPeriod, setTranscriptPeriod] = useState('Q1')
  const [transcriptYear, setTranscriptYear] = useState('')
  const [gradesData, setGradesData] = useState({})
  const [gradeSettings, setGradeSettings] = useState({
    gradingPeriod: 'quarters',
    schoolYear: String(new Date().getFullYear())
  })

  useEffect(() => {
    const { gradesData: g, gradeSettings: s } = loadGradeStorage()
    setGradesData(g)
    setGradeSettings(prev => ({ ...prev, ...s }))
    setTranscriptYear(s.schoolYear || String(new Date().getFullYear()))
    const periods = GRADING_PERIODS[s.gradingPeriod || 'quarters']?.periods || GRADING_PERIODS.quarters.periods
    setTranscriptPeriod(p => (periods.includes(p) ? p : periods[0]))
  }, [])

  const periodOptions = useMemo(
    () => GRADING_PERIODS[gradeSettings.gradingPeriod || 'quarters']?.periods || GRADING_PERIODS.quarters.periods,
    [gradeSettings.gradingPeriod]
  )

  useEffect(() => {
    if (!selectedChild && children.length > 0) {
      setSelectedChild(children[0].id)
    }
  }, [children, selectedChild])

  const child = children.find(c => c.id === selectedChild)
  const homeschoolName = homeschoolProfile?.homeschoolName?.trim() || ''
  const parentLine = primaryParentLine(homeschoolProfile)

  const dateRangeLabel = `${rangeStart} → ${rangeEnd}`

  const attendanceData = useMemo(() => {
    if (!child) return { byMonth: {} }
    return buildDailyAttendance(hourLogs, child.id, rangeStart, rangeEnd)
  }, [child, hourLogs, rangeStart, rangeEnd])

  const reportContent = useMemo(() => {
    if (!child) {
      return <p className="report-empty">Add a child in the Children tab to generate reports.</p>
    }

    if (reportType === 'progress') {
      return (
        <ReportDocument
          title="Progress Report"
          subtitle="Subject hours vs. annual requirements (hours in selected date range)"
          homeschoolName={homeschoolName}
          childName={child.name}
          dateRangeLabel={dateRangeLabel}
          footerNote="Progress report — Homeschool Helper"
          childrenContent={
            child.subjects?.length ? (
              <ProgressTable child={child} hourLogs={hourLogs} start={rangeStart} end={rangeEnd} />
            ) : (
              <p className="report-empty">No subjects on file for this student.</p>
            )
          }
        />
      )
    }

    if (reportType === 'transcript') {
      const totalHrs = getChildTotalHours(child.id)
      return (
        <ReportDocument
          title="Homeschool Transcript"
          subtitle={`School year ${transcriptYear} · ${transcriptPeriod}`}
          homeschoolName={homeschoolName}
          childName={child.name}
          dateRangeLabel={null}
          footerNote="Official transcript summary — Homeschool Helper"
          childrenContent={
            <>
              <div className="report-transcript-block">
                <p>
                  <strong>Parent / Guardian:</strong> {parentLine || '—'}
                </p>
                <p>
                  <strong>Total hours (all subjects, cumulative):</strong>{' '}
                  <span className="report-num">{totalHrs.toFixed(1)}</span>
                </p>
                <p className="report-transcript-note">
                  Grades reflect entries saved in the Grades section for the selected period.
                </p>
              </div>
              {child.subjects?.length ? (
                <TranscriptTable
                  child={child}
                  gradesData={gradesData}
                  period={transcriptPeriod}
                  getSubjectHours={getSubjectHours}
                />
              ) : (
                <p className="report-empty">No subjects on file for this student.</p>
              )}
            </>
          }
        />
      )
    }

    return (
      <ReportDocument
        title="Attendance Record"
        subtitle="Daily study hours (all subjects combined)"
        homeschoolName={homeschoolName}
        childName={child.name}
        dateRangeLabel={dateRangeLabel}
        footerNote="Attendance record — Homeschool Helper"
        childrenContent={<AttendanceTables byMonth={attendanceData.byMonth} />}
      />
    )
  }, [
    child,
    reportType,
    homeschoolName,
    parentLine,
    dateRangeLabel,
    rangeStart,
    rangeEnd,
    hourLogs,
    gradesData,
    transcriptPeriod,
    transcriptYear,
    getSubjectHours,
    getChildTotalHours,
    attendanceData.byMonth
  ])

  const handlePrint = () => {
    if (!isPremium) return
    window.print()
  }

  return (
    <div className="reports-page">
      <div className="reports-header tracker-section">
        <div className="tracker-section-header">
          <FileText size={22} />
          <h2>Reports &amp; PDF Export</h2>
        </div>
        <p className="reports-lead">
          Build progress summaries, transcripts, and attendance logs. Premium members can print or save as PDF
          from the browser print dialog.
        </p>
      </div>

      <div className="reports-toolbar tracker-section">
        <div className="reports-type-tabs">
          <button
            type="button"
            className={`reports-tab ${reportType === 'progress' ? 'active' : ''}`}
            onClick={() => setReportType('progress')}
          >
            <ClipboardList size={18} />
            Progress Report
          </button>
          <button
            type="button"
            className={`reports-tab ${reportType === 'transcript' ? 'active' : ''}`}
            onClick={() => setReportType('transcript')}
          >
            <GraduationCap size={18} />
            Transcript
          </button>
          <button
            type="button"
            className={`reports-tab ${reportType === 'attendance' ? 'active' : ''}`}
            onClick={() => setReportType('attendance')}
          >
            <Calendar size={18} />
            Attendance
          </button>
        </div>

        <div className="reports-controls">
          <div className="form-group">
            <label>
              <User size={14} /> Student
            </label>
            <select
              className="form-select"
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {(reportType === 'progress' || reportType === 'attendance') && (
            <>
              <div className="form-group">
                <label>From</label>
                <input
                  type="date"
                  className="form-input"
                  value={rangeStart}
                  onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>To</label>
                <input
                  type="date"
                  className="form-input"
                  value={rangeEnd}
                  onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
                />
              </div>
            </>
          )}

          {reportType === 'transcript' && (
            <>
              <div className="form-group">
                <label>School year</label>
                <input
                  type="text"
                  className="form-input"
                  value={transcriptYear}
                  onChange={e => setTranscriptYear(e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
              <div className="form-group">
                <label>Grading period</label>
                <select
                  className="form-select"
                  value={transcriptPeriod}
                  onChange={e => setTranscriptPeriod(e.target.value)}
                >
                  {periodOptions.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="reports-actions">
          {isPremium ? (
            <button type="button" className="btn-tracker btn-primary" onClick={handlePrint}>
              <Download size={18} />
              Download PDF
            </button>
          ) : (
            <>
              <button type="button" className="btn-tracker btn-primary" onClick={upgradeToPremium}>
                <Sparkles size={18} />
                Upgrade to download PDF
              </button>
              <Link to="/tracker/upgrade" className="btn-tracker btn-secondary">
                Compare plans
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="reports-preview-wrap tracker-section">
        <h3 className="reports-preview-heading">Preview</h3>
        <div className={`reports-preview-shell ${!isPremium ? 'is-gated' : ''}`}>
          <div className="reports-preview-inner">{reportContent}</div>
          {!isPremium && (
            <div className="reports-gate-overlay">
              <p className="reports-gate-title">Premium feature</p>
              <p className="reports-gate-text">
                Preview is blurred until you upgrade. Unlock full PDF export and clean print layout.
              </p>
              <button type="button" className="btn-tracker btn-primary" onClick={upgradeToPremium}>
                <Sparkles size={18} />
                Upgrade to Premium
              </button>
              <Link to="/tracker/upgrade" className="reports-gate-link">
                See benefits
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Print-only: professional sheet (same content as preview, never blurred) */}
      <div className="reports-print-root" aria-hidden="true">
        {isPremium ? (
          reportContent
        ) : (
          <div className="report-doc report-print-placeholder">
            <h1 className="report-doc-title">Homeschool Helper</h1>
            <p>Upgrade to Premium to export reports, transcripts, and attendance as PDF.</p>
          </div>
        )}
      </div>
    </div>
  )
}

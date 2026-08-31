import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { isBackendConfigured } from '../lib/config'
import { useAuth } from './AuthContext'
import { STATE_REQUIREMENTS } from '../data/stateRequirements'

const DataContext = createContext()

// Default subjects with typical homeschool requirements
const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'Mathematics', requiredHours: 150, color: '#2D5A4A' },
  { id: 'ela', name: 'Language Arts', requiredHours: 150, color: '#E8A87C' },
  { id: 'science', name: 'Science', requiredHours: 100, color: '#8FB39A' },
  { id: 'history', name: 'History/Social Studies', requiredHours: 100, color: '#D4896A' },
  { id: 'pe', name: 'Physical Education', requiredHours: 50, color: '#5A8F7B' },
  { id: 'art', name: 'Art', requiredHours: 50, color: '#C4A484' },
]

// Get subjects based on state requirements
export const getSubjectsForState = (stateCode) => {
  const state = STATE_REQUIREMENTS[stateCode]
  if (!state || !state.recommendedHours) {
    return DEFAULT_SUBJECTS
  }

  const colors = ['#2D5A4A', '#E8A87C', '#8FB39A', '#D4896A', '#5A8F7B', '#C4A484', '#6B8E7B', '#B58863']

  return Object.entries(state.recommendedHours).map(([name, hours], index) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    requiredHours: hours,
    color: colors[index % colors.length]
  }))
}

// Row transforms: API returns snake_case rows straight from Postgres
const toChild = (child, subjects = []) => ({
  id: child.id,
  name: child.name,
  color: child.color || '#8FB39A',
  stateCode: child.state_code,
  birthDate: child.birth_date || null,
  gradeLevel: child.grade_level || null,
  createdAt: child.created_at,
  subjects: subjects.map(toSubject)
})

const toSubject = (s) => ({
  id: s.id,
  name: s.name,
  requiredHours: s.required_hours,
  color: s.color,
  schoolworkReminderFrequency: s.schoolwork_reminder_frequency || null
})

const toHourLog = (log) => ({
  id: log.id,
  childId: log.child_id,
  subjectId: log.subject_id,
  hours: Number(log.hours),
  date: log.date,
  notes: log.notes,
  createdAt: log.created_at
})

const toReadAloud = (l) => ({
  id: l.id,
  childId: l.child_id,
  bookId: l.book_id,
  bookTitle: l.book_title,
  bookAuthor: l.book_author,
  status: l.status || (l.completed ? 'completed' : 'reading'),
  completed: l.completed,
  completedAt: l.completed_at,
  startedAt: l.started_at,
  notes: l.notes,
  createdAt: l.created_at,
  isCustom: String(l.book_id || '').startsWith('custom-')
})

const toSample = (s) => ({
  id: s.id,
  childId: s.child_id,
  subjectId: s.subject_id,
  imageUrl: s.image_url,
  fileName: s.file_name,
  fileSize: s.file_size,
  notes: s.notes,
  uploadedAt: s.uploaded_at
})

const toBook = (b) => ({
  id: b.id,
  title: b.title,
  author: b.author || '',
  illustrator: b.illustrator || '',
  ageGroup: b.age_group,
  genre: b.genre || '',
  description: b.description || '',
  isDb: true
})

const toSchedule = (s) => ({
  id: s.id,
  childId: s.child_id,
  subjectId: s.subject_id,
  title: s.title || '',
  daysOfWeek: (s.days_of_week || []).map(Number),
  startDate: s.start_date,
  endDate: s.end_date,
  startLesson: s.start_lesson,
  lessonsPerSession: s.lessons_per_session,
  totalLessons: s.total_lessons || null
})

const toScheduleBreak = (b) => ({
  id: b.id,
  name: b.name,
  startDate: b.start_date,
  endDate: b.end_date
})

const toCompletion = (c) => ({
  id: c.id,
  scheduleId: c.schedule_id,
  lessonNumber: c.lesson_number,
  completedOn: c.completed_on
})

const toResource = (r) => ({
  id: r.id,
  category: r.category,
  countLabel: r.count_label,
  items: r.items || [],
  color: r.color || 'sage',
  link: r.link,
  isDb: true
})

export function DataProvider({ children: childrenProp }) {
  const { user, profile } = useAuth()
  const isConfigured = isBackendConfigured()

  const [children, setChildren] = useState([])
  const [hourLogs, setHourLogs] = useState([])
  const [schoolworkSamples, setSchoolworkSamples] = useState([])
  const [userState, setUserState] = useState('')
  const [homeschoolProfile, setHomeschoolProfile] = useState({
    homeschoolName: '',
    parentName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    guardians: []
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [suggestedBooks, setSuggestedBooks] = useState([])
  const [resources, setResources] = useState([])
  const [readAloudLogs, setReadAloudLogs] = useState([])
  const [schedules, setSchedules] = useState([])
  const [scheduleBreaks, setScheduleBreaks] = useState([])
  const [lessonCompletions, setLessonCompletions] = useState([])

  // Load public data (suggested books, resources)
  useEffect(() => {
    if (!isConfigured) return
    const loadPublic = async () => {
      try {
        const data = await api('/api/public')
        if (data?.suggested_books) setSuggestedBooks(data.suggested_books.map(toBook))
        if (data?.resources) setResources(data.resources.map(toResource))
      } catch (_) { /* backend may not be reachable yet */ }
    }
    loadPublic()
  }, [isConfigured])

  // Load data when user changes
  useEffect(() => {
    if (!isConfigured || !user) {
      loadFromLocalStorage()
      return
    }

    loadFromCloud()
  }, [user, isConfigured])

  // Sync homeschool profile fields from the auth profile row
  useEffect(() => {
    if (!isConfigured || !user || !profile) return
    // Parse guardians — migrate legacy single-parent fields if needed
    let guardians = []
    if (profile.guardians && Array.isArray(profile.guardians) && profile.guardians.length > 0) {
      guardians = profile.guardians
    } else if (profile.parent_name) {
      guardians = [{
        id: crypto.randomUUID(),
        name: profile.parent_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        role: 'Parent'
      }]
    }
    setHomeschoolProfile({
      homeschoolName: profile.homeschool_name || '',
      parentName: profile.parent_name || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip: profile.zip || '',
      phone: profile.phone || '',
      email: profile.email || '',
      guardians
    })
    setUserState(profile.state || '')
  }, [isConfigured, user, profile])

  // Load from localStorage (fallback/demo mode)
  const loadFromLocalStorage = () => {
    const savedChildren = localStorage.getItem('homeschool_children')
    const savedLogs = localStorage.getItem('homeschool_logs')
    const savedState = localStorage.getItem('homeschool_state')
    const savedProfile = localStorage.getItem('homeschool_profile')
    const savedSamples = localStorage.getItem('homeschool_schoolwork_samples')
    const savedSchedules = localStorage.getItem('homeschool_schedules')
    const savedBreaks = localStorage.getItem('homeschool_schedule_breaks')
    const savedCompletions = localStorage.getItem('homeschool_lesson_completions')

    if (savedChildren) setChildren(JSON.parse(savedChildren))
    if (savedLogs) setHourLogs(JSON.parse(savedLogs))
    if (savedState) setUserState(savedState)
    if (savedProfile) setHomeschoolProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }))
    if (savedSamples) setSchoolworkSamples(JSON.parse(savedSamples))
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules))
    if (savedBreaks) setScheduleBreaks(JSON.parse(savedBreaks))
    if (savedCompletions) setLessonCompletions(JSON.parse(savedCompletions))

    setIsLoaded(true)
    setLoading(false)
  }

  // Load everything from the API
  const loadFromCloud = async () => {
    setLoading(true)
    try {
      const data = await api('/api/data/bootstrap')

      const transformedChildren = (data?.children || []).map(c => toChild(c, c.subjects || []))
      setChildren(transformedChildren)
      setHourLogs((data?.hour_logs || []).map(toHourLog))
      setReadAloudLogs((data?.read_aloud_logs || []).map(toReadAloud))
      setSchoolworkSamples((data?.schoolwork_samples || []).map(toSample))
      setSchedules((data?.schedules || []).map(toSchedule))
      setScheduleBreaks((data?.schedule_breaks || []).map(toScheduleBreak))
      setLessonCompletions((data?.lesson_completions || []).map(toCompletion))

      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
      setChildren([])
      setHourLogs([])
      setReadAloudLogs([])
      setSchoolworkSamples([])
      setSchedules([])
      setScheduleBreaks([])
      setLessonCompletions([])
      setIsLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  // Save to localStorage (for demo mode)
  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_children', JSON.stringify(children))
    }
  }, [children, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_logs', JSON.stringify(hourLogs))
    }
  }, [hourLogs, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_state', userState)
    }
  }, [userState, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_profile', JSON.stringify(homeschoolProfile))
    }
  }, [homeschoolProfile, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_schoolwork_samples', JSON.stringify(schoolworkSamples))
    }
  }, [schoolworkSamples, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_schedules', JSON.stringify(schedules))
    }
  }, [schedules, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_schedule_breaks', JSON.stringify(scheduleBreaks))
    }
  }, [scheduleBreaks, isLoaded, isConfigured, user])

  useEffect(() => {
    if (isLoaded && (!isConfigured || !user)) {
      localStorage.setItem('homeschool_lesson_completions', JSON.stringify(lessonCompletions))
    }
  }, [lessonCompletions, isLoaded, isConfigured, user])

  // Add a new child
  const addChild = async (name, useStateRequirements = false, stateCode = null, birthDate = null, gradeLevel = null, trackHours = true, color = '#8FB39A') => {
    const effectiveState = stateCode || userState
    // Only create subjects if tracking hours is enabled
    const subjects = trackHours
      ? (useStateRequirements && effectiveState
          ? getSubjectsForState(effectiveState)
          : DEFAULT_SUBJECTS)
      : []

    if (isConfigured && user) {
      try {
        const data = await api('/api/data/children', {
          method: 'POST',
          body: {
            name,
            color: color || '#8FB39A',
            state_code: useStateRequirements ? effectiveState : null,
            birth_date: birthDate || null,
            grade_level: gradeLevel || null,
            subjects: trackHours
              ? subjects.map(s => ({ name: s.name, required_hours: s.requiredHours, color: s.color }))
              : []
          }
        })

        const newChild = toChild(data.child, data.subjects || [])
        setChildren(prev => [...prev, newChild])
        return newChild
      } catch (error) {
        console.error('Error adding child:', error)
        throw error
      }
    } else {
      // localStorage mode
      const newChild = {
        id: Date.now().toString(),
        name,
        subjects: trackHours ? subjects.map(s => ({ ...s, id: `${Date.now()}-${s.id}` })) : [],
        stateCode: useStateRequirements ? effectiveState : null,
        birthDate: birthDate || null,
        gradeLevel: gradeLevel || null,
        createdAt: new Date().toISOString()
      }
      setChildren(prev => [...prev, newChild])
      return newChild
    }
  }

  // Update child
  const updateChild = async (childId, updates) => {
    if (isConfigured && user) {
      try {
        const updateData = {}
        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate || null
        if (updates.gradeLevel !== undefined) updateData.grade_level = updates.gradeLevel || null
        if (updates.color !== undefined) updateData.color = updates.color

        await api(`/api/data/children?id=${childId}`, { method: 'PATCH', body: updateData })
      } catch (error) {
        console.error('Error updating child:', error)
      }
    }
    setChildren(prev => prev.map(child =>
      child.id === childId ? { ...child, ...updates } : child
    ))
  }

  // Delete a child and their logs
  const deleteChild = async (childId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/children?id=${childId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting child:', error)
      }
    }
    setChildren(prev => prev.filter(child => child.id !== childId))
    setHourLogs(prev => prev.filter(log => log.childId !== childId))
    setSchedules(prev => {
      const removed = new Set(prev.filter(s => s.childId === childId).map(s => s.id))
      setLessonCompletions(pc => pc.filter(c => !removed.has(c.scheduleId)))
      return prev.filter(s => s.childId !== childId)
    })
  }

  // Add a subject to a child
  const addSubject = async (childId, name, requiredHours, color, schoolworkReminderFrequency = null) => {
    const newSubject = {
      name,
      requiredHours: Number(requiredHours),
      color: color || '#8FB39A',
      schoolworkReminderFrequency
    }

    if (isConfigured && user) {
      try {
        const data = await api('/api/data/subjects', {
          method: 'POST',
          body: {
            child_id: childId,
            name: newSubject.name,
            required_hours: newSubject.requiredHours,
            color: newSubject.color,
            schoolwork_reminder_frequency: newSubject.schoolworkReminderFrequency
          }
        })

        const subject = toSubject(data)
        setChildren(prev => prev.map(child =>
          child.id === childId
            ? { ...child, subjects: [...child.subjects, subject] }
            : child
        ))
        return subject
      } catch (error) {
        console.error('Error adding subject:', error)
        throw error
      }
    } else {
      const subject = { ...newSubject, id: Date.now().toString() }
      setChildren(prev => prev.map(child =>
        child.id === childId
          ? { ...child, subjects: [...child.subjects, subject] }
          : child
      ))
      return subject
    }
  }

  // Update a subject
  const updateSubject = async (childId, subjectId, updates) => {
    if (isConfigured && user) {
      try {
        const updateData = {
          name: updates.name,
          required_hours: updates.requiredHours,
          color: updates.color
        }
        if (updates.schoolworkReminderFrequency !== undefined) {
          updateData.schoolwork_reminder_frequency = updates.schoolworkReminderFrequency
        }
        await api(`/api/data/subjects?id=${subjectId}`, { method: 'PATCH', body: updateData })
      } catch (error) {
        console.error('Error updating subject:', error)
      }
    }
    setChildren(prev => prev.map(child =>
      child.id === childId
        ? {
            ...child,
            subjects: child.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, ...updates } : subject
            )
          }
        : child
    ))
  }

  // Delete a subject
  const deleteSubject = async (childId, subjectId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/subjects?id=${subjectId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting subject:', error)
      }
    }
    setChildren(prev => prev.map(child =>
      child.id === childId
        ? { ...child, subjects: child.subjects.filter(s => s.id !== subjectId) }
        : child
    ))
    setHourLogs(prev => prev.filter(log =>
      !(log.childId === childId && log.subjectId === subjectId)
    ))
    setSchedules(prev => {
      const removed = new Set(prev.filter(s => s.subjectId === subjectId).map(s => s.id))
      setLessonCompletions(pc => pc.filter(c => !removed.has(c.scheduleId)))
      return prev.filter(s => s.subjectId !== subjectId)
    })
  }

  // Log hours for a subject
  const logHours = async (childId, subjectId, hours, date, notes = '') => {
    const logData = {
      childId,
      subjectId,
      hours: Number(hours),
      date: date || new Date().toISOString().split('T')[0],
      notes,
      createdAt: new Date().toISOString()
    }

    if (isConfigured && user) {
      try {
        const data = await api('/api/data/hour-logs', {
          method: 'POST',
          body: {
            child_id: childId,
            subject_id: subjectId,
            hours: logData.hours,
            date: logData.date,
            notes: logData.notes
          }
        })

        const newLog = toHourLog(data)
        setHourLogs(prev => [...prev, newLog])
        return newLog
      } catch (error) {
        console.error('Error logging hours:', error)
        throw error
      }
    } else {
      const newLog = { ...logData, id: Date.now().toString() }
      setHourLogs(prev => [...prev, newLog])
      return newLog
    }
  }

  // Delete a log entry
  const deleteLog = async (logId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/hour-logs?id=${logId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting log:', error)
      }
    }
    setHourLogs(prev => prev.filter(log => log.id !== logId))
  }

  // Update homeschool profile
  const updateHomeschoolProfile = async (updates) => {
    setHomeschoolProfile(prev => ({ ...prev, ...updates }))

    if (isConfigured && user) {
      try {
        const mergedGuardians = updates.guardians ?? homeschoolProfile.guardians ?? []
        const primaryGuardian = mergedGuardians[0]
        await api('/api/data/profile', {
          method: 'PATCH',
          body: {
            homeschool_name: updates.homeschoolName ?? homeschoolProfile.homeschoolName,
            parent_name: primaryGuardian?.name ?? updates.parentName ?? homeschoolProfile.parentName,
            address: updates.address ?? homeschoolProfile.address,
            city: updates.city ?? homeschoolProfile.city,
            state: updates.state ?? homeschoolProfile.state,
            zip: updates.zip ?? homeschoolProfile.zip,
            phone: primaryGuardian?.phone ?? updates.phone ?? homeschoolProfile.phone,
            email: primaryGuardian?.email ?? updates.email ?? homeschoolProfile.email,
            guardians: mergedGuardians
          }
        })
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    }
  }

  // Utility functions
  const getSubjectHours = (childId, subjectId) => {
    return hourLogs
      .filter(log => log.childId === childId && log.subjectId === subjectId)
      .reduce((total, log) => total + log.hours, 0)
  }

  const getChildTotalHours = (childId) => {
    return hourLogs
      .filter(log => log.childId === childId)
      .reduce((total, log) => total + log.hours, 0)
  }

  const getLogs = (childId, subjectId = null) => {
    return hourLogs
      .filter(log => {
        if (subjectId) {
          return log.childId === childId && log.subjectId === subjectId
        }
        return log.childId === childId
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getSubjectProgress = (childId, subjectId) => {
    const child = children.find(c => c.id === childId)
    if (!child) return 0
    const subject = child.subjects.find(s => s.id === subjectId)
    if (!subject) return 0
    const hours = getSubjectHours(childId, subjectId)
    return Math.min(100, (hours / subject.requiredHours) * 100)
  }

  const updateChildState = async (childId, stateCode, updateSubjects = false) => {
    if (isConfigured && user) {
      try {
        if (updateSubjects && stateCode) {
          // Replace all subjects based on the new state (single transaction)
          const newSubjects = getSubjectsForState(stateCode)
          await api(`/api/data/subjects?child_id=${childId}`, {
            method: 'PUT',
            body: {
              state_code: stateCode,
              subjects: newSubjects.map(s => ({
                name: s.name,
                required_hours: s.requiredHours,
                color: s.color
              }))
            }
          })
        } else {
          await api(`/api/data/children?id=${childId}`, {
            method: 'PATCH',
            body: { state_code: stateCode }
          })
        }

        // Reload data
        await loadFromCloud()
      } catch (error) {
        console.error('Error updating child state:', error)
      }
    } else {
      setChildren(prev => prev.map(child => {
        if (child.id !== childId) return child

        if (updateSubjects && stateCode) {
          const newSubjects = getSubjectsForState(stateCode).map(s => ({
            ...s,
            id: `${Date.now()}-${s.id}`
          }))
          return { ...child, stateCode, subjects: newSubjects }
        }

        return { ...child, stateCode }
      }))
    }
  }

  // Add schoolwork sample
  const addSchoolworkSample = async (childId, subjectId, imageUrl, fileName, fileSize, notes = '') => {
    const newSample = {
      childId,
      subjectId,
      imageUrl,
      fileName: fileName || 'schoolwork.jpg',
      fileSize: fileSize || 0,
      notes,
      uploadedAt: new Date().toISOString()
    }

    if (isConfigured && user) {
      try {
        const data = await api('/api/data/samples', {
          method: 'POST',
          body: {
            child_id: childId,
            subject_id: subjectId,
            image_url: imageUrl,
            file_name: fileName,
            file_size: fileSize,
            notes
          }
        })

        const sample = toSample(data)
        setSchoolworkSamples(prev => [sample, ...prev])
        return sample
      } catch (error) {
        console.error('Error adding schoolwork sample:', error)
        throw error
      }
    } else {
      const sample = { ...newSample, id: Date.now().toString() }
      setSchoolworkSamples(prev => [sample, ...prev])
      // Save to localStorage
      localStorage.setItem('homeschool_schoolwork_samples', JSON.stringify([...schoolworkSamples, sample]))
      return sample
    }
  }

  // Delete schoolwork sample
  const deleteSchoolworkSample = async (sampleId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/samples?id=${sampleId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting schoolwork sample:', error)
        throw error
      }
    }
    setSchoolworkSamples(prev => prev.filter(s => s.id !== sampleId))
    // Update localStorage
    if (!isConfigured || !user) {
      localStorage.setItem('homeschool_schoolwork_samples', JSON.stringify(schoolworkSamples.filter(s => s.id !== sampleId)))
    }
  }

  // Get schoolwork samples for a subject
  const getSchoolworkSamples = (childId, subjectId) => {
    return schoolworkSamples
      .filter(sample => sample.childId === childId && sample.subjectId === subjectId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  }

  // Get last schoolwork upload date for a subject (for reminder checking)
  const getLastSchoolworkUpload = (childId, subjectId) => {
    const samples = getSchoolworkSamples(childId, subjectId)
    return samples.length > 0 ? new Date(samples[0].uploadedAt) : null
  }

  // --- Read-aloud (premium): status per child per book ---
  const getReadAloudStatus = (childId, bookId) => {
    const log = readAloudLogs.find(l => l.childId === childId && (l.bookId === bookId || l.bookTitle === bookId))
    return log?.status ?? null
  }

  const setReadAloudStatus = async (childId, bookId, bookTitle, bookAuthor, status) => {
    const existing = readAloudLogs.find(l => l.childId === childId && (l.bookId === bookId || l.bookTitle === bookTitle))
    if (isConfigured && user) {
      try {
        if (existing) {
          await api(`/api/data/read-alouds?id=${existing.id}`, {
            method: 'PATCH',
            body: {
              status,
              completed: status === 'completed',
              completed_at: status === 'completed' ? new Date().toISOString() : null
            }
          })
        } else {
          const data = await api('/api/data/read-alouds', {
            method: 'POST',
            body: {
              child_id: childId,
              book_id: bookId,
              book_title: bookTitle,
              book_author: bookAuthor || null,
              status,
              completed: status === 'completed',
              completed_at: status === 'completed' ? new Date().toISOString() : null
            }
          })
          if (data) setReadAloudLogs(prev => [...prev, { id: data.id, childId, bookId, bookTitle, bookAuthor, status, completed: data.completed, completedAt: data.completed_at, createdAt: data.created_at }])
          return
        }
        setReadAloudLogs(prev => prev.map(l => l.id === existing.id ? { ...l, status, completed: status === 'completed', completedAt: status === 'completed' ? new Date().toISOString() : null } : l))
      } catch (e) {
        console.error('Error saving read-aloud status:', e)
        throw e
      }
    } else {
      setReadAloudLogs(prev => {
        const next = prev.filter(l => !(l.childId === childId && (l.bookId === bookId || l.bookTitle === bookTitle)))
        if (status) next.push({ id: `local-${Date.now()}`, childId, bookId, bookTitle, bookAuthor, status, completed: status === 'completed', completedAt: status === 'completed' ? new Date().toISOString() : null, createdAt: new Date().toISOString() })
        return next
      })
    }
  }

  const removeReadAloudStatus = async (childId, bookIdOrTitle) => {
    const existing = readAloudLogs.find(l => l.childId === childId && (l.bookId === bookIdOrTitle || l.bookTitle === bookIdOrTitle))
    if (existing?.id && !existing.id.startsWith('local-') && isConfigured && user) {
      await api(`/api/data/read-alouds?id=${existing.id}`, { method: 'DELETE' })
    }
    setReadAloudLogs(prev => prev.filter(l => !(l.childId === childId && (l.bookId === bookIdOrTitle || l.bookTitle === bookIdOrTitle))))
  }

  // --- Premium: custom read-aloud books (user's own list per child) ---
  const addCustomReadAloudBook = async (childId, { title, author, ageGroup, genre }) => {
    const bookId = `custom-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
    const notes = JSON.stringify({ ageGroup: ageGroup || 'elementary', genre: genre || 'Other' })
    const data = await api('/api/data/read-alouds', {
      method: 'POST',
      body: {
        child_id: childId,
        book_id: bookId,
        book_title: title.trim(),
        book_author: (author || '').trim() || null,
        status: 'want',
        completed: false,
        notes
      }
    })
    setReadAloudLogs(prev => [...prev, {
      id: data.id,
      childId,
      bookId: data.book_id,
      bookTitle: data.book_title,
      bookAuthor: data.book_author,
      status: 'want',
      completed: false,
      notes: data.notes,
      createdAt: data.created_at,
      isCustom: true
    }])
    return data
  }

  const updateCustomReadAloudBook = async (logId, { title, author, ageGroup, genre }) => {
    const updates = {}
    if (title != null) updates.book_title = title.trim()
    if (author != null) updates.book_author = author.trim() || null
    if (ageGroup != null || genre != null) {
      const log = readAloudLogs.find(l => l.id === logId)
      const prev = log?.notes ? (() => { try { return JSON.parse(log.notes) } catch { return {} } })() : {}
      updates.notes = JSON.stringify({ ageGroup: ageGroup ?? prev.ageGroup, genre: genre ?? prev.genre })
    }
    if (Object.keys(updates).length === 0) return
    const data = await api(`/api/data/read-alouds?id=${logId}`, { method: 'PATCH', body: updates })
    setReadAloudLogs(prev => prev.map(l => l.id === logId ? { ...l, ...updates, bookTitle: updates.book_title ?? l.bookTitle, bookAuthor: updates.book_author !== undefined ? updates.book_author : l.bookAuthor, notes: updates.notes ?? l.notes } : l))
    return data
  }

  const deleteCustomReadAloudBook = async (logId) => {
    await api(`/api/data/read-alouds?id=${logId}`, { method: 'DELETE' })
    setReadAloudLogs(prev => prev.filter(l => l.id !== logId))
  }

  // --- Scheduler: per-subject lesson schedules ---
  // Create-or-replace the schedule for a subject (one schedule per subject).
  const saveSchedule = async (childId, subjectId, form) => {
    if (isConfigured && user) {
      const data = await api('/api/data/schedules', {
        method: 'POST',
        body: {
          child_id: childId,
          subject_id: subjectId,
          title: form.title || null,
          days_of_week: form.daysOfWeek,
          start_date: form.startDate,
          end_date: form.endDate,
          start_lesson: form.startLesson,
          lessons_per_session: form.lessonsPerSession,
          total_lessons: form.totalLessons || null
        }
      })
      const saved = toSchedule(data)
      setSchedules(prev => [...prev.filter(s => s.subjectId !== subjectId), saved])
      return saved
    }
    const existing = schedules.find(s => s.subjectId === subjectId)
    const saved = {
      id: existing?.id || `local-${Date.now()}`,
      childId,
      subjectId,
      title: form.title || '',
      daysOfWeek: form.daysOfWeek,
      startDate: form.startDate,
      endDate: form.endDate,
      startLesson: form.startLesson,
      lessonsPerSession: form.lessonsPerSession,
      totalLessons: form.totalLessons || null
    }
    setSchedules(prev => [...prev.filter(s => s.subjectId !== subjectId), saved])
    return saved
  }

  const deleteSchedule = async (scheduleId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/schedules?id=${scheduleId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting schedule:', error)
      }
    }
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    setLessonCompletions(prev => prev.filter(c => c.scheduleId !== scheduleId))
  }

  const addScheduleBreak = async (name, startDate, endDate) => {
    if (isConfigured && user) {
      const data = await api('/api/data/schedule-breaks', {
        method: 'POST',
        body: { name, start_date: startDate, end_date: endDate }
      })
      const brk = toScheduleBreak(data)
      setScheduleBreaks(prev => [...prev, brk])
      return brk
    }
    const brk = { id: `local-${Date.now()}`, name, startDate, endDate }
    setScheduleBreaks(prev => [...prev, brk])
    return brk
  }

  const deleteScheduleBreak = async (breakId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/schedule-breaks?id=${breakId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting break:', error)
      }
    }
    setScheduleBreaks(prev => prev.filter(b => b.id !== breakId))
  }

  const completeLesson = async (scheduleId, lessonNumber, completedOn) => {
    if (isConfigured && user) {
      const data = await api('/api/data/lesson-completions', {
        method: 'POST',
        body: { schedule_id: scheduleId, lesson_number: lessonNumber, completed_on: completedOn }
      })
      const comp = toCompletion(data)
      setLessonCompletions(prev => [
        ...prev.filter(c => !(c.scheduleId === scheduleId && c.lessonNumber === lessonNumber)),
        comp
      ])
      return comp
    }
    const comp = { id: `local-${Date.now()}`, scheduleId, lessonNumber, completedOn }
    setLessonCompletions(prev => [
      ...prev.filter(c => !(c.scheduleId === scheduleId && c.lessonNumber === lessonNumber)),
      comp
    ])
    return comp
  }

  const uncompleteLesson = async (completionId) => {
    if (isConfigured && user) {
      try {
        await api(`/api/data/lesson-completions?id=${completionId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error removing completion:', error)
      }
    }
    setLessonCompletions(prev => prev.filter(c => c.id !== completionId))
  }

  // --- Admin: suggested books ---
  const addSuggestedBook = async (book) => {
    const data = await api('/api/admin', {
      method: 'POST',
      body: {
        action: 'book-add',
        book: {
          title: book.title,
          author: book.author || null,
          illustrator: book.illustrator || null,
          age_group: book.ageGroup,
          genre: book.genre || null,
          description: book.description || null,
          sort_order: book.sortOrder ?? 0
        }
      }
    })
    setSuggestedBooks(prev => [...prev, toBook(data)])
    return data
  }

  const updateSuggestedBook = async (id, updates) => {
    // Convert empty strings to null so optional fields can be properly cleared
    const nullify = v => (v === '' || v == null) ? null : v
    const data = await api('/api/admin', {
      method: 'POST',
      body: {
        action: 'book-update',
        id,
        updates: {
          ...(updates.title != null && { title: updates.title }),
          ...('author' in updates && { author: nullify(updates.author) }),
          ...('illustrator' in updates && { illustrator: nullify(updates.illustrator) }),
          ...(updates.ageGroup != null && { age_group: updates.ageGroup }),
          ...('genre' in updates && { genre: nullify(updates.genre) }),
          ...('description' in updates && { description: nullify(updates.description) }),
          ...(updates.sortOrder != null && { sort_order: updates.sortOrder })
        }
      }
    })
    setSuggestedBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates, id: b.id } : b))
    return data
  }

  const deleteSuggestedBook = async (id) => {
    await api('/api/admin', { method: 'POST', body: { action: 'book-delete', id } })
    setSuggestedBooks(prev => prev.filter(b => b.id !== id))
  }

  const refreshSuggestedBooks = async () => {
    try {
      const data = await api('/api/public')
      if (data?.suggested_books) setSuggestedBooks(data.suggested_books.map(toBook))
    } catch (e) {
      console.error('Error refreshing suggested books:', e)
    }
  }

  // --- Admin: resources ---
  const addResource = async (resource) => {
    const data = await api('/api/admin', {
      method: 'POST',
      body: {
        action: 'resource-add',
        resource: {
          category: resource.category,
          count_label: resource.countLabel || null,
          items: resource.items || [],
          color: resource.color || 'sage',
          link: resource.link || null,
          sort_order: resource.sortOrder ?? 0
        }
      }
    })
    setResources(prev => [...prev, toResource(data)])
    return data
  }

  const updateResource = async (id, updates) => {
    const data = await api('/api/admin', {
      method: 'POST',
      body: {
        action: 'resource-update',
        id,
        updates: {
          ...(updates.category != null && { category: updates.category }),
          ...(updates.countLabel != null && { count_label: updates.countLabel }),
          ...(updates.items != null && { items: updates.items }),
          ...(updates.color != null && { color: updates.color }),
          ...(updates.link != null && { link: updates.link }),
          ...(updates.sortOrder != null && { sort_order: updates.sortOrder })
        }
      }
    })
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates, id: r.id } : r))
    return data
  }

  const deleteResource = async (id) => {
    await api('/api/admin', { method: 'POST', body: { action: 'resource-delete', id } })
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const refreshResources = async () => {
    try {
      const data = await api('/api/public')
      if (data?.resources) setResources(data.resources.map(toResource))
    } catch (e) {
      console.error('Error refreshing resources:', e)
    }
  }

  const value = {
    children,
    hourLogs,
    schoolworkSamples,
    userState,
    setUserState,
    homeschoolProfile,
    updateHomeschoolProfile,
    isLoaded,
    loading,
    addChild,
    updateChild,
    updateChildState,
    deleteChild,
    addSubject,
    updateSubject,
    deleteSubject,
    logHours,
    deleteLog,
    getSubjectHours,
    getChildTotalHours,
    getLogs,
    getSubjectProgress,
    getSubjectsForState,
    DEFAULT_SUBJECTS,
    schedules,
    scheduleBreaks,
    lessonCompletions,
    saveSchedule,
    deleteSchedule,
    addScheduleBreak,
    deleteScheduleBreak,
    completeLesson,
    uncompleteLesson,
    addSchoolworkSample,
    deleteSchoolworkSample,
    getSchoolworkSamples,
    getLastSchoolworkUpload,
    suggestedBooks,
    resources,
    getReadAloudStatus,
    setReadAloudStatus,
    removeReadAloudStatus,
    readAloudLogs,
    addCustomReadAloudBook,
    updateCustomReadAloudBook,
    deleteCustomReadAloudBook,
    addSuggestedBook,
    updateSuggestedBook,
    deleteSuggestedBook,
    refreshSuggestedBooks,
    addResource,
    updateResource,
    deleteResource,
    refreshResources
  }

  return (
    <DataContext.Provider value={value}>
      {childrenProp}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

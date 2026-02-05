import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
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

export function SupabaseDataProvider({ children: childrenProp }) {
  const { user, profile } = useAuth()
  const isConfigured = isSupabaseConfigured()
  
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
    email: ''
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [suggestedBooks, setSuggestedBooks] = useState([])
  const [resources, setResources] = useState([])
  const [readAloudLogs, setReadAloudLogs] = useState([])

  // Load public data (suggested books, resources) when Supabase is configured
  useEffect(() => {
    if (!isConfigured) return
    const loadPublic = async () => {
      try {
        const [booksRes, resourcesRes] = await Promise.all([
          supabase.from('suggested_books').select('*').order('sort_order').order('title'),
          supabase.from('resources').select('*').order('sort_order').order('category')
        ])
        if (booksRes.data) setSuggestedBooks(booksRes.data.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || '',
          ageGroup: b.age_group,
          genre: b.genre || '',
          description: b.description || '',
          isDb: true
        })))
        if (resourcesRes.data) setResources(resourcesRes.data.map(r => ({
          id: r.id,
          category: r.category,
          countLabel: r.count_label,
          items: r.items || [],
          color: r.color || 'sage',
          link: r.link,
          isDb: true
        })))
      } catch (_) { /* tables may not exist yet */ }
    }
    loadPublic()
  }, [isConfigured])

  // Load data when user changes
  useEffect(() => {
    if (!isConfigured || !user) {
      loadFromLocalStorage()
      return
    }

    loadFromSupabase()
  }, [user, isConfigured])

  // Load from localStorage (fallback/demo mode)
  const loadFromLocalStorage = () => {
    const savedChildren = localStorage.getItem('homeschool_children')
    const savedLogs = localStorage.getItem('homeschool_logs')
    const savedState = localStorage.getItem('homeschool_state')
    const savedProfile = localStorage.getItem('homeschool_profile')
    const savedSamples = localStorage.getItem('homeschool_schoolwork_samples')
    
    if (savedChildren) setChildren(JSON.parse(savedChildren))
    if (savedLogs) setHourLogs(JSON.parse(savedLogs))
    if (savedState) setUserState(savedState)
    if (savedProfile) setHomeschoolProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }))
    if (savedSamples) setSchoolworkSamples(JSON.parse(savedSamples))
    
    setIsLoaded(true)
    setLoading(false)
  }

  // Load from Supabase
  const loadFromSupabase = async () => {
    setLoading(true)
    try {
      // Load children with their subjects
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select(`
          *,
          subjects (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (childrenError) {
        console.error('Error loading children:', childrenError)
        // If no children exist yet, that's okay - just set empty array
        if (childrenError.code !== 'PGRST116') {
          throw childrenError
        }
      }

      // Transform data to match existing structure
      const transformedChildren = childrenData?.map(child => ({
        id: child.id,
        name: child.name,
        stateCode: child.state_code,
        birthDate: child.birth_date || null,
        gradeLevel: child.grade_level || null,
        createdAt: child.created_at,
        subjects: child.subjects?.map(s => ({
          id: s.id,
          name: s.name,
          requiredHours: s.required_hours,
          color: s.color,
          schoolworkReminderFrequency: s.schoolwork_reminder_frequency || null
        })) || []
      })) || []

      setChildren(transformedChildren)

      // Load hour logs (only if we have children)
      let transformedLogs = []
      if (transformedChildren.length > 0) {
        const { data: logsData, error: logsError } = await supabase
          .from('hour_logs')
          .select('*')
          .in('child_id', transformedChildren.map(c => c.id))
          .order('date', { ascending: false })

        if (logsError && logsError.code !== 'PGRST116') {
          console.error('Error loading hour logs:', logsError)
          // Don't throw - just continue with empty logs
        } else {
          transformedLogs = logsData?.map(log => ({
            id: log.id,
            childId: log.child_id,
            subjectId: log.subject_id,
            hours: log.hours,
            date: log.date,
            notes: log.notes,
            createdAt: log.created_at
          })) || []
        }
      }

      setHourLogs(transformedLogs)

      // Load profile data
      if (profile) {
        setHomeschoolProfile({
          homeschoolName: profile.homeschool_name || '',
          parentName: profile.parent_name || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zip: profile.zip || '',
          phone: profile.phone || '',
          email: profile.email || ''
        })
        setUserState(profile.state || '')
      }

      // Load read-aloud logs for user's children
      if (transformedChildren.length > 0) {
        const childIds = transformedChildren.map(c => c.id)
        const { data: logsData } = await supabase
          .from('read_aloud_logs')
          .select('*')
          .in('child_id', childIds)
        setReadAloudLogs(logsData?.map(l => ({
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
        })) || [])
      } else {
        setReadAloudLogs([])
      }

      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading data from Supabase:', error)
      setChildren([])
      setHourLogs([])
      setReadAloudLogs([])
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

  // Add a new child
  const addChild = async (name, useStateRequirements = false, stateCode = null, birthDate = null, gradeLevel = null, trackHours = true) => {
    const effectiveState = stateCode || userState
    // Only create subjects if tracking hours is enabled
    const subjects = trackHours 
      ? (useStateRequirements && effectiveState
          ? getSubjectsForState(effectiveState)
          : DEFAULT_SUBJECTS)
      : []

    if (isConfigured && user) {
      try {
        // Insert child
        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({
            user_id: user.id,
            name,
            state_code: useStateRequirements ? effectiveState : null,
            birth_date: birthDate || null,
            grade_level: gradeLevel || null
          })
          .select()
          .single()

        if (childError) throw childError

        // Insert subjects only if tracking hours
        let subjectsData = []
        if (trackHours && subjects.length > 0) {
          const { data, error: subjectsError } = await supabase
            .from('subjects')
            .insert(subjects.map(s => ({
              child_id: childData.id,
              name: s.name,
              required_hours: s.requiredHours,
              color: s.color
            })))
            .select()

          if (subjectsError) throw subjectsError
          subjectsData = data || []
        }

        const newChild = {
          id: childData.id,
          name: childData.name,
          stateCode: childData.state_code,
          birthDate: childData.birth_date || null,
          gradeLevel: childData.grade_level || null,
          createdAt: childData.created_at,
          subjects: subjectsData.map(s => ({
            id: s.id,
            name: s.name,
            requiredHours: s.required_hours,
            color: s.color,
            schoolworkReminderFrequency: s.schoolwork_reminder_frequency || null
          }))
        }

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
        
        await supabase
          .from('children')
          .update(updateData)
          .eq('id', childId)
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
        await supabase
          .from('children')
          .delete()
          .eq('id', childId)
      } catch (error) {
        console.error('Error deleting child:', error)
      }
    }
    setChildren(prev => prev.filter(child => child.id !== childId))
    setHourLogs(prev => prev.filter(log => log.childId !== childId))
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
        const { data, error } = await supabase
          .from('subjects')
          .insert({
            child_id: childId,
            name: newSubject.name,
            required_hours: newSubject.requiredHours,
            color: newSubject.color,
            schoolwork_reminder_frequency: newSubject.schoolworkReminderFrequency
          })
          .select()
          .single()

        if (error) throw error

        const subject = {
          id: data.id,
          name: data.name,
          requiredHours: data.required_hours,
          color: data.color,
          schoolworkReminderFrequency: data.schoolwork_reminder_frequency || null
        }

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
        await supabase
          .from('subjects')
          .update(updateData)
          .eq('id', subjectId)
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
        await supabase
          .from('subjects')
          .delete()
          .eq('id', subjectId)
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
        const { data, error } = await supabase
          .from('hour_logs')
          .insert({
            child_id: childId,
            subject_id: subjectId,
            hours: logData.hours,
            date: logData.date,
            notes: logData.notes
          })
          .select()
          .single()

        if (error) throw error

        const newLog = {
          id: data.id,
          childId: data.child_id,
          subjectId: data.subject_id,
          hours: data.hours,
          date: data.date,
          notes: data.notes,
          createdAt: data.created_at
        }

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
        await supabase
          .from('hour_logs')
          .delete()
          .eq('id', logId)
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
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            homeschool_name: updates.homeschoolName ?? homeschoolProfile.homeschoolName,
            parent_name: updates.parentName ?? homeschoolProfile.parentName,
            address: updates.address ?? homeschoolProfile.address,
            city: updates.city ?? homeschoolProfile.city,
            state: updates.state ?? homeschoolProfile.state,
            zip: updates.zip ?? homeschoolProfile.zip,
            phone: updates.phone ?? homeschoolProfile.phone,
            email: updates.email ?? homeschoolProfile.email,
            updated_at: new Date().toISOString()
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
        await supabase
          .from('children')
          .update({ state_code: stateCode })
          .eq('id', childId)

        if (updateSubjects && stateCode) {
          // Delete existing subjects and add new ones based on state
          await supabase
            .from('subjects')
            .delete()
            .eq('child_id', childId)

          const newSubjects = getSubjectsForState(stateCode)
          await supabase
            .from('subjects')
            .insert(newSubjects.map(s => ({
              child_id: childId,
              name: s.name,
              required_hours: s.requiredHours,
              color: s.color
            })))
        }

        // Reload data
        await loadFromSupabase()
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
        const { data, error } = await supabase
          .from('schoolwork_samples')
          .insert({
            child_id: childId,
            subject_id: subjectId,
            image_url: imageUrl,
            file_name: fileName,
            file_size: fileSize,
            notes
          })
          .select()
          .single()

        if (error) throw error

        const sample = {
          id: data.id,
          childId: data.child_id,
          subjectId: data.subject_id,
          imageUrl: data.image_url,
          fileName: data.file_name,
          fileSize: data.file_size,
          notes: data.notes,
          uploadedAt: data.uploaded_at
        }

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
        await supabase
          .from('schoolwork_samples')
          .delete()
          .eq('id', sampleId)
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
          await supabase.from('read_aloud_logs').update({
            status,
            completed: status === 'completed',
            completed_at: status === 'completed' ? new Date().toISOString() : null
          }).eq('id', existing.id)
        } else {
          const { data } = await supabase.from('read_aloud_logs').insert({
            child_id: childId,
            book_id: bookId,
            book_title: bookTitle,
            book_author: bookAuthor || null,
            status,
            completed: status === 'completed',
            completed_at: status === 'completed' ? new Date().toISOString() : null
          }).select().single()
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
      await supabase.from('read_aloud_logs').delete().eq('id', existing.id)
    }
    setReadAloudLogs(prev => prev.filter(l => !(l.childId === childId && (l.bookId === bookIdOrTitle || l.bookTitle === bookIdOrTitle))))
  }

  // --- Premium: custom read-aloud books (user's own list per child) ---
  const addCustomReadAloudBook = async (childId, { title, author, ageGroup, genre }) => {
    const bookId = `custom-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
    const notes = JSON.stringify({ ageGroup: ageGroup || 'elementary', genre: genre || 'Other' })
    const { data, error } = await supabase.from('read_aloud_logs').insert({
      child_id: childId,
      book_id: bookId,
      book_title: title.trim(),
      book_author: (author || '').trim() || null,
      status: 'want',
      completed: false,
      notes
    }).select().single()
    if (error) throw error
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
    const { data, error } = await supabase.from('read_aloud_logs').update(updates).eq('id', logId).select().single()
    if (error) throw error
    setReadAloudLogs(prev => prev.map(l => l.id === logId ? { ...l, ...updates, bookTitle: updates.book_title ?? l.bookTitle, bookAuthor: updates.book_author !== undefined ? updates.book_author : l.bookAuthor, notes: updates.notes ?? l.notes } : l))
    return data
  }

  const deleteCustomReadAloudBook = async (logId) => {
    await supabase.from('read_aloud_logs').delete().eq('id', logId)
    setReadAloudLogs(prev => prev.filter(l => l.id !== logId))
  }

  // --- Admin: suggested books ---
  const addSuggestedBook = async (book) => {
    const { data, error } = await supabase.from('suggested_books').insert({
      title: book.title,
      author: book.author || null,
      age_group: book.ageGroup,
      genre: book.genre || null,
      description: book.description || null,
      sort_order: book.sortOrder ?? 0
    }).select().single()
    if (error) throw error
    setSuggestedBooks(prev => [...prev, { id: data.id, title: data.title, author: data.author || '', ageGroup: data.age_group, genre: data.genre || '', description: data.description || '', isDb: true }])
    return data
  }

  const updateSuggestedBook = async (id, updates) => {
    const { data, error } = await supabase.from('suggested_books').update({
      ...(updates.title != null && { title: updates.title }),
      ...(updates.author != null && { author: updates.author }),
      ...(updates.ageGroup != null && { age_group: updates.ageGroup }),
      ...(updates.genre != null && { genre: updates.genre }),
      ...(updates.description != null && { description: updates.description }),
      ...(updates.sortOrder != null && { sort_order: updates.sortOrder }),
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single()
    if (error) throw error
    setSuggestedBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates, id: b.id } : b))
    return data
  }

  const deleteSuggestedBook = async (id) => {
    await supabase.from('suggested_books').delete().eq('id', id)
    setSuggestedBooks(prev => prev.filter(b => b.id !== id))
  }

  const refreshSuggestedBooks = async () => {
    const { data } = await supabase.from('suggested_books').select('*').order('sort_order').order('title')
    if (data) setSuggestedBooks(data.map(b => ({ id: b.id, title: b.title, author: b.author || '', ageGroup: b.age_group, genre: b.genre || '', description: b.description || '', isDb: true })))
  }

  // --- Admin: resources ---
  const addResource = async (resource) => {
    const { data, error } = await supabase.from('resources').insert({
      category: resource.category,
      count_label: resource.countLabel || null,
      items: resource.items || [],
      color: resource.color || 'sage',
      link: resource.link || null,
      sort_order: resource.sortOrder ?? 0
    }).select().single()
    if (error) throw error
    setResources(prev => [...prev, { id: data.id, category: data.category, countLabel: data.count_label, items: data.items || [], color: data.color || 'sage', link: data.link, isDb: true }])
    return data
  }

  const updateResource = async (id, updates) => {
    const { data, error } = await supabase.from('resources').update({
      ...(updates.category != null && { category: updates.category }),
      ...(updates.countLabel != null && { count_label: updates.countLabel }),
      ...(updates.items != null && { items: updates.items }),
      ...(updates.color != null && { color: updates.color }),
      ...(updates.link != null && { link: updates.link }),
      ...(updates.sortOrder != null && { sort_order: updates.sortOrder }),
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single()
    if (error) throw error
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates, id: r.id } : r))
    return data
  }

  const deleteResource = async (id) => {
    await supabase.from('resources').delete().eq('id', id)
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const refreshResources = async () => {
    const { data } = await supabase.from('resources').select('*').order('sort_order').order('category')
    if (data) setResources(data.map(r => ({ id: r.id, category: r.category, countLabel: r.count_label, items: r.items || [], color: r.color || 'sage', link: r.link, isDb: true })))
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

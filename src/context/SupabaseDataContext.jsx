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

  // Load data when user changes
  useEffect(() => {
    if (!isConfigured || !user) {
      // Fall back to localStorage if not configured or no user
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
    
    if (savedChildren) setChildren(JSON.parse(savedChildren))
    if (savedLogs) setHourLogs(JSON.parse(savedLogs))
    if (savedState) setUserState(savedState)
    if (savedProfile) setHomeschoolProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }))
    
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
        createdAt: child.created_at,
        subjects: child.subjects?.map(s => ({
          id: s.id,
          name: s.name,
          requiredHours: s.required_hours,
          color: s.color
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

    } catch (error) {
      console.error('Error loading data from Supabase:', error)
      // Set empty state instead of falling back to localStorage for logged-in users
      setChildren([])
      setHourLogs([])
      setIsLoaded(true)
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

  // Add a new child
  const addChild = async (name, useStateRequirements = false, stateCode = null) => {
    const effectiveState = stateCode || userState
    const subjects = useStateRequirements && effectiveState
      ? getSubjectsForState(effectiveState)
      : DEFAULT_SUBJECTS

    if (isConfigured && user) {
      try {
        // Insert child
        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({
            user_id: user.id,
            name,
            state_code: useStateRequirements ? effectiveState : null
          })
          .select()
          .single()

        if (childError) throw childError

        // Insert subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .insert(subjects.map(s => ({
            child_id: childData.id,
            name: s.name,
            required_hours: s.requiredHours,
            color: s.color
          })))
          .select()

        if (subjectsError) throw subjectsError

        const newChild = {
          id: childData.id,
          name: childData.name,
          stateCode: childData.state_code,
          createdAt: childData.created_at,
          subjects: subjectsData.map(s => ({
            id: s.id,
            name: s.name,
            requiredHours: s.required_hours,
            color: s.color
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
        subjects: subjects.map(s => ({ ...s, id: `${Date.now()}-${s.id}` })),
        stateCode: useStateRequirements ? effectiveState : null,
        createdAt: new Date().toISOString()
      }
      setChildren(prev => [...prev, newChild])
      return newChild
    }
  }

  // Update child name
  const updateChild = async (childId, name) => {
    if (isConfigured && user) {
      try {
        await supabase
          .from('children')
          .update({ name })
          .eq('id', childId)
      } catch (error) {
        console.error('Error updating child:', error)
      }
    }
    setChildren(prev => prev.map(child => 
      child.id === childId ? { ...child, name } : child
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
  const addSubject = async (childId, name, requiredHours, color) => {
    const newSubject = {
      name,
      requiredHours: Number(requiredHours),
      color: color || '#8FB39A'
    }

    if (isConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .insert({
            child_id: childId,
            name: newSubject.name,
            required_hours: newSubject.requiredHours,
            color: newSubject.color
          })
          .select()
          .single()

        if (error) throw error

        const subject = {
          id: data.id,
          name: data.name,
          requiredHours: data.required_hours,
          color: data.color
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
        await supabase
          .from('subjects')
          .update({
            name: updates.name,
            required_hours: updates.requiredHours,
            color: updates.color
          })
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

  const value = {
    children,
    hourLogs,
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
    DEFAULT_SUBJECTS
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

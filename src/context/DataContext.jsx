import { createContext, useContext, useState, useEffect } from 'react'
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

// Get subjects based on state requirements (for premium users)
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

// Default homeschool profile
const DEFAULT_PROFILE = {
  homeschoolName: '',
  parentName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: ''
}

export function DataProvider({ children: childrenProp }) {
  const [children, setChildren] = useState([])
  const [hourLogs, setHourLogs] = useState([])
  const [userState, setUserState] = useState('')
  const [homeschoolProfile, setHomeschoolProfile] = useState(DEFAULT_PROFILE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedChildren = localStorage.getItem('homeschool_children')
    const savedLogs = localStorage.getItem('homeschool_logs')
    const savedState = localStorage.getItem('homeschool_state')
    const savedProfile = localStorage.getItem('homeschool_profile')
    
    if (savedChildren) {
      setChildren(JSON.parse(savedChildren))
    }
    if (savedLogs) {
      setHourLogs(JSON.parse(savedLogs))
    }
    if (savedState) {
      setUserState(savedState)
    }
    if (savedProfile) {
      setHomeschoolProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) })
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_children', JSON.stringify(children))
    }
  }, [children, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_logs', JSON.stringify(hourLogs))
    }
  }, [hourLogs, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_state', userState)
    }
  }, [userState, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeschool_profile', JSON.stringify(homeschoolProfile))
    }
  }, [homeschoolProfile, isLoaded])

  // Update homeschool profile
  const updateHomeschoolProfile = (updates) => {
    setHomeschoolProfile(prev => ({ ...prev, ...updates }))
  }

  // Add a new child
  const addChild = (name, useStateRequirements = false, stateCode = null) => {
    const effectiveState = stateCode || userState
    const subjects = useStateRequirements && effectiveState
      ? getSubjectsForState(effectiveState).map(s => ({ ...s, id: `${Date.now()}-${s.id}` }))
      : DEFAULT_SUBJECTS.map(s => ({ ...s, id: `${Date.now()}-${s.id}` }))

    const newChild = {
      id: Date.now().toString(),
      name,
      subjects,
      stateCode: useStateRequirements ? effectiveState : null,
      createdAt: new Date().toISOString()
    }
    setChildren(prev => [...prev, newChild])
    return newChild
  }

  // Update child name
  const updateChild = (childId, name) => {
    setChildren(prev => prev.map(child => 
      child.id === childId ? { ...child, name } : child
    ))
  }

  // Update child's state and optionally update subjects
  const updateChildState = (childId, stateCode, updateSubjects = false) => {
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

  // Delete a child and their logs
  const deleteChild = (childId) => {
    setChildren(prev => prev.filter(child => child.id !== childId))
    setHourLogs(prev => prev.filter(log => log.childId !== childId))
  }

  // Add a subject to a child
  const addSubject = (childId, name, requiredHours, color) => {
    const newSubject = {
      id: Date.now().toString(),
      name,
      requiredHours: Number(requiredHours),
      color: color || '#8FB39A'
    }
    setChildren(prev => prev.map(child => 
      child.id === childId 
        ? { ...child, subjects: [...child.subjects, newSubject] }
        : child
    ))
    return newSubject
  }

  // Update a subject
  const updateSubject = (childId, subjectId, updates) => {
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
  const deleteSubject = (childId, subjectId) => {
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
  const logHours = (childId, subjectId, hours, date, notes = '') => {
    const newLog = {
      id: Date.now().toString(),
      childId,
      subjectId,
      hours: Number(hours),
      date: date || new Date().toISOString().split('T')[0],
      notes,
      createdAt: new Date().toISOString()
    }
    setHourLogs(prev => [...prev, newLog])
    return newLog
  }

  // Delete a log entry
  const deleteLog = (logId) => {
    setHourLogs(prev => prev.filter(log => log.id !== logId))
  }

  // Get total hours for a subject
  const getSubjectHours = (childId, subjectId) => {
    return hourLogs
      .filter(log => log.childId === childId && log.subjectId === subjectId)
      .reduce((total, log) => total + log.hours, 0)
  }

  // Get total hours for a child
  const getChildTotalHours = (childId) => {
    return hourLogs
      .filter(log => log.childId === childId)
      .reduce((total, log) => total + log.hours, 0)
  }

  // Get logs for a specific child and optionally subject
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

  // Get progress percentage for a subject
  const getSubjectProgress = (childId, subjectId) => {
    const child = children.find(c => c.id === childId)
    if (!child) return 0
    const subject = child.subjects.find(s => s.id === subjectId)
    if (!subject) return 0
    const hours = getSubjectHours(childId, subjectId)
    return Math.min(100, (hours / subject.requiredHours) * 100)
  }

  const value = {
    children,
    hourLogs,
    userState,
    setUserState,
    homeschoolProfile,
    updateHomeschoolProfile,
    isLoaded,
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

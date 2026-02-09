import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import {
  DollarSign, Plus, Trash2, Calendar, Filter, BookOpen, Scissors,
  MapPin, Music, Monitor, GraduationCap, FileCheck, Tag, Download
} from 'lucide-react'
import './ExpenseTracker.css'

const EXPENSE_CATEGORIES = [
  { id: 'curriculum', name: 'Curriculum & Books', icon: BookOpen, color: '#2D5A4A' },
  { id: 'supplies', name: 'Supplies & Materials', icon: Scissors, color: '#E8A87C' },
  { id: 'field-trips', name: 'Field Trips', icon: MapPin, color: '#8FB39A' },
  { id: 'extracurricular', name: 'Extracurricular', icon: Music, color: '#D4896A' },
  { id: 'technology', name: 'Technology', icon: Monitor, color: '#5A8F7B' },
  { id: 'tutoring', name: 'Tutoring & Classes', icon: GraduationCap, color: '#6B8E7B' },
  { id: 'testing', name: 'Testing & Assessments', icon: FileCheck, color: '#C4A484' },
  { id: 'other', name: 'Other', icon: Tag, color: '#B58863' },
]

function ExpenseTracker() {
  const { children } = useData()
  const [expenses, setExpenses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState('')
  const [newExpense, setNewExpense] = useState({
    category: 'curriculum',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    childId: '',
    notes: '',
    forTaxRecords: false
  })

  useEffect(() => {
    const saved = localStorage.getItem('homeschool_expenses')
    if (saved) setExpenses(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('homeschool_expenses', JSON.stringify(expenses))
  }, [expenses])

  const handleAddExpense = (e) => {
    e.preventDefault()
    const amount = parseFloat(newExpense.amount)
    if (!newExpense.description?.trim() || isNaN(amount) || amount <= 0) {
      alert('Please enter a description and valid amount.')
      return
    }
    const expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      description: newExpense.description.trim(),
      amount,
      date: newExpense.date,
      childId: newExpense.childId || null,
      notes: newExpense.notes?.trim() || '',
      forTaxRecords: !!newExpense.forTaxRecords,
      createdAt: new Date().toISOString()
    }
    setExpenses(prev => [expense, ...prev])
    setNewExpense({
      category: 'curriculum',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      childId: '',
      notes: '',
      forTaxRecords: false
    })
    setShowAddForm(false)
  }

  const deleteExpense = (id) => {
    if (confirm('Delete this expense?')) setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const getFilteredExpenses = () => {
    let list = [...expenses]
    if (filterCategory) list = list.filter(e => e.category === filterCategory)
    if (filterYear) {
      list = list.filter(e => new Date(e.date).getFullYear() === parseInt(filterYear, 10))
    }
    if (filterMonth) {
      list = list.filter(e => (new Date(e.date).getMonth() + 1).toString() === filterMonth)
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const filteredExpenses = getFilteredExpenses()

  const getTotal = (list = filteredExpenses) =>
    list.reduce((sum, e) => sum + e.amount, 0).toFixed(2)

  const getCategoryBreakdown = (list = filteredExpenses) => {
    const breakdown = {}
    list.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount
    })
    return breakdown
  }

  const getYearTotal = (year) => {
    const y = expenses.filter(e => new Date(e.date).getFullYear() === year)
    return y.reduce((s, e) => s + e.amount, 0).toFixed(2)
  }

  const getChildName = (childId) => children.find(c => c.id === childId)?.name || null
  const getCategoryInfo = (id) => EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]

  const years = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a)
  if (years.length === 0) years.push(new Date().getFullYear())

  const categoryBreakdown = getCategoryBreakdown()

  return (
    <div className="expense-tracker">
      <div className="expense-header">
        <div className="header-content">
          <h1>Expense Tracker</h1>
          <p>Track homeschool spending for budgeting and tax records</p>
        </div>
        <div className="expense-header-actions">
          <button
            className="btn-tracker btn-secondary"
            onClick={() => {
              const headers = ['Date', 'Category', 'Description', 'Amount', 'Child', 'Tax Records', 'Notes']
              const rows = filteredExpenses.map(e => [
                e.date,
                getCategoryInfo(e.category).name,
                `"${(e.description || '').replace(/"/g, '""')}"`,
                e.amount.toFixed(2),
                getChildName(e.childId) || '',
                e.forTaxRecords ? 'Yes' : 'No',
                `"${(e.notes || '').replace(/"/g, '""')}"`
              ])
              const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `homeschool-expenses-${filterYear || 'all'}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            disabled={filteredExpenses.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-tracker btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="expense-stats">
        <div className="stat-card total">
          <DollarSign size={32} />
          <div className="stat-info">
            <span className="stat-value">${getTotal()}</span>
            <span className="stat-label">
              Total {filterMonth ? `(${filterMonth}/${filterYear})` : filterYear ? `(${filterYear})` : 'All Time'}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={24} />
          <div className="stat-info">
            <span className="stat-value">{filteredExpenses.length}</span>
            <span className="stat-label">Expenses</span>
          </div>
        </div>
        <div className="stat-card">
          <FileCheck size={24} />
          <div className="stat-info">
            <span className="stat-value">
              ${filteredExpenses.filter(e => e.forTaxRecords).reduce((s, e) => s + e.amount, 0).toFixed(2)}
            </span>
            <span className="stat-label">For Tax Records</span>
          </div>
        </div>
      </div>

      {/* Year totals for tax overview */}
      {years.length > 0 && (
        <div className="year-totals">
          <h3>Yearly Totals (for tax prep)</h3>
          <div className="year-totals-grid">
            {years.slice(0, 5).map(year => (
              <div key={year} className="year-total-card">
                <span className="year-label">{year}</span>
                <span className="year-amount">${getYearTotal(year)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="category-breakdown">
          <h3>By Category</h3>
          <div className="breakdown-grid">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => {
                const info = getCategoryInfo(cat)
                const Icon = info.icon
                return (
                  <div key={cat} className="breakdown-item">
                    <div className="cat-icon" style={{ background: info.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="cat-info">
                      <span className="cat-name">{info.name}</span>
                      <span className="cat-amount">${amt.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-section">
        <Filter size={18} />
        <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="form-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Expense list */}
      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <DollarSign size={48} />
          </div>
          <h3>No expenses logged yet</h3>
          <p>Add expenses to track spending for budgeting and tax preparation.</p>
        </div>
      ) : (
        <div className="expense-list">
          {filteredExpenses.map(exp => {
            const info = getCategoryInfo(exp.category)
            const Icon = info.icon
            return (
              <div key={exp.id} className="expense-card">
                <div className="exp-icon" style={{ background: info.color }}>
                  <Icon size={24} />
                </div>
                <div className="exp-content">
                  <div className="exp-header">
                    <h4>{exp.description}</h4>
                    <span className="exp-amount">${exp.amount.toFixed(2)}</span>
                  </div>
                  <div className="exp-meta">
                    <span className="exp-cat">{info.name}</span>
                    <span className="exp-date">
                      <Calendar size={14} />
                      {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {exp.childId && (
                      <span className="exp-child">{getChildName(exp.childId)}</span>
                    )}
                    {exp.forTaxRecords && (
                      <span className="tax-badge">Tax records</span>
                    )}
                  </div>
                  {exp.notes && <p className="exp-notes">{exp.notes}</p>}
                </div>
                <button className="delete-btn" onClick={() => deleteExpense(exp.id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><DollarSign size={20} /> Add Expense</h3>
              <button type="button" className="close-btn" onClick={() => setShowAddForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-group">
                <label>Category *</label>
                <select
                  className="form-select"
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  required
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Math textbook, museum admission"
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newExpense.date}
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              {children.length > 0 && (
                <div className="form-group">
                  <label>Child (optional)</label>
                  <select
                    className="form-select"
                    value={newExpense.childId}
                    onChange={e => setNewExpense({ ...newExpense, childId: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newExpense.forTaxRecords}
                    onChange={e => setNewExpense({ ...newExpense, forTaxRecords: e.target.checked })}
                  />
                  Mark for tax records (keeps a running total for deductions where applicable)
                </label>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Receipt info, vendor, etc."
                  value={newExpense.notes}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-tracker btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-tracker btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseTracker

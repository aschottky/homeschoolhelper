import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { AGE_GROUPS, SUGGESTED_BOOKS, getBooksByAgeGroup, GENRES } from '../../data/readAloudBooks'
import AdBanner from '../Ads/AdBanner'
import { Book, BookOpen, Check, Plus, Trash2, Star, Filter, User, Sparkles, Lock, BookMarked, Clock, X } from 'lucide-react'
import './ReadAlouds.css'

const READING_STATUS = {
  WANT_TO_READ: { id: 'want', label: 'Want to Read', icon: BookMarked, color: '#E8A87C' },
  READING: { id: 'reading', label: 'Currently Reading', icon: BookOpen, color: '#2D5A4A' },
  COMPLETED: { id: 'completed', label: 'Completed', icon: Check, color: '#8FB39A' }
}

function ReadAlouds() {
  const { children } = useData()
  const { isPremium, upgradeToPremium } = useSubscription()
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [readingList, setReadingList] = useState({})
  const [showAddBook, setShowAddBook] = useState(false)
  const [newBook, setNewBook] = useState({ title: '', author: '', ageGroup: '', genre: '' })

  // Load reading list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('homeschool_reading_list')
    if (saved) {
      setReadingList(JSON.parse(saved))
    }
  }, [])

  // Save reading list to localStorage
  useEffect(() => {
    localStorage.setItem('homeschool_reading_list', JSON.stringify(readingList))
  }, [readingList])

  // Filter books
  const getFilteredBooks = () => {
    let books = [...SUGGESTED_BOOKS]
    
    // Add custom books for the selected child
    if (isPremium && selectedChild && readingList[selectedChild]?.customBooks) {
      books = [...books, ...readingList[selectedChild].customBooks]
    }

    if (selectedAgeGroup !== 'all') {
      books = books.filter(b => b.ageGroup === selectedAgeGroup)
    }
    if (selectedGenre !== 'all') {
      books = books.filter(b => b.genre === selectedGenre)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      books = books.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query)
      )
    }
    return books
  }

  const filteredBooks = getFilteredBooks()

  // Get reading status for a book
  const getBookStatus = (childId, bookId) => {
    return readingList[childId]?.books?.[bookId]?.status || null
  }

  // Set reading status for a book
  const setBookStatus = (childId, bookId, status) => {
    setReadingList(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        books: {
          ...prev[childId]?.books,
          [bookId]: { status, updatedAt: new Date().toISOString() }
        }
      }
    }))
  }

  // Remove book status
  const removeBookStatus = (childId, bookId) => {
    setReadingList(prev => {
      const newList = { ...prev }
      if (newList[childId]?.books?.[bookId]) {
        delete newList[childId].books[bookId]
      }
      return newList
    })
  }

  // Add custom book
  const addCustomBook = (childId) => {
    if (!newBook.title.trim()) return
    
    const customBook = {
      id: `custom-${Date.now()}`,
      title: newBook.title.trim(),
      author: newBook.author.trim() || 'Unknown Author',
      ageGroup: newBook.ageGroup || 'elementary',
      genre: newBook.genre || 'Other',
      description: 'Custom book added by user',
      isCustom: true
    }

    setReadingList(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        customBooks: [...(prev[childId]?.customBooks || []), customBook],
        books: {
          ...prev[childId]?.books,
          [customBook.id]: { status: 'want', updatedAt: new Date().toISOString() }
        }
      }
    }))

    setNewBook({ title: '', author: '', ageGroup: '', genre: '' })
    setShowAddBook(false)
  }

  // Delete custom book
  const deleteCustomBook = (childId, bookId) => {
    setReadingList(prev => {
      const newList = { ...prev }
      if (newList[childId]) {
        newList[childId].customBooks = (newList[childId].customBooks || []).filter(b => b.id !== bookId)
        if (newList[childId].books?.[bookId]) {
          delete newList[childId].books[bookId]
        }
      }
      return newList
    })
  }

  // Get stats for a child
  const getChildStats = (childId) => {
    const books = readingList[childId]?.books || {}
    return {
      wantToRead: Object.values(books).filter(b => b.status === 'want').length,
      reading: Object.values(books).filter(b => b.status === 'reading').length,
      completed: Object.values(books).filter(b => b.status === 'completed').length
    }
  }

  const stats = selectedChild ? getChildStats(selectedChild) : null

  return (
    <div className="read-alouds">
      <div className="read-alouds-header">
        <div className="header-content">
          <h1>Read-Aloud Book List</h1>
          <p>Curated books perfect for reading aloud, organized by age</p>
        </div>
      </div>

      {!isPremium && <AdBanner variant="horizontal" className="read-alouds-ad" />}

      {/* Premium Child Selector & Stats */}
      <div className={`tracking-section ${!isPremium ? 'locked' : ''}`}>
        <div className="tracking-header">
          <h3>
            <BookMarked size={20} />
            Reading Tracker
            {!isPremium && <span className="premium-badge"><Lock size={12} /> Premium</span>}
          </h3>
        </div>

        {isPremium ? (
          <>
            {children.length > 0 ? (
              <div className="child-selector">
                <label>Track reading for:</label>
                <select 
                  className="form-select"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                >
                  <option value="">Select a child</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="no-children">Add children in the Children tab to track their reading.</p>
            )}

            {selectedChild && stats && (
              <div className="reading-stats">
                <div className="stat-item">
                  <BookMarked size={18} style={{ color: READING_STATUS.WANT_TO_READ.color }} />
                  <span className="stat-value">{stats.wantToRead}</span>
                  <span className="stat-label">Want to Read</span>
                </div>
                <div className="stat-item">
                  <BookOpen size={18} style={{ color: READING_STATUS.READING.color }} />
                  <span className="stat-value">{stats.reading}</span>
                  <span className="stat-label">Reading</span>
                </div>
                <div className="stat-item">
                  <Check size={18} style={{ color: READING_STATUS.COMPLETED.color }} />
                  <span className="stat-value">{stats.completed}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            )}

            {selectedChild && (
              <button 
                className="btn-tracker btn-secondary add-book-btn"
                onClick={() => setShowAddBook(true)}
              >
                <Plus size={18} />
                Add Custom Book
              </button>
            )}
          </>
        ) : (
          <div className="premium-upsell-box">
            <Sparkles size={24} />
            <div>
              <h4>Track Reading Progress</h4>
              <p>Upgrade to Premium to track books for each child, mark reading status, and add custom books to your list.</p>
            </div>
            <button className="btn-tracker btn-primary" onClick={upgradeToPremium}>
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Book Modal */}
      {showAddBook && isPremium && selectedChild && (
        <div className="modal-overlay" onClick={() => setShowAddBook(false)}>
          <div className="add-book-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Custom Book</h3>
              <button className="close-btn" onClick={() => setShowAddBook(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter book title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter author name"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age Group</label>
                  <select
                    className="form-select"
                    value={newBook.ageGroup}
                    onChange={(e) => setNewBook({ ...newBook, ageGroup: e.target.value })}
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map(ag => (
                      <option key={ag.id} value={ag.id}>{ag.name} ({ag.ages})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <select
                    className="form-select"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                  >
                    <option value="">Select genre</option>
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-tracker btn-secondary"
                onClick={() => setShowAddBook(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-tracker btn-primary"
                onClick={() => addCustomBook(selectedChild)}
                disabled={!newBook.title.trim()}
              >
                <Plus size={18} />
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <Filter size={18} />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-select"
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
        >
          <option value="all">All Ages</option>
          {AGE_GROUPS.map(ag => (
            <option key={ag.id} value={ag.id}>{ag.name} ({ag.ages})</option>
          ))}
        </select>
        <select
          className="form-select"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="all">All Genres</option>
          {GENRES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Age Group Cards (when showing all) */}
      {selectedAgeGroup === 'all' && !searchQuery && selectedGenre === 'all' ? (
        <div className="age-groups-grid">
          {AGE_GROUPS.map(ageGroup => {
            const books = getBooksByAgeGroup(ageGroup.id)
            return (
              <div key={ageGroup.id} className="age-group-card">
                <div className="age-group-header">
                  <h3>{ageGroup.name}</h3>
                  <span className="age-range">Ages {ageGroup.ages}</span>
                </div>
                <p className="age-group-desc">{ageGroup.description}</p>
                <div className="book-preview-list">
                  {books.slice(0, 4).map(book => {
                    const status = selectedChild ? getBookStatus(selectedChild, book.id) : null
                    return (
                      <div key={book.id} className={`book-preview ${status ? `status-${status}` : ''}`}>
                        <Book size={14} />
                        <span>{book.title}</span>
                        {status && (
                          <span className="status-indicator" style={{ background: READING_STATUS[status.toUpperCase()]?.color }} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedAgeGroup(ageGroup.id)}
                >
                  View all {books.length} books →
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        /* Book List */
        <div className="books-list">
          <div className="list-header">
            <span>{filteredBooks.length} books</span>
            {selectedAgeGroup !== 'all' && (
              <button className="clear-filter" onClick={() => setSelectedAgeGroup('all')}>
                Clear filter
              </button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="no-books">
              <Book size={48} />
              <h3>No books found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map(book => {
                const status = selectedChild ? getBookStatus(selectedChild, book.id) : null
                const ageGroup = AGE_GROUPS.find(ag => ag.id === book.ageGroup)

                return (
                  <div key={book.id} className={`book-card ${status ? `has-status status-${status}` : ''}`}>
                    {book.isCustom && (
                      <span className="custom-badge">Custom</span>
                    )}
                    <div className="book-icon">
                      <Book size={28} />
                    </div>
                    <div className="book-content">
                      <h4>{book.title}</h4>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-desc">{book.description}</p>
                      <div className="book-meta">
                        <span className="book-age">{ageGroup?.name}</span>
                        <span className="book-genre">{book.genre}</span>
                      </div>
                    </div>

                    {isPremium && selectedChild && (
                      <div className="book-actions">
                        {status ? (
                          <div className="status-actions">
                            <span 
                              className="current-status"
                              style={{ color: READING_STATUS[status.toUpperCase()]?.color }}
                            >
                              {READING_STATUS[status.toUpperCase()]?.label}
                            </span>
                            <div className="status-buttons">
                              {Object.values(READING_STATUS).map(s => (
                                <button
                                  key={s.id}
                                  className={`status-btn ${status === s.id ? 'active' : ''}`}
                                  style={{ '--status-color': s.color }}
                                  onClick={() => setBookStatus(selectedChild, book.id, s.id)}
                                  title={s.label}
                                >
                                  <s.icon size={14} />
                                </button>
                              ))}
                              <button
                                className="status-btn remove"
                                onClick={() => removeBookStatus(selectedChild, book.id)}
                                title="Remove from list"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="add-to-list-btn"
                            onClick={() => setBookStatus(selectedChild, book.id, 'want')}
                          >
                            <Plus size={16} />
                            Add to List
                          </button>
                        )}

                        {book.isCustom && (
                          <button
                            className="delete-custom-btn"
                            onClick={() => {
                              if (confirm('Delete this custom book?')) {
                                deleteCustomBook(selectedChild, book.id)
                              }
                            }}
                            title="Delete custom book"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReadAlouds

import { useState, useEffect, useMemo } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'
import AdSlot from '../Ads/AdSlot'
import { AGE_GROUPS, SUGGESTED_BOOKS } from '../../data/readAloudBooks'
import { Book, BookOpen, Check, Plus, Trash2, Pencil, Filter, Sparkles, Lock, BookMarked, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import './ReadAlouds.css'

const READING_STATUS = {
  WANT_TO_READ: { id: 'want', label: 'Want to Read', icon: BookMarked, color: '#E8A87C' },
  READING: { id: 'reading', label: 'Currently Reading', icon: BookOpen, color: '#2D5A4A' },
  COMPLETED: { id: 'completed', label: 'Completed', icon: Check, color: '#8FB39A' }
}
const getStatusInfo = (statusId) => Object.values(READING_STATUS).find(s => s.id === statusId)

// Map child age (from birthDate) or grade to read-aloud age group id
function getAgeGroupForChild(child) {
  if (!child) return null
  if (child.birthDate) {
    const birth = new Date(child.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
    if (age <= 3)  return 'ages-0-3'
    if (age <= 7)  return 'ages-4-7'
    if (age <= 12) return 'ages-8-12'
    return 'ages-13-plus'
  }
  if (child.gradeLevel) {
    const g = String(child.gradeLevel).toLowerCase()
    if (g.includes('early learner') || g.includes('pre-k') || g.includes('kindergarten') || g.includes('1st') || g.includes('2nd')) return 'ages-4-7'
    if (g.includes('3rd') || g.includes('4th') || g.includes('5th') || g.includes('6th')) return 'ages-8-12'
    if (g.includes('7th') || g.includes('8th') || g.includes('9th') || g.includes('10th') || g.includes('11th') || g.includes('12th')) return 'ages-13-plus'
  }
  return null
}

function ReadAlouds() {
  const { children, suggestedBooks, readAloudLogs, getReadAloudStatus, setReadAloudStatus, removeReadAloudStatus, addCustomReadAloudBook, updateCustomReadAloudBook, deleteCustomReadAloudBook } = useData()
  const { user, isConfigured } = useAuth()
  const { isPremium, upgradeToPremium } = useSubscription()
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [readingList, setReadingList] = useState({})
  const [showAddBook, setShowAddBook] = useState(false)
  const [showMyList, setShowMyList] = useState(false)
  const [sortField, setSortField] = useState('title')   // 'title' | 'author'
  const [sortDir, setSortDir] = useState('asc')
  const [newBook, setNewBook] = useState({ title: '', author: '', ageGroup: 'ages-8-12', genre: 'Other' })
  const [editingCustomBook, setEditingCustomBook] = useState(null)
  const [savingCustom, setSavingCustom] = useState(false)

  const useDbForStatus = isConfigured && user && isPremium

  // When a child is selected, auto-filter to that child's age group
  useEffect(() => {
    if (!selectedChild || !isPremium) return
    const child = children.find(c => c.id === selectedChild)
    const ageGroup = getAgeGroupForChild(child)
    if (ageGroup) setSelectedAgeGroup(ageGroup)
    setShowMyList(false)
  }, [selectedChild, isPremium, children])

  // Suggested books: from DB if any, else static list (same shape: id, title, author, illustrator, ageGroup, genre, description)
  const suggestedBookList = useMemo(() => {
    if (suggestedBooks?.length > 0) {
      return suggestedBooks.map(b => ({ id: b.id, title: b.title, author: b.author || '', illustrator: b.illustrator || '', ageGroup: b.ageGroup, genre: b.genre || '', description: b.description || '' }))
    }
    return SUGGESTED_BOOKS
  }, [suggestedBooks])

  // Derive genres dynamically from whichever book source is active
  const activeGenres = useMemo(() => {
    const genres = [...new Set(suggestedBookList.map(b => b.genre).filter(g => g && g !== 'Other'))].sort()
    return genres
  }, [suggestedBookList])

  const getBooksByAgeGroup = (ageGroupId) => suggestedBookList.filter(book => book.ageGroup === ageGroupId)

  useEffect(() => {
    const saved = localStorage.getItem('homeschool_reading_list')
    if (saved) setReadingList(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('homeschool_reading_list', JSON.stringify(readingList))
  }, [readingList])

  const customBooksForChild = useMemo(() => {
    if (!selectedChild || !useDbForStatus) return []
    return readAloudLogs
      .filter(l => l.childId === selectedChild && String(l.bookId || '').startsWith('custom-'))
      .map(l => {
        let ageGroup = 'ages-8-12'
        let genre = 'Other'
        if (l.notes) {
          try {
            const n = JSON.parse(l.notes)
            if (n.ageGroup) ageGroup = n.ageGroup
            if (n.genre) genre = n.genre
          } catch (_) {}
        }
        return {
          id: l.bookId,
          logId: l.id,
          title: l.bookTitle,
          author: l.bookAuthor || '',
          ageGroup,
          genre,
          description: 'Custom book',
          isCustom: true
        }
      })
  }, [selectedChild, useDbForStatus, readAloudLogs])

  const getBookStatus = (childId, bookId) => {
    if (useDbForStatus && childId) return getReadAloudStatus(childId, bookId) || null
    return readingList[childId]?.books?.[bookId]?.status || null
  }

  const getFilteredBooks = () => {
    let books = [...suggestedBookList]
    if (isPremium && selectedChild) {
      if (useDbForStatus) books = [...books, ...customBooksForChild]
      else if (readingList[selectedChild]?.customBooks) books = [...books, ...readingList[selectedChild].customBooks]
    }
    if (showMyList && selectedChild) books = books.filter(b => !!getBookStatus(selectedChild, b.id))
    if (selectedAgeGroup !== 'all') books = books.filter(b => b.ageGroup === selectedAgeGroup)
    if (selectedGenre !== 'all') books = books.filter(b => b.genre === selectedGenre)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      books = books.filter(b => b.title.toLowerCase().includes(q) || (b.author && b.author.toLowerCase().includes(q)))
    }
    return books
  }

  const sortTitle = (t) => t.replace(/^(The|An|A) /i, '')
  const sortAuthorKey = (author) => {
    if (!author) return 'zzz'
    const words = author.trim().split(/\s+/)
    return words[words.length - 1].toLowerCase()
  }
  const handleSortClick = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }
  const filteredBooks = getFilteredBooks().sort((a, b) => {
    const cmp = sortField === 'author'
      ? sortAuthorKey(a.author).localeCompare(sortAuthorKey(b.author))
      : sortTitle(a.title).localeCompare(sortTitle(b.title))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const addAllToList = async () => {
    if (!selectedChild) return
    const untracked = filteredBooks.filter(b => !getBookStatus(selectedChild, b.id))
    for (const book of untracked) {
      await setBookStatus(selectedChild, book.id, 'want', book)
    }
  }

  const setBookStatus = async (childId, bookId, status, book = null) => {
    if (useDbForStatus && childId) {
      const b = book || filteredBooks.find(x => x.id === bookId)
      if (b) await setReadAloudStatus(childId, bookId, b.title, b.author || '', status)
      return
    }
    setReadingList(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        books: { ...prev[childId]?.books, [bookId]: { status, updatedAt: new Date().toISOString() } }
      }
    }))
  }

  const removeBookStatus = (childId, bookId) => {
    if (useDbForStatus && childId) {
      removeReadAloudStatus(childId, bookId)
      return
    }
    setReadingList(prev => {
      const next = { ...prev }
      if (next[childId]?.books?.[bookId]) delete next[childId].books[bookId]
      return next
    })
  }

  const addCustomBook = async (childId) => {
    if (!newBook.title.trim()) return
    if (useDbForStatus) {
      setSavingCustom(true)
      try {
        await addCustomReadAloudBook(childId, {
          title: newBook.title.trim(),
          author: newBook.author.trim(),
          ageGroup: newBook.ageGroup || 'ages-8-12',
          genre: newBook.genre || 'Other'
        })
        setNewBook({ title: '', author: '', ageGroup: 'ages-8-12', genre: 'Other' })
        setShowAddBook(false)
      } catch (e) {
        console.error(e)
      }
      setSavingCustom(false)
      return
    }
    const customBook = {
      id: `custom-${Date.now()}`,
      title: newBook.title.trim(),
      author: newBook.author.trim() || 'Unknown Author',
      ageGroup: newBook.ageGroup || 'ages-8-12',
      genre: newBook.genre || 'Other',
      description: 'Custom book added by user',
      isCustom: true
    }
    setReadingList(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        customBooks: [...(prev[childId]?.customBooks || []), customBook],
        books: { ...prev[childId]?.books, [customBook.id]: { status: 'want', updatedAt: new Date().toISOString() } }
      }
    }))
    setNewBook({ title: '', author: '', ageGroup: 'ages-8-12', genre: 'Other' })
    setShowAddBook(false)
  }

  const saveEditCustomBook = async () => {
    if (!editingCustomBook?.logId) return
    setSavingCustom(true)
    try {
      await updateCustomReadAloudBook(editingCustomBook.logId, {
        title: editingCustomBook.title?.trim(),
        author: editingCustomBook.author?.trim(),
        ageGroup: editingCustomBook.ageGroup,
        genre: editingCustomBook.genre
      })
      setEditingCustomBook(null)
    } catch (e) {
      console.error(e)
    }
    setSavingCustom(false)
  }

  const deleteCustomBook = (childId, bookId, logId) => {
    if (useDbForStatus && logId) {
      deleteCustomReadAloudBook(logId)
      return
    }
    setReadingList(prev => {
      const newList = { ...prev }
      if (newList[childId]) {
        newList[childId].customBooks = (newList[childId].customBooks || []).filter(b => b.id !== bookId)
        if (newList[childId].books?.[bookId]) delete newList[childId].books[bookId]
      }
      return newList
    })
  }

  const getChildStats = (childId) => {
    if (useDbForStatus && childId) {
      const logs = readAloudLogs.filter(l => l.childId === childId)
      return {
        wantToRead: logs.filter(l => l.status === 'want').length,
        reading: logs.filter(l => l.status === 'reading').length,
        completed: logs.filter(l => l.status === 'completed').length
      }
    }
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

      <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_READALOUDS} />

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
                    {activeGenres.map(g => (
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
                disabled={!newBook.title.trim() || savingCustom}
              >
                <Plus size={18} />
                {savingCustom ? 'Adding…' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Custom Book Modal */}
      {editingCustomBook && (
        <div className="modal-overlay" onClick={() => !savingCustom && setEditingCustomBook(null)}>
          <div className="add-book-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit book</h3>
              <button type="button" className="close-btn" onClick={() => !savingCustom && setEditingCustomBook(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCustomBook.title ?? ''}
                  onChange={e => setEditingCustomBook(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCustomBook.author ?? ''}
                  onChange={e => setEditingCustomBook(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age Group</label>
                  <select
                    className="form-select"
                    value={editingCustomBook.ageGroup ?? 'ages-8-12'}
                    onChange={e => setEditingCustomBook(prev => ({ ...prev, ageGroup: e.target.value }))}
                  >
                    {AGE_GROUPS.map(ag => (
                      <option key={ag.id} value={ag.id}>{ag.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <select
                    className="form-select"
                    value={editingCustomBook.genre ?? 'Other'}
                    onChange={e => setEditingCustomBook(prev => ({ ...prev, genre: e.target.value }))}
                  >
                    {activeGenres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-tracker btn-secondary" onClick={() => !savingCustom && setEditingCustomBook(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-tracker btn-primary"
                onClick={saveEditCustomBook}
                disabled={!editingCustomBook.title?.trim() || savingCustom}
              >
                {savingCustom ? 'Saving…' : 'Save'}
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
          {activeGenres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {isPremium && selectedChild && (
          <button
            className={`my-list-toggle ${showMyList ? 'active' : ''}`}
            onClick={() => setShowMyList(v => !v)}
            title={showMyList ? 'Show all books' : `Show ${children.find(c => c.id === selectedChild)?.name}'s book list`}
          >
            <BookMarked size={15} />
            {showMyList
              ? 'All Books'
              : `${children.find(c => c.id === selectedChild)?.name}'s List`}
          </button>
        )}
      </div>

      {/* Age Group overview cards (no filter active) */}
      {selectedAgeGroup === 'all' && !searchQuery && selectedGenre === 'all' && !showMyList ? (
        <div className="age-groups-grid">
          {AGE_GROUPS.map(ageGroup => {
            const books = suggestedBookList.filter(b => b.ageGroup === ageGroup.id).sort((a, b) => sortTitle(a.title).localeCompare(sortTitle(b.title)))
            return (
              <div key={ageGroup.id} className="age-group-card">
                <div className="age-group-header">
                  <h3>{ageGroup.name}</h3>
                  <span className="age-range">{ageGroup.ages}</span>
                </div>
                <p className="age-group-desc">{ageGroup.description}</p>
                <div className="book-preview-list">
                  {books.slice(0, 5).map(book => {
                    const status = selectedChild ? getBookStatus(selectedChild, book.id) : null
                    return (
                      <div key={book.id} className={`book-preview ${status ? `status-${status}` : ''}`}>
                        <Book size={12} />
                        <span>{book.title}</span>
                        {status && <span className="status-indicator" style={{ background: getStatusInfo(status)?.color }} />}
                      </div>
                    )
                  })}
                </div>
                <button className="view-all-btn" onClick={() => setSelectedAgeGroup(ageGroup.id)}>
                  View all {books.length} books →
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        /* Book Table */
        <div className="books-list">
          <div className="list-header">
            <span>{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}</span>
            <div className="list-header-actions">
              {isPremium && selectedChild && filteredBooks.some(b => !getBookStatus(selectedChild, b.id)) && (
                <button className="btn-tracker btn-secondary btn-sm" onClick={addAllToList}>
                  <Plus size={14} />
                  Add All to List
                </button>
              )}
              {(selectedAgeGroup !== 'all' || selectedGenre !== 'all' || searchQuery || showMyList) && (
                <button className="clear-filter" onClick={() => { setSelectedAgeGroup('all'); setSelectedGenre('all'); setSearchQuery(''); setShowMyList(false) }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="no-books">
              <Book size={48} />
              <h3>No books found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <table className="books-table">
              <thead>
                <tr>
                  <th>
                    <button className={`sort-th-btn ${sortField === 'title' ? 'active' : ''}`} onClick={() => handleSortClick('title')}>
                      Title
                      {sortField === 'title' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                    </button>
                  </th>
                  <th>
                    <button className={`sort-th-btn ${sortField === 'author' ? 'active' : ''}`} onClick={() => handleSortClick('author')}>
                      Author / Illustrator
                      {sortField === 'author' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                    </button>
                  </th>
                  <th>Age Group</th>
                  <th>Genre</th>
                  {isPremium && selectedChild && <th>Status</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => {
                  const status = selectedChild ? getBookStatus(selectedChild, book.id) : null
                  const statusInfo = status ? getStatusInfo(status) : null
                  const ageGroup = AGE_GROUPS.find(ag => ag.id === book.ageGroup)

                  return (
                    <tr key={book.id} className={`book-row ${status ? `has-status status-${status}` : ''}`}>
                      <td className="book-title-cell">
                        {book.isCustom && <span className="custom-badge">Custom</span>}
                        <span className="book-title-text">{book.title}</span>
                        {book.description && <span className="book-desc-tooltip" title={book.description} />}
                      </td>
                      <td className="book-author-cell">
                        <span>{book.author}</span>
                        {book.illustrator && <span className="book-illustrator">illus. {book.illustrator}</span>}
                      </td>
                      <td className="book-age-cell">
                        <span className="book-age-badge">{ageGroup?.name}</span>
                      </td>
                      <td className="book-genre-cell">
                        {book.genre && book.genre !== 'Other' && (
                          <span className="book-genre-badge">{book.genre}</span>
                        )}
                      </td>
                      {isPremium && selectedChild && (
                        <td className="book-status-cell">
                          {status ? (
                            <div className="status-actions">
                              <div className="status-buttons">
                                {Object.values(READING_STATUS).map(s => (
                                  <button
                                    key={s.id}
                                    className={`status-btn ${status === s.id ? 'active' : ''}`}
                                    style={{ '--status-color': s.color }}
                                    onClick={() => setBookStatus(selectedChild, book.id, s.id, book)}
                                    title={s.label}
                                  >
                                    <s.icon size={13} />
                                  </button>
                                ))}
                                <button
                                  className="status-btn remove"
                                  onClick={() => removeBookStatus(selectedChild, book.id)}
                                  title="Remove from list"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                              {book.isCustom && useDbForStatus && book.logId && (
                                <div className="custom-book-buttons">
                                  <button type="button" className="edit-custom-btn" onClick={() => setEditingCustomBook({ logId: book.logId, title: book.title, author: book.author, ageGroup: book.ageGroup, genre: book.genre })} title="Edit"><Pencil size={13} /></button>
                                  <button type="button" className="delete-custom-btn" onClick={() => { if (confirm('Remove this book?')) deleteCustomBook(selectedChild, book.id, book.logId) }} title="Delete"><Trash2 size={13} /></button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button className="add-to-list-btn" onClick={() => setBookStatus(selectedChild, book.id, 'want', book)}>
                              <Plus size={14} />
                              Add
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default ReadAlouds

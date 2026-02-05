import { useState, useEffect } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { BookOpen, FolderOpen, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { AGE_GROUPS } from '../../data/readAloudBooks'
import './Admin.css'

const RESOURCE_COLORS = ['terracotta', 'forest', 'sage']

function Admin() {
  const {
    suggestedBooks,
    resources,
    addSuggestedBook,
    updateSuggestedBook,
    deleteSuggestedBook,
    refreshSuggestedBooks,
    addResource,
    updateResource,
    deleteResource,
    refreshResources
  } = useData()

  const [activeSection, setActiveSection] = useState('books')
  const [books, setBooks] = useState([])
  const [resList, setResList] = useState([])
  const [editingBook, setEditingBook] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [newBook, setNewBook] = useState({ title: '', author: '', ageGroup: 'elementary', genre: '', description: '' })
  const [newResource, setNewResource] = useState({ category: '', countLabel: '', items: '', color: 'sage', link: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setBooks(suggestedBooks)
    setResList(resources)
  }, [suggestedBooks, resources])

  const showMsg = (text, isError = false) => {
    setMessage({ text, isError })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    if (!newBook.title.trim()) return
    setSaving(true)
    try {
      await addSuggestedBook({
        title: newBook.title.trim(),
        author: newBook.author.trim() || null,
        ageGroup: newBook.ageGroup,
        genre: newBook.genre || null,
        description: newBook.description.trim() || null
      })
      setNewBook({ title: '', author: '', ageGroup: 'elementary', genre: '', description: '' })
      showMsg('Book added.')
    } catch (err) {
      showMsg(err.message || 'Failed to add book', true)
    }
    setSaving(false)
  }

  const handleUpdateBook = async (id, updates) => {
    setSaving(true)
    try {
      await updateSuggestedBook(id, updates)
      setEditingBook(null)
      showMsg('Book updated.')
    } catch (err) {
      showMsg(err.message || 'Failed to update', true)
    }
    setSaving(false)
  }

  const handleDeleteBook = async (id) => {
    if (!confirm('Remove this book from the suggested list?')) return
    setSaving(true)
    try {
      await deleteSuggestedBook(id)
      showMsg('Book removed.')
    } catch (err) {
      showMsg(err.message || 'Failed to delete', true)
    }
    setSaving(false)
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!newResource.category.trim()) return
    const items = newResource.items.trim() ? newResource.items.split('\n').map(s => s.trim()).filter(Boolean) : []
    setSaving(true)
    try {
      await addResource({
        category: newResource.category.trim(),
        countLabel: newResource.countLabel.trim() || null,
        items,
        color: newResource.color,
        link: newResource.link.trim() || null
      })
      setNewResource({ category: '', countLabel: '', items: '', color: 'sage', link: '' })
      showMsg('Resource added.')
    } catch (err) {
      showMsg(err.message || 'Failed to add resource', true)
    }
    setSaving(false)
  }

  const handleUpdateResource = async (id, updates) => {
    setSaving(true)
    try {
      if (updates.items != null && typeof updates.items === 'string') {
        updates.items = updates.items.trim() ? updates.items.split('\n').map(s => s.trim()).filter(Boolean) : []
      }
      await updateResource(id, updates)
      setEditingResource(null)
      showMsg('Resource updated.')
    } catch (err) {
      showMsg(err.message || 'Failed to update', true)
    }
    setSaving(false)
  }

  const handleDeleteResource = async (id) => {
    if (!confirm('Remove this resource card?')) return
    setSaving(true)
    try {
      await deleteResource(id)
      showMsg('Resource removed.')
    } catch (err) {
      showMsg(err.message || 'Failed to delete', true)
    }
    setSaving(false)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin</h1>
        <p>Manage suggested read-aloud books and homepage resources.</p>
      </div>

      {message && (
        <div className={`admin-message ${message.isError ? 'error' : ''}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeSection === 'books' ? 'active' : ''}
          onClick={() => setActiveSection('books')}
        >
          <BookOpen size={18} /> Suggested Books
        </button>
        <button
          className={activeSection === 'resources' ? 'active' : ''}
          onClick={() => setActiveSection('resources')}
        >
          <FolderOpen size={18} /> Resources
        </button>
      </div>

      {activeSection === 'books' && (
        <div className="admin-section">
          <form onSubmit={handleAddBook} className="admin-form add-form">
            <h3>Add book to suggestions</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Title *"
                value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
              />
            </div>
            <div className="form-row">
              <select
                value={newBook.ageGroup}
                onChange={e => setNewBook({ ...newBook, ageGroup: e.target.value })}
              >
                {AGE_GROUPS.map(ag => (
                  <option key={ag.id} value={ag.id}>{ag.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Genre"
                value={newBook.genre}
                onChange={e => setNewBook({ ...newBook, genre: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Short description (optional)"
              value={newBook.description}
              onChange={e => setNewBook({ ...newBook, description: e.target.value })}
            />
            <button type="submit" className="btn-admin" disabled={saving}>
              <Plus size={18} /> Add Book
            </button>
          </form>

          <div className="admin-list">
            <h3>Current suggested books ({books.length})</h3>
            {books.length === 0 ? (
              <p className="admin-empty">No books in database yet. Add some above or they will use the built-in list.</p>
            ) : (
              <ul>
                {books.map(b => (
                  <li key={b.id} className="admin-list-item">
                    {editingBook?.id === b.id ? (
                      <div className="edit-inline">
                        <input value={editingBook.title} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} placeholder="Title" />
                        <input value={editingBook.author} onChange={e => setEditingBook({ ...editingBook, author: e.target.value })} placeholder="Author" />
                        <select value={editingBook.ageGroup} onChange={e => setEditingBook({ ...editingBook, ageGroup: e.target.value })}>
                          {AGE_GROUPS.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                        </select>
                        <div className="edit-actions">
                          <button type="button" onClick={() => handleUpdateBook(b.id, editingBook)}><Save size={16} /> Save</button>
                          <button type="button" onClick={() => setEditingBook(null)}><X size={16} /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="item-title">{b.title}</span>
                        {b.author && <span className="item-meta">{b.author}</span>}
                        <span className="item-meta">{AGE_GROUPS.find(ag => ag.id === b.ageGroup)?.name || b.ageGroup}</span>
                        <div className="item-actions">
                          <button type="button" onClick={() => setEditingBook({ id: b.id, title: b.title, author: b.author || '', ageGroup: b.ageGroup })} title="Edit"><Pencil size={14} /></button>
                          <button type="button" onClick={() => handleDeleteBook(b.id)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeSection === 'resources' && (
        <div className="admin-section">
          <form onSubmit={handleAddResource} className="admin-form add-form">
            <h3>Add resource card</h3>
            <input
              type="text"
              placeholder="Category (e.g. Language Arts) *"
              value={newResource.category}
              onChange={e => setNewResource({ ...newResource, category: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Count label (e.g. 120+ Resources)"
              value={newResource.countLabel}
              onChange={e => setNewResource({ ...newResource, countLabel: e.target.value })}
            />
            <textarea
              placeholder="Bullet items, one per line"
              value={newResource.items}
              onChange={e => setNewResource({ ...newResource, items: e.target.value })}
              rows={3}
            />
            <div className="form-row">
              <select value={newResource.color} onChange={e => setNewResource({ ...newResource, color: e.target.value })}>
                {RESOURCE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Link URL (optional)"
                value={newResource.link}
                onChange={e => setNewResource({ ...newResource, link: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-admin" disabled={saving}>
              <Plus size={18} /> Add Resource
            </button>
          </form>

          <div className="admin-list">
            <h3>Current resources ({resList.length})</h3>
            {resList.length === 0 ? (
              <p className="admin-empty">No resources in database. The homepage will use the built-in list until you add some.</p>
            ) : (
              <ul>
                {resList.map(r => (
                  <li key={r.id} className="admin-list-item">
                    {editingResource?.id === r.id ? (
                      <div className="edit-inline">
                        <input value={editingResource.category} onChange={e => setEditingResource({ ...editingResource, category: e.target.value })} placeholder="Category" />
                        <input value={editingResource.countLabel} onChange={e => setEditingResource({ ...editingResource, countLabel: e.target.value })} placeholder="Count label" />
                        <textarea value={editingResource.items} onChange={e => setEditingResource({ ...editingResource, items: e.target.value })} placeholder="Items, one per line" rows={2} />
                        <div className="edit-actions">
                          <button type="button" onClick={() => handleUpdateResource(r.id, editingResource)}><Save size={16} /> Save</button>
                          <button type="button" onClick={() => setEditingResource(null)}><X size={16} /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="item-title">{r.category}</span>
                        {r.countLabel && <span className="item-meta">{r.countLabel}</span>}
                        <div className="item-actions">
                          <button type="button" onClick={() => setEditingResource({ id: r.id, category: r.category, countLabel: r.countLabel || '', items: Array.isArray(r.items) ? r.items.join('\n') : '' })} title="Edit"><Pencil size={14} /></button>
                          <button type="button" onClick={() => handleDeleteResource(r.id)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

import { useState, useEffect, useCallback } from 'react'
import { useData } from '../../context/SupabaseDataContext'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, FolderOpen, Users, Plus, Pencil, Trash2, X, Save, ListPlus, ListMinus, ChevronDown, ChevronUp, Crown, RefreshCw, ExternalLink, ShieldCheck, ShieldOff, ArrowUpCircle, ArrowDownCircle, Loader } from 'lucide-react'
import { AGE_GROUPS } from '../../data/readAloudBooks'
import './Admin.css'

const CHECKOUT_API = import.meta.env.VITE_CHECKOUT_API_URL

async function callAdminApi(action, payload, token) {
  const res = await fetch(CHECKOUT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, access_token: token, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(typeof ts === 'number' ? ts * 1000 : ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAmount(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

const TIER_BADGE = {
  premium: 'badge-premium',
  free: 'badge-free',
}
const STATUS_BADGE = {
  active: 'badge-active',
  trialing: 'badge-trialing',
  canceled: 'badge-canceled',
  past_due: 'badge-past-due',
}

const RESOURCE_COLORS = ['terracotta', 'forest', 'sage']

// ── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ token }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [billingData, setBillingData] = useState({})
  const [billingLoading, setBillingLoading] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError })
    setTimeout(() => setMsg(null), 3500)
  }

  const loadUsers = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await callAdminApi('admin-list-users', {}, token)
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [token])

  useEffect(() => { loadUsers() }, [loadUsers])

  const loadBilling = async (userId) => {
    if (billingData[userId]) return
    setBillingLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const data = await callAdminApi('admin-billing-history', { target_user_id: userId }, token)
      setBillingData(prev => ({ ...prev, [userId]: data }))
    } catch (err) {
      setBillingData(prev => ({ ...prev, [userId]: { error: err.message } }))
    }
    setBillingLoading(prev => ({ ...prev, [userId]: false }))
  }

  const toggleExpand = (userId) => {
    if (expandedId === userId) { setExpandedId(null); return }
    setExpandedId(userId)
    loadBilling(userId)
  }

  const startEdit = (user) => {
    setEditingId(user.id)
    setEditForm({
      subscription_tier: user.subscription_tier || 'free',
      subscription_status: user.subscription_status || '',
      is_admin: !!user.is_admin,
      full_name: user.full_name || '',
    })
  }

  const saveEdit = async (userId) => {
    setSaving(true)
    try {
      await callAdminApi('admin-update-user', { target_user_id: userId, updates: editForm }, token)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editForm } : u))
      setBillingData(prev => { const n = { ...prev }; delete n[userId]; return n })
      setEditingId(null)
      showMsg('User updated.')
    } catch (err) {
      showMsg(err.message, true)
    }
    setSaving(false)
  }

  const quickUpdate = async (userId, updates) => {
    setSaving(true)
    try {
      await callAdminApi('admin-update-user', { target_user_id: userId, updates }, token)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
      setBillingData(prev => { const n = { ...prev }; delete n[userId]; return n })
      showMsg('Updated.')
    } catch (err) {
      showMsg(err.message, true)
    }
    setSaving(false)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || (u.auth_email || u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)
  })

  if (!CHECKOUT_API) return (
    <div className="admin-empty" style={{ padding: '1rem' }}>
      <strong>VITE_CHECKOUT_API_URL</strong> is not configured. Set it in your <code>.env</code> to enable user management.
    </div>
  )

  return (
    <div className="admin-users">
      {msg && <div className={`admin-message ${msg.isError ? 'error' : ''}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

      <div className="users-toolbar">
        <input
          className="users-search"
          placeholder="Search by email or name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-admin btn-admin-secondary" onClick={loadUsers} disabled={loading} title="Refresh">
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'Loading…' : `${users.length} users`}
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <p className="admin-empty">No users found.</p>
      )}

      <div className="users-list">
        {filtered.map(user => {
          const isExpanded = expandedId === user.id
          const isEditing = editingId === user.id
          const billing = billingData[user.id]
          const isPremium = user.subscription_tier === 'premium'

          return (
            <div key={user.id} className={`user-card ${isExpanded ? 'expanded' : ''}`}>
              {/* Row */}
              <div className="user-row" onClick={() => !isEditing && toggleExpand(user.id)}>
                <div className="user-avatar">
                  {(user.full_name || user.auth_email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.full_name || <span className="user-no-name">No name</span>}
                    {user.is_admin && <span className="badge badge-admin" title="Admin"><ShieldCheck size={12} /> Admin</span>}
                  </div>
                  <div className="user-email">{user.auth_email || user.email || '—'}</div>
                </div>
                <div className="user-meta">
                  <span className={`badge ${TIER_BADGE[user.subscription_tier] || 'badge-free'}`}>
                    {user.subscription_tier === 'premium' ? <><Crown size={11} /> Premium</> : 'Free'}
                  </span>
                  {user.subscription_status && user.subscription_status !== user.subscription_tier && (
                    <span className={`badge ${STATUS_BADGE[user.subscription_status] || ''}`}>
                      {user.subscription_status}
                    </span>
                  )}
                </div>
                <div className="user-joined">{formatDate(user.auth_created_at)}</div>
                <div className="user-expand-icon">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="user-detail" onClick={e => e.stopPropagation()}>
                  <div className="user-detail-cols">

                    {/* Left: profile edit */}
                    <div className="user-detail-col">
                      <h4>Profile</h4>
                      {isEditing ? (
                        <div className="user-edit-form">
                          <label>Full name
                            <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
                          </label>
                          <label>Subscription tier
                            <select value={editForm.subscription_tier} onChange={e => setEditForm(f => ({ ...f, subscription_tier: e.target.value }))}>
                              <option value="free">Free</option>
                              <option value="premium">Premium</option>
                            </select>
                          </label>
                          <label>Subscription status
                            <select value={editForm.subscription_status} onChange={e => setEditForm(f => ({ ...f, subscription_status: e.target.value }))}>
                              <option value="">— none —</option>
                              <option value="active">active</option>
                              <option value="trialing">trialing</option>
                              <option value="canceled">canceled</option>
                              <option value="past_due">past_due</option>
                            </select>
                          </label>
                          <label className="user-edit-checkbox">
                            <input type="checkbox" checked={editForm.is_admin} onChange={e => setEditForm(f => ({ ...f, is_admin: e.target.checked }))} />
                            Admin user
                          </label>
                          <div className="edit-actions" style={{ marginTop: '0.5rem' }}>
                            <button className="btn-admin" onClick={() => saveEdit(user.id)} disabled={saving}>
                              {saving ? <Loader size={14} className="spinning" /> : <Save size={14} />} Save
                            </button>
                            <button className="btn-admin btn-admin-secondary" onClick={() => setEditingId(null)} disabled={saving}>
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="user-profile-view">
                          <div className="profile-row"><span>Email</span><strong>{user.auth_email || user.email || '—'}</strong></div>
                          <div className="profile-row"><span>Name</span><strong>{user.full_name || '—'}</strong></div>
                          <div className="profile-row"><span>Tier</span><strong>{user.subscription_tier || 'free'}</strong></div>
                          <div className="profile-row"><span>Status</span><strong>{user.subscription_status || '—'}</strong></div>
                          <div className="profile-row"><span>Renews</span><strong>{formatDate(user.subscription_end_date)}</strong></div>
                          <div className="profile-row"><span>Confirmed</span><strong>{user.email_confirmed ? 'Yes' : 'No'}</strong></div>
                          <div className="profile-row"><span>Last sign-in</span><strong>{formatDate(user.last_sign_in)}</strong></div>
                          <div className="profile-row"><span>Joined</span><strong>{formatDate(user.auth_created_at)}</strong></div>
                          <div className="user-quick-actions">
                            <button className="btn-admin" onClick={() => startEdit(user)}>
                              <Pencil size={14} /> Edit
                            </button>
                            {!isPremium ? (
                              <button className="btn-admin" style={{ background: '#d97706' }} onClick={() => quickUpdate(user.id, { subscription_tier: 'premium', subscription_status: 'active' })} disabled={saving}>
                                <ArrowUpCircle size={14} /> Grant Premium
                              </button>
                            ) : (
                              <button className="btn-admin btn-admin-danger" onClick={() => quickUpdate(user.id, { subscription_tier: 'free', subscription_status: 'canceled' })} disabled={saving}>
                                <ArrowDownCircle size={14} /> Revoke Premium
                              </button>
                            )}
                            {!user.is_admin ? (
                              <button className="btn-admin btn-admin-secondary" onClick={() => quickUpdate(user.id, { is_admin: true })} disabled={saving}>
                                <ShieldCheck size={14} /> Make Admin
                              </button>
                            ) : (
                              <button className="btn-admin btn-admin-secondary" onClick={() => quickUpdate(user.id, { is_admin: false })} disabled={saving}>
                                <ShieldOff size={14} /> Remove Admin
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: billing history */}
                    <div className="user-detail-col">
                      <h4>Billing History</h4>
                      {billingLoading[user.id] && (
                        <div className="billing-loading"><Loader size={18} className="spinning" /> Loading…</div>
                      )}
                      {billing?.error && <p className="admin-empty">{billing.error}</p>}
                      {billing && !billing.error && (
                        <>
                          {billing.subscription && (
                            <div className="billing-subscription">
                              <div className="profile-row">
                                <span>Stripe status</span>
                                <strong className={`badge ${STATUS_BADGE[billing.subscription.status] || ''}`}>{billing.subscription.status}</strong>
                              </div>
                              <div className="profile-row">
                                <span>Current period</span>
                                <strong>{formatDate(billing.subscription.current_period_start)} → {formatDate(billing.subscription.current_period_end)}</strong>
                              </div>
                              {billing.subscription.cancel_at_period_end && (
                                <div className="profile-row"><span>Cancels</span><strong>at period end</strong></div>
                              )}
                            </div>
                          )}
                          {!billing.subscription && !billing.profile?.stripe_customer_id && (
                            <p className="admin-empty">No Stripe customer yet.</p>
                          )}
                          {billing.invoices?.length > 0 ? (
                            <table className="billing-table">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Description</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {billing.invoices.map(inv => (
                                  <tr key={inv.id}>
                                    <td>{formatDate(inv.created)}</td>
                                    <td>{inv.description || `${formatDate(inv.period_start)} – ${formatDate(inv.period_end)}`}</td>
                                    <td>{formatAmount(inv.amount_paid || inv.amount_due, inv.currency)}</td>
                                    <td><span className={`badge ${inv.status === 'paid' ? 'badge-active' : 'badge-past-due'}`}>{inv.status}</span></td>
                                    <td>{inv.hosted_invoice_url && <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" title="View invoice"><ExternalLink size={14} /></a>}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            billing.profile?.stripe_customer_id && <p className="admin-empty">No invoices found.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Admin Component ──────────────────────────────────────────────────────
function Admin() {
  const {
    suggestedBooks,
    resources,
    addSuggestedBook,
    updateSuggestedBook,
    deleteSuggestedBook,
    addResource,
    updateResource,
    deleteResource
  } = useData()
  const { user } = useAuth()
  const [adminToken, setAdminToken] = useState('')
  useEffect(() => {
    import('../../lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) setAdminToken(session.access_token)
      })
    })
  }, [user])

  const [activeSection, setActiveSection] = useState('books')
  const [books, setBooks] = useState([])
  const [resList, setResList] = useState([])
  const [editingBook, setEditingBook] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [newBook, setNewBook] = useState({ title: '', author: '', ageGroup: 'elementary', genre: '', description: '' })
  const [newResource, setNewResource] = useState({ category: '', countLabel: '', items: '', color: 'sage', link: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedBookIds, setSelectedBookIds] = useState(new Set())
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [bulkAddText, setBulkAddText] = useState('')

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
      setSelectedBookIds(prev => { const s = new Set(prev); s.delete(id); return s })
      showMsg('Book removed.')
    } catch (err) {
      showMsg(err.message || 'Failed to delete', true)
    }
    setSaving(false)
  }

  const toggleBookSelection = (id) => {
    setSelectedBookIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllBooks = () => {
    if (selectedBookIds.size === books.length) setSelectedBookIds(new Set())
    else setSelectedBookIds(new Set(books.map(b => b.id)))
  }

  const handleBulkRemoveBooks = async () => {
    const ids = Array.from(selectedBookIds)
    if (ids.length === 0) {
      showMsg('Select at least one book to remove.', true)
      return
    }
    if (!confirm(`Remove ${ids.length} book(s) from the suggested list?`)) return
    setSaving(true)
    try {
      for (const id of ids) await deleteSuggestedBook(id)
      setSelectedBookIds(new Set())
      showMsg(`${ids.length} book(s) removed.`)
    } catch (err) {
      showMsg(err.message || 'Bulk remove failed', true)
    }
    setSaving(false)
  }

  const handleBulkAddBooks = async (e) => {
    e.preventDefault()
    const lines = bulkAddText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) {
      showMsg('Enter at least one line (Title / Author or Title by Author).', true)
      return
    }
    const defaultAgeGroup = newBook.ageGroup || 'elementary'
    const defaultGenre = newBook.genre || 'Other'
    setSaving(true)
    let added = 0
    try {
      for (const line of lines) {
        let title = line
        let author = ''
        if (line.includes(' / ')) {
          const [t, a] = line.split(' / ').map(s => s.trim())
          title = t
          author = a || ''
        } else if (line.includes(' by ')) {
          const i = line.indexOf(' by ')
          title = line.slice(0, i).trim()
          author = line.slice(i + 4).trim()
        }
        if (!title) continue
        await addSuggestedBook({
          title,
          author: author || null,
          ageGroup: defaultAgeGroup,
          genre: defaultGenre,
          description: null
        })
        added++
      }
      setBulkAddText('')
      setShowBulkAdd(false)
      showMsg(added ? `${added} book(s) added.` : 'No valid lines to add.', !added)
    } catch (err) {
      showMsg(err.message || 'Bulk add failed', true)
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
        <button
          className={activeSection === 'users' ? 'active' : ''}
          onClick={() => setActiveSection('users')}
        >
          <Users size={18} /> Users
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
            <div className="admin-form-actions">
              <button type="submit" className="btn-admin" disabled={saving}>
                <Plus size={18} /> Add Book
              </button>
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setShowBulkAdd(prev => !prev)}
              >
                <ListPlus size={18} /> Bulk add
              </button>
            </div>
          </form>

          {showBulkAdd && (
            <form onSubmit={handleBulkAddBooks} className="admin-form bulk-add-form">
              <h3>Bulk add books</h3>
              <p className="admin-hint">One book per line. Use &quot;Title / Author&quot; or &quot;Title by Author&quot;. Default age group and genre from the form above.</p>
              <textarea
                placeholder={"Charlotte's Web / E.B. White\nThe BFG / Roald Dahl\nJames and the Giant Peach by Roald Dahl"}
                value={bulkAddText}
                onChange={e => setBulkAddText(e.target.value)}
                rows={6}
                className="bulk-add-textarea"
              />
              <div className="edit-actions">
                <button type="button" className="btn-admin btn-admin-secondary" onClick={() => { setShowBulkAdd(false); setBulkAddText('') }}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin" disabled={saving}>
                  {saving ? 'Adding…' : 'Add all'}
                </button>
              </div>
            </form>
          )}

          <div className="admin-list">
            <div className="admin-list-header">
              <h3>Current suggested books ({books.length})</h3>
              {books.length > 0 && (
                <div className="admin-bulk-actions">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.size === books.length && books.length > 0}
                      onChange={selectAllBooks}
                    />
                    Select all
                  </label>
                  <button
                    type="button"
                    className="btn-admin btn-admin-danger"
                    onClick={handleBulkRemoveBooks}
                    disabled={selectedBookIds.size === 0 || saving}
                  >
                    <ListMinus size={16} /> Remove selected ({selectedBookIds.size})
                  </button>
                </div>
              )}
            </div>
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
                        <label className="admin-list-item-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedBookIds.has(b.id)}
                            onChange={() => toggleBookSelection(b.id)}
                          />
                        </label>
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

      {activeSection === 'users' && (
        <div className="admin-section" style={{ padding: '1rem' }}>
          <UsersTab token={adminToken} />
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

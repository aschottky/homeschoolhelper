// Subscribers are stored in the email_subscribers table (db/schema.sql)
// via POST /api/subscribe; localStorage is the demo-mode fallback.

import { useState } from 'react'
import { api } from '../lib/api'
import { isBackendConfigured } from '../lib/config'
import { Check, Loader2, Mail } from 'lucide-react'
import './EmailCapture.css'

const LS_KEY = 'email_subscribers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getLocalSubscribers() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function isDuplicateLocal(emailNorm) {
  return getLocalSubscribers().some(
    row => normalizeEmail(row.email || '') === emailNorm
  )
}

function saveLocalSubscriber(emailNorm) {
  const list = getLocalSubscribers()
  if (list.some(row => normalizeEmail(row.email || '') === emailNorm)) {
    return false
  }
  list.push({
    email: emailNorm,
    created_at: new Date().toISOString(),
    source: 'landing_page',
  })
  localStorage.setItem(LS_KEY, JSON.stringify(list))
  return true
}

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setErrorMessage('')

    const trimmed = email.trim()
    if (!trimmed) {
      setErrorMessage('Please enter your email.')
      return
    }
    if (!EMAIL_RE.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    const emailNorm = normalizeEmail(trimmed)

    if (isDuplicateLocal(emailNorm)) {
      setErrorMessage('This email is already on the list.')
      return
    }

    setStatus('loading')

    if (isBackendConfigured()) {
      try {
        const result = await api('/api/subscribe', {
          method: 'POST',
          body: { email: emailNorm, source: 'landing_page' },
        })

        if (result?.duplicate) {
          setErrorMessage('This email is already on the list.')
          saveLocalSubscriber(emailNorm)
          setStatus('idle')
          return
        }
      } catch (error) {
        setErrorMessage(error.message || 'Something went wrong. Please try again.')
        setStatus('idle')
        return
      }

      saveLocalSubscriber(emailNorm)
      setStatus('success')
      setEmail('')
      return
    }

    if (!saveLocalSubscriber(emailNorm)) {
      setErrorMessage('This email is already on the list.')
      setStatus('idle')
      return
    }

    setStatus('success')
    setEmail('')
  }

  return (
    <section id="newsletter" className="email-capture" aria-labelledby="email-capture-heading">
      <div className="container email-capture-inner">
        <div className="email-capture-copy">
          <h2 id="email-capture-heading" className="email-capture-title">
            Get homeschool tips &amp; product updates
          </h2>
          <p className="email-capture-subtitle">
            Join 100s of homeschool families. No spam, unsubscribe anytime.
          </p>
        </div>

        {status === 'success' ? (
          <div className="email-capture-success" role="status">
            <Check className="email-capture-success-icon" size={28} strokeWidth={2.5} />
            <p>You&apos;re in! Check your inbox.</p>
          </div>
        ) : (
          <form className="email-capture-form" onSubmit={handleSubmit} noValidate>
            <div className="email-capture-fields">
              <label htmlFor="email-capture-input" className="visually-hidden">
                Email address
              </label>
              <div className="email-capture-input-wrap">
                <Mail className="email-capture-input-icon" size={20} aria-hidden />
                <input
                  id="email-capture-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  className="email-capture-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                className="email-capture-submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="email-capture-spin" size={20} />
                    Subscribing…
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            {errorMessage ? (
              <p className="email-capture-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  )
}

export default EmailCapture

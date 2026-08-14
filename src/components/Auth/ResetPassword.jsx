import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authClient } from '../../lib/authClient'
import {
  BookOpen, Lock, ArrowLeft, Eye, EyeOff,
  Loader2, AlertTriangle, CheckCircle
} from 'lucide-react'
import './Auth.css'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const tokenError = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const invalidLink = !token || tokenError

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { error: resetErr } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (resetErr) throw new Error(resetErr.message || 'Password reset failed')
      setDone(true)
      setTimeout(() => navigate('/auth', { replace: true }), 2500)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="auth-header">
          <div className="auth-logo">
            <BookOpen size={32} />
          </div>
          <h1>Set New Password</h1>
          <p>Choose a new password for your account</p>
        </div>

        {invalidLink ? (
          <>
            <div className="auth-alert error">
              <AlertTriangle size={18} />
              This password reset link is invalid or has expired. Please request a new one.
            </div>
            <Link to="/auth" className="btn-primary submit-btn" style={{ textAlign: 'center', display: 'block' }}>
              Back to Sign In
            </Link>
          </>
        ) : done ? (
          <div className="auth-alert success">
            <CheckCircle size={18} />
            Password updated! Redirecting you to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-alert error">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label>
                <Lock size={16} />
                New Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} />
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

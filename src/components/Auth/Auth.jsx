import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowLeft,
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'
import './Auth.css'

function Auth({ onBack, onSuccess }) {
  const { signIn, signUp, signInWithProvider, resetPassword, isConfigured } = useAuth()
  
  const [mode, setMode] = useState('login') // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Demo mode notice if Supabase not configured
  if (!isConfigured) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <div className="auth-header">
            <div className="auth-logo">
              <BookOpen size={32} />
            </div>
            <h1>Demo Mode</h1>
            <p>Supabase is not configured yet</p>
          </div>

          <div className="demo-notice">
            <AlertCircle size={24} />
            <div>
              <h3>Setup Required</h3>
              <p>
                To enable user accounts, you need to:
              </p>
              <ol>
                <li>Create a free Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                <li>Copy your project URL and anon key</li>
                <li>Create a <code>.env</code> file with your credentials</li>
                <li>Run the database schema SQL in Supabase</li>
              </ol>
              <p>
                For now, the app works in demo mode using localStorage.
              </p>
            </div>
          </div>

          <button className="btn-primary demo-btn" onClick={onSuccess}>
            Continue in Demo Mode
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        onSuccess?.()
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        await signUp(email, password, { full_name: name })
        setMessage('Check your email to confirm your account!')
        setMode('login')
      } else if (mode === 'forgot') {
        await resetPassword(email)
        setMessage('Password reset email sent! Check your inbox.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await signInWithProvider(provider)
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <BookOpen size={32} />
          </div>
          <h1>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p>
            {mode === 'login' && 'Sign in to access your homeschool data'}
            {mode === 'signup' && 'Start your homeschool journey today'}
            {mode === 'forgot' && 'Enter your email to reset your password'}
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="auth-alert success">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <label>
                <Lock size={16} />
                Password
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
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label>
                <Lock size={16} />
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              className="forgot-link"
              onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
            >
              Forgot your password?
            </button>
          )}

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending...'}
              </>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </>
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="oauth-buttons">
              <button
                type="button"
                className="oauth-btn google"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </>
        )}

        <div className="auth-footer">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>
                Sign up
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth

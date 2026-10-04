import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { authApi } from '../api/auth.js'
import { apiErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function TeacherAuth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data =
        mode === 'login'
          ? await authApi.teacherLogin({ username: form.username, password: form.password })
          : await authApi.teacherRegister(form)
      login(data)
      navigate('/teacher/dashboard')
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not sign in. Check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-3.5 py-8 sm:py-12 selection:bg-accent/30 selection:text-white">
      <Link to="/" className="mb-6 sm:mb-8 flex items-center gap-2.5 transition-transform hover:scale-105">
        <Logo size={34} />
        <span className="font-display text-base font-bold tracking-wider text-ink">ARGUSS</span>
      </Link>

      <div className="card w-full max-w-sm p-5 sm:p-7 shadow-raised">
        <h1 className="text-lg font-semibold text-ink">
          {mode === 'login' ? 'Teacher sign in' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === 'login' ? 'Access your classes and attendance records.' : 'Set up an account to start managing classes.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Username">
            <input className="input-field" value={form.username} onChange={update('username')} placeholder="e.g. ananyaroy" required />
          </Field>

          {mode === 'register' && (
            <Field label="Full name">
              <input className="input-field" value={form.name} onChange={update('name')} placeholder="e.g. Prof. Ananya Roy" required />
            </Field>
          )}

          <Field label="Password">
            <div className="relative">
              <input
                className="input-field pr-11"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-faint transition-colors hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>

          {error && <p className="text-sm text-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <button className="btn-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Create an account' : 'Already have an account?'}
          </button>
          <Link to="/" className="btn-link">Back to home</Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1.5 12C1.5 12 5 5.5 12 5.5C19 5.5 22.5 12 22.5 12C22.5 12 19 18.5 12 18.5C5 18.5 1.5 12 1.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.6A9.9 9.9 0 0 1 12 5.5c7 0 10.5 6.5 10.5 6.5a16.3 16.3 0 0 1-3.1 3.9M6.6 6.6C3.6 8.5 1.5 12 1.5 12s3.5 6.5 10.5 6.5c1.4 0 2.6-.25 3.7-.65" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}
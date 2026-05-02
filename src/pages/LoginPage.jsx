/* built by twelve. — bytw12ve */
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ font: '400 10px var(--kw-mono)', color: KW.text3, letterSpacing: '.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        height: 33, padding: '0 12px', borderRadius: 6,
        background: KW.surface2, border: `1px solid ${focus ? KW.lavender : KW.surface3}`,
        color: KW.text, font: '400 11px var(--kw-mono)', outline: 'none',
      }}
    />
  )
}

export default function LoginPage() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const from = location.state?.from || '/profile'
  const authRedirectPath = String(from || '').startsWith('/') ? from : '/profile'

  if (user) return <Navigate to={from} replace />

  const handleSubmit = async () => {
    if (submitting) return
    setError('')
    setMessage('')
    if (!email.trim() || !password) {
      setError('email and password are required.')
      return
    }
    if (mode === 'signup' && username.trim().length < 3) {
      setError('username must be at least 3 characters.')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    const result = mode === 'signup'
      ? await signUp({ email: email.trim(), password, username })
      : await signIn({ email: email.trim(), password })
    setSubmitting(false)

    if (result.error) {
      setError(result.error.message || 'something went wrong.')
      return
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('account created. check your email to confirm, then log in.')
      setMode('login')
      return
    }

    navigate(from, { replace: true })
  }

  const handleGoogle = async () => {
    if (submitting) return
    setError('')
    setMessage('')
    setSubmitting(true)
    const result = await signInWithGoogle(authRedirectPath)
    setSubmitting(false)
    if (result.error) setError(result.error.message || 'could not start google login.')
  }

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '40px var(--kw-page-x)', display: 'grid', placeItems: 'start center' }}>
        <div style={{ width: '100%', maxWidth: 420, background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 24 }}>
          <div style={{ font: '700 22px/1 var(--kw-mono)', color: KW.text, marginBottom: 8 }}>
            {mode === 'signup' ? 'create account.' : 'log in.'}
          </div>
          <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginBottom: 22 }}>
            {mode === 'signup'
              ? 'make a profile so your builds and articles belong to you. passwords need at least 8 characters.'
              : 'log in to submit, edit, and manage your keeb.wiki posts.'}
          </div>
          <Button variant="secondary" onClick={handleGoogle} disabled={submitting} style={{ width: '100%', marginBottom: 16 }}>
            continue with google.
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, background: KW.border, flex: 1 }} />
            <span style={{ font: '400 9px var(--kw-mono)', color: KW.text4 }}>or</span>
            <div style={{ height: 1, background: KW.border, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <Field label="username">
                <TextInput value={username} onChange={setUsername} placeholder="e.g. thockmaster" />
              </Field>
            )}
            <Field label="email">
              <TextInput value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            </Field>
            <Field label="password">
              <TextInput value={password} onChange={setPassword} type="password" placeholder="password" />
            </Field>
          </div>
          {error && <div style={{ font: '400 10px var(--kw-mono)', color: KW.pink, marginTop: 14 }}>{error}</div>}
          {message && <div style={{ font: '400 10px var(--kw-mono)', color: KW.green, marginTop: 14 }}>{message}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 22 }}>
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}
              style={{ background: 'none', border: 'none', color: KW.text3, font: '400 10px var(--kw-mono)', cursor: 'pointer', padding: 0 }}
            >
              {mode === 'signup' ? 'already have an account?' : 'need an account?'}
            </button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'working...' : mode === 'signup' ? 'sign up →' : 'log in →'}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

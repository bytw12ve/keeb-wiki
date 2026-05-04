/* built by twelve. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { SUGGESTION_CATEGORIES, submitSuggestion } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const CONTACT_EMAIL = 'contact@keebwiki.com'

const CATEGORY_COPY = {
  'missing wiki topic': 'Tell us what guide, glossary entry, or comparison would have helped you earlier.',
  'build archive polish': 'Call out confusing filters, missing specs, card layout issues, or gallery ideas.',
  'community feature': 'Suggest lightweight community ideas that fit a curated archive instead of a social feed.',
  'bug report': 'Include the page URL, what you expected, and what happened instead.',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ font: '400 10px var(--kw-mono)', color: KW.text3, letterSpacing: '.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, style }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        height: 33,
        padding: '0 12px',
        borderRadius: 6,
        background: KW.surface2,
        border: `1px solid ${focus ? KW.lavender : KW.surface3}`,
        color: KW.text,
        font: '400 11px var(--kw-mono)',
        outline: 'none',
        transition: 'border-color .18s',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

function TextArea({ value, onChange, placeholder }) {
  const [focus, setFocus] = useState(false)
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={7}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 6,
        background: KW.surface2,
        border: `1px solid ${focus ? KW.lavender : KW.surface3}`,
        color: KW.text,
        font: '400 11px/1.6 var(--kw-mono)',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color .18s',
        boxSizing: 'border-box',
        fontFamily: 'var(--kw-mono)',
      }}
    />
  )
}

function CategoryButton({ category, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? KW.surface3 : KW.surface2,
        border: `1px solid ${active ? KW.lavender : KW.surface3}`,
        borderRadius: 8,
        padding: 16,
        color: KW.text3,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ font: '700 11px var(--kw-mono)', color: active ? KW.lavender : KW.text, marginBottom: 7 }}>{category}.</div>
      <div style={{ font: '400 10px/1.6 var(--kw-mono)', color: KW.text3 }}>{CATEGORY_COPY[category]}</div>
    </button>
  )
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [form, setForm] = useState({
    category: SUGGESTION_CATEGORIES[0],
    title: '',
    message: '',
    pageUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (submitting) return
    if (!form.title.trim() || !form.message.trim()) {
      setError('title and message are required.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: err } = await submitSuggestion({
      category: form.category,
      title: form.title,
      message: form.message,
      pageUrl: form.pageUrl,
      userId: user.id,
      submittedBy: profile?.username || user.email?.split('@')[0] || 'member',
    })
    setSubmitting(false)
    if (err) {
      const msg = `${err.message || ''} ${err.details || ''}`.toLowerCase()
      if (msg.includes('relation') && msg.includes('suggestions')) {
        setError('suggestions are not enabled yet. run the Phase 4 suggestions SQL in Supabase, then try again.')
      } else if (msg.includes('row-level security')) {
        setError('your session could not submit this suggestion. log out and back in, then try again.')
      } else {
        setError('something went wrong. check the required fields and try again.')
      }
      return
    }
    setSuccess(true)
    setForm({ category: SUGGESTION_CATEGORIES[0], title: '', message: '', pageUrl: '' })
  }

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '40px var(--kw-page-x)' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 10 }}>
            community
          </div>
          <h1 style={{ font: '700 32px/1 var(--kw-mono)', color: KW.text, margin: '0 0 10px' }}>community.</h1>
          <div style={{ font: '400 12px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 620 }}>
            keebwiki is still small and deliberately curated. Reach the project directly by email, or use the form below for feature ideas, wiki topics, and bug reports.
          </div>
        </div>

        <div style={{ marginBottom: 18, background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18 }}>
          <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>contact.</div>
          <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3 }}>
            Reach the project at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: KW.lavender, textDecoration: 'none' }}>
              {CONTACT_EMAIL}
            </a>
            .
          </div>
        </div>

        <div style={{ font: '700 9px var(--kw-mono)', color: KW.pink, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 14 }}>
          suggestions
        </div>

        <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, maxWidth: 640, marginBottom: 16 }}>
          Help shape the archive before launch. Suggestions stay private to the moderation team and are used to plan cleanup, wiki topics, and community features.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-wiki-sections)', gap: 12, marginBottom: 18 }}>
          {SUGGESTION_CATEGORIES.map(category => (
            <CategoryButton
              key={category}
              category={category}
              active={form.category === category}
              onClick={() => set('category', category)}
            />
          ))}
        </div>

        {success && (
          <div style={{ background: KW.surface, border: `1px solid ${KW.green}`, borderRadius: 8, padding: 16, font: '400 11px/1.6 var(--kw-mono)', color: KW.green, marginBottom: 18 }}>
            suggestion submitted. thanks for helping tighten the site before launch.
          </div>
        )}

        {loading ? (
          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 20, font: '400 11px var(--kw-mono)', color: KW.text4 }}>
            checking session...
          </div>
        ) : !user ? (
          <div style={{
            background: KW.surface,
            border: `1px solid ${KW.border}`,
            borderRadius: 8,
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ font: '700 12px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>log in to submit a suggestion.</div>
              <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 560 }}>
                Suggestions are tied to member accounts so staff can keep spam out and follow up later if needed.
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate('/login', { state: { from: '/community' } })}>log in →</Button>
          </div>
        ) : (
          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 24 }}>
            <div style={{ font: '700 12px var(--kw-mono)', color: KW.lavender, marginBottom: 20 }}>submit a suggestion.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="category">
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  style={{
                    height: 33,
                    padding: '0 12px',
                    borderRadius: 6,
                    background: KW.surface2,
                    border: `1px solid ${KW.surface3}`,
                    color: KW.text,
                    font: '400 11px var(--kw-mono)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {SUGGESTION_CATEGORIES.map(category => <option key={category} value={category} style={{ background: KW.surface, color: KW.text }}>{category}</option>)}
                </select>
              </Field>
              <Field label="title">
                <TextInput value={form.title} onChange={value => set('title', value)} placeholder="short version of the idea" />
              </Field>
              <Field label="message">
                <TextArea value={form.message} onChange={value => set('message', value)} placeholder="what should change, what feels confusing, or what would help?" />
              </Field>
              <Field label="page url (optional)">
                <TextInput value={form.pageUrl} onChange={value => set('pageUrl', value)} placeholder="paste the page this relates to, if any" />
              </Field>
            </div>
            {error && <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.pink, marginTop: 14 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <Button onClick={handleSubmit} disabled={submitting || loading}>{submitting ? 'submitting...' : 'submit suggestion →'}</Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

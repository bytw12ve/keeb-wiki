/* built by twelve. — bytw12ve */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'
import { fetchOwnWikiArticles, updateOwnWikiArticle } from '../lib/supabase.js'

const CATEGORIES = ['beginner-guides','modding-guides','parts-glossary','sound-feel','community-buying','about']

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ font: '400 10px var(--kw-mono)', color: KW.text3, letterSpacing: '.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 24, marginBottom: 14 }}>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.lavender, marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px var(--kw-mono)', outline: 'none' }} />
}

function SectionEditor({ section, index, onUpdate, onRemove }) {
  return (
    <div style={{ background: KW.surface2, border: `1px solid ${KW.surface3}`, borderRadius: 6, padding: 16, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ font: '700 10px var(--kw-mono)', color: KW.text3 }}>section {index + 1}</span>
        {index > 0 && <button onClick={onRemove} style={{ background: 'none', border: 'none', font: '400 10px var(--kw-mono)', color: KW.text4, cursor: 'pointer' }}>remove</button>}
      </div>
      <TextInput value={section.heading} onChange={v => onUpdate({ ...section, heading: v })} placeholder="section heading" />
      <textarea value={section.content} onChange={e => onUpdate({ ...section, content: e.target.value })} rows={5} placeholder="section content..." style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: 6, background: KW.surface, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px/1.6 var(--kw-mono)', outline: 'none', resize: 'vertical' }} />
    </div>
  )
}

export default function WikiEditPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [sections, setSections] = useState([])
  const [combined, setCombined] = useState('')
  const [tagText, setTagText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOwnWikiArticles(user.id).then(({ data }) => {
      const found = data.find(a => a.slug === slug)
      if (found) {
        setArticle(found)
        setSections((found.content || []).map(s => ({ heading: s.heading || '', content: s.body || '' })))
        setCombined(found.combined_content || '')
        setTagText((found.tags || []).join(', '))
      }
      setLoading(false)
    })
  }, [slug, user.id])

  const set = (k, v) => setArticle(a => ({ ...a, [k]: v }))
  const addSection = () => setSections(s => [...s, { heading: '', content: '' }])
  const updateSection = (i, val) => setSections(s => { const next = [...s]; next[i] = val; return next })
  const removeSection = (i) => setSections(s => s.filter((_, idx) => idx !== i))

  const save = async () => {
    if (saving) return
    if (!article.title?.trim() || !article.category) {
      setError('title and category are required.')
      return
    }
    const tags = tagText.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    const patch = {
      title: article.title.trim(),
      category: article.category,
      short_description: article.short_description?.trim() || '',
      tags: [...new Set(tags)],
      format: article.format,
      content: article.format === 'sections'
        ? sections.map(s => ({ heading: s.heading.trim(), body: s.content.trim() })).filter(s => s.heading || s.body)
        : null,
      combined_content: article.format === 'combined' ? combined.trim() : null,
      status: 'pending',
    }
    if (article.format === 'sections' && !patch.content.length) {
      setError('add at least one section.')
      return
    }
    if (article.format === 'combined' && !patch.combined_content) {
      setError('article content is required.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await updateOwnWikiArticle(article.id, patch)
    setSaving(false)
    if (err) setError('could not save article.')
    else navigate('/profile')
  }

  if (loading) return <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center', color: KW.text4, font: '400 11px var(--kw-mono)' }}>loading article...</div>
  if (!article) return <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center', color: KW.text, font: '700 18px var(--kw-mono)' }}>article not found.</div>

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px', maxWidth: 860, width: '100%' }}>
        <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>edit wiki article.</h1>
        <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: '0 0 28px' }}>changes go back to pending review.</p>
        <FormSection title="article info.">
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-form)', gap: 12, marginBottom: 12 }}>
            <Field label="title"><TextInput value={article.title} onChange={v => set('title', v)} /></Field>
            <Field label="category">
              <select value={article.category} onChange={e => set('category', e.target.value)} style={{ height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px var(--kw-mono)' }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: KW.surface, color: KW.text }}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="short description"><TextInput value={article.short_description} onChange={v => set('short_description', v)} /></Field>
          <div style={{ height: 12 }} />
          <Field label="tags"><TextInput value={tagText} onChange={setTagText} placeholder="comma separated tags" /></Field>
        </FormSection>
        <FormSection title="content.">
          {article.format === 'sections' ? (
            <>
              {sections.map((s, i) => <SectionEditor key={i} section={s} index={i} onUpdate={v => updateSection(i, v)} onRemove={() => removeSection(i)} />)}
              <button onClick={addSection} style={{ height: 28, padding: '0 14px', borderRadius: 6, border: `1px solid ${KW.surface3}`, background: KW.surface2, color: KW.text3, font: '400 10px var(--kw-mono)', cursor: 'pointer' }}>+ add section</button>
            </>
          ) : (
            <textarea value={combined} onChange={e => setCombined(e.target.value)} rows={12} style={{ width: '100%', padding: '12px 14px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px/1.7 var(--kw-mono)', outline: 'none', resize: 'vertical' }} />
          )}
        </FormSection>
        {error && <div style={{ font: '400 10px var(--kw-mono)', color: KW.pink, textAlign: 'right', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={() => navigate('/profile')} style={{ height: 33, padding: '0 18px', borderRadius: 6, background: 'transparent', border: `1px solid ${KW.surface3}`, color: KW.text3, font: '400 11px var(--kw-mono)', cursor: 'pointer' }}>cancel</button>
          <Button onClick={save} disabled={saving}>{saving ? 'saving...' : 'save changes →'}</Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

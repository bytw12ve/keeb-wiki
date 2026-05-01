import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { submitWikiArticle } from '../lib/supabase.js'

const CATEGORIES = ['beginner guides','modding guides','parts glossary','sound & feel','community & buying','about']
const TAGS = ['beginner friendly','advanced','modding','linear','tactile','clicky','sound','buying guide']

function FormSection({ title, children }) {
  return (
    <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 24, marginBottom: 14 }}>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.lavender, marginBottom: 20, letterSpacing: '.02em' }}>{title}</div>
      {children}
    </div>
  )
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
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${focus ? KW.lavender : KW.surface3}`, color: KW.text, font: '400 11px var(--kw-mono)', outline: 'none', transition: 'border-color .18s', ...style }} />
  )
}

function SelectInput({ value, onChange, options, placeholder }) {
  const [focus, setFocus] = useState(false)
  return (
    <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${focus ? KW.lavender : KW.surface3}`, color: value ? KW.text : KW.text4, font: '400 11px var(--kw-mono)', outline: 'none', transition: 'border-color .18s', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o} style={{ background: KW.surface, color: KW.text }}>{o}</option>)}
    </select>
  )
}

function TagPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '0 13px', height: 26, borderRadius: 20,
      border: `1px solid ${active ? KW.lavender : KW.surface3}`,
      background: active ? KW.lavender : KW.surface2,
      color: active ? KW.bg : KW.text3,
      font: `${active ? 700 : 400} 10px var(--kw-mono)`, cursor: 'pointer', transition: 'all .18s',
    }}>{label}</button>
  )
}

function FormatCard({ id, title, desc, selected, onSelect }) {
  return (
    <div onClick={onSelect} style={{
      flex: 1, background: selected ? KW.surface3 : KW.surface2,
      border: `1px solid ${selected ? KW.lavender : KW.surface3}`,
      borderRadius: 8, padding: 18, cursor: 'pointer', transition: 'all .18s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${selected ? KW.lavender : KW.text4}`, background: selected ? KW.lavender : 'transparent', transition: 'all .18s', flexShrink: 0 }} />
        <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{title}</div>
      </div>
      <div style={{ font: '400 10px/1.6 var(--kw-mono)', color: KW.text3 }}>{desc}</div>
    </div>
  )
}

function SectionEditor({ section, index, onUpdate, onRemove, isFirst }) {
  const [headFocus, setHeadFocus] = useState(false)
  const [bodyFocus, setBodyFocus] = useState(false)
  return (
    <div style={{ background: KW.surface2, border: `1px solid ${KW.surface3}`, borderRadius: 6, padding: 16, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ font: '700 10px var(--kw-mono)', color: KW.text3 }}>section {index + 1}</span>
        {!isFirst && (
          <button onClick={onRemove} style={{ background: 'none', border: 'none', font: '400 10px var(--kw-mono)', color: KW.text4, cursor: 'pointer', padding: 0 }}>remove</button>
        )}
      </div>
      <input value={section.heading} onChange={e => onUpdate({ ...section, heading: e.target.value })}
        placeholder="section heading e.g. what you'll need"
        onFocus={() => setHeadFocus(true)} onBlur={() => setHeadFocus(false)}
        style={{ width: '100%', height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface, border: `1px solid ${headFocus ? KW.lavender : KW.surface3}`, color: KW.text, font: '400 11px var(--kw-mono)', outline: 'none', transition: 'border-color .18s', marginBottom: 8, boxSizing: 'border-box' }} />
      <textarea value={section.content} onChange={e => onUpdate({ ...section, content: e.target.value })}
        placeholder="section content..."
        rows={4}
        onFocus={() => setBodyFocus(true)} onBlur={() => setBodyFocus(false)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: KW.surface, border: `1px solid ${bodyFocus ? KW.lavender : KW.surface3}`, color: KW.text, font: '400 11px/1.6 var(--kw-mono)', outline: 'none', resize: 'vertical', transition: 'border-color .18s', boxSizing: 'border-box', fontFamily: 'var(--kw-mono)' }} />
    </div>
  )
}

export default function SubmitWikiPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', category: '', description: '', tags: [], format: 'sections' })
  const [sections, setSections] = useState([{ heading: '', content: '' }, { heading: '', content: '' }])
  const [combined, setCombined] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleTag = (t) => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }))

  const addSection = () => setSections(s => [...s, { heading: '', content: '' }])
  const removeSection = (i) => setSections(s => s.filter((_, idx) => idx !== i))
  const updateSection = (i, val) => setSections(s => { const next = [...s]; next[i] = val; return next })

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await submitWikiArticle({
      title: form.title,
      category: form.category,
      description: form.description,
      tags: form.tags,
      format: form.format,
      sections,
      combined,
    })
    setSubmitting(false)
    if (err) {
      setError('something went wrong. please try again.')
    } else {
      setSuccess(true)
    }
  }

  if (success) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ font: '700 22px var(--kw-mono)', color: KW.text }}>article submitted for review.</div>
        <div style={{ font: '400 11px var(--kw-mono)', color: KW.text3 }}>we'll review it and let you know when it goes live.</div>
        <button onClick={() => navigate('/wiki')} style={{ background: 'none', border: 'none', font: '400 11px var(--kw-mono)', color: KW.lavender, cursor: 'pointer' }}>← back to wiki</button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px 40px 40px', maxWidth: 860, width: '100%' }}>
        <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>submit a wiki article.</h1>
        <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: '0 0 28px' }}>
          share your knowledge with the community. articles are reviewed before going live.
        </p>

        {/* Article info */}
        <FormSection title="article info.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="article title">
                <TextInput value={form.title} onChange={v => set('title', v)} placeholder="e.g. how to lube switches" />
              </Field>
              <Field label="category">
                <SelectInput value={form.category} onChange={v => set('category', v)} options={CATEGORIES} placeholder="select category" />
              </Field>
            </div>
            <Field label="short description">
              <TextInput value={form.description} onChange={v => set('description', v)} placeholder="one sentence summary shown on the wiki landing page" />
            </Field>
            <Field label="tags">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TAGS.map(t => (
                  <TagPill key={t} label={t} active={form.tags.includes(t)} onClick={() => toggleTag(t)} />
                ))}
              </div>
            </Field>
          </div>
        </FormSection>

        {/* Format */}
        <FormSection title="choose your format.">
          <div style={{ display: 'flex', gap: 12 }}>
            <FormatCard id="sections" title="sections" selected={form.format === 'sections'} onSelect={() => set('format', 'sections')}
              desc="write each part in separate sections. great for step by step guides and structured content." />
            <FormatCard id="combined" title="combined" selected={form.format === 'combined'} onSelect={() => set('format', 'combined')}
              desc="write everything in one continuous article. great for long form explainers and glossary entries." />
          </div>
        </FormSection>

        {/* Content */}
        <FormSection title={`content — ${form.format === 'sections' ? 'sections' : 'article'}.`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span />
            {form.format === 'sections' && (
              <button onClick={addSection} style={{
                height: 28, padding: '0 14px', borderRadius: 6, border: `1px solid ${KW.surface3}`,
                background: KW.surface2, color: KW.text3, font: '400 10px var(--kw-mono)', cursor: 'pointer',
              }}>+ add section</button>
            )}
          </div>

          {form.format === 'sections' && (
            <>
              <div style={{ borderLeft: `3px solid ${KW.lavender}`, padding: '8px 14px', background: '#2D1F4A22', borderRadius: '0 4px 4px 0', marginBottom: 14, font: '400 10px/1.6 var(--kw-mono)', color: KW.text3 }}>
                tip: each section gets its own bubble on the article page. keep headings short and punchy.
              </div>
              {sections.map((s, i) => (
                <SectionEditor key={i} section={s} index={i} isFirst={i === 0}
                  onUpdate={val => updateSection(i, val)} onRemove={() => removeSection(i)} />
              ))}
            </>
          )}

          {form.format === 'combined' && (
            <textarea value={combined} onChange={e => setCombined(e.target.value)}
              placeholder="write your full article here..."
              rows={12}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px/1.7 var(--kw-mono)', outline: 'none', resize: 'vertical', transition: 'border-color .18s', boxSizing: 'border-box', fontFamily: 'var(--kw-mono)' }}
              onFocus={e => e.target.style.borderColor = KW.lavender}
              onBlur={e => e.target.style.borderColor = KW.surface3}
            />
          )}
        </FormSection>

        {/* Actions */}
        {error && (
          <div style={{ font: '400 10px var(--kw-mono)', color: '#f87171', textAlign: 'right', marginBottom: 8 }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button style={{ height: 33, padding: '0 18px', borderRadius: 6, background: 'transparent', border: `1px solid ${KW.surface3}`, color: KW.text3, font: '400 11px var(--kw-mono)', cursor: 'pointer' }}>
            save draft
          </button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'submitting...' : 'submit for review →'}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

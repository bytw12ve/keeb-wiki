import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

/* built by twelve. — bytw12ve */

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const LAYOUTS = ['40%','60%','65%','75%','TKL','WKL','Full']
const MATERIALS = ['Aluminum','Polycarbonate','Steel','Brass','Carbon Fiber','POM','Acrylic']
const PLATES = ['Aluminum','Brass','Polycarbonate','FR4','Carbon Fiber','POM','PE','Copper']
const SWITCH_TYPES = ['linear','tactile','clicky']
const SOUND_SIGS = ['thocky','clacky','muted','poppy','creamy']
const TYPING_FEELS = ['smooth','light','heavy','fast','bouncy']
const SOUND_LEVELS = ['quiet','medium','loud']
const PHOTO_TYPES = ['image/jpeg','image/png','image/webp','image/gif']

function FormSection({ title, children }) {
  return (
    <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 24, marginBottom: 14 }}>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.lavender, marginBottom: 20, letterSpacing: '.02em' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children, half }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...(half ? {} : {}) }}>
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

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => onChange(!checked)} style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', padding: 0,
        background: checked ? KW.lavender : KW.surface3, transition: 'background .18s', position: 'relative',
      }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: KW.bg, transition: 'left .18s' }} />
      </button>
      <span style={{ font: '400 11px var(--kw-mono)', color: checked ? KW.text : KW.text4 }}>{checked ? 'yes' : 'no'}</span>
    </div>
  )
}

function MultiToggle({ options, selected, onToggle, single }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = single ? selected === o : selected.includes(o)
        return (
          <button key={o} onClick={() => onToggle(o)} style={{
            padding: '0 13px', height: 24, borderRadius: 20,
            border: `1px solid ${active ? KW.lavender : KW.surface3}`,
            background: active ? KW.lavender : KW.surface2,
            color: active ? KW.bg : KW.text3,
            font: `${active ? 700 : 400} 10px var(--kw-mono)`, cursor: 'pointer',
            transition: 'all .18s',
          }}>{o}</button>
        )
      })}
    </div>
  )
}

function RatingPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const active = value === n
        return (
          <button key={n} onClick={() => onChange(n)} style={{
            width: 28, height: 28, borderRadius: 6, border: `1px solid ${active ? KW.lavender : KW.surface3}`,
            background: active ? KW.lavender : KW.surface2, color: active ? KW.bg : KW.text3,
            font: `${active ? 700 : 400} 10px var(--kw-mono)`, cursor: 'pointer', transition: 'all .18s',
          }}>{n}</button>
        )
      })}
    </div>
  )
}

function PhotoSlot({ photo, onAdd, onRemove, index }) {
  const [dragOver, setDragOver] = useState(false)
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onAdd(f, index) }}
      style={{
        paddingTop: '75%', position: 'relative', borderRadius: 6, overflow: 'hidden',
        border: `1px dashed ${dragOver ? KW.lavender : photo ? 'transparent' : KW.surface3}`,
        background: photo ? 'transparent' : KW.surface2, cursor: 'pointer', transition: 'border-color .18s',
      }}
      onClick={() => { if (!photo) { const el = document.getElementById(`photo-input-${index}`); el && el.click() } }}
    >
      {photo
        ? <img src={photo.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>add photo</span>
          </div>
      }
      {photo && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(index) }} style={{
          position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(30,27,46,.85)', border: 'none', color: KW.text3, cursor: 'pointer',
          font: '400 11px var(--kw-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      )}
      <input id={`photo-input-${index}`} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files[0]; if (f) onAdd(f, index) }} />
    </div>
  )
}

export default function SubmitBuildPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', layout: '', case_material: '', case_color: '',
    plate: '', switches: '', switch_type: '', keycaps: '', mods: '',
    lubed: false, lube_type: '', filmed: false, film_brand: '',
    sound_signature: [], typing_feel: [], sound_level: '',
    builder_notes: '', rating: null,
  })
  const [photos, setPhotos] = useState(Array(6).fill(null))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }))

  const addPhoto = (file, idx) => {
    if (!PHOTO_TYPES.includes(file.type)) {
      setError('photos must be jpg, png, webp, or gif.')
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('photos must be 5MB or smaller.')
      return
    }
    setError('')
    const preview = URL.createObjectURL(file)
    setPhotos(p => { const next = [...p]; next[idx] = { file, preview }; return next })
  }
  const removePhoto = (idx) => setPhotos(p => { const next = [...p]; next[idx] = null; return next })

  const photoCount = photos.filter(Boolean).length

  const handleSubmit = async () => {
    if (submitting) return
    if (!form.name.trim()) {
      setError('keyboard name is required.')
      return
    }
    if (!form.switch_type) {
      setError('switch type is required for filtering.')
      return
    }
    if (photos.some(photo => photo && !PHOTO_TYPES.includes(photo.file.type))) {
      setError('photos must be jpg, png, webp, or gif.')
      return
    }
    if (photos.some(photo => photo?.file?.size > MAX_PHOTO_SIZE)) {
      setError('photos must be 5MB or smaller.')
      return
    }
    setSubmitting(true)
    setError('')
    const uploadedPaths = []
    try {
      const photoUrls = []
      for (const photo of photos) {
        if (!photo) continue
        const ext = photo.file.name.split('.').pop().toLowerCase()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: up, error: uploadError } = await supabase.storage.from('build-photos').upload(path, photo.file, {
          contentType: photo.file.type,
          upsert: false,
        })
        if (uploadError) throw uploadError
        uploadedPaths.push(path)
        if (up) {
          const { data: url } = supabase.storage.from('build-photos').getPublicUrl(path)
          if (url) photoUrls.push(url.publicUrl)
        }
      }

      const payload = {
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])),
        photos: photoUrls,
        switch_type: form.switch_type,
        status: 'pending',
        user_id: user.id,
        submitted_by: profile?.username || user.email?.split('@')[0] || 'member',
      }
      const { error: insertError } = await supabase.from('builds').insert(payload)
      if (insertError) throw insertError
      setSuccess(true)
    } catch (e) {
      console.error(e)
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('build-photos').remove(uploadedPaths)
      }
      setError('something went wrong submitting this build.')
    }
    setSubmitting(false)
  }

  if (success) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
        <div style={{ font: '700 22px var(--kw-mono)', color: KW.text }}>build submitted for review.</div>
        <div style={{ font: '400 11px var(--kw-mono)', color: KW.text3 }}>it will show publicly after it is published.</div>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', font: '400 11px var(--kw-mono)', color: KW.lavender, cursor: 'pointer' }}>view your profile →</button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px', maxWidth: 860, width: '100%' }}>
        <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>submit your build.</h1>
        <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: '0 0 28px' }}>
          document your build and send it for review. fill in as much as you can.
        </p>

        {/* Build specs */}
        <FormSection title="build specs.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="keyboard name">
              <TextInput value={form.name} onChange={v => set('name', v)} placeholder="e.g. Satisfaction75" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-form)', gap: 12 }}>
              <Field label="layout"><SelectInput value={form.layout} onChange={v => set('layout', v)} options={LAYOUTS} placeholder="select layout" /></Field>
              <Field label="case color"><TextInput value={form.case_color} onChange={v => set('case_color', v)} placeholder="e.g. Iced Silver" /></Field>
              <Field label="case material"><SelectInput value={form.case_material} onChange={v => set('case_material', v)} options={MATERIALS} placeholder="select material" /></Field>
              <Field label="plate material"><SelectInput value={form.plate} onChange={v => set('plate', v)} options={PLATES} placeholder="select plate" /></Field>
              <Field label="switches"><TextInput value={form.switches} onChange={v => set('switches', v)} placeholder="e.g. Gateron Yellow" /></Field>
              <Field label="switch type"><SelectInput value={form.switch_type} onChange={v => set('switch_type', v)} options={SWITCH_TYPES} placeholder="select switch type" /></Field>
              <Field label="keycaps"><TextInput value={form.keycaps} onChange={v => set('keycaps', v)} placeholder="e.g. GMK Olivia" /></Field>
              <Field label="mods"><TextInput value={form.mods} onChange={v => set('mods', v)} placeholder="e.g. tape mod, PE foam" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-form)', gap: 12 }}>
              <Field label="lubed?">
                <Toggle checked={form.lubed} onChange={v => set('lubed', v)} />
                {form.lubed && <TextInput value={form.lube_type} onChange={v => set('lube_type', v)} placeholder="e.g. Krytox 205g0" style={{ marginTop: 6 }} />}
              </Field>
              <Field label="filmed?">
                <Toggle checked={form.filmed} onChange={v => set('filmed', v)} />
                {form.filmed && <TextInput value={form.film_brand} onChange={v => set('film_brand', v)} placeholder="e.g. Deskeys" style={{ marginTop: 6 }} />}
              </Field>
            </div>
          </div>
        </FormSection>

        {/* Sound & feel */}
        <FormSection title="sound & feel profile.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="sound signature">
              <MultiToggle options={SOUND_SIGS} selected={form.sound_signature} onToggle={v => toggleArr('sound_signature', v)} />
            </Field>
            <Field label="typing feel">
              <MultiToggle options={TYPING_FEELS} selected={form.typing_feel} onToggle={v => toggleArr('typing_feel', v)} />
            </Field>
            <Field label="sound level">
              <MultiToggle options={SOUND_LEVELS} selected={form.sound_level} onToggle={v => set('sound_level', v)} single />
            </Field>
          </div>
        </FormSection>

        {/* Builder's notes */}
        <FormSection title="builder's notes.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="your write up">
              <textarea
                value={form.builder_notes}
                onChange={e => set('builder_notes', e.target.value)}
                placeholder="tell the community about your build — what you love, what you'd change, how long it took ..."
                rows={5}
                style={{ padding: '10px 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px/1.6 var(--kw-mono)', outline: 'none', resize: 'vertical', transition: 'border-color .18s', fontFamily: 'var(--kw-mono)' }}
                onFocus={e => e.target.style.borderColor = KW.lavender}
                onBlur={e => e.target.style.borderColor = KW.surface3}
              />
            </Field>
            <Field label="overall rating">
              <RatingPicker value={form.rating} onChange={v => set('rating', v)} />
            </Field>
          </div>
        </FormSection>

        {/* Photos */}
        <FormSection title="photos.">
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-photos)', gap: 10, marginBottom: 10 }}>
            {photos.map((p, i) => <PhotoSlot key={i} photo={p} index={i} onAdd={addPhoto} onRemove={removePhoto} />)}
          </div>
          <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4, textAlign: 'right' }}>
            {photoCount} / 6 photos added · jpg, png, webp, or gif · 5MB max each
          </div>
        </FormSection>

        {/* Actions */}
        {error && (
          <div style={{ font: '400 10px var(--kw-mono)', color: KW.pink, textAlign: 'right', marginBottom: 10 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'submitting...' : 'submit build →'}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

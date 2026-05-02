/* built by twelve. — bytw12ve */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'
import { buildRouteSlug, buildSlug, fetchOwnBuilds, supabase, updateOwnBuild } from '../lib/supabase.js'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const LAYOUTS = ['40%','60%','65%','75%','TKL','WKL','Full']
const MATERIALS = ['Aluminum','Polycarbonate','Steel','Brass','Carbon Fiber','POM','Acrylic']
const PLATES = ['Aluminum','Brass','Polycarbonate','FR4','Carbon Fiber','POM','PE','Copper']
const SWITCH_TYPES = ['linear','tactile','clicky']
const SOUND_SIGS = ['thocky','clacky','muted','poppy','creamy']
const TYPING_FEELS = ['smooth','light','heavy','fast','bouncy']
const SOUND_LEVELS = ['quiet','medium','loud']
const PHOTO_TYPES = ['image/jpeg','image/png','image/webp','image/gif']

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

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} style={{ height: 33, padding: '0 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: value ? KW.text : KW.text4, font: '400 11px var(--kw-mono)', outline: 'none' }}>
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o} style={{ background: KW.surface, color: KW.text }}>{o}</option>)}
    </select>
  )
}

function MultiToggle({ options, selected, onToggle, single }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = single ? selected === o : selected.includes(o)
        return (
          <button key={o} onClick={() => onToggle(o)} style={{ padding: '0 13px', height: 24, borderRadius: 20, border: `1px solid ${active ? KW.lavender : KW.surface3}`, background: active ? KW.lavender : KW.surface2, color: active ? KW.bg : KW.text3, font: `${active ? 700 : 400} 10px var(--kw-mono)`, cursor: 'pointer' }}>{o}</button>
        )
      })}
    </div>
  )
}

function PhotoSlot({ photo, onAdd, onRemove, index }) {
  const [dragOver, setDragOver] = useState(false)
  const inputId = `edit-photo-input-${index}`
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onAdd(f, index) }}
      onClick={() => { const el = document.getElementById(inputId); el && el.click() }}
      style={{
        paddingTop: '75%', position: 'relative', borderRadius: 6, overflow: 'hidden',
        border: `1px dashed ${dragOver ? KW.lavender : photo ? 'transparent' : KW.surface3}`,
        background: photo ? 'transparent' : KW.surface2, cursor: 'pointer', transition: 'border-color .18s',
      }}
    >
      {photo
        ? <img src={photo.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>add photo</span>
          </div>
      }
      {photo && (
        <>
          <div style={{
            position: 'absolute', left: 6, bottom: 6, borderRadius: 4, padding: '3px 6px',
            background: 'rgba(30,27,46,.82)', color: KW.text3, font: '400 9px var(--kw-mono)',
          }}>{photo.file ? 'new' : 'replace'}</div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(index) }} style={{
            position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(30,27,46,.85)', border: 'none', color: KW.text3, cursor: 'pointer',
            font: '400 11px var(--kw-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </>
      )}
      <input id={inputId} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files[0]; if (f) onAdd(f, index); e.target.value = '' }} />
    </div>
  )
}

function buildPhotoSlots(urls) {
  const slots = Array(6).fill(null)
  ;(urls || []).filter(Boolean).slice(0, 6).forEach((url, i) => {
    slots[i] = { url, preview: url }
  })
  return slots
}

function storagePathFromPublicUrl(url) {
  const marker = '/storage/v1/object/public/build-photos/'
  const idx = String(url || '').indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(String(url).slice(idx + marker.length).split('?')[0])
}

export default function BuildEditPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState(Array(6).fill(null))
  const [originalPhotoUrls, setOriginalPhotoUrls] = useState([])
  const previewUrls = useRef(new Set())

  useEffect(() => {
    fetchOwnBuilds(user.id).then(({ data }) => {
      const build = data.find(b => buildRouteSlug(b) === slug || buildSlug(b.name) === slug)
      setForm(build || null)
      const urls = (build?.photos || []).filter(Boolean)
      setOriginalPhotoUrls(urls)
      setPhotos(buildPhotoSlots(urls))
      setLoading(false)
    })
  }, [slug, user.id])

  useEffect(() => {
    return () => {
      previewUrls.current.forEach(url => URL.revokeObjectURL(url))
      previewUrls.current.clear()
    }
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k]?.includes(v) ? f[k].filter(x => x !== v) : [...(f[k] || []), v] }))

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
    previewUrls.current.add(preview)
    setPhotos(p => {
      const next = [...p]
      if (next[idx]?.file && next[idx]?.preview) {
        URL.revokeObjectURL(next[idx].preview)
        previewUrls.current.delete(next[idx].preview)
      }
      next[idx] = { file, preview }
      return next
    })
  }

  const removePhoto = (idx) => setPhotos(p => {
    const next = [...p]
    if (next[idx]?.file && next[idx]?.preview) {
      URL.revokeObjectURL(next[idx].preview)
      previewUrls.current.delete(next[idx].preview)
    }
    next[idx] = null
    return next
  })

  const save = async () => {
    if (saving) return
    if (!form.name?.trim() || !form.switch_type) {
      setError('keyboard name and switch type are required.')
      return
    }
    setSaving(true)
    setError('')
    const uploadedPaths = []
    const patch = {
      name: form.name.trim(),
      layout: form.layout,
      case_material: form.case_material,
      case_color: form.case_color,
      plate: form.plate,
      switches: form.switches,
      switch_type: form.switch_type,
      keycaps: form.keycaps,
      mods: form.mods,
      lubed: form.lubed,
      lube_type: form.lube_type,
      filmed: form.filmed,
      film_brand: form.film_brand,
      sound_signature: form.sound_signature || [],
      typing_feel: form.typing_feel || [],
      sound_level: form.sound_level,
      builder_notes: form.builder_notes,
      rating: form.rating,
      status: 'pending',
    }
    try {
      const finalPhotoUrls = []
      for (const photo of photos) {
        if (!photo) continue
        if (photo.url) {
          finalPhotoUrls.push(photo.url)
          continue
        }
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
          if (url?.publicUrl) finalPhotoUrls.push(url.publicUrl)
        }
      }
      const { error: err } = await updateOwnBuild(form.id, { ...patch, photos: finalPhotoUrls })
      if (err) throw err

      const removedPaths = originalPhotoUrls
        .filter(url => !finalPhotoUrls.includes(url))
        .map(storagePathFromPublicUrl)
        .filter(Boolean)
      if (removedPaths.length > 0) {
        await supabase.storage.from('build-photos').remove(removedPaths)
      }
      setSaving(false)
      navigate('/profile')
    } catch (e) {
      console.error(e)
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('build-photos').remove(uploadedPaths)
      }
      const msg = `${e?.message || ''} ${e?.details || ''}`.toLowerCase()
      if (msg.includes('row-level security')) setError('your session could not save these photos. log out and back in, then try again.')
      else setError('could not save build.')
      setSaving(false)
    }
  }

  if (loading) return <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center', color: KW.text4, font: '400 11px var(--kw-mono)' }}>loading build...</div>
  if (!form) return <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center', color: KW.text, font: '700 18px var(--kw-mono)' }}>build not found.</div>

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px', maxWidth: 860, width: '100%' }}>
        <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>edit build.</h1>
        <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: '0 0 28px' }}>changes go back to pending review.</p>
        <FormSection title="build specs.">
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-form)', gap: 12 }}>
            <Field label="keyboard name"><TextInput value={form.name} onChange={v => set('name', v)} /></Field>
            <Field label="layout"><SelectInput value={form.layout} onChange={v => set('layout', v)} options={LAYOUTS} placeholder="select layout" /></Field>
            <Field label="case material"><SelectInput value={form.case_material} onChange={v => set('case_material', v)} options={MATERIALS} placeholder="select material" /></Field>
            <Field label="case color"><TextInput value={form.case_color} onChange={v => set('case_color', v)} /></Field>
            <Field label="plate"><SelectInput value={form.plate} onChange={v => set('plate', v)} options={PLATES} placeholder="select plate" /></Field>
            <Field label="switches"><TextInput value={form.switches} onChange={v => set('switches', v)} /></Field>
            <Field label="switch type"><SelectInput value={form.switch_type} onChange={v => set('switch_type', v)} options={SWITCH_TYPES} placeholder="select switch type" /></Field>
            <Field label="keycaps"><TextInput value={form.keycaps} onChange={v => set('keycaps', v)} /></Field>
            <Field label="mods"><TextInput value={form.mods} onChange={v => set('mods', v)} /></Field>
          </div>
        </FormSection>
        <FormSection title="sound & feel.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="sound signature"><MultiToggle options={SOUND_SIGS} selected={form.sound_signature || []} onToggle={v => toggleArr('sound_signature', v)} /></Field>
            <Field label="typing feel"><MultiToggle options={TYPING_FEELS} selected={form.typing_feel || []} onToggle={v => toggleArr('typing_feel', v)} /></Field>
            <Field label="sound level"><MultiToggle options={SOUND_LEVELS} selected={form.sound_level || ''} onToggle={v => set('sound_level', v)} single /></Field>
          </div>
        </FormSection>
        <FormSection title="builder's notes.">
          <textarea value={form.builder_notes || ''} onChange={e => set('builder_notes', e.target.value)} rows={6} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: KW.surface2, border: `1px solid ${KW.surface3}`, color: KW.text, font: '400 11px/1.6 var(--kw-mono)', outline: 'none', resize: 'vertical' }} />
        </FormSection>
        <FormSection title="photos.">
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-photos)', gap: 10, marginBottom: 10 }}>
            {photos.map((p, i) => <PhotoSlot key={i} photo={p} index={i} onAdd={addPhoto} onRemove={removePhoto} />)}
          </div>
          <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4, textAlign: 'right' }}>
            {photos.filter(Boolean).length} / 6 photos added · click a photo to replace · jpg, png, webp, or gif · 5MB max each
          </div>
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

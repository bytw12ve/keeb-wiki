import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import KeebArt from '../components/KeebArt.jsx'
import { fetchBuildBySlug, getArt, getLayoutCode, getBuildTags } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

/* built by twelve. — bytw12ve */

function SpecRow({ k, v, last }) {
  if (!v) return null
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: last ? 'none' : `1px solid ${KW.border}`,
      font: '400 11px var(--kw-mono)', gap: 12,
    }}>
      <span style={{ color: KW.text3 }}>{k}</span>
      <span style={{ color: KW.text, textAlign: 'right' }}>{v}</span>
    </div>
  )
}

function Bubble({ title, titleColor, children, style }) {
  return (
    <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18, ...style }}>
      {title && <div style={{ font: '700 11px var(--kw-mono)', color: titleColor || KW.lavender, marginBottom: 14, letterSpacing: '.02em' }}>{title}</div>}
      {children}
    </div>
  )
}

function SoundGroup({ label, tags, kind }) {
  if (!tags || tags.length === 0) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em', marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {tags.map((t, i) => <Tag key={i} kind={kind}>{t}</Tag>)}
      </div>
    </div>
  )
}

function GalleryTile({ palette, layout, seed, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      paddingTop: '75%', borderRadius: 6, position: 'relative', overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${hover ? KW.surface3 : 'transparent'}`, transition: 'border-color .18s',
      background: 'transparent', display: 'block', width: '100%',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <KeebArt palette={palette} layout={layout} seed={seed} />
      </div>
    </button>
  )
}

function Lightbox({ photos, index, buildName, onClose, onPrev, onNext, onSelect }) {
  if (index === null || !photos[index]) return null
  const hasMultiplePhotos = photos.length > 1
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${buildName} photo gallery`}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(30,27,46,.94)',
        display: 'grid', gridTemplateRows: hasMultiplePhotos ? '48px 1fr 52px' : '48px 1fr',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${KW.border}` }}>
        <span style={{ font: '700 10px var(--kw-mono)', color: KW.text3 }}>{index + 1} / {photos.length}</span>
        <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${KW.surface3}`, background: KW.surface, color: KW.text2, font: '700 14px var(--kw-mono)', cursor: 'pointer' }}>×</button>
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ minHeight: 0, display: 'grid', gridTemplateColumns: hasMultiplePhotos ? '56px 1fr 56px' : '1fr', alignItems: 'center', gap: 12, padding: 20 }}>
        {hasMultiplePhotos && <button onClick={onPrev} style={{ height: 52, borderRadius: 8, border: `1px solid ${KW.surface3}`, background: KW.surface, color: KW.lavender, font: '700 18px var(--kw-mono)', cursor: 'pointer' }}>‹</button>}
        <img src={photos[index]} alt={`${buildName} photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', minHeight: 0 }} />
        {hasMultiplePhotos && <button onClick={onNext} style={{ height: 52, borderRadius: 8, border: `1px solid ${KW.surface3}`, background: KW.surface, color: KW.lavender, font: '700 18px var(--kw-mono)', cursor: 'pointer' }}>›</button>}
      </div>
      {hasMultiplePhotos && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, borderTop: `1px solid ${KW.border}` }}>
          {photos.map((_, i) => (
            <button key={i} onClick={() => onSelect(i)} style={{
              width: i === index ? 18 : 6, height: 6, borderRadius: 6, border: 'none',
              background: i === index ? KW.lavender : KW.surface3, padding: 0, cursor: 'pointer',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

const GALLERY_PALETTES = ['lavender','pink','blue','cream','olive','slate']

export default function DetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [build, setBuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    if (authLoading) return
    setLoading(true)
    setNotFound(false)
    setBuild(null)
    fetchBuildBySlug(slug, { ownerId: user?.id }).then(({ data, error }) => {
      if (error || !data) setNotFound(true)
      else setBuild(data)
      setLoading(false)
    })
  }, [slug, user?.id, authLoading])

  const photos = build?.photos?.filter(Boolean) || []
  const hasPhotos = photos.length > 0
  const openedFromProfile = location.state?.from === 'profile'
  const backPath = openedFromProfile ? '/profile' : '/builds'
  const backLabel = openedFromProfile ? '← back to profile' : '← back to builds'

  useEffect(() => {
    if (lightboxIndex === null || !hasPhotos) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (photos.length > 1 && e.key === 'ArrowLeft') setLightboxIndex(i => (i + photos.length - 1) % photos.length)
      if (photos.length > 1 && e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, hasPhotos, photos.length])

  if (loading) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>loading build...</span>
      </div>
      <Footer />
    </div>
  )

  if (notFound) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ font: '700 22px var(--kw-mono)', color: KW.text }}>build not found.</div>
        <button onClick={() => navigate('/builds')} style={{ background: 'none', border: 'none', font: '400 11px var(--kw-mono)', color: KW.lavender, cursor: 'pointer' }}>← back to builds</button>
      </div>
      <Footer />
    </div>
  )

  const tags = getBuildTags(build)
  const art = getArt(build)
  const layoutCode = getLayoutCode(build.layout)
  const galleryItems = hasPhotos ? photos : GALLERY_PALETTES
  const isOwnerPreview = build.user_id === user?.id && build.status && build.status !== 'published'
  const specs = [
    ['layout', build.layout],
    ['case', build.case_material],
    ['case color', build.case_color],
    ['plate', build.plate],
    ['switches', build.switches],
    ['lubed', build.lubed ? `yes${build.lube_type ? ` — ${build.lube_type}` : ''}` : 'no'],
    ['filmed', build.filmed ? `yes${build.film_brand ? ` — ${build.film_brand}` : ''}` : 'no'],
    ['keycaps', build.keycaps],
    ['mods', build.mods],
  ].filter(([, v]) => v)

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, padding: '20px var(--kw-page-x) 40px' }}>
        <a href={backPath} onClick={(e) => { e.preventDefault(); navigate(backPath) }} style={{
          font: '400 10px var(--kw-mono)', color: KW.text3, textDecoration: 'none',
          cursor: 'pointer', transition: 'color .18s', display: 'inline-block', marginBottom: 22,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
        onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
        >{backLabel}</a>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
          <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: 0 }}>{build.name}</h1>
          <div style={{ display: 'flex', gap: 5, paddingTop: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
          </div>
        </div>
        <div style={{ font: '400 11px var(--kw-mono)', color: KW.text3, marginBottom: 18 }}>
          submitted by <span style={{ color: KW.text2 }}>{build.submitted_by}</span>
          <span style={{ color: KW.text4, margin: '0 8px' }}>·</span>
          <span>{new Date(build.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        {isOwnerPreview && (
          <div style={{
            background: KW.surface,
            border: `1px solid ${KW.surface3}`,
            borderRadius: 8,
            padding: '10px 12px',
            color: KW.lavender,
            font: '400 10px/1.6 var(--kw-mono)',
            marginBottom: 18,
          }}>
            owner preview: this build is {build.status} and only visible to you while it waits for review.
          </div>
        )}

        {/* Hero image */}
        <div onClick={() => hasPhotos && setLightboxIndex(0)} style={{ height: 280, marginBottom: 18, borderRadius: 10, overflow: 'hidden', cursor: hasPhotos ? 'zoom-in' : 'default' }}>
          {hasPhotos
            ? <img src={photos[0]} alt={build.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <KeebArt palette={art} layout={layoutCode} seed={11} />
          }
        </div>

        {/* 3-column cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-details)', gap: 12, marginBottom: 32 }}>
          <Bubble title="build specs.">
            {specs.map(([k, v], i) => <SpecRow key={k} k={k} v={v} last={i === specs.length - 1} />)}
          </Bubble>

          <Bubble title="builder's notes.">
            {build.builder_notes ? (
              <div style={{ font: '400 11px/1.8 var(--kw-mono)', color: KW.text2 }}>
                {build.builder_notes.split('\n').filter(Boolean).map((p, i, arr) => (
                  <p key={i} style={{ margin: i === arr.length - 1 ? 0 : '0 0 12px' }}>{p}</p>
                ))}
              </div>
            ) : <span style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>no notes from builder.</span>}
            {build.rating && (
              <>
                <div style={{ marginTop: 6, paddingTop: 14, borderTop: `1px solid ${KW.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em' }}>OVERALL RATING</span>
                  <span style={{ font: '700 18px var(--kw-mono)', color: KW.lavender }}>
                    {build.rating}<span style={{ color: KW.text4, fontWeight: 400, fontSize: 12 }}>/10</span>
                  </span>
                </div>
              </>
            )}
          </Bubble>

          <Bubble title="sound & feel profile." titleColor={KW.lavender}>
            <SoundGroup label="SOUND SIGNATURE" tags={build.sound_signature} kind="layout" />
            <SoundGroup label="TYPING FEEL" tags={build.typing_feel} kind="layout" />
            {build.sound_level && <SoundGroup label="SOUND LEVEL" tags={[build.sound_level]} kind="layout" />}
          </Bubble>
        </div>

        {/* Gallery */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ font: '700 9px var(--kw-mono)', color: KW.text4, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 6 }}>photos</div>
            <div style={{ font: '700 16px var(--kw-mono)', color: KW.text }}>build gallery.</div>
          </div>
          <span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>
            {hasPhotos ? `${photos.length} photos` : 'procedural previews'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-photos)', gap: 10 }}>
          {galleryItems.map((item, i) => (
            typeof item === 'string' && item.startsWith('http')
              ? <button key={i} onClick={() => setLightboxIndex(i)} style={{ paddingTop: '75%', position: 'relative', borderRadius: 6, overflow: 'hidden', border: 'none', background: 'transparent', cursor: 'zoom-in' }}>
                  <img src={item} alt={`${build.name} photo ${i + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              : <GalleryTile key={i} palette={item} layout={layoutCode} seed={i * 7 + 3} />
          ))}
        </div>
      </div>
      <Lightbox
        photos={photos}
        index={lightboxIndex}
        buildName={build.name}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(i => (i + photos.length - 1) % photos.length)}
        onNext={() => setLightboxIndex(i => (i + 1) % photos.length)}
        onSelect={setLightboxIndex}
      />
      <Footer />
    </div>
  )
}

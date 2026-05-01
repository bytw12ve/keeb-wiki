import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import KeebArt from '../components/KeebArt.jsx'
import Toast, { flashToast } from '../components/Toast.jsx'
import { fetchBuildBySlug, getArt, getLayoutCode, getBuildTags } from '../lib/supabase.js'

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

function SoundTestButton({ onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: '100%', height: 32, borderRadius: 6,
      background: hover ? KW.surface2 : 'transparent',
      border: `1px solid ${hover ? KW.blue : KW.surface3}`,
      color: hover ? KW.blue : KW.text3,
      font: '700 10px var(--kw-mono)', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all .18s',
    }}>
      <span style={{ width: 0, height: 0, borderLeft: `6px solid ${hover ? KW.blue : KW.text3}`, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', transition: 'border-color .18s' }} />
      youtube sound test →
    </button>
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

function GalleryTile({ palette, layout, seed }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      paddingTop: '75%', borderRadius: 6, position: 'relative', overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${hover ? KW.surface3 : 'transparent'}`, transition: 'border-color .18s',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <KeebArt palette={palette} layout={layout} seed={seed} />
      </div>
    </div>
  )
}

const GALLERY_PALETTES = ['lavender','pink','blue','cream','olive','slate']

export default function DetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [build, setBuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    fetchBuildBySlug(slug).then(({ data, error }) => {
      if (error || !data) setNotFound(true)
      else setBuild(data)
      setLoading(false)
    })
  }, [slug])

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
      <div style={{ flex: 1, padding: '20px 40px 40px' }}>
        <a href="/builds" onClick={(e) => { e.preventDefault(); navigate('/builds') }} style={{
          font: '400 10px var(--kw-mono)', color: KW.text3, textDecoration: 'none',
          cursor: 'pointer', transition: 'color .18s', display: 'inline-block', marginBottom: 22,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
        onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
        >← back to builds</a>

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

        {/* Hero image */}
        <div style={{ height: 280, marginBottom: 18, borderRadius: 10, overflow: 'hidden' }}>
          {build.photos && build.photos.length > 0
            ? <img src={build.photos[0]} alt={build.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <KeebArt palette={art} layout={layoutCode} seed={11} />
          }
        </div>

        {/* 3-column cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
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

          <Bubble title="sound & feel profile." titleColor={KW.pink}>
            <SoundGroup label="SOUND SIGNATURE" tags={build.sound_signature} kind="materials" />
            <SoundGroup label="TYPING FEEL" tags={build.typing_feel} kind="materials" />
            {build.sound_level && <SoundGroup label="SOUND LEVEL" tags={[build.sound_level]} kind="switches" />}
            <div style={{ marginTop: 4 }}>
              <SoundTestButton onClick={() => flashToast('→ youtube sound test')} />
            </div>
          </Bubble>
        </div>

        {/* Gallery */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ font: '700 9px var(--kw-mono)', color: KW.text4, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 6 }}>photos</div>
            <div style={{ font: '700 16px var(--kw-mono)', color: KW.text }}>build gallery.</div>
          </div>
          <span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>
            {build.photos && build.photos.length > 0 ? `${build.photos.length} photos` : '6 placeholder photos'} · click to expand
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {(build.photos && build.photos.length > 0 ? build.photos : GALLERY_PALETTES).map((item, i) => (
            typeof item === 'string' && item.startsWith('http')
              ? <div key={i} style={{ paddingTop: '75%', position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
                  <img src={item} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              : <GalleryTile key={i} palette={item} layout={layoutCode} seed={i * 7 + 3} />
          ))}
        </div>
      </div>
      <Footer />
      <Toast />
    </div>
  )
}

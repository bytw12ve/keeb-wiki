import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import Pill from '../components/Pill.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import KeebArt from '../components/KeebArt.jsx'
import Toast, { flashToast } from '../components/Toast.jsx'
import { fetchBuilds, getArt, getLayoutCode, getBuildTags, buildSlug } from '../lib/supabase.js'

const FILTER_PILLS = ['all','60%','65%','75%','TKL','linear','tactile','clicky','budget','endgame']

function Hero({ q, setQ, onSearch }) {
  return (
    <div style={{ padding: '64px 40px 56px', textAlign: 'center' }}>
      <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 18 }}>
        the keyboard build archive
      </div>
      <h1 style={{ font: '700 38px/1.1 var(--kw-mono)', color: KW.text, margin: 0, letterSpacing: '-.01em' }}>
        find your next endgame.
      </h1>
      <div style={{ font: '400 13px/1.6 var(--kw-mono)', color: KW.text3, marginTop: 14, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
        browse community builds, specs, and photos.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <Input style={{ flex: 1, height: 36 }} placeholder="search builds, switches, layouts..."
          value={q} onChange={setQ} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} />
        <Button onClick={onSearch} style={{ height: 36 }}>search</Button>
      </div>
      <div style={{ marginTop: 20, font: '400 10px var(--kw-mono)', color: KW.text4, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span>247 builds in the archive</span><span>•</span><span>updated daily</span><span>•</span><span>no ads, no algorithm</span>
      </div>
    </div>
  )
}

function FeaturedCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 24px rgba(0,0,0,.3)` : 'none',
    }}>
      <div style={{ height: 168 }}><KeebArt palette={getArt(b)} layout={getLayoutCode(b.layout)} seed={b.name.length} /></div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ font: '700 16px var(--kw-mono)', color: KW.text }}>{b.name}</div>
        <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>
          by <span style={{ color: KW.text3 }}>{b.submitted_by}</span>
        </div>
      </div>
      {b.description && <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text2 }}>{b.description}</div>}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${KW.border}` }}>
        <span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>
          rated <span style={{ color: KW.text }}>{b.rating}/10</span> by builder
        </span>
        <span style={{ font: '700 11px var(--kw-mono)', color: hover ? KW.text : KW.lavender, transition: 'color .18s' }}>
          view full build →
        </span>
      </div>
    </div>
  )
}

function RecentCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 16px rgba(0,0,0,.25)` : 'none',
    }}>
      <div style={{ height: 96 }}><KeebArt palette={getArt(b)} layout={getLayoutCode(b.layout)} seed={b.name.length * 3} /></div>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{b.name}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6 }}>
        <span style={{ font: '400 9px var(--kw-mono)', color: KW.text4 }}>{b.submitted_by}</span>
        <span style={{ font: '700 10px var(--kw-mono)', color: hover ? KW.text : KW.lavender, transition: 'color .18s' }}>view build →</span>
      </div>
    </div>
  )
}

function BuildCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 16px rgba(0,0,0,.25)` : 'none',
    }}>
      <div style={{ height: 100, position: 'relative' }}>
        <KeebArt palette={getArt(b)} layout={getLayoutCode(b.layout)} seed={b.name.length * 5} />
      </div>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{b.name}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ font: '400 9px var(--kw-mono)', color: KW.text4 }}>{b.submitted_by}</span>
        <span style={{ font: '700 10px var(--kw-mono)', color: hover ? KW.text : KW.lavender, transition: 'color .18s' }}>view build →</span>
      </div>
    </div>
  )
}

function SectionHeader({ title, eyebrow, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <div>
        {eyebrow && <div style={{ font: '700 9px var(--kw-mono)', color: KW.text4, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 6 }}>{eyebrow}</div>}
        <div style={{ font: '700 16px var(--kw-mono)', color: KW.text }}>{title}</div>
      </div>
      {right}
    </div>
  )
}

function CTA({ onSubmit }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 10,
      padding: '32px 28px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 24,
    }}>
      <div>
        <div style={{ font: '700 9px var(--kw-mono)', color: KW.pink, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 10 }}>contribute.</div>
        <div style={{ font: '700 22px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>built something you're proud of?</div>
        <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 460 }}>
          document your build and add it to the archive — specs, photos, mods, and what you'd do differently next time. takes about ten minutes.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <Button onClick={onSubmit}>submit your build →</Button>
        <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>no account needed.</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtered, setFiltered] = useState(null) // null = show default sections, array = show filtered results
  const navigate = useNavigate()

  useEffect(() => {
    fetchBuilds().then(({ data }) => {
      setBuilds(data)
      setLoading(false)
    })
  }, [])

  const runFilter = useCallback(async (f, qVal) => {
    setLoading(true)
    const { data } = await fetchBuilds({ q: qVal, filter: f })
    setFiltered(data)
    setLoading(false)
  }, [])

  const onSearch = () => {
    if (!q.trim()) return
    runFilter('all', q)
  }

  const onFilterPill = (f) => {
    setFilter(f)
    if (f === 'all' && !q) { setFiltered(null); return }
    runFilter(f, q)
  }

  const featured = builds.slice(0, 2)
  const recent = builds.slice(0, 5)

  const goToBuild = (b) => navigate(`/builds/${buildSlug(b.name)}`)

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1 }}>
        <Hero q={q} setQ={setQ} onSearch={onSearch} />

        <div style={{ padding: '0 40px 40px' }}>
          {/* Filter pills */}
          <SectionHeader title="browse by." eyebrow="filter" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36 }}>
            {FILTER_PILLS.map(p => (
              <Pill key={p} active={filter === p} onClick={() => onFilterPill(p)}>{p}</Pill>
            ))}
          </div>

          {/* Filtered results */}
          {filtered !== null ? (
            <>
              <SectionHeader
                title={`${filtered.length} build${filtered.length !== 1 ? 's' : ''} found.`}
                eyebrow="results"
                right={
                  <button onClick={() => { setFiltered(null); setFilter('all'); setQ('') }} style={{
                    background: 'none', border: 'none', font: '400 10px var(--kw-mono)',
                    color: KW.text3, cursor: 'pointer', padding: 0
                  }}>clear ×</button>
                }
              />
              {loading ? (
                <div style={{ font: '400 11px var(--kw-mono)', color: KW.text4, padding: '24px 0' }}>searching...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 36 }}>
                  {filtered.map((b, i) => <BuildCard key={b.id || i} b={b} onClick={() => goToBuild(b)} />)}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Featured builds */}
              <SectionHeader title="featured builds." eyebrow="staff picks"
                right={<span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>2 of the week</span>} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
                {loading
                  ? [0,1].map(i => <div key={i} style={{ height: 320, background: KW.surface, borderRadius: 8, border: `1px solid ${KW.border}` }} />)
                  : featured.map((b, i) => <FeaturedCard key={b.id || i} b={b} onClick={() => goToBuild(b)} />)
                }
              </div>

              {/* Recent builds */}
              <SectionHeader title="recent builds." eyebrow="just submitted"
                right={<a onClick={() => navigate('/builds')} style={{ font: '400 11px var(--kw-mono)', color: KW.lavender, cursor: 'pointer', textDecoration: 'none' }}>view all →</a>} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 36 }}>
                {loading
                  ? [0,1,2,3,4].map(i => <div key={i} style={{ height: 200, background: KW.surface, borderRadius: 8, border: `1px solid ${KW.border}` }} />)
                  : recent.map((b, i) => <RecentCard key={b.id || i} b={b} onClick={() => goToBuild(b)} />)
                }
              </div>
            </>
          )}

          <CTA onSubmit={() => navigate('/submit')} />
        </div>
      </div>
      <Footer />
      <Toast />
    </div>
  )
}

/* built by twelve. */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import BuildVisual from '../components/BuildVisual.jsx'
import Toast from '../components/Toast.jsx'
import { fetchBuilds, fetchStaffPickBuilds, getBuildTags, buildRouteSlug } from '../lib/supabase.js'

function Hero({ q, setQ, onSearch, buildCount }) {
  return (
    <div style={{ padding: '64px var(--kw-page-x) 56px', textAlign: 'center' }}>
      <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 18 }}>
        the keyboard build archive
      </div>
      <h1 style={{ font: '700 38px/1.1 var(--kw-mono)', color: KW.text, margin: 0, letterSpacing: '-.01em' }}>
        find your next endgame.
      </h1>
      <div style={{ font: '400 13px/1.6 var(--kw-mono)', color: KW.text3, marginTop: 14, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
        browse community builds, specs, and photos.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', flexWrap: 'wrap' }}>
        <Input style={{ flex: 1, height: 36 }} placeholder="search builds, switches, layouts..."
          value={q} onChange={setQ} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} />
        <Button onClick={onSearch} style={{ height: 36 }}>search</Button>
      </div>
      <div style={{ marginTop: 20, font: '400 10px var(--kw-mono)', color: KW.text4, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span>{buildCount ?? '—'} builds in the archive</span><span>•</span><span>community moderated</span><span>•</span><span>no ads, no algorithm</span>
      </div>
    </div>
  )
}

function FeaturedCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  const submittedBy = b.submitted_by || 'community builder'
  const summary = b.description || b.builder_notes
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: 390,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 24px rgba(0,0,0,.3)` : 'none',
    }}>
      <div style={{ height: 168 }}><BuildVisual build={b} seed={(b.name || '').length} /></div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ font: '700 16px var(--kw-mono)', color: KW.text }}>{b.name}</div>
        <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>
          by <span style={{ color: KW.text3 }}>{submittedBy}</span>
        </div>
      </div>
      <div style={{
        minHeight: 76,
        font: '400 11px/1.7 var(--kw-mono)',
        color: summary ? KW.text2 : KW.text4,
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {summary || 'no builder notes yet.'}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', minHeight: 18, alignContent: 'flex-start' }}>
        {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${KW.border}`, marginTop: 'auto' }}>
        {b.rating ? (
          <span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>
            rated <span style={{ color: KW.text }}>{b.rating}/10</span> by builder
          </span>
        ) : (
          <span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>staff selected</span>
        )}
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
  const submittedBy = b.submitted_by || 'community builder'
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 16px rgba(0,0,0,.25)` : 'none',
    }}>
      <div style={{ height: 96 }}><BuildVisual build={b} seed={(b.name || '').length * 3} /></div>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{b.name}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6 }}>
        <span style={{ font: '400 9px var(--kw-mono)', color: KW.text4 }}>{submittedBy}</span>
        <span style={{ font: '700 10px var(--kw-mono)', color: hover ? KW.text : KW.lavender, transition: 'color .18s' }}>view build →</span>
      </div>
    </div>
  )
}

function BuildCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  const submittedBy = b.submitted_by || 'community builder'
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
      borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 16px rgba(0,0,0,.25)` : 'none',
    }}>
      <div style={{ height: 100, position: 'relative' }}>
        <BuildVisual build={b} seed={(b.name || '').length * 5} />
      </div>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{b.name}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ font: '400 9px var(--kw-mono)', color: KW.text4 }}>{submittedBy}</span>
        <span style={{ font: '700 10px var(--kw-mono)', color: hover ? KW.text : KW.lavender, transition: 'color .18s' }}>view build →</span>
      </div>
    </div>
  )
}

function StaffPicksEmpty() {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: KW.surface,
      border: `1px dashed ${KW.surface3}`,
      borderRadius: 8,
      minHeight: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}>
      <div>
        <div style={{ font: '700 13px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>staff picks are being curated.</div>
        <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 420 }}>
          published community builds stay in recent builds and the archive until staff manually features them.
        </div>
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

function WikiFeature({ onBrowse, onSubmit, onTopic }) {
  const [hover, setHover] = useState(null)
  const topics = [
    ['beginner guides', 'layouts, switches, first boards', 'beginner-guides'],
    ['modding guides', 'lube, films, foam, tuning', 'modding-guides'],
    ['sound & feel', 'mounts, plates, sound profiles', 'sound-feel'],
  ]

  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 22, display: 'grid', gridTemplateColumns: 'var(--kw-grid-wiki-feature)', gap: 18,
      alignItems: 'stretch', marginBottom: 36,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
        <div>
          <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 10 }}>wiki.</div>
          <div style={{ font: '700 22px/1.2 var(--kw-mono)', color: KW.text, marginBottom: 10 }}>learn the hobby while you browse.</div>
          <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 520 }}>
            The wiki turns build details into plain-language guides: what parts do, why boards sound different, and how to make smarter buying and modding choices.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={onBrowse}>browse wiki →</Button>
          <button
            onClick={onSubmit}
            onMouseEnter={() => setHover('submit')}
            onMouseLeave={() => setHover(null)}
            style={{
              height: 33, padding: '0 16px', borderRadius: 6,
              border: `1px solid ${hover === 'submit' ? KW.lavender : KW.surface3}`,
              background: hover === 'submit' ? KW.surface2 : 'transparent',
              color: hover === 'submit' ? KW.lavender : KW.text3,
              font: '700 10px var(--kw-mono)', cursor: 'pointer',
              transition: 'all .18s',
            }}
          >
            submit article
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        {topics.map(([title, desc, category], i) => (
          <button key={title} onClick={() => onTopic(category)} style={{
            background: KW.surface2, border: `1px solid ${KW.surface3}`, borderRadius: 8,
            padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12,
            alignItems: 'center', cursor: 'pointer', textAlign: 'left',
          }}>
            <div>
              <div style={{ font: '700 11px var(--kw-mono)', color: i === 0 ? KW.blue : i === 1 ? KW.lavender : KW.pink, marginBottom: 5 }}>{title}.</div>
              <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text3 }}>{desc}</div>
            </div>
            <span style={{ font: '700 13px var(--kw-mono)', color: KW.text4 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CTA({ onSubmit }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 10,
      padding: '32px 28px', display: 'grid', gridTemplateColumns: 'var(--kw-grid-cta)', alignItems: 'center', gap: 24,
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
        <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>login required.</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [q, setQ] = useState('')
  const [builds, setBuilds] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtered, setFiltered] = useState(null) // null = show default sections, array = show filtered results
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchBuilds(), fetchStaffPickBuilds()]).then(([{ data }, staffPicks]) => {
      setBuilds(data)
      setFeatured(staffPicks.data)
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

  const recent = builds.slice(0, 5)

  const goToBuild = (b) => navigate(`/builds/${buildRouteSlug(b)}`)

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1 }}>
        <Hero q={q} setQ={setQ} onSearch={onSearch} buildCount={loading ? null : builds.length} />

        <div style={{ padding: '0 var(--kw-page-x) 40px' }}>
          {/* Filtered results */}
          {filtered !== null ? (
            <>
              <SectionHeader
                title={`${filtered.length} build${filtered.length !== 1 ? 's' : ''} found.`}
                eyebrow="results"
                right={
                  <button onClick={() => { setFiltered(null); setQ('') }} style={{
                    background: 'none', border: 'none', font: '400 10px var(--kw-mono)',
                    color: KW.text3, cursor: 'pointer', padding: 0
                  }}>clear ×</button>
                }
              />
              {loading ? (
                <div style={{ font: '400 11px var(--kw-mono)', color: KW.text4, padding: '24px 0' }}>searching...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-builds)', gap: 10, marginBottom: 36 }}>
                  {filtered.map((b, i) => <BuildCard key={b.id || i} b={b} onClick={() => goToBuild(b)} />)}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Featured builds */}
              <SectionHeader title="featured builds." eyebrow="staff picks"
                right={<span style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>{featured.length} picked</span>} />
              <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-featured)', gap: 14, marginBottom: 36 }}>
                {loading
                  ? [0,1].map(i => <div key={i} style={{ height: 320, background: KW.surface, borderRadius: 8, border: `1px solid ${KW.border}` }} />)
                  : featured.length > 0
                    ? featured.map((b, i) => <FeaturedCard key={b.id || i} b={b} onClick={() => goToBuild(b)} />)
                    : <StaffPicksEmpty />
                }
              </div>

              <SectionHeader title="wiki knowledge base." eyebrow="learn" />
              <WikiFeature
                onBrowse={() => navigate('/wiki')}
                onSubmit={() => navigate('/submit-wiki')}
                onTopic={(category) => navigate(`/wiki?category=${category}`)}
              />

              {/* Recent builds */}
              <SectionHeader title="recent builds." eyebrow="just submitted"
                right={<a onClick={() => navigate('/builds')} style={{ font: '400 11px var(--kw-mono)', color: KW.lavender, cursor: 'pointer', textDecoration: 'none' }}>view all →</a>} />
              <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-builds)', gap: 10, marginBottom: 36 }}>
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

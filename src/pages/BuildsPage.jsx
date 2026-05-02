/* built by twelve. — bytw12ve */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import Pill from '../components/Pill.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import BuildVisual from '../components/BuildVisual.jsx'
import Toast from '../components/Toast.jsx'
import { fetchBuilds, getBuildTags, buildRouteSlug } from '../lib/supabase.js'

const BUILDS_FILTERS = ['all','60%','65%','75%','TKL','linear','tactile','clicky','brass','aluminum','polycarbonate','WKL']

function GridBuildCard({ b, onClick }) {
  const [hover, setHover] = useState(false)
  const tags = getBuildTags(b)
  const submittedBy = b.submitted_by || 'community builder'
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: KW.surface, border: `1px solid ${hover ? KW.lavender : KW.border}`,
      borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .18s, box-shadow .18s',
      boxShadow: hover ? `0 4px 20px rgba(0,0,0,.3)` : 'none',
    }}>
      <div style={{ height: 110, position: 'relative' }}>
        <BuildVisual build={b} seed={(b.name || '').length * 5} />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          font: '400 9px var(--kw-mono)', color: KW.text3,
          background: 'rgba(23,20,42,.85)', padding: '2px 6px', borderRadius: 4, letterSpacing: '.04em',
        }}>{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{b.name}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
      <div style={{ font: '400 9px var(--kw-mono)', color: KW.text4, marginTop: -2 }}>by {submittedBy}</div>
      <button style={{
        marginTop: 'auto', height: 26, borderRadius: 6, cursor: 'pointer',
        background: hover ? KW.surface2 : 'transparent',
        border: `1px solid ${hover ? KW.lavender : KW.surface3}`,
        color: hover ? KW.lavender : KW.text3,
        font: '700 10px var(--kw-mono)', letterSpacing: '.02em', transition: 'all .18s',
      }}>view build →</button>
    </div>
  )
}

function SortButton({ value, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={!onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      height: 36, padding: '0 14px', borderRadius: 6, background: KW.surface2,
      border: `1px solid ${hover && onClick ? KW.lavender : KW.surface3}`, color: hover && onClick ? KW.text : KW.text3,
      font: '400 11px var(--kw-mono)', cursor: onClick ? 'pointer' : 'default',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      transition: 'all .18s', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: KW.text4 }}>sort:</span>
      <span>{value}</span>
      <span style={{ color: KW.text4, marginLeft: 2 }}>↓</span>
    </button>
  )
}

function PageButton({ children, active, onClick, disabled }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      minWidth: 30, height: 30, padding: '0 10px', borderRadius: 6,
      background: active ? KW.lavender : (hover && !disabled ? KW.surface2 : 'transparent'),
      border: `1px solid ${active ? KW.lavender : KW.surface3}`,
      color: active ? KW.bg : (disabled ? KW.text4 : KW.text3),
      font: `${active ? 700 : 400} 11px var(--kw-mono)`,
      cursor: disabled ? 'default' : 'pointer', transition: 'all .18s',
    }}>{children}</button>
  )
}

const PAGE_SIZE = 15

export default function BuildsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetchBuilds({ q, filter }).then(({ data }) => {
      setBuilds(data)
      setLoading(false)
      setPage(1)
    })
  }, [q, filter])

  useEffect(() => {
    const next = {}
    if (q.trim()) next.q = q.trim()
    if (filter !== 'all') next.filter = filter
    setSearchParams(next, { replace: true })
  }, [q, filter, setSearchParams])

  const paged = builds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(builds.length / PAGE_SIZE))
  const firstResult = builds.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(page * PAGE_SIZE, builds.length)

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 8 }}>
            the archive
          </div>
          <h1 style={{ font: '700 32px/1 var(--kw-mono)', color: KW.text, margin: 0 }}>all builds.</h1>
          <div style={{ font: '400 12px var(--kw-mono)', color: KW.text3, marginTop: 8 }}>
            <span style={{ color: KW.text }}>{builds.length || '—'}</span> builds in the archive
            <span style={{ color: KW.text4, margin: '0 8px' }}>•</span>updated daily
          </div>
        </div>

        {/* Search row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input style={{ flex: 1, height: 36 }} placeholder="search builds, switches, layouts..."
            value={q} onChange={setQ} onKeyDown={(e) => { if (e.key === 'Enter') setPage(1) }} />
          <Button onClick={() => setPage(1)} style={{ height: 36 }}>search</Button>
          <SortButton value="newest" />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22, paddingBottom: 22, borderBottom: `1px solid ${KW.border}` }}>
          {BUILDS_FILTERS.map(p => (
            <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>{p}</Pill>
          ))}
        </div>

        {/* Result meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, font: '400 10px var(--kw-mono)', color: KW.text3 }}>
          <span>
            {loading ? 'loading...' : <>showing <span style={{ color: KW.text }}>{firstResult}–{lastResult}</span> of <span style={{ color: KW.text }}>{builds.length}</span></>}
            {filter !== 'all' && !loading && <span> · filtered by <span style={{ color: KW.lavender }}>{filter}</span></span>}
          </span>
          <span>page {page} of {totalPages}</span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-builds)', gap: 10, marginBottom: 32, minHeight: 200 }}>
          {loading
            ? Array(10).fill(0).map((_, i) => <div key={i} style={{ height: 220, background: KW.surface, borderRadius: 8, border: `1px solid ${KW.border}` }} />)
            : paged.map((b, i) => (
                <GridBuildCard key={b.id || i} b={b} onClick={() => navigate(`/builds/${buildRouteSlug(b)}`)} />
              ))
          }
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 16, borderTop: `1px solid ${KW.border}` }}>
          <PageButton onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← prev</PageButton>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
            <PageButton key={n} active={page === n} onClick={() => setPage(n)}>{n}</PageButton>
          ))}
          {totalPages > 5 && <><span style={{ color: KW.text4, font: '400 11px var(--kw-mono)', padding: '0 4px' }}>…</span>
            <PageButton onClick={() => setPage(totalPages)}>{totalPages}</PageButton></>}
          <PageButton onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>next →</PageButton>
        </div>
      </div>
      <Footer />
      <Toast />
    </div>
  )
}

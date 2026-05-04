import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import { fetchWikiArticleBySlug, fetchWikiArticles, isStaffProfile } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

/* built by twelve. */

const CATEGORY_META = {
  'beginner-guides': { label: 'beginner', color: KW.blue, bg: '#1F2D3A' },
  'modding-guides': { label: 'modding', color: KW.lavender, bg: '#2D1F4A' },
  'parts-glossary': { label: 'glossary', color: KW.pink, bg: '#2D1F2A' },
  'sound-feel': { label: 'sound', color: KW.pink, bg: '#2D1F2A' },
  'community-buying': { label: 'community', color: KW.green, bg: '#1F2D2A' },
  'about': { label: 'about', color: KW.text3, bg: KW.surface2 },
}

function sectionSlug(heading) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function punctuatedTitle(title) {
  return /[.!?]$/.test(String(title || '').trim()) ? title : `${title}.`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function Tip({ text }) {
  return (
    <div style={{
      borderLeft: `3px solid ${KW.lavender}`, padding: '10px 14px',
      margin: '14px 0 0', font: '400 11px/1.6 var(--kw-mono)', color: KW.text3,
      background: '#2D1F4A22', borderRadius: '0 4px 4px 0',
    }}>
      tip: {text}
    </div>
  )
}

function SectionBubble({ s, id, innerRef }) {
  return (
    <div
      id={id}
      ref={innerRef}
      data-section-id={id}
      style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: '18px 20px', marginBottom: 10 }}
    >
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text, marginBottom: (s.body || s.bullets?.length) ? 10 : 0 }}>
        {s.heading}
      </div>
      {s.bullets?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {s.bullets.map((b, i) => (
            <div key={i} style={{ font: '400 11px var(--kw-mono)', color: KW.text2 }}>→ {b}</div>
          ))}
        </div>
      )}
      {s.body && <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text2 }}>{s.body}</div>}
      {s.tip && <Tip text={s.tip} />}
    </div>
  )
}

export default function WikiArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, loading: authLoading } = useAuth()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(null)
  const [view, setView] = useState('sections')
  const sectionRefs = useRef([])

  useEffect(() => {
    if (authLoading) return
    setLoading(true)
    setArticle(null)
    sectionRefs.current = []
    fetchWikiArticleBySlug(slug, { ownerId: user?.id, staffPreview: isStaffProfile(profile) }).then(({ data }) => {
      setArticle(data)
      if (data?.content?.length) setActiveSection(sectionSlug(data.content[0].heading))
      else setActiveSection(null)
      setLoading(false)
    })
  }, [slug, user?.id, profile?.role, authLoading])

  useEffect(() => {
    if (!article) return
    fetchWikiArticles({ category: article.category, limit: 5 }).then(({ data }) => {
      setRelated((data || []).filter(a => a.slug !== slug).slice(0, 4))
    })
  }, [article, slug])

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll TOC tracking
  useEffect(() => {
    if (!article?.content?.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveSection(visible[0].target.dataset.sectionId)
      },
      { rootMargin: '-10% 0px -70% 0px' }
    )
    sectionRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [article])

  if (loading) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>loading...</span>
      </div>
      <Footer />
    </div>
  )

  if (!article) return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ font: '700 18px var(--kw-mono)', color: KW.text }}>article not found.</div>
        <button onClick={() => navigate('/wiki')} style={{ font: '400 11px var(--kw-mono)', color: KW.lavender, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← back to wiki
        </button>
      </div>
      <Footer />
    </div>
  )

  const catMeta = CATEGORY_META[article.category] || { label: article.category, color: KW.text3, bg: KW.surface2 }
  const sections = article.content || []
  const isCombined = article.format === 'combined'
  const isOwnerPreview = article.user_id === user?.id && article.status && article.status !== 'published'
  const isStaffPreview = !isOwnerPreview && isStaffProfile(profile) && article.status && article.status !== 'published'
  const openedFromProfile = location.state?.from === 'profile'
  const openedFromAdmin = location.state?.from === 'admin'
  const backPath = openedFromAdmin ? '/admin' : openedFromProfile ? '/profile' : '/wiki'
  const backLabel = openedFromAdmin ? '← back to admin' : openedFromProfile ? '← back to profile' : '← back to wiki'
  const tagLabels = new Set([article.category, catMeta.label].map(t => String(t).toLowerCase()))
  const uniqueTags = (article.tags || []).filter((t, i, arr) => {
    const normalized = String(t).toLowerCase()
    return !tagLabels.has(normalized) && arr.findIndex(x => String(x).toLowerCase() === normalized) === i
  })

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Reading progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: `${progress}%`, height: 2,
        background: KW.lavender, zIndex: 1000,
        transition: 'width .1s linear',
      }} />

      <Nav />

      <div style={{ flex: 1, padding: '24px var(--kw-page-x) 40px', display: 'grid', gridTemplateColumns: 'var(--kw-grid-article)', gap: 32, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            style={{ font: '400 10px var(--kw-mono)', color: KW.text3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14 }}
            onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
            onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
          >
            {backLabel}
          </button>

          {/* Breadcrumb */}
          <div style={{ font: '400 10px var(--kw-mono)', color: KW.text3, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/wiki')}
              onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
              onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
            >wiki.</span>
            <span style={{ color: KW.text4 }}>→</span>
            <span>{catMeta.label}.</span>
            <span style={{ color: KW.text4 }}>→</span>
            <span style={{ color: KW.text2 }}>{article.title}</span>
          </div>

          {/* Tags + meta */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ background: catMeta.bg, color: catMeta.color, font: '700 9px var(--kw-mono)', padding: '0 8px', borderRadius: 20, height: 16, lineHeight: '16px', display: 'inline-flex', alignItems: 'center' }}>
              {catMeta.label}
            </span>
            {uniqueTags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
            {article.read_time && (
              <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>{article.read_time}</span>
            )}
            {article.updated_at && (
              <>
                <span style={{ color: KW.text4 }}>·</span>
                <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>updated {timeAgo(article.updated_at)}</span>
              </>
            )}
          </div>

          <h1 style={{ font: '700 28px/1.2 var(--kw-mono)', color: KW.text, margin: '0 0 10px' }}>{punctuatedTitle(article.title)}</h1>
          {isOwnerPreview && (
            <div style={{
              background: KW.surface,
              border: `1px solid ${KW.surface3}`,
              borderRadius: 8,
              padding: '10px 12px',
              color: KW.lavender,
              font: '400 10px/1.6 var(--kw-mono)',
              marginBottom: 16,
            }}>
              owner preview: this wiki article is {article.status} and only visible to you while it waits for review.
            </div>
          )}
          {isStaffPreview && (
            <div style={{
              background: KW.surface,
              border: `1px solid ${KW.surface3}`,
              borderRadius: 8,
              padding: '10px 12px',
              color: KW.lavender,
              font: '400 10px/1.6 var(--kw-mono)',
              marginBottom: 16,
            }}>
              staff preview: this wiki article is {article.status} and hidden from public browsing.
            </div>
          )}
          {article.short_description && (
            <p style={{ font: '400 12px/1.6 var(--kw-mono)', color: KW.text3, margin: '0 0 24px' }}>{article.short_description}</p>
          )}

          {/* View toggle — only for sections format */}
          {!isCombined && sections.length > 0 && (
            <div style={{ display: 'flex', gap: 2, background: KW.surface2, padding: 3, borderRadius: 8, width: 'fit-content', marginBottom: 20 }}>
              {['sections', 'combined'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: view === v ? KW.surface3 : 'transparent',
                  color: view === v ? KW.text : KW.text3,
                  font: `${view === v ? 700 : 400} 10px var(--kw-mono)`,
                  transition: 'all .18s',
                }}>{v}</button>
              ))}
            </div>
          )}

          {/* Content */}
          {isCombined && article.combined_content ? (
            <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: '20px 24px' }}>
              <div style={{ font: '400 11px/1.9 var(--kw-mono)', color: KW.text2, whiteSpace: 'pre-wrap' }}>
                {article.combined_content}
              </div>
            </div>
          ) : view === 'sections' ? (
            sections.map((s, i) => {
              const id = sectionSlug(s.heading)
              return (
                <SectionBubble
                  key={i} s={s} id={id}
                  innerRef={el => { sectionRefs.current[i] = el }}
                />
              )
            })
          ) : (
            <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: '20px 24px' }}>
              {sections.map((s, i) => (
                <div key={i} style={{ marginBottom: i < sections.length - 1 ? 24 : 0 }}>
                  <div style={{ font: '700 12px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>{s.heading}</div>
                  {s.bullets?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                      {s.bullets.map((b, j) => (
                        <div key={j} style={{ font: '400 11px var(--kw-mono)', color: KW.text2 }}>→ {b}</div>
                      ))}
                    </div>
                  )}
                  {s.body && <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text2 }}>{s.body}</div>}
                  {s.tip && (
                    <div style={{ font: '400 10px/1.6 var(--kw-mono)', color: KW.text3, marginTop: 8, paddingLeft: 12, borderLeft: `2px solid ${KW.lavender}` }}>
                      tip: {s.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Next article */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingTop: 20, borderTop: `1px solid ${KW.border}` }}>
            {related[0] && (
              <button
                onClick={() => navigate(`/wiki/${related[0].slug}`)}
                style={{ font: '400 10px var(--kw-mono)', color: KW.text3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
              >{related[0].title} →</button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 24 }}>
          {sections.length > 0 && (
            <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em', marginBottom: 14 }}>on this page</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sections.map((s, i) => {
                  const id = sectionSlug(s.heading)
                  const isActive = activeSection === id
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        const el = document.getElementById(id)
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setActiveSection(id)
                      }}
                      style={{
                        font: '400 10px var(--kw-mono)',
                        color: isActive ? KW.text : KW.text3,
                        padding: '5px 0 5px 10px',
                        borderLeft: `2px solid ${isActive ? KW.lavender : 'transparent'}`,
                        cursor: 'pointer', transition: 'all .18s',
                      }}
                    >{s.heading}</div>
                  )
                })}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18 }}>
              <div style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em', marginBottom: 14 }}>related articles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/wiki/${r.slug}`)}
                    style={{ font: '400 10px var(--kw-mono)', color: KW.text3, cursor: 'pointer', transition: 'color .18s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                    onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                  >→ {r.title}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

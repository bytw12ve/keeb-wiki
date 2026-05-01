import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { fetchWikiArticles, searchWikiArticles } from '../lib/supabase.js'

const SECTIONS = [
  {
    key: 'about',
    dbKey: 'about',
    title: 'about.',
    color: KW.lavender,
    desc: "keeb.wiki is a community driven archive for mechanical keyboard builds. Learn what we're about, how the site started, and how you can get involved.",
    links: ['what is keeb.wiki', 'how to contribute', 'the team', 'contact'],
  },
  {
    key: 'beginner',
    dbKey: 'beginner-guides',
    title: 'beginner guides.',
    color: KW.blue,
    desc: 'New to the hobby? Start here. We cover everything from choosing your first board to understanding the difference between switches, layouts, and what all the terminology means.',
    links: ['choosing your first board', 'understanding layouts', 'switch types explained', 'do i need to lube?'],
  },
  {
    key: 'glossary',
    dbKey: 'parts-glossary',
    title: 'parts glossary.',
    color: KW.pink,
    desc: 'A full breakdown of every part that goes into a mechanical keyboard build. Case materials, plate options, switch brands, keycap profiles and more — all explained in plain language.',
    links: ['case materials', 'plate materials', 'switch brands', 'keycap profiles'],
  },
  {
    key: 'modding',
    dbKey: 'modding-guides',
    title: 'modding guides.',
    color: KW.lavender,
    desc: 'Step by step guides for the most popular keyboard mods. From lubing and filming switches to tape mods and PE foam — learn how to get the most out of your board.',
    links: ['how to lube switches', 'how to film switches', 'tape mod walkthrough', 'PE foam mod'],
  },
  {
    key: 'sound',
    dbKey: 'sound-feel',
    title: 'sound & feel.',
    color: KW.pink,
    desc: 'Understand what makes a keyboard sound and feel the way it does. We break down mount styles, plate materials, and the mods that have the biggest impact on sound signature.',
    links: ['what makes a board thocky', 'mount styles explained', 'tuning for clack'],
  },
  {
    key: 'community',
    dbKey: 'community-buying',
    title: 'community & buying.',
    color: KW.green,
    desc: 'Where to buy keyboards, how group buys work, what to look for in a vendor, and how to navigate the keyboard community without getting burned.',
    links: ['where to buy', 'group buys explained', 'in stock vs group buy'],
  },
]

const CATEGORY_META = {
  'beginner-guides': { label: 'beginner', color: KW.blue, bg: '#1F2D3A' },
  'modding-guides': { label: 'modding', color: KW.lavender, bg: '#2D1F4A' },
  'parts-glossary': { label: 'glossary', color: KW.pink, bg: '#2D1F2A' },
  'sound-feel': { label: 'sound', color: KW.pink, bg: '#2D1F2A' },
  'community-buying': { label: 'community', color: KW.green, bg: '#1F2D2A' },
  'about': { label: 'about', color: KW.text3, bg: KW.surface2 },
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

function SectionCard({ s, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: KW.surface, border: `1px solid ${hover ? KW.surface3 : KW.border}`,
        borderRadius: 8, padding: 20, cursor: 'pointer',
        transition: 'border-color .18s, box-shadow .18s',
        boxShadow: hover ? '0 4px 20px rgba(0,0,0,.25)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ font: '700 13px var(--kw-mono)', color: s.color }}>{s.title}</div>
      <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text2 }}>{s.desc}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
        {s.links.map((l, i) => (
          <div key={i} style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>→ {l}</div>
        ))}
      </div>
    </div>
  )
}

function SearchResultRow({ article, onClick, isFirst, isLast }) {
  const meta = CATEGORY_META[article.category] || { label: article.category, color: KW.text3, bg: KW.surface2 }
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
        background: KW.surface,
        borderRadius: isFirst && isLast ? 8 : isFirst ? '8px 8px 0 0' : isLast ? '0 0 8px 8px' : 0,
        border: `1px solid ${KW.border}`, borderTop: isFirst ? undefined : 'none',
        cursor: 'pointer', transition: 'background .18s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = KW.surface2}
      onMouseLeave={(e) => e.currentTarget.style.background = KW.surface}
    >
      <span style={{ background: meta.bg, color: meta.color, font: '700 9px var(--kw-mono)', padding: '0 8px', borderRadius: 20, height: 16, lineHeight: '16px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {meta.label}
      </span>
      <span style={{ font: '400 11px var(--kw-mono)', color: KW.text, flex: 1 }}>{article.title}</span>
      {article.short_description && (
        <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.short_description}</span>
      )}
    </div>
  )
}

export default function WikiPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQ = searchParams.get('q') || ''
  const [q, setQ] = useState(searchQ)
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [recentArticles, setRecentArticles] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    fetchWikiArticles({ limit: 6 }).then(({ data }) => {
      setRecentArticles(data)
      setRecentLoading(false)
    })
  }, [])

  useEffect(() => {
    if (searchQ) {
      setSearching(true)
      searchWikiArticles(searchQ).then(({ data }) => {
        setSearchResults(data)
        setSearching(false)
      })
    } else {
      setSearchResults(null)
    }
  }, [searchQ])

  const handleSearch = () => {
    if (q.trim()) setSearchParams({ q: q.trim() })
    else setSearchParams({})
  }

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <div style={{ padding: '56px 40px 48px', textAlign: 'center', borderBottom: `1px solid ${KW.border}` }}>
        <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 16 }}>
          knowledge base
        </div>
        <h1 style={{ font: '700 36px/1.1 var(--kw-mono)', color: KW.text, margin: '0 0 14px', letterSpacing: '-.01em' }}>
          the keeb.wiki knowledge base.
        </h1>
        <div style={{ font: '400 13px/1.5 var(--kw-mono)', color: KW.text3, maxWidth: 560, margin: '0 auto 28px' }}>
          guides, glossaries, and everything you need to know about mechanical keyboards.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 520, margin: '0 auto' }}>
          <Input
            style={{ flex: 1, height: 36 }}
            placeholder="search the wiki..."
            value={q}
            onChange={setQ}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
          />
          <Button style={{ height: 36 }} onClick={handleSearch}>search</Button>
        </div>
        {searchQ && (
          <button
            onClick={() => { setSearchParams({}); setQ('') }}
            style={{ marginTop: 10, font: '400 10px var(--kw-mono)', color: KW.text4, background: 'none', border: 'none', cursor: 'pointer' }}
          >clear search</button>
        )}
      </div>

      <div style={{ flex: 1, padding: '36px 40px 40px' }}>
        {searchQ ? (
          <>
            <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              {searching ? 'searching...' : `${searchResults?.length || 0} result${searchResults?.length === 1 ? '' : 's'} for "${searchQ}"`}
            </div>
            {!searching && searchResults?.length === 0 && (
              <div style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>no articles found. try a different search.</div>
            )}
            {!searching && searchResults?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {searchResults.map((a, i) => (
                  <SearchResultRow
                    key={a.id} article={a}
                    isFirst={i === 0} isLast={i === searchResults.length - 1}
                    onClick={() => navigate(`/wiki/${a.slug}`)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Browse by section */}
            <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              browse by section
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
              {SECTIONS.map(s => (
                <SectionCard key={s.key} s={s} onClick={() => navigate(`/wiki?category=${s.dbKey}`)} />
              ))}
            </div>

            {/* Recently updated */}
            <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              recently updated
            </div>
            {recentLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 44, background: KW.surface, borderRadius: i === 0 ? '8px 8px 0 0' : i === 3 ? '0 0 8px 8px' : 0, border: `1px solid ${KW.border}`, borderTop: i === 0 ? undefined : 'none' }} />
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentArticles.map((a, i) => {
                  const meta = CATEGORY_META[a.category] || { label: a.category, color: KW.text3, bg: KW.surface2 }
                  return (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/wiki/${a.slug}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
                        background: KW.surface,
                        borderRadius: i === 0 ? '8px 8px 0 0' : i === recentArticles.length - 1 ? '0 0 8px 8px' : 0,
                        border: `1px solid ${KW.border}`, borderTop: i === 0 ? undefined : 'none',
                        cursor: 'pointer', transition: 'background .18s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = KW.surface2}
                      onMouseLeave={(e) => e.currentTarget.style.background = KW.surface}
                    >
                      <span style={{ background: meta.bg, color: meta.color, font: '700 9px var(--kw-mono)', padding: '0 8px', borderRadius: 20, height: 16, lineHeight: '16px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        {meta.label}
                      </span>
                      <span style={{ font: '400 11px var(--kw-mono)', color: KW.text, flex: 1 }}>{a.title}</span>
                      <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4, whiteSpace: 'nowrap' }}>updated {timeAgo(a.updated_at)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>no articles yet.</div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

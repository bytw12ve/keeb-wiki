import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'

const SECTIONS = [
  {
    key: 'about',
    title: 'about.',
    color: KW.lavender,
    desc: 'keeb.wiki is a community driven archive for mechanical keyboard builds. Learn what we\'re about, how the site started, and how you can get involved.',
    links: ['what is keeb.wiki', 'how to contribute', 'the team', 'contact'],
  },
  {
    key: 'beginner',
    title: 'beginner guides.',
    color: KW.blue,
    desc: 'New to the hobby? Start here. We cover everything from choosing your first board to understanding the difference between switches, layouts, and what all the terminology means.',
    links: ['choosing your first board', 'understanding layouts', 'switch types explained', 'do i need to lube?'],
  },
  {
    key: 'glossary',
    title: 'parts glossary.',
    color: KW.pink,
    desc: 'A full breakdown of every part that goes into a mechanical keyboard build. Case materials, plate options, switch brands, keycap profiles and more — all explained in plain language.',
    links: ['case materials', 'plate materials', 'switch brands', 'keycap profiles'],
  },
  {
    key: 'modding',
    title: 'modding guides.',
    color: KW.lavender,
    desc: 'Step by step guides for the most popular keyboard mods. From lubing and filming switches to tape mods and PE foam — learn how to get the most out of your board.',
    links: ['how to lube switches', 'how to film switches', 'tape mod walkthrough', 'PE foam mod'],
  },
  {
    key: 'sound',
    title: 'sound & feel.',
    color: KW.pink,
    desc: 'Understand what makes a keyboard sound and feel the way it does. We break down mount styles, plate materials, and the mods that have the biggest impact on sound signature.',
    links: ['what makes a board thocky', 'mount styles explained', 'turning for clack'],
  },
  {
    key: 'community',
    title: 'community & buying.',
    color: KW.green,
    desc: 'Where to buy keyboards, how group buys work, what to look for in a vendor, and how to navigate the keyboard community without getting burned.',
    links: ['where to buy', 'group buys explained', 'in stock vs group buy'],
  },
]

const RECENT = [
  { tag: 'modding',  tagColor: KW.lavender, tagBg: '#2D1F4A', title: 'how to lube switches',                           updated: '2 days ago' },
  { tag: 'beginner', tagColor: KW.blue,     tagBg: '#1F2D3A', title: 'understanding layouts — 60% vs 75% vs TKL',      updated: '5 days ago' },
  { tag: 'glossary', tagColor: KW.pink,     tagBg: '#2D1F2A', title: 'keycap profiles — Cherry, OEM, SA, KAT, MT3',    updated: '1 week ago' },
  { tag: 'sound',    tagColor: KW.pink,     tagBg: '#2D1F2A', title: 'mount styles explained — gasket vs top mount vs tray', updated: '2 weeks ago' },
]

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
          <div key={i} style={{ font: '400 10px var(--kw-mono)', color: KW.text3 }}>
            → {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WikiPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

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
            value={q} onChange={setQ}
            onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) navigate(`/wiki/search?q=${encodeURIComponent(q)}`) }}
          />
          <Button style={{ height: 36 }} onClick={() => q.trim() && navigate(`/wiki/search?q=${encodeURIComponent(q)}`)}>search</Button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '36px 40px 40px' }}>
        {/* Browse by section */}
        <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          browse by section
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
          {SECTIONS.map(s => (
            <SectionCard key={s.key} s={s} onClick={() => navigate(`/wiki/${s.key}`)} />
          ))}
        </div>

        {/* Recently updated */}
        <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          recently updated
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {RECENT.map((a, i) => (
            <div
              key={i}
              onClick={() => navigate('/wiki/how-to-lube-switches')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
                background: KW.surface, borderRadius: i === 0 ? '8px 8px 0 0' : i === RECENT.length-1 ? '0 0 8px 8px' : 0,
                border: `1px solid ${KW.border}`, borderTop: i === 0 ? undefined : 'none',
                cursor: 'pointer', transition: 'background .18s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = KW.surface2}
              onMouseLeave={(e) => e.currentTarget.style.background = KW.surface}
            >
              <span style={{ background: a.tagBg, color: a.tagColor, font: '700 9px var(--kw-mono)', padding: '0 8px', borderRadius: 20, height: 16, lineHeight: '16px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                {a.tag}
              </span>
              <span style={{ font: '400 11px var(--kw-mono)', color: KW.text, flex: 1 }}>{a.title}</span>
              <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4, whiteSpace: 'nowrap' }}>updated {a.updated}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

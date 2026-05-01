import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

const ARTICLE = {
  title: 'how to lube switches.',
  subtitle: 'a complete guide to lubing your switches for a smoother, better sounding board.',
  tags: [
    { label: 'modding', color: KW.lavender, bg: '#2D1F4A' },
    { label: 'beginner friendly', color: KW.blue, bg: '#1F2D3A' },
  ],
  readTime: '~15 min read',
  updated: '2 days ago',
  breadcrumb: ['wiki.', 'modding guides.', 'how to lube switches'],
  sections: [
    {
      id: 'what-youll-need',
      heading: "what you'll need.",
      content: null,
      bullets: [
        'switch opener',
        'lube — krytox 205g0 for linears, 3203 for tactiles',
        'small brush',
        'stem holder (optional but helpful)',
      ],
    },
    {
      id: 'step-1',
      heading: 'step 1 — open the switch.',
      content: 'Use your switch opener to carefully pop open the top housing. Place the opener on the four clips and press down gently. Be careful — forcing it can break the clips on cheaper switches.',
      tip: 'open all your switches first before lubing. it makes the whole process faster and more consistent.',
    },
    {
      id: 'step-2',
      heading: 'step 2 — lube the bottom housing.',
      content: 'Apply a thin, even coat to the inside rails of the bottom housing where the stem legs travel. Less is more — avoid the leaf spring on linears.',
    },
    {
      id: 'step-3',
      heading: 'step 3 — lube the stem.',
      content: 'Apply lube to the legs and the bottom of the stem pole. For linears lube all four sides of the legs. For tactiles, avoid the legs entirely — it kills the bump.',
      tip: 'too much lube on the stem is the most common mistake. thin coats only.',
    },
    {
      id: 'step-4',
      heading: 'step 4 — reassemble.',
      content: 'Place the stem back in, add the spring, and clip the top housing back on. Test the switch — it should feel smooth with no scratchiness.',
    },
  ],
  related: [
    'how to film switches',
    'tape mod walkthrough',
    'PE foam mod',
    'do i need to lube?',
  ],
  prev: 'choosing your first board',
  next: 'how to film switches',
}

function Tip({ text }) {
  return (
    <div style={{
      borderLeft: `3px solid ${KW.lavender}`, paddingLeft: 14, margin: '14px 0 0',
      font: '400 11px/1.6 var(--kw-mono)', color: KW.text3,
      background: '#2D1F4A22', padding: '10px 14px', borderRadius: '0 4px 4px 0',
    }}>
      tip: {text}
    </div>
  )
}

function SectionBubble({ s }) {
  return (
    <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: '18px 20px', marginBottom: 10 }}>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text, marginBottom: s.content || s.bullets ? 10 : 0 }}>
        {s.heading}
      </div>
      {s.bullets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {s.bullets.map((b, i) => (
            <div key={i} style={{ font: '400 11px var(--kw-mono)', color: KW.text2 }}>→ {b}</div>
          ))}
        </div>
      )}
      {s.content && <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text2 }}>{s.content}</div>}
      {s.tip && <Tip text={s.tip} />}
    </div>
  )
}

function CombinedSection({ s }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ font: '700 12px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>{s.heading}</div>
      {s.bullets && (
        <div style={{ font: '400 11px var(--kw-mono)', color: KW.text2 }}>
          {s.bullets.join(' → ')}
        </div>
      )}
      {s.content && <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text2 }}>{s.content}</div>}
      {s.tip && <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginTop: 8 }}>tip: {s.tip}</div>}
    </div>
  )
}

export default function WikiArticlePage() {
  const navigate = useNavigate()
  const [view, setView] = useState('sections')
  const [activeSection, setActiveSection] = useState(ARTICLE.sections[0].id)

  const ViewToggle = () => (
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
  )

  return (
    <div style={{ background: KW.bg, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />

      <div style={{ flex: 1, padding: '24px 40px 40px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 32, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Breadcrumb */}
          <div style={{ font: '400 10px var(--kw-mono)', color: KW.text3, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            {ARTICLE.breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {i > 0 && <span style={{ color: KW.text4 }}>→</span>}
                <span style={{ color: i === ARTICLE.breadcrumb.length - 1 ? KW.text2 : KW.text3, cursor: i < ARTICLE.breadcrumb.length - 1 ? 'pointer' : 'default' }}
                  onClick={() => i === 0 && navigate('/wiki')}
                >{crumb}</span>
              </span>
            ))}
          </div>

          {/* Tags + meta */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            {ARTICLE.tags.map((t, i) => (
              <span key={i} style={{ background: t.bg, color: t.color, font: '700 9px var(--kw-mono)', padding: '0 8px', borderRadius: 20, height: 16, lineHeight: '16px', display: 'inline-flex', alignItems: 'center' }}>{t.label}</span>
            ))}
            <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>{ARTICLE.readTime}</span>
            <span style={{ color: KW.text4 }}>·</span>
            <span style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>updated {ARTICLE.updated}</span>
          </div>

          <h1 style={{ font: '700 28px/1.2 var(--kw-mono)', color: KW.text, margin: '0 0 10px' }}>{ARTICLE.title}</h1>
          <p style={{ font: '400 12px/1.6 var(--kw-mono)', color: KW.text3, margin: '0 0 24px' }}>{ARTICLE.subtitle}</p>

          <ViewToggle />

          {view === 'sections'
            ? ARTICLE.sections.map(s => <SectionBubble key={s.id} s={s} />)
            : (
              <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: '20px 24px' }}>
                {ARTICLE.sections.map(s => <CombinedSection key={s.id} s={s} />)}
              </div>
            )
          }

          {/* Prev / next */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: `1px solid ${KW.border}` }}>
            <a onClick={() => navigate('/wiki')} style={{ font: '400 10px var(--kw-mono)', color: KW.text3, cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
              onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
            >← {ARTICLE.prev}</a>
            <a onClick={() => navigate('/wiki')} style={{ font: '400 10px var(--kw-mono)', color: KW.text3, cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
              onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
            >{ARTICLE.next} →</a>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
            <div style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em', marginBottom: 14 }}>on this page</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ARTICLE.sections.map(s => (
                <div key={s.id} onClick={() => setActiveSection(s.id)} style={{
                  font: '400 10px var(--kw-mono)',
                  color: activeSection === s.id ? KW.text : KW.text3,
                  padding: '5px 0 5px 10px',
                  borderLeft: `2px solid ${activeSection === s.id ? KW.lavender : 'transparent'}`,
                  cursor: 'pointer', transition: 'all .18s',
                }}>{s.heading.replace('.', '')}</div>
              ))}
            </div>
          </div>

          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18 }}>
            <div style={{ font: '700 9px var(--kw-mono)', color: KW.text3, letterSpacing: '.12em', marginBottom: 14 }}>related articles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ARTICLE.related.map((r, i) => (
                <div key={i} onClick={() => navigate('/wiki')} style={{ font: '400 10px var(--kw-mono)', color: KW.text3, cursor: 'pointer', transition: 'color .18s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                >→ {r}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

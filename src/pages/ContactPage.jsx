/* built by twelve. */
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'

const CONTACT_EMAIL = 'contact@keebwiki.com'

function Card({ title, children, action }) {
  return (
    <div style={{
      background: KW.surface,
      border: `1px solid ${KW.border}`,
      borderRadius: 8,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ font: '700 13px var(--kw-mono)', color: KW.lavender }}>{title}</div>
      <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3 }}>{children}</div>
      {action}
    </div>
  )
}

export default function ContactPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '40px var(--kw-page-x)' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ font: '700 9px var(--kw-mono)', color: KW.lavender, letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 10 }}>
            community
          </div>
          <h1 style={{ font: '700 32px/1 var(--kw-mono)', color: KW.text, margin: '0 0 10px' }}>contact.</h1>
          <div style={{ font: '400 12px/1.7 var(--kw-mono)', color: KW.text3, maxWidth: 620 }}>
            keebwiki is still small and deliberately curated. Use the launch contact address for direct notes, or use the built-in contribution flows for builds, wiki articles, and suggestions.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'var(--kw-grid-wiki-sections)', gap: 12 }}>
          <Card
            title="submit a build."
            action={<Button variant="secondary" onClick={() => navigate('/submit')} style={{ alignSelf: 'flex-start' }}>submit build →</Button>}
          >
            Share a keyboard build with specs, photos, sound notes, and what you learned from the process.
          </Card>
          <Card
            title="write for the wiki."
            action={<Button variant="secondary" onClick={() => navigate('/submit-wiki')} style={{ alignSelf: 'flex-start' }}>submit article →</Button>}
          >
            Send in guides, glossary entries, buying advice, or corrections that would help newer builders.
          </Card>
          <Card
            title="suggest an improvement."
            action={<Button variant="secondary" onClick={() => navigate('/suggestions')} style={{ alignSelf: 'flex-start' }}>suggestion guide →</Button>}
          >
            Use the suggestions page for feature ideas, missing wiki topics, and rough edges to clean up next.
          </Card>
        </div>

        <div style={{ marginTop: 18, background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 18 }}>
          <div style={{ font: '700 11px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>launch contact email.</div>
          <div style={{ font: '400 11px/1.7 var(--kw-mono)', color: KW.text3 }}>
            Reach the project at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: KW.lavender, textDecoration: 'none' }}>
              {CONTACT_EMAIL}
            </a>
            . Make sure this mailbox exists before public launch so messages do not bounce.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

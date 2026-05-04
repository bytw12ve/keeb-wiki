import { Link } from 'react-router-dom'
import { KW } from '../tokens.js'

/* built by twelve. */

export default function Footer() {
  return (
    <div style={{
      height: 39, borderTop: `1px solid ${KW.border}`, background: KW.surface,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, font: "400 10px var(--kw-mono)", color: KW.text3,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>keebwiki</span>
        <span style={{ color: KW.text4 }}>•</span>
        <span style={{ color: KW.text4 }}>community archive, est. 2026</span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[
          ['submit.', '/submit'],
          ['wiki.', '/wiki'],
          ['community.', '/community'],
        ].map(([label, to]) => (
          <Link key={label} to={to} style={{ cursor: "pointer", color: 'inherit', textDecoration: 'none' }}>{label}</Link>
        ))}
      </div>
    </div>
  )
}

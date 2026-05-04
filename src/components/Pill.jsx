/* built by twelve. */
import { KW } from '../tokens.js'

export default function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      cursor: "pointer", border: `1px solid ${active ? KW.lavender : KW.surface3}`,
      background: active ? KW.lavender : KW.surface2,
      color: active ? KW.bg : KW.text3,
      fontFamily: "var(--kw-mono)",
      fontSize: 10,
      fontWeight: active ? 700 : 400,
      lineHeight: 1,
      padding: "0 13px", borderRadius: 20, height: 22,
      display: "inline-flex", alignItems: "center",
      transition: "color .18s, background .18s, border-color .18s",
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = KW.text; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = KW.text3; }}
    >{children}</button>
  )
}

/* built by twelve. — bytw12ve */
import { TINT, tagKind } from '../tokens.js'

export default function Tag({ children, kind }) {
  const k = kind || tagKind(children);
  const t = TINT[k] || TINT.layout;
  return (
    <span style={{
      background: t.bg, color: t.fg, font: "700 9px var(--kw-mono)",
      padding: "0 8px", borderRadius: 20, height: 14, lineHeight: "14px",
      display: "inline-flex", alignItems: "center", letterSpacing: ".04em",
      whiteSpace: "nowrap",
    }}>{children}</span>
  )
}

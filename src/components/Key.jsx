import { KW } from '../tokens.js'

export default function Key({ children, size = "default", color }) {
  const dims = size === "lg"
    ? { w: 22, h: 22, f: 12 }
    : size === "sm"
    ? { w: 14, h: 14, f: 8 }
    : { w: 18, h: 18, f: 10 };
  return (
    <div style={{
      width: dims.w, height: dims.h, background: KW.surface2,
      border: `1px solid ${KW.surface3}`, borderRadius: 4,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      font: `700 ${dims.f}px var(--kw-mono)`, color: color || KW.text, flexShrink: 0,
    }}>{children}</div>
  )
}

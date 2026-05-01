import { KW } from '../tokens.js'

export default function Button({ children, variant = "primary", onClick, size = "md", style }) {
  const heights = { sm: 28, md: 33 };
  const fs = { sm: 10, md: 11 };
  const base = {
    primary:   { background: KW.lavender, color: KW.bg, border: "none", fontWeight: 700 },
    secondary: { background: "transparent", color: KW.text3, border: `1px solid ${KW.surface3}`, fontWeight: 400 },
  }[variant];
  return (
    <button onClick={onClick} style={{
      height: heights[size], padding: `0 ${size === "sm" ? 14 : 18}px`, borderRadius: 6,
      font: `${base.fontWeight} ${fs[size]}px var(--kw-mono)`, cursor: "pointer",
      letterSpacing: ".02em",
      transition: "background .18s, color .18s, border-color .18s",
      ...base, ...style,
    }}
    onMouseEnter={(e) => {
      if (variant === "primary") e.currentTarget.style.background = "#C5B7E8";
      else { e.currentTarget.style.color = KW.text; e.currentTarget.style.borderColor = KW.lavender; }
    }}
    onMouseLeave={(e) => {
      if (variant === "primary") e.currentTarget.style.background = KW.lavender;
      else { e.currentTarget.style.color = KW.text3; e.currentTarget.style.borderColor = KW.surface3; }
    }}
    >{children}</button>
  )
}

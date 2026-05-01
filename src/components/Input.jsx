import { KW } from '../tokens.js'

export default function Input({ placeholder, value, onChange, style, onKeyDown }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        height: 33, padding: "0 13px", borderRadius: 6,
        background: KW.surface2, border: `1px solid ${KW.surface3}`,
        color: KW.text, font: "400 11px var(--kw-mono)", outline: "none",
        transition: "border-color .18s",
        ...style,
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = KW.lavender}
      onBlur={(e) => e.currentTarget.style.borderColor = KW.surface3}
    />
  )
}

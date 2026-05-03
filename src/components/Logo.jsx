/* built by twelve. */
import { KW, LOGO_COLORS } from '../tokens.js'
import Key from './Key.jsx'

export default function Logo({ size = "default" }) {
  const dot = size === "lg" ? 14 : 11;
  const letters = ["K","E","E","B","W","I","K","I"];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {letters.slice(0,4).map((l,i) => <Key key={i} size={size} color={LOGO_COLORS[i]}>{l}</Key>)}
      <span style={{ color: KW.text3, fontSize: dot, margin: "0 4px" }}>•</span>
      {letters.slice(4).map((l,i) => <Key key={i} size={size} color={LOGO_COLORS[i+4]}>{l}</Key>)}
    </div>
  )
}

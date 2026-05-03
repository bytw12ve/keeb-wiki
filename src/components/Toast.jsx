/* built by twelve. */
import { KW } from '../tokens.js'

export default function Toast() {
  return (
    <div id="toast" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: KW.surface2, border: `1px solid ${KW.surface3}`,
      color: KW.text, font: "400 10px var(--kw-mono)",
      padding: "8px 14px", borderRadius: 6,
      opacity: 0, transition: "opacity .2s", pointerEvents: "none", zIndex: 99,
    }} />
  )
}

export function flashToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => { el.style.opacity = "0"; }, 1400);
}

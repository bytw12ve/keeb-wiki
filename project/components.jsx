// keeb.wiki homepage primitives. All values lifted from the design system tokens.

const KW = {
  bg: "#1E1B2E", surface: "#17142A", surface2: "#2D2845", surface3: "#3D3660",
  lavender: "#B8A9E0", pink: "#E8A8C0", blue: "#A8C8E8", green: "#A8E0A8",
  text: "#F5F2E8", text2: "#C8C0E0", text3: "#9B91B8", text4: "#6B6490",
  border: "#2D2845",
};
const TINT = {
  layout:    { bg: "#2D1F4A", fg: "#B8A9E0" },
  switches:  { bg: "#1F2D3A", fg: "#A8C8E8" },
  materials: { bg: "#2D1F2A", fg: "#E8A8C0" },
  community: { bg: "#1F2D1F", fg: "#A8E0A8" },
};

const TAG_LOOKUP = {
  layout: ["60%","65%","75%","80%","TKL","WKL","Full","40%","linear","tactile","clicky","budget","endgame","modding","beginner","glossary"],
  switches: ["Gateron Yellow","Holy Pandas","Boba U4T","Boba U4","Gateron Brown","Cherry BX","Cherry Black MX","Akko CS Jelly","Zealios V2","Moon V2","Alpacas","Tangerines"],
  materials: ["Brass","Aluminum","Polycarbonate","Steel","Carbon Fiber","POM"],
};
function tagKind(text) {
  for (const k of Object.keys(TAG_LOOKUP)) {
    if (TAG_LOOKUP[k].includes(text)) return k;
  }
  return "layout";
}

function Key({ children, size = "default", color }) {
  const dims = size === "lg" ? { w: 22, h: 22, f: 12 } : size === "sm" ? { w: 14, h: 14, f: 8 } : { w: 18, h: 18, f: 10 };
  return (
    <div style={{
      width: dims.w, height: dims.h, background: KW.surface2,
      border: `1px solid ${KW.surface3}`, borderRadius: 4,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      font: `700 ${dims.f}px var(--kw-mono)`, color: color || KW.text, flexShrink: 0,
    }}>{children}</div>
  );
}

// Per-key letter colors — canonical 3-accent palette only (lavender, pink, blue),
// cycled across the 8 keycaps for a steady visual rhythm. Green is reserved
// for community/buying surfaces per the design system.
const LOGO_COLORS = [
  KW.lavender, KW.pink, KW.blue,
  KW.lavender, KW.pink, KW.blue,
  KW.lavender, KW.pink,
];

function Logo({ size = "default" }) {
  const dot = size === "lg" ? 14 : 11;
  const letters = ["K","E","E","B","W","I","K","I"];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {letters.slice(0,4).map((l,i) => <Key key={i} size={size} color={LOGO_COLORS[i]}>{l}</Key>)}
      <span style={{ color: KW.text3, fontSize: dot, margin: "0 4px" }}>•</span>
      {letters.slice(4).map((l,i) => <Key key={i} size={size} color={LOGO_COLORS[i+4]}>{l}</Key>)}
    </div>
  );
}

function Nav({ active, onNav }) {
  const link = (k, label) => (
    <a key={k} onClick={(e)=>{e.preventDefault();onNav&&onNav(k);}} href="#" style={{
      font: `${active===k?700:400} 11px var(--kw-mono)`,
      color: active===k ? KW.lavender : KW.text3,
      textDecoration: "none", cursor: "pointer",
      transition: "color .18s",
    }}
    onMouseEnter={(e)=>{ if(active!==k) e.currentTarget.style.color = KW.text; }}
    onMouseLeave={(e)=>{ if(active!==k) e.currentTarget.style.color = KW.text3; }}
    >{label}</a>
  );
  return (
    <div style={{
      height: 44, background: KW.surface,
      borderBottom: `1px solid ${KW.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0,
    }}>
      <a href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav("home");}} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Logo />
        <span style={{ marginLeft: 12, font: "400 9px var(--kw-mono)", color: KW.text3, letterSpacing: ".06em" }}>
          the keyboard build archive
        </span>
      </a>
      <div style={{ display: "flex", gap: 24 }}>
        {link("home", "home.")}
        {link("builds", "builds.")}
        {link("submit", "submit.")}
        {link("wiki", "wiki.")}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      height: 39, borderTop: `1px solid ${KW.border}`, background: KW.surface,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, font: "400 10px var(--kw-mono)", color: KW.text3,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>keeb.wiki</span>
        <span style={{ color: KW.text4 }}>•</span>
        <span style={{ color: KW.text4 }}>community archive, est. 2026</span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ cursor: "pointer" }}>about.</span>
        <span style={{ cursor: "pointer" }}>submit.</span>
        <span style={{ cursor: "pointer" }}>wiki.</span>
        <span style={{ cursor: "pointer" }}>rss.</span>
      </div>
    </div>
  );
}

function Tag({ children, kind }) {
  const k = kind || tagKind(children);
  const t = TINT[k] || TINT.layout;
  return (
    <span style={{
      background: t.bg, color: t.fg, font: "700 9px var(--kw-mono)",
      padding: "0 8px", borderRadius: 20, height: 14, lineHeight: "14px",
      display: "inline-flex", alignItems: "center", letterSpacing: ".04em",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      cursor: "pointer", border: `1px solid ${active ? KW.lavender : KW.surface3}`,
      background: active ? KW.lavender : KW.surface2,
      color: active ? KW.bg : KW.text3,
      font: `${active ? 700 : 400} 10px var(--kw-mono)`,
      padding: "0 13px", borderRadius: 20, height: 22,
      display: "inline-flex", alignItems: "center", lineHeight: 1,
      transition: "color .18s, background .18s, border-color .18s",
    }}
    onMouseEnter={(e)=>{ if(!active) e.currentTarget.style.color = KW.text; }}
    onMouseLeave={(e)=>{ if(!active) e.currentTarget.style.color = KW.text3; }}
    >{children}</button>
  );
}

function Button({ children, variant = "primary", onClick, size = "md", style }) {
  const heights = { sm: 28, md: 33 };
  const fs = { sm: 10, md: 11 };
  const base = {
    primary: { background: KW.lavender, color: KW.bg, border: "none", fontWeight: 700 },
    secondary: { background: "transparent", color: KW.text3, border: `1px solid ${KW.surface3}`, fontWeight: 400 },
  }[variant];
  return (
    <button onClick={onClick} style={{
      height: heights[size], padding: `0 ${size==="sm"?14:18}px`, borderRadius: 6,
      font: `${base.fontWeight} ${fs[size]}px var(--kw-mono)`, cursor: "pointer",
      letterSpacing: ".02em",
      transition: "background .18s, color .18s, border-color .18s",
      ...base, ...style,
    }}
    onMouseEnter={(e)=>{
      if (variant==="primary") e.currentTarget.style.background = "#C5B7E8";
      else { e.currentTarget.style.color = KW.text; e.currentTarget.style.borderColor = KW.lavender; }
    }}
    onMouseLeave={(e)=>{
      if (variant==="primary") e.currentTarget.style.background = KW.lavender;
      else { e.currentTarget.style.color = KW.text3; e.currentTarget.style.borderColor = KW.surface3; }
    }}
    >{children}</button>
  );
}

function Input({ placeholder, value, onChange, style, onKeyDown }) {
  return (
    <input
      value={value || ""}
      onChange={(e)=>onChange&&onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        height: 33, padding: "0 13px", borderRadius: 6,
        background: KW.surface2, border: `1px solid ${KW.surface3}`,
        color: KW.text, font: "400 11px var(--kw-mono)", outline: "none",
        transition: "border-color .18s",
        ...style,
      }}
      onFocus={(e)=>e.currentTarget.style.borderColor = KW.lavender}
      onBlur={(e)=>e.currentTarget.style.borderColor = KW.surface3}
    />
  );
}

// Decorative "keyboard" placeholder rendered as keys on a tinted base.
// Keeps the page on-brand without inventing photo-style imagery.
function KeebArt({ palette = "lavender", layout = "75", seed = 0 }) {
  const palettes = {
    lavender: { case: "#2D1F4A", plate: "#3D3660", caps: "#B8A9E0", caps2: "#9B91B8", accent: "#E8A8C0" },
    pink:     { case: "#3A1F2D", plate: "#5C2E45", caps: "#E8A8C0", caps2: "#C28098", accent: "#B8A9E0" },
    blue:     { case: "#1F2D3A", plate: "#2E4458", caps: "#A8C8E8", caps2: "#7E9BBA", accent: "#E8A8C0" },
    cream:    { case: "#3A3328", plate: "#52483A", caps: "#F5E8C8", caps2: "#C8B888", accent: "#A8C8E8" },
    olive:    { case: "#2A3328", plate: "#3D4A38", caps: "#C8D8A8", caps2: "#94A878", accent: "#E8A8C0" },
    slate:    { case: "#23232E", plate: "#34344A", caps: "#9B91B8", caps2: "#6B6490", accent: "#A8E0A8" },
  };
  const p = palettes[palette] || palettes.lavender;
  // layout densities — relative # of cols
  const cols = layout === "60" ? 14 : layout === "65" ? 15 : layout === "75" ? 16 : layout === "tkl" ? 18 : layout === "40" ? 12 : 16;
  const rows = layout === "40" ? 4 : 5;
  // pseudo-random per-key accent using a deterministic hash
  const rand = (i) => ((Math.sin((i+1) * 12.9898 + seed * 78.233) + 1) * 0.5);
  const keys = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const useAccent = rand(idx) < 0.07;
      const useDim = rand(idx + 100) < 0.18;
      keys.push({ r, c, fill: useAccent ? p.accent : useDim ? p.caps2 : p.caps });
    }
  }
  // bottom row spacebar group: skip last row last 6 keys, draw spacebar
  return (
    <div style={{
      width: "100%", height: "100%", background: p.case,
      borderRadius: 6, padding: "10% 6%", boxSizing: "border-box",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: "8% 4%", background: p.plate,
        borderRadius: 4,
      }} />
      <div style={{ position: "relative", display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: "3%",
        padding: "5% 4%",
      }}>
        {keys.map((k, i) => {
          // spacebar: bottom row, cols 4..9
          const isSpaceArea = k.r === rows - 1 && k.c >= 4 && k.c <= 9;
          if (isSpaceArea && k.c !== 4) return null;
          const span = isSpaceArea ? 6 : 1;
          return (
            <div key={i} style={{
              gridColumn: `${k.c+1} / span ${span}`,
              gridRow: k.r+1,
              background: k.fill,
              borderRadius: 2,
              boxShadow: `inset 0 -2px 0 rgba(0,0,0,.18)`,
              aspectRatio: span === 1 ? "1 / 1" : "auto",
            }} />
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { KW, Tag, Pill, Button, Input, Key, Logo, Nav, Footer, KeebArt });

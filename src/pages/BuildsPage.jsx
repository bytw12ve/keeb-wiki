import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Tag from '../components/Tag.jsx'
import Pill from '../components/Pill.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import KeebArt from '../components/KeebArt.jsx'
import Toast from '../components/Toast.jsx'

const ALL_BUILDS = [
  { name: "Satisfaction75",  tags: ["75%", "Gateron Yellow", "Brass"],          art: "lavender", layout: "75",  by: "thockmaster_",   when: "5d" },
  { name: "Onibi80",         tags: ["WKL", "Holy Pandas", "Aluminum"],          art: "pink",     layout: "tkl", by: "kbd_oni",        when: "1w" },
  { name: "Tofu65",          tags: ["65%", "Holy Pandas", "Polycarbonate"],     art: "blue",     layout: "65",  by: "evergrey",       when: "2d" },
  { name: "Mode Envoy",      tags: ["60%", "Boba U4T", "Aluminum"],             art: "cream",    layout: "60",  by: "soundtest_",     when: "3d" },
  { name: "KBD75v3",         tags: ["75%", "Gateron Brown", "Steel"],           art: "olive",    layout: "75",  by: "browncow",       when: "4d" },
  { name: "Agar Mini",       tags: ["40%", "Cherry BX", "Polycarbonate"],       art: "lavender", layout: "40",  by: "tinyhands",      when: "6d" },
  { name: "Discipline65",    tags: ["65%", "Boba U4", "Carbon Fiber"],          art: "slate",    layout: "65",  by: "lateniteclacks", when: "1w" },
  { name: "Keychron Q1",     tags: ["75%", "Akko CS Jelly", "Steel"],           art: "blue",     layout: "75",  by: "qwertyqueen",    when: "1w" },
  { name: "Brutal60",        tags: ["60%", "Zealios V2", "Aluminum"],           art: "olive",    layout: "60",  by: "brut_force",     when: "2w" },
  { name: "Athena 1800",     tags: ["Full", "Moon V2", "Steel"],                art: "cream",    layout: "tkl", by: "midnight_typer", when: "2w" },
  { name: "Bakeneko60",      tags: ["60%", "Alpacas", "Polycarbonate"],         art: "pink",     layout: "60",  by: "neko_thock",     when: "2w" },
  { name: "Class65",         tags: ["65%", "Tangerines", "Brass"],              art: "lavender", layout: "65",  by: "topclass",       when: "3w" },
  { name: "Mode Sonnet",     tags: ["TKL", "Boba U4T", "POM"],                  art: "slate",    layout: "tkl", by: "iambicpent",     when: "3w" },
  { name: "QK65",            tags: ["65%", "Gateron Yellow", "Aluminum"],       art: "olive",    layout: "65",  by: "quantum_keys",   when: "3w" },
  { name: "NK87",            tags: ["TKL", "Cherry Black MX", "Aluminum"],      art: "blue",     layout: "tkl", by: "nokey87",        when: "4w" },
];

const BUILDS_FILTERS = ["all", "60%", "65%", "75%", "TKL", "linear", "tactile", "clicky", "brass", "aluminum", "polycarbonate", "WKL"];

function GridBuildCard({ b, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: KW.surface,
        border: `1px solid ${hover ? KW.surface3 : KW.border}`,
        borderRadius: 8, padding: 12, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "border-color .18s",
      }}
    >
      <div style={{ height: 110, position: "relative" }}>
        <KeebArt palette={b.art} layout={b.layout} seed={b.name.length * 5} />
        <span style={{
          position: "absolute", top: 6, right: 6,
          font: "400 9px var(--kw-mono)", color: KW.text3,
          background: "rgba(23, 20, 42, .85)", padding: "2px 6px",
          borderRadius: 4, letterSpacing: ".04em",
        }}>{b.when}</span>
      </div>
      <div style={{ font: "700 12px var(--kw-mono)", color: KW.text }}>{b.name}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {b.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
      </div>
      <div style={{ font: "400 9px var(--kw-mono)", color: KW.text4, marginTop: -2 }}>
        by {b.by}
      </div>
      <button style={{
        marginTop: "auto",
        height: 26, borderRadius: 6, cursor: "pointer",
        background: hover ? KW.surface2 : "transparent",
        border: `1px solid ${hover ? KW.lavender : KW.surface3}`,
        color: hover ? KW.lavender : KW.text3,
        font: "700 10px var(--kw-mono)", letterSpacing: ".02em",
        transition: "all .18s",
      }}>view build →</button>
    </div>
  )
}

function SortButton({ value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 36, padding: "0 14px", borderRadius: 6,
        background: KW.surface2,
        border: `1px solid ${hover ? KW.lavender : KW.surface3}`,
        color: hover ? KW.text : KW.text3,
        font: "400 11px var(--kw-mono)", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 8,
        transition: "all .18s", whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: KW.text4 }}>sort:</span>
      <span>{value}</span>
      <span style={{ color: KW.text4, marginLeft: 2 }}>↓</span>
    </button>
  )
}

function PageButton({ children, active, onClick, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minWidth: 30, height: 30, padding: "0 10px", borderRadius: 6,
        background: active ? KW.lavender : (hover && !disabled ? KW.surface2 : "transparent"),
        border: `1px solid ${active ? KW.lavender : KW.surface3}`,
        color: active ? KW.bg : (disabled ? KW.text4 : KW.text3),
        font: `${active ? 700 : 400} 11px var(--kw-mono)`,
        cursor: disabled ? "default" : "pointer",
        transition: "all .18s",
      }}
    >{children}</button>
  )
}

export default function BuildsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [sort] = useState("newest");
  const [page, setPage] = useState(1);

  const onSearch = () => { if (q.trim()) setPage(1); };

  const list = ALL_BUILDS.filter(b => !q || b.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{
      width: 1024, margin: "24px auto", background: KW.bg,
      border: `1px solid ${KW.border}`, borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column", minHeight: 700,
    }}>
      <Nav />

      <div style={{ flex: 1, padding: "32px 24px 32px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 16, marginBottom: 22,
        }}>
          <div>
            <div style={{
              font: "700 9px var(--kw-mono)", color: KW.lavender,
              letterSpacing: ".24em", textTransform: "uppercase", marginBottom: 8,
            }}>
              the archive
            </div>
            <h1 style={{ font: "700 32px/1 var(--kw-mono)", color: KW.text, margin: 0 }}>
              all builds.
            </h1>
            <div style={{ font: "400 12px var(--kw-mono)", color: KW.text3, marginTop: 8 }}>
              <span style={{ color: KW.text }}>247</span> builds in the archive
              <span style={{ color: KW.text4, margin: "0 8px" }}>•</span>
              <span>updated daily</span>
            </div>
          </div>
        </div>

        {/* Search row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Input
            style={{ flex: 1, height: 36 }}
            placeholder="search builds, switches, layouts..."
            value={q} onChange={setQ}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
          />
          <Button onClick={onSearch} style={{ height: 36 }}>search</Button>
          <SortButton value={sort} />
        </div>

        {/* Filter pills */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22,
          paddingBottom: 22, borderBottom: `1px solid ${KW.border}`,
        }}>
          {BUILDS_FILTERS.map(p => (
            <Pill key={p} active={filter === p} onClick={() => { setFilter(p); setPage(1); }}>{p}</Pill>
          ))}
        </div>

        {/* Result meta */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 14, font: "400 10px var(--kw-mono)", color: KW.text3,
        }}>
          <span>
            showing <span style={{ color: KW.text }}>1–{list.length}</span> of <span style={{ color: KW.text }}>247</span>
            {filter !== "all" && (
              <span> · filtered by <span style={{ color: KW.lavender }}>{filter}</span></span>
            )}
          </span>
          <span>page {page} of 17</span>
        </div>

        {/* 5-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 32 }}>
          {list.map((b, i) => (
            <GridBuildCard
              key={i} b={b}
              onClick={() => navigate(`/builds/${b.name.toLowerCase().replace(/\s+/g, "-")}`)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
          paddingTop: 16, borderTop: `1px solid ${KW.border}`,
        }}>
          <PageButton onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>← prev</PageButton>
          {[1, 2, 3, 4, 5].map(n => (
            <PageButton key={n} active={page === n} onClick={() => setPage(n)}>{n}</PageButton>
          ))}
          <span style={{ color: KW.text4, font: "400 11px var(--kw-mono)", padding: "0 4px" }}>…</span>
          <PageButton onClick={() => setPage(17)}>17</PageButton>
          <PageButton onClick={() => setPage(Math.min(17, page + 1))}>next →</PageButton>
        </div>
      </div>

      <Footer />
      <Toast />
    </div>
  )
}

// homepage screen — composition of nav, hero, featured, filters, recent, CTA, footer.

const FEATURED = [
  {
    name: "Satisfaction75",
    desc: "an aluminum 75% with a brass plate, gateron yellows lubed with krytox 205g0, and PE foam. deep, thocky, controlled — eight months of daily driving and i still grin every morning.",
    tags: ["75%", "Gateron Yellow", "Brass"],
    art: "lavender", layout: "75",
    by: "thockmaster_", when: "5 days ago", rating: "9/10",
  },
  {
    name: "Onibi80",
    desc: "WKL aluminum case in iced silver, holy pandas filmed and lubed with 205g0 + GPL105 on the springs. a tactile bump that's loud, proud, and unapologetic.",
    tags: ["WKL", "Holy Pandas", "Aluminum"],
    art: "pink", layout: "tkl",
    by: "kbd_oni", when: "1 week ago", rating: "8/10",
  },
];

const RECENT = [
  { name: "Tofu65",       tags: ["65%", "Holy Pandas"],          art: "blue",     layout: "65", by: "evergrey",     when: "2d" },
  { name: "Mode Envoy",   tags: ["60%", "Boba U4T"],             art: "cream",    layout: "60", by: "soundtest_",   when: "3d" },
  { name: "KBD75v3",      tags: ["75%", "Gateron Brown"],        art: "olive",    layout: "75", by: "browncow",     when: "4d" },
  { name: "Agar Mini",    tags: ["40%", "Cherry BX"],            art: "lavender", layout: "40", by: "tinyhands",    when: "6d" },
  { name: "Discipline65", tags: ["65%", "Boba U4", "Carbon Fiber"], art: "slate", layout: "65", by: "lateniteclacks",when: "1w" },
];

const FILTER_PILLS = ["all", "60%", "65%", "75%", "TKL", "linear", "tactile", "clicky", "budget", "endgame"];

function Hero({ q, setQ, onSearch }) {
  return (
    <div style={{ padding: "64px 24px 56px", textAlign: "center" }}>
      <div style={{
        font: "700 9px var(--kw-mono)", color: KW.lavender,
        letterSpacing: ".24em", textTransform: "uppercase", marginBottom: 18,
      }}>
        the keyboard build archive
      </div>
      <h1 style={{
        font: "700 38px/1.1 var(--kw-mono)", color: KW.text, margin: 0,
        letterSpacing: "-.01em",
      }}>
        find your next endgame.
      </h1>
      <div style={{
        font: "400 13px/1.6 var(--kw-mono)", color: KW.text3,
        marginTop: 14, maxWidth: 460, marginLeft: "auto", marginRight: "auto",
      }}>
        browse community builds, specs, and photos.
      </div>
      <div style={{
        display: "flex", gap: 8, justifyContent: "center", marginTop: 28,
        maxWidth: 520, marginLeft: "auto", marginRight: "auto",
      }}>
        <Input
          style={{ flex: 1, height: 36 }}
          placeholder="search builds, switches, layouts..."
          value={q} onChange={setQ}
          onKeyDown={(e)=>{ if(e.key === "Enter") onSearch(); }}
        />
        <Button onClick={onSearch} style={{ height: 36 }}>search</Button>
      </div>
      <div style={{
        marginTop: 20, font: "400 10px var(--kw-mono)", color: KW.text4,
        display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
      }}>
        <span>247 builds in the archive</span>
        <span>•</span>
        <span>updated daily</span>
        <span>•</span>
        <span>no ads, no algorithm</span>
      </div>
    </div>
  );
}

function FeaturedCard({ b, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        background: KW.surface,
        border: `1px solid ${hover ? KW.surface3 : KW.border}`,
        borderRadius: 8, padding: 18, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 14,
        transition: "border-color .18s",
      }}
    >
      <div style={{ height: 168 }}>
        <KeebArt palette={b.art} layout={b.layout} seed={b.name.length} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ font: "700 16px var(--kw-mono)", color: KW.text }}>{b.name}</div>
        <div style={{ font: "400 10px var(--kw-mono)", color: KW.text4 }}>
          by <span style={{ color: KW.text3 }}>{b.by}</span> · {b.when}
        </div>
      </div>
      <div style={{ font: "400 11px/1.7 var(--kw-mono)", color: KW.text2 }}>{b.desc}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {b.tags.map((t,i) => <Tag key={i}>{t}</Tag>)}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 12, borderTop: `1px solid ${KW.border}`,
      }}>
        <span style={{ font: "400 10px var(--kw-mono)", color: KW.text3 }}>
          rated <span style={{ color: KW.text }}>{b.rating}</span> by builder
        </span>
        <span style={{
          font: "700 11px var(--kw-mono)",
          color: hover ? KW.text : KW.lavender,
          transition: "color .18s",
        }}>
          view full build →
        </span>
      </div>
    </div>
  );
}

function RecentCard({ b, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        background: KW.surface,
        border: `1px solid ${hover ? KW.surface3 : KW.border}`,
        borderRadius: 8, padding: 12, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "border-color .18s",
      }}
    >
      <div style={{ height: 96 }}>
        <KeebArt palette={b.art} layout={b.layout} seed={b.name.length * 3} />
      </div>
      <div style={{ font: "700 12px var(--kw-mono)", color: KW.text }}>{b.name}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {b.tags.map((t,i) => <Tag key={i}>{t}</Tag>)}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "auto", paddingTop: 6,
      }}>
        <span style={{ font: "400 9px var(--kw-mono)", color: KW.text4 }}>
          {b.by} · {b.when}
        </span>
        <span style={{
          font: "700 10px var(--kw-mono)",
          color: hover ? KW.text : KW.lavender,
          transition: "color .18s",
        }}>
          view build →
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ title, eyebrow, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 14, gap: 12,
    }}>
      <div>
        {eyebrow && (
          <div style={{
            font: "700 9px var(--kw-mono)", color: KW.text4,
            letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 6,
          }}>
            {eyebrow}
          </div>
        )}
        <div style={{ font: "700 16px var(--kw-mono)", color: KW.text }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function CTA({ onSubmit }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 10,
      padding: "32px 28px",
      display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 24,
    }}>
      <div>
        <div style={{
          font: "700 9px var(--kw-mono)", color: KW.pink,
          letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 10,
        }}>
          contribute.
        </div>
        <div style={{ font: "700 22px var(--kw-mono)", color: KW.text, marginBottom: 8 }}>
          built something you're proud of?
        </div>
        <div style={{ font: "400 11px/1.7 var(--kw-mono)", color: KW.text3, maxWidth: 460 }}>
          document your build and add it to the archive — specs, photos, mods, and what you'd do differently next time. takes about ten minutes.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <Button onClick={onSubmit}>submit your build →</Button>
        <span style={{ font: "400 10px var(--kw-mono)", color: KW.text4 }}>
          no account needed.
        </span>
      </div>
    </div>
  );
}

function HomePage() {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const onSearch = () => {
    if (!q.trim()) return;
    // No-op nav stub; surface a soft toast instead.
    flashToast(`searched: "${q}" — opening builds.`);
  };
  const onNav = (k) => flashToast(`→ ${k}`);
  const flashToast = (msg) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => { el.style.opacity = "0"; }, 1400);
  };

  return (
    <div data-screen-label="01 homepage" style={{
      width: 1024, margin: "24px auto", background: KW.bg,
      border: `1px solid ${KW.border}`, borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column", minHeight: 700,
    }}>
      <Nav active="home" onNav={onNav} />

      <div style={{ flex: 1, padding: "0 24px 32px" }}>
        <Hero q={q} setQ={setQ} onSearch={onSearch} />

        <SectionHeader
          title="featured builds."
          eyebrow="staff picks"
          right={<span style={{ font: "400 10px var(--kw-mono)", color: KW.text3 }}>2 of the week</span>}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36 }}>
          {FEATURED.map((b,i) => <FeaturedCard key={i} b={b} onClick={()=>flashToast(`→ ${b.name}`)} />)}
        </div>

        <SectionHeader
          title="browse by."
          eyebrow="filter"
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 36 }}>
          {FILTER_PILLS.map(p =>
            <Pill key={p} active={filter===p} onClick={()=>setFilter(p)}>{p}</Pill>
          )}
        </div>

        <SectionHeader
          title="recent builds."
          eyebrow="just submitted"
          right={
            <a
              onClick={()=>flashToast("→ all builds")}
              style={{
                font: "400 11px var(--kw-mono)", color: KW.lavender,
                cursor: "pointer", textDecoration: "none",
              }}
            >view all →</a>
          }
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10, marginBottom: 36,
        }}>
          {RECENT.map((b,i) => <RecentCard key={i} b={b} onClick={()=>flashToast(`→ ${b.name}`)} />)}
        </div>

        <CTA onSubmit={()=>flashToast("→ submit your build")} />
      </div>

      <Footer />

      <div id="toast" style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: KW.surface2, border: `1px solid ${KW.surface3}`,
        color: KW.text, font: "400 10px var(--kw-mono)",
        padding: "8px 14px", borderRadius: 6,
        opacity: 0, transition: "opacity .2s", pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
}

Object.assign(window, { HomePage });

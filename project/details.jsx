// build detail page — Satisfaction75

const BUILD = {
  name: "Satisfaction75",
  tags: ["75%", "Gateron Yellow", "Brass"],
  by: "thockmaster_",
  when: "march 2026",
  art: "lavender", layout: "75",
  rating: 9,
  specs: [
    ["layout",       "75% — exploded"],
    ["case",         "Aluminum"],
    ["case color",   "Iced Silver"],
    ["plate",        "Brass"],
    ["switches",     "Gateron Yellow"],
    ["lubed",        "yes — krytox 205g0"],
    ["filmed",       "yes — deskeys"],
    ["keycaps",      "GMK Olivia"],
    ["mods",         "tape mod, PE foam, force break"],
  ],
  notes: [
    "this has been my daily driver for about eight months and i couldn't be happier. the brass plate paired with PE foam gives a really satisfying thocky sound without being too loud — coworkers haven't complained once on calls.",
    "the gateron yellows are buttery smooth after a coat of 205g0, and deskeys films tightened up the wobble nicely. i'd probably go with a polycarbonate plate next time just to compare, but honestly the brass is doing it for me.",
    "build took maybe four hours start to finish, most of that lubing. tape mod made a bigger difference than expected.",
  ],
  sound: {
    signature: ["deep", "muted", "thocky"],
    feel: ["smooth", "light", "fast"],
    level: ["quiet"],
  },
  galleryPalettes: ["lavender", "pink", "blue", "cream", "olive", "slate"],
};

function SpecRow({ k, v, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0",
      borderBottom: last ? "none" : `1px solid ${KW.border}`,
      font: "400 11px var(--kw-mono)",
      gap: 12,
    }}>
      <span style={{ color: KW.text3 }}>{k}</span>
      <span style={{ color: KW.text, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Bubble({ title, titleColor, children, style }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 18, ...style,
    }}>
      {title && (
        <div style={{
          font: "700 11px var(--kw-mono)",
          color: titleColor || KW.lavender,
          marginBottom: 14, letterSpacing: ".02em",
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

function SoundTestButton({ onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        width: "100%", height: 32, borderRadius: 6,
        background: hover ? KW.surface2 : "transparent",
        border: `1px solid ${hover ? KW.blue : KW.surface3}`,
        color: hover ? KW.blue : KW.text3,
        font: "700 10px var(--kw-mono)", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all .18s",
      }}
    >
      <span style={{
        width: 0, height: 0,
        borderLeft: `6px solid ${hover ? KW.blue : KW.text3}`,
        borderTop: "4px solid transparent",
        borderBottom: "4px solid transparent",
        transition: "border-color .18s",
      }} />
      youtube sound test →
    </button>
  );
}

function SoundGroup({ label, tags, kind }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        font: "700 9px var(--kw-mono)", color: KW.text3,
        letterSpacing: ".12em", marginBottom: 7,
      }}>{label}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {tags.map((t,i) => <Tag key={i} kind={kind}>{t}</Tag>)}
      </div>
    </div>
  );
}

function GalleryTile({ palette, layout, seed }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        paddingTop: "75%", borderRadius: 6, position: "relative",
        overflow: "hidden", cursor: "pointer",
        border: `1px solid ${hover ? KW.surface3 : "transparent"}`,
        transition: "border-color .18s",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <KeebArt palette={palette} layout={layout} seed={seed} />
      </div>
    </div>
  );
}

function DetailsPage() {
  const flashToast = (msg) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => { el.style.opacity = "0"; }, 1400);
  };

  return (
    <div data-screen-label="03 build details" style={{
      width: 1024, margin: "24px auto", background: KW.bg,
      border: `1px solid ${KW.border}`, borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column", minHeight: 700,
    }}>
      <Nav active="builds" onNav={(k)=>flashToast(`→ ${k}`)} />

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        {/* Back link */}
        <a
          href="#"
          onClick={(e)=>{e.preventDefault();flashToast("→ all builds");}}
          style={{
            font: "400 10px var(--kw-mono)", color: KW.text3,
            textDecoration: "none", cursor: "pointer",
            transition: "color .18s",
            display: "inline-block", marginBottom: 22,
          }}
          onMouseEnter={(e)=>e.currentTarget.style.color = KW.text}
          onMouseLeave={(e)=>e.currentTarget.style.color = KW.text3}
        >← back to builds</a>

        {/* Title row */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 16, marginBottom: 6,
        }}>
          <h1 style={{ font: "700 28px/1 var(--kw-mono)", color: KW.text, margin: 0 }}>
            {BUILD.name}
          </h1>
          <div style={{ display: "flex", gap: 5, paddingTop: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {BUILD.tags.map((t,i) => <Tag key={i}>{t}</Tag>)}
          </div>
        </div>
        <div style={{ font: "400 11px var(--kw-mono)", color: KW.text3, marginBottom: 18 }}>
          submitted by <span style={{ color: KW.text2 }}>{BUILD.by}</span>
          <span style={{ color: KW.text4, margin: "0 8px" }}>·</span>
          <span>{BUILD.when}</span>
        </div>

        {/* Hero image */}
        <div style={{
          height: 280, marginBottom: 18, borderRadius: 10, overflow: "hidden",
        }}>
          <KeebArt palette={BUILD.art} layout={BUILD.layout} seed={11} />
        </div>

        {/* 3-column cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
          {/* Build specs */}
          <Bubble title="build specs.">
            <div>
              {BUILD.specs.map(([k,v], i) => (
                <SpecRow key={k} k={k} v={v} last={i === BUILD.specs.length - 1} />
              ))}
            </div>
          </Bubble>

          {/* Builder's notes */}
          <Bubble title="builder's notes.">
            <div style={{ font: "400 11px/1.8 var(--kw-mono)", color: KW.text2 }}>
              {BUILD.notes.map((p,i) => (
                <p key={i} style={{ margin: i === 0 ? "0 0 12px" : "0 0 12px" }}>{p}</p>
              ))}
            </div>
            <div style={{
              marginTop: 6, paddingTop: 14,
              borderTop: `1px solid ${KW.border}`,
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
            }}>
              <span style={{
                font: "700 9px var(--kw-mono)", color: KW.text3,
                letterSpacing: ".12em",
              }}>OVERALL RATING</span>
              <span style={{ font: "700 18px var(--kw-mono)", color: KW.lavender }}>
                {BUILD.rating}<span style={{ color: KW.text4, fontWeight: 400, fontSize: 12 }}>/10</span>
              </span>
            </div>
            <div style={{
              font: "400 10px var(--kw-mono)", color: KW.text4,
              marginTop: 4, textAlign: "right",
            }}>
              would absolutely build again.
            </div>
          </Bubble>

          {/* Sound & feel */}
          <Bubble title="sound & feel profile." titleColor={KW.pink}>
            <SoundGroup label="SOUND SIGNATURE" tags={BUILD.sound.signature} kind="materials" />
            <SoundGroup label="TYPING FEEL"      tags={BUILD.sound.feel}      kind="materials" />
            <SoundGroup label="SOUND LEVEL"      tags={BUILD.sound.level}     kind="switches" />
            <div style={{ marginTop: 4 }}>
              <SoundTestButton onClick={()=>flashToast("→ youtube sound test")} />
            </div>
          </Bubble>
        </div>

        {/* Gallery */}
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <div>
            <div style={{
              font: "700 9px var(--kw-mono)", color: KW.text4,
              letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 6,
            }}>photos</div>
            <div style={{ font: "700 16px var(--kw-mono)", color: KW.text }}>build gallery.</div>
          </div>
          <span style={{ font: "400 10px var(--kw-mono)", color: KW.text3 }}>
            6 photos · click to expand
          </span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}>
          {BUILD.galleryPalettes.map((p, i) => (
            <GalleryTile key={i} palette={p} layout={BUILD.layout} seed={i * 7 + 3} />
          ))}
        </div>
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

Object.assign(window, { DetailsPage });

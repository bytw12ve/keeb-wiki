const PALETTES = {
  lavender: { case: "#2D1F4A", plate: "#3D3660", caps: "#B8A9E0", caps2: "#9B91B8", accent: "#E8A8C0" },
  pink:     { case: "#3A1F2D", plate: "#5C2E45", caps: "#E8A8C0", caps2: "#C28098", accent: "#B8A9E0" },
  blue:     { case: "#1F2D3A", plate: "#2E4458", caps: "#A8C8E8", caps2: "#7E9BBA", accent: "#E8A8C0" },
  cream:    { case: "#3A3328", plate: "#52483A", caps: "#F5E8C8", caps2: "#C8B888", accent: "#A8C8E8" },
  olive:    { case: "#2A3328", plate: "#3D4A38", caps: "#C8D8A8", caps2: "#94A878", accent: "#E8A8C0" },
  slate:    { case: "#23232E", plate: "#34344A", caps: "#9B91B8", caps2: "#6B6490", accent: "#A8E0A8" },
};

export default function KeebArt({ palette = "lavender", layout = "75", seed = 0 }) {
  const p = PALETTES[palette] || PALETTES.lavender;
  const cols = layout === "60" ? 14 : layout === "65" ? 15 : layout === "75" ? 16 : layout === "tkl" ? 18 : layout === "40" ? 12 : 16;
  const rows = layout === "40" ? 4 : 5;
  const rand = (i) => ((Math.sin((i + 1) * 12.9898 + seed * 78.233) + 1) * 0.5);
  const keys = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const useAccent = rand(idx) < 0.07;
      const useDim = rand(idx + 100) < 0.18;
      keys.push({ r, c, fill: useAccent ? p.accent : useDim ? p.caps2 : p.caps });
    }
  }
  return (
    <div style={{
      width: "100%", height: "100%", background: p.case,
      borderRadius: 6, padding: "10% 6%", boxSizing: "border-box",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: "8% 4%", background: p.plate, borderRadius: 4 }} />
      <div style={{
        position: "relative", display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: "3%", padding: "5% 4%",
      }}>
        {keys.map((k, i) => {
          const isSpaceArea = k.r === rows - 1 && k.c >= 4 && k.c <= 9;
          if (isSpaceArea && k.c !== 4) return null;
          const span = isSpaceArea ? 6 : 1;
          return (
            <div key={i} style={{
              gridColumn: `${k.c + 1} / span ${span}`,
              gridRow: k.r + 1,
              background: k.fill,
              borderRadius: 2,
              boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)",
              aspectRatio: span === 1 ? "1 / 1" : "auto",
            }} />
          );
        })}
      </div>
    </div>
  )
}

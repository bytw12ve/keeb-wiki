/* built by twelve. */
export const KW = {
  bg: "#1E1B2E", surface: "#17142A", surface2: "#2D2845", surface3: "#3D3660",
  lavender: "#B8A9E0", pink: "#E8A8C0", blue: "#A8C8E8", green: "#A8E0A8",
  text: "#F5F2E8", text2: "#C8C0E0", text3: "#9B91B8", text4: "#6B6490",
  border: "#2D2845",
};

export const TINT = {
  layout:    { bg: "#2D1F4A", fg: "#B8A9E0" },
  switches:  { bg: "#1F2D3A", fg: "#A8C8E8" },
  materials: { bg: "#2D1F2A", fg: "#E8A8C0" },
  community: { bg: "#1F2D1F", fg: "#A8E0A8" },
};

const TAG_LOOKUP = {
  layout: ["60%","65%","75%","80%","TKL","WKL","Full","40%","budget","endgame","modding","beginner","beginner friendly","glossary","layout"],
  switches: ["linear","tactile","clicky","switches","Gateron Yellow","Holy Pandas","Boba U4T","Boba U4","Gateron Brown","Cherry BX","Cherry Black MX","Akko CS Jelly","Zealios V2","Moon V2","Alpacas","Tangerines"],
  materials: ["sound","sound & feel","keycaps","Brass","Aluminum","Polycarbonate","Steel","Carbon Fiber","POM"],
  community: ["community","buying guide"],
};

export function tagKind(text) {
  const normalized = String(text).toLowerCase()
  for (const k of Object.keys(TAG_LOOKUP)) {
    if (TAG_LOOKUP[k].some(t => t.toLowerCase() === normalized)) return k;
  }
  return "layout";
}

export const LOGO_COLORS = [
  KW.lavender, KW.pink, KW.blue,
  KW.lavender, KW.pink, KW.blue,
  KW.lavender, KW.pink,
];

export const MONO = "var(--kw-mono)";

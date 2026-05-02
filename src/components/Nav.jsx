/* built by twelve. — bytw12ve */
import { useNavigate, useLocation } from 'react-router-dom'
import { KW } from '../tokens.js'
import Logo from './Logo.jsx'
import { useAuth } from '../lib/auth.jsx'

const LINKS = [
  { key: "home",   label: "home.",   path: "/" },
  { key: "builds", label: "builds.", path: "/builds" },
  { key: "submit", label: "submit.", path: "/submit" },
  { key: "wiki",   label: "wiki.",   path: "/wiki" },
];

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const activeKey = location.pathname === "/" ? "home"
    : location.pathname.startsWith("/builds") ? "builds"
    : location.pathname.startsWith("/submit") ? "submit"
    : location.pathname.startsWith("/wiki") ? "wiki"
    : location.pathname.startsWith("/profile") ? "profile"
    : location.pathname.startsWith("/login") ? "login"
    : location.pathname.startsWith("/submit-wiki") ? "submit"
    : null;
  const authLinks = user
    ? [{ key: "profile", label: "profile.", path: "/profile" }]
    : [{ key: "login", label: "login.", path: "/login" }]
  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0]

  return (
    <div style={{
      minHeight: 44, background: KW.surface,
      borderBottom: `1px solid ${KW.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 24px", flexShrink: 0, gap: 16, flexWrap: "wrap",
    }}>
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); navigate("/"); }}
        style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
      >
        <Logo />
        <span style={{ marginLeft: 12, font: "400 9px var(--kw-mono)", color: KW.text3, letterSpacing: ".06em" }}>
          the keyboard build archive
        </span>
      </a>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        {user && displayName && (
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: KW.surface2,
              border: `1px solid ${KW.surface3}`,
              borderRadius: 8,
              padding: '6px 9px',
              color: KW.lavender,
              font: '700 10px var(--kw-mono)',
              cursor: 'pointer',
            }}
          >
            logged in as {displayName}.
          </button>
        )}
        {[...LINKS, ...authLinks].map(({ key, label, path }) => {
          const isActive = activeKey === key;
          return (
            <a
              key={key}
              href={path}
              onClick={(e) => { e.preventDefault(); navigate(path); }}
              style={{
                font: `${isActive ? 700 : 400} 11px var(--kw-mono)`,
                color: isActive ? KW.lavender : KW.text3,
                textDecoration: "none", cursor: "pointer",
                transition: "color .18s",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = KW.text; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = KW.text3; }}
            >{label}</a>
          );
        })}
        {user && (
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            style={{ background: 'none', border: 'none', padding: 0, font: '400 11px var(--kw-mono)', color: KW.text3, cursor: 'pointer' }}
          >
            logout.
          </button>
        )}
      </div>
    </div>
  )
}

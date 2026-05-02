/* built by twelve. — bytw12ve */
import { useState } from 'react'
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
  const [accountOpen, setAccountOpen] = useState(false);

  const activeKey = location.pathname === "/" ? "home"
    : location.pathname.startsWith("/builds") ? "builds"
    : location.pathname.startsWith("/submit") ? "submit"
    : location.pathname.startsWith("/wiki") ? "wiki"
    : location.pathname.startsWith("/profile") ? "profile"
    : location.pathname.startsWith("/login") ? "login"
    : location.pathname.startsWith("/submit-wiki") ? "submit"
    : null;
  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0]
  const textLinkStyle = (isActive) => ({
    font: `${isActive ? 700 : 400} 11px var(--kw-mono)`,
    color: isActive ? KW.lavender : KW.text3,
    textDecoration: "none", cursor: "pointer",
    transition: "color .18s",
  })

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
        {LINKS.map(({ key, label, path }) => {
          const isActive = activeKey === key;
          return (
            <a
              key={key}
              href={path}
              onClick={(e) => { e.preventDefault(); navigate(path); }}
              style={textLinkStyle(isActive)}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = KW.text; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = KW.text3; }}
            >{label}</a>
          );
        })}
        {user && displayName ? (
          <div
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
            onFocus={() => setAccountOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setAccountOpen(false)
            }}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: KW.surface2,
                border: `1px solid ${activeKey === 'profile' || accountOpen ? KW.surface3 : KW.border}`,
                borderRadius: 8,
                padding: '6px 9px',
                color: KW.lavender,
                font: '700 10px var(--kw-mono)',
                cursor: 'pointer',
                boxShadow: accountOpen ? '0 8px 18px rgba(0,0,0,.18)' : 'none',
              }}
            >
              logged in as {displayName}.
            </button>
            {accountOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                zIndex: 20,
                minWidth: 132,
                background: KW.surface,
                border: `1px solid ${KW.border}`,
                borderRadius: 8,
                padding: 6,
                boxShadow: '0 12px 24px rgba(0,0,0,.24)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
                <button
                  onClick={() => navigate('/profile')}
                  style={{ background: 'transparent', border: 'none', borderRadius: 6, color: KW.text3, cursor: 'pointer', font: '400 11px var(--kw-mono)', padding: '8px 10px', textAlign: 'left' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                >
                  profile.
                </button>
                <button
                  onClick={async () => { await signOut(); navigate('/') }}
                  style={{ background: 'transparent', border: 'none', borderRadius: 6, color: KW.text3, cursor: 'pointer', font: '400 11px var(--kw-mono)', padding: '8px 10px', textAlign: 'left' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = KW.pink}
                  onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                >
                  logout.
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            style={textLinkStyle(activeKey === 'login')}
            onMouseEnter={(e) => { if (activeKey !== 'login') e.currentTarget.style.color = KW.text; }}
            onMouseLeave={(e) => { if (activeKey !== 'login') e.currentTarget.style.color = KW.text3; }}
          >
            login.
          </a>
        )}
      </div>
    </div>
  )
}

/* built by twelve. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { KW } from '../tokens.js'
import Logo from './Logo.jsx'
import { useAuth } from '../lib/auth.jsx'
import { isStaffProfile } from '../lib/supabase.js'

const COMMUNITY_LINKS = [
  ['contact.', '/contact'],
  ['suggestions.', '/suggestions'],
]

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const accountCloseTimer = useRef(null);
  const communityCloseTimer = useRef(null);

  const activeKey = location.pathname === "/" ? "home"
    : location.pathname.startsWith("/builds") || location.pathname === "/submit" ? "builds"
    : location.pathname.startsWith("/wiki") || location.pathname === "/submit-wiki" ? "wiki"
    : location.pathname.startsWith("/contact") || location.pathname.startsWith("/suggestions") ? "community"
    : location.pathname.startsWith("/admin") ? "admin"
    : location.pathname.startsWith("/profile") ? "profile"
    : location.pathname.startsWith("/login") ? "login"
    : null;
  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0]
  const isStaff = isStaffProfile(profile)
  const openAccount = () => {
    window.clearTimeout(accountCloseTimer.current)
    setAccountOpen(true)
  }
  const closeAccountSoon = () => {
    window.clearTimeout(accountCloseTimer.current)
    accountCloseTimer.current = window.setTimeout(() => setAccountOpen(false), 180)
  }
  const openCommunity = () => {
    window.clearTimeout(communityCloseTimer.current)
    setCommunityOpen(true)
  }
  const closeCommunitySoon = () => {
    window.clearTimeout(communityCloseTimer.current)
    communityCloseTimer.current = window.setTimeout(() => setCommunityOpen(false), 180)
  }
  useEffect(() => {
    return () => {
      window.clearTimeout(accountCloseTimer.current)
      window.clearTimeout(communityCloseTimer.current)
    }
  }, [])
  const navTriggerStyle = (isActive) => ({
    height: 18,
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1,
    font: `${isActive ? 700 : 400} 11px var(--kw-mono)`,
    color: isActive ? KW.lavender : KW.text3,
    textDecoration: "none",
    cursor: "pointer",
    transition: "color .18s",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: 0,
    margin: 0,
    appearance: "none",
    WebkitAppearance: "none",
  })
  const menuPanelStyle = {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    zIndex: 20,
    minWidth: 142,
    background: KW.surface,
    border: `1px solid ${KW.border}`,
    borderRadius: 8,
    padding: 6,
    boxShadow: '0 12px 24px rgba(0,0,0,.24)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }
  const menuItemStyle = (isActive) => ({
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    color: isActive ? KW.lavender : KW.text3,
    cursor: 'pointer',
    font: `${isActive ? 700 : 400} 11px var(--kw-mono)`,
    padding: '8px 10px',
    textAlign: 'left',
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
        {[
          ['home.', '/', 'home'],
          ['builds.', '/builds', 'builds'],
          ['wiki.', '/wiki', 'wiki'],
        ].map(([label, path, key]) => {
          const isActive = activeKey === key
          return (
            <a
              key={path}
              href={path}
              onClick={(e) => { e.preventDefault(); navigate(path); }}
              style={navTriggerStyle(isActive)}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = KW.text; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = KW.text3; }}
            >{label}</a>
          )
        })}
        <div
          onMouseEnter={openCommunity}
          onMouseLeave={closeCommunitySoon}
          onFocus={openCommunity}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) closeCommunitySoon()
          }}
          style={{ position: 'relative', height: 18, display: 'inline-flex', alignItems: 'center' }}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={communityOpen}
            onClick={openCommunity}
            style={navTriggerStyle(activeKey === 'community' || communityOpen)}
            onMouseEnter={(e) => { if (activeKey !== 'community') e.currentTarget.style.color = KW.text; }}
            onMouseLeave={(e) => { if (activeKey !== 'community' && !communityOpen) e.currentTarget.style.color = KW.text3; }}
          >
            community.
          </button>
          {communityOpen && (
            <>
              <div style={{ position: 'absolute', right: 0, top: '100%', width: '100%', height: 10 }} />
              <div role="menu" style={{ ...menuPanelStyle, minWidth: 154 }}>
                {COMMUNITY_LINKS.map(([label, path]) => {
                  const isActive = path === '/submit-wiki'
                    ? location.pathname === '/submit-wiki'
                    : location.pathname.startsWith(path)
                  return (
                    <button
                      key={path}
                      role="menuitem"
                      onClick={() => { setCommunityOpen(false); navigate(path) }}
                      style={menuItemStyle(isActive)}
                      onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                      onMouseLeave={(e) => e.currentTarget.style.color = isActive ? KW.lavender : KW.text3}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
        {user && displayName ? (
          <div
            onMouseEnter={openAccount}
            onMouseLeave={closeAccountSoon}
            onFocus={openAccount}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) closeAccountSoon()
            }}
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              style={{
                background: KW.surface2,
                border: `1px solid ${activeKey === 'profile' || accountOpen ? KW.surface3 : KW.border}`,
                borderRadius: 8,
                padding: '6px 9px',
                color: KW.lavender,
                font: '700 10px var(--kw-mono)',
                cursor: 'default',
                boxShadow: accountOpen ? '0 8px 18px rgba(0,0,0,.18)' : 'none',
              }}
            >
              logged in as {displayName}.
            </button>
            {accountOpen && (
              <>
                <div style={{ position: 'absolute', right: 0, top: '100%', width: '100%', height: 10 }} />
                <div role="menu" style={{
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
                    role="menuitem"
                    onClick={() => navigate('/profile')}
                    style={{ background: 'transparent', border: 'none', borderRadius: 6, color: KW.text3, cursor: 'pointer', font: '400 11px var(--kw-mono)', padding: '8px 10px', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                    onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                  >
                    profile.
                  </button>
                  {isStaff && (
                    <button
                      role="menuitem"
                      onClick={() => navigate('/admin')}
                      style={{ background: 'transparent', border: 'none', borderRadius: 6, color: activeKey === 'admin' ? KW.lavender : KW.text3, cursor: 'pointer', font: `${activeKey === 'admin' ? 700 : 400} 11px var(--kw-mono)`, padding: '8px 10px', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = KW.text}
                      onMouseLeave={(e) => e.currentTarget.style.color = activeKey === 'admin' ? KW.lavender : KW.text3}
                    >
                      admin.
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={async () => { await signOut(); navigate('/') }}
                    style={{ background: 'transparent', border: 'none', borderRadius: 6, color: KW.text3, cursor: 'pointer', font: '400 11px var(--kw-mono)', padding: '8px 10px', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = KW.pink}
                    onMouseLeave={(e) => e.currentTarget.style.color = KW.text3}
                  >
                    logout.
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            style={navTriggerStyle(activeKey === 'login')}
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

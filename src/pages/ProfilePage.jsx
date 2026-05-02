/* built by twelve. — bytw12ve */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../lib/auth.jsx'
import { fetchOwnBuilds, fetchOwnWikiArticles, softDeleteOwnBuild, softDeleteOwnWikiArticle, buildRouteSlug } from '../lib/supabase.js'

function StatusPill({ status, deleted }) {
  const label = deleted ? 'deleted' : status || 'published'
  const color = label === 'published' ? KW.green : label === 'pending' ? KW.lavender : KW.pink
  return (
    <span style={{
      height: 18, padding: '0 8px', borderRadius: 20,
      background: KW.surface2, border: `1px solid ${KW.surface3}`,
      color, font: '700 9px var(--kw-mono)', display: 'inline-flex', alignItems: 'center',
    }}>{label}</span>
  )
}

function Row({ title, meta, status, deleted, onView, onEdit, onDelete }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{title}</span>
          <StatusPill status={status} deleted={deleted} />
        </div>
        <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>{meta}</div>
      </div>
      {!deleted && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onView} style={{ background: 'transparent', border: `1px solid ${KW.surface3}`, color: KW.lavender, height: 28, padding: '0 12px', borderRadius: 6, font: '400 10px var(--kw-mono)', cursor: 'pointer' }}>view</button>
          <button onClick={onEdit} style={{ background: 'transparent', border: `1px solid ${KW.surface3}`, color: KW.text3, height: 28, padding: '0 12px', borderRadius: 6, font: '400 10px var(--kw-mono)', cursor: 'pointer' }}>edit</button>
          <button onClick={onDelete} style={{ background: 'transparent', border: `1px solid ${KW.surface3}`, color: KW.pink, height: 28, padding: '0 12px', borderRadius: 6, font: '400 10px var(--kw-mono)', cursor: 'pointer' }}>delete</button>
        </div>
      )}
    </div>
  )
}

function Section({ title, empty, children }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ font: '700 11px var(--kw-mono)', color: KW.lavender, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hasChildren ? children : <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 16, font: '400 11px var(--kw-mono)', color: KW.text4 }}>{empty}</div>}
      </div>
    </div>
  )
}

function ConfirmDelete({ target, onCancel, onConfirm, busy }) {
  if (!target) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(14,12,24,.72)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420, background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 20, boxShadow: '0 18px 40px rgba(0,0,0,.34)' }}>
        <div style={{ font: '700 14px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>delete {target.kind}?</div>
        <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginBottom: 18 }}>
          this will remove <span style={{ color: KW.text2 }}>{target.title}</span> from your profile and public pages.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} disabled={busy} style={{ height: 30, padding: '0 14px', borderRadius: 6, border: `1px solid ${KW.surface3}`, background: 'transparent', color: KW.text3, font: '400 10px var(--kw-mono)', cursor: busy ? 'default' : 'pointer', opacity: busy ? .6 : 1 }}>cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ height: 30, padding: '0 14px', borderRadius: 6, border: `1px solid ${KW.pink}`, background: 'transparent', color: KW.pink, font: '700 10px var(--kw-mono)', cursor: busy ? 'default' : 'pointer', opacity: busy ? .6 : 1 }}>{busy ? 'deleting...' : 'delete'}</button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [builds, setBuilds] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = async () => {
    setLoading(true)
    const [{ data: ownBuilds }, { data: ownArticles }] = await Promise.all([
      fetchOwnBuilds(user.id),
      fetchOwnWikiArticles(user.id),
    ])
    setBuilds(ownBuilds)
    setArticles(ownArticles)
    setLoading(false)
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  const deleteBuild = async (id) => {
    setDeleting(true)
    setDeleteError('')
    const { error } = await softDeleteOwnBuild(id)
    setDeleting(false)
    if (error) {
      setDeleteError('could not delete that build. refresh and try again.')
      return
    }
    setConfirmDelete(null)
    await load()
  }

  const deleteArticle = async (id) => {
    setDeleting(true)
    setDeleteError('')
    const { error } = await softDeleteOwnWikiArticle(id)
    setDeleting(false)
    if (error) {
      setDeleteError('could not delete that wiki article. refresh and try again.')
      return
    }
    setConfirmDelete(null)
    await load()
  }
  const displayName = profile?.username || user?.email?.split('@')[0] || 'member'

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px' }}>
        <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>profile.</h1>
        <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: '0 0 22px' }}>
          manage your builds and wiki submissions.
        </p>

        <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 20, maxWidth: 520 }}>
          <div style={{ font: '700 11px var(--kw-mono)', color: KW.lavender, marginBottom: 14 }}>account.</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, font: '400 11px var(--kw-mono)' }}>
              <span style={{ color: KW.text3 }}>username</span>
              <span style={{ color: KW.text }}>{displayName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, font: '400 11px var(--kw-mono)' }}>
              <span style={{ color: KW.text3 }}>email</span>
              <span style={{ color: KW.text2, textAlign: 'right' }}>{user.email}</span>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${KW.border}`, font: '400 10px/1.6 var(--kw-mono)', color: KW.text4 }}>
            username changes are not self-service yet.
          </div>
        </div>

        {deleteError && <div style={{ marginTop: 18, font: '400 10px var(--kw-mono)', color: KW.pink }}>{deleteError}</div>}

        {loading ? (
          <div style={{ marginTop: 28, font: '400 11px var(--kw-mono)', color: KW.text4 }}>loading your posts...</div>
        ) : (
          <>
            <Section title="your builds" empty="no builds yet.">
              {builds.map(b => (
                <Row
                  key={b.id}
                  title={b.name}
                  meta={`${b.layout || 'unknown layout'} · ${new Date(b.created_at).toLocaleDateString('en-US')}`}
                  status={b.status}
                  deleted={Boolean(b.deleted_at)}
                  onView={() => navigate(`/builds/${buildRouteSlug(b)}`, { state: { from: 'profile' } })}
                  onEdit={() => navigate(`/builds/${buildRouteSlug(b)}/edit`)}
                  onDelete={() => setConfirmDelete({ kind: 'build', title: b.name, onConfirm: () => deleteBuild(b.id) })}
                />
              ))}
            </Section>
            <Section title="your wiki submissions" empty="no wiki submissions yet.">
              {articles.map(a => (
                <Row
                  key={a.id}
                  title={a.title}
                  meta={`${a.category} · ${new Date(a.created_at).toLocaleDateString('en-US')}`}
                  status={a.status}
                  deleted={Boolean(a.deleted_at)}
                  onView={() => navigate(`/wiki/${a.slug}`)}
                  onEdit={() => navigate(`/wiki/${a.slug}/edit`)}
                  onDelete={() => setConfirmDelete({ kind: 'wiki article', title: a.title, onConfirm: () => deleteArticle(a.id) })}
                />
              ))}
            </Section>
          </>
        )}
      </div>
      <ConfirmDelete
        target={confirmDelete}
        busy={deleting}
        onCancel={() => !deleting && setConfirmDelete(null)}
        onConfirm={() => confirmDelete?.onConfirm()}
      />
      <Footer />
    </div>
  )
}

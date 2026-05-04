/* built by twelve. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KW } from '../tokens.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'
import {
  buildRouteSlug,
  deleteBuildAsStaff,
  deleteWikiArticleAsStaff,
  fetchAdminAuditLog,
  fetchAdminPendingBuilds,
  fetchAdminPendingWikiArticles,
  fetchAdminPublishedBuilds,
  fetchAdminSuggestions,
  isStaffProfile,
  moderateBuild,
  moderateWikiArticle,
  setBuildStaffPick,
  updateSuggestionStatus,
} from '../lib/supabase.js'

function StatusPill({ children, color = KW.lavender }) {
  return (
    <span style={{
      height: 18, padding: '0 8px', borderRadius: 20,
      background: KW.surface2, border: `1px solid ${KW.surface3}`,
      color, font: '700 9px var(--kw-mono)', display: 'inline-flex', alignItems: 'center',
    }}>{children}</span>
  )
}

function Section({ title, eyebrow, empty, children }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 }}>
        <div>
          {eyebrow && <div style={{ font: '700 9px var(--kw-mono)', color: KW.text4, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 5 }}>{eyebrow}</div>}
          <div style={{ font: '700 14px var(--kw-mono)', color: KW.text }}>{title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hasChildren ? children : (
          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 16, font: '400 11px var(--kw-mono)', color: KW.text4 }}>
            {empty}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionButton({ children, onClick, tone = 'neutral' }) {
  const color = tone === 'danger' ? KW.pink : tone === 'good' ? KW.green : KW.text3
  return (
    <button onClick={onClick} style={{
      height: 28, padding: '0 12px', borderRadius: 6,
      border: `1px solid ${KW.surface3}`, background: 'transparent',
      color, font: '400 10px var(--kw-mono)', cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{children}</button>
  )
}

function ModerationRow({ title, meta, status, note, onView, onPublish, onReject, onDelete }) {
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{title}</span>
          <StatusPill>{status}</StatusPill>
        </div>
        <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text4 }}>{meta}</div>
        {note && <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text3, marginTop: 6 }}>last note: {note}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <ActionButton onClick={onView}>view</ActionButton>
        <ActionButton tone="good" onClick={onPublish}>publish</ActionButton>
        <ActionButton tone="danger" onClick={onReject}>reject</ActionButton>
        <ActionButton tone="danger" onClick={onDelete}>delete</ActionButton>
      </div>
    </div>
  )
}

function StaffPickRow({ build, onView, onSave, onRemove, onDelete, busy }) {
  const [priority, setPriority] = useState(build.staff_pick_order ?? '')
  const picked = Boolean(build.is_staff_pick)
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{build.name}</span>
          {picked && <StatusPill color={KW.green}>staff pick</StatusPill>}
        </div>
        <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4 }}>
          {build.layout || 'unknown layout'} · {build.submitted_by || 'community builder'} · {new Date(build.created_at).toLocaleDateString('en-US')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <ActionButton onClick={() => onView(build)}>view</ActionButton>
        <input
          value={priority}
          onChange={e => setPriority(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          placeholder="priority"
          style={{
            width: 82, height: 28, borderRadius: 6, background: KW.surface2,
            border: `1px solid ${KW.surface3}`, color: KW.text,
            font: '400 10px var(--kw-mono)', padding: '0 9px', outline: 'none',
          }}
        />
        <ActionButton tone="good" onClick={() => onSave(build, priority)}>{picked ? 'update' : 'feature'}</ActionButton>
        {picked && <ActionButton tone="danger" onClick={() => onRemove(build)}>unfeature</ActionButton>}
        <ActionButton tone="danger" onClick={() => onDelete(build)}>delete</ActionButton>
      </div>
    </div>
  )
}

function SuggestionRow({ suggestion, onStatus, busy }) {
  const [note, setNote] = useState(suggestion.staff_note || '')
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start',
    }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ font: '700 12px var(--kw-mono)', color: KW.text }}>{suggestion.title}</span>
          <StatusPill color={suggestion.status === 'open' ? KW.green : KW.lavender}>{suggestion.status}</StatusPill>
        </div>
        <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text4 }}>
          {suggestion.category} · {suggestion.submitted_by || 'member'} · {new Date(suggestion.created_at).toLocaleDateString('en-US')}
        </div>
        {suggestion.page_url && <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text3, marginTop: 6 }}>page: {suggestion.page_url}</div>}
        <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginTop: 8, whiteSpace: 'pre-wrap' }}>{suggestion.message}</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="optional staff note"
          rows={2}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 6,
            background: KW.surface2,
            border: `1px solid ${KW.surface3}`,
            color: KW.text,
            font: '400 10px/1.5 var(--kw-mono)',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <ActionButton tone="good" onClick={() => onStatus(suggestion, 'triaged', note)}>{suggestion.status === 'triaged' ? 'triaged' : 'triage'}</ActionButton>
        <ActionButton tone="danger" onClick={() => onStatus(suggestion, 'closed', note)}>close</ActionButton>
      </div>
    </div>
  )
}

function AuditRow({ item }) {
  const snapshotName = item.snapshot?.name || item.snapshot?.title || item.target_id
  const note = item.note || item.snapshot?.review_note || item.snapshot?.staff_pick_note
  return (
    <div style={{
      background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8,
      padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start',
    }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ font: '700 11px var(--kw-mono)', color: KW.text }}>{snapshotName}</span>
          <StatusPill color={item.action === 'deleted' || item.action === 'rejected' ? KW.pink : KW.lavender}>{item.action.replace(/_/g, ' ')}</StatusPill>
        </div>
        <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text4 }}>
          {item.target_type.replace(/_/g, ' ')} · by {item.actor_id || 'unknown staff'}
        </div>
        {note && <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text3, marginTop: 6 }}>note: {note}</div>}
      </div>
      <div style={{ font: '400 10px var(--kw-mono)', color: KW.text4, whiteSpace: 'nowrap' }}>
        {new Date(item.created_at).toLocaleDateString('en-US')}
      </div>
    </div>
  )
}

function ConfirmAction({ action, note, setNote, onCancel, onConfirm, busy }) {
  if (!action) return null
  const isDelete = action.type === 'delete'
  const isReject = action.type === 'reject'
  const title = `${action.label} ${action.kind}?`
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(14,12,24,.72)', display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460, background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 20, boxShadow: '0 18px 40px rgba(0,0,0,.34)' }}>
        <div style={{ font: '700 14px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>{title}</div>
        <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginBottom: 14 }}>
          {isDelete
            ? <>this permanently deletes <span style={{ color: KW.text2 }}>{action.title}</span>. once deleted, it cannot be recovered.</>
            : <>this will {action.label} <span style={{ color: KW.text2 }}>{action.title}</span>.</>
          }
        </div>
        {(isReject || isDelete) && (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="optional internal note"
            rows={4}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 6,
              background: KW.surface2, border: `1px solid ${KW.surface3}`,
              color: KW.text, font: '400 11px/1.5 var(--kw-mono)',
              outline: 'none', resize: 'vertical', marginBottom: 14,
            }}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} disabled={busy} style={{ height: 30, padding: '0 14px', borderRadius: 6, border: `1px solid ${KW.surface3}`, background: 'transparent', color: KW.text3, font: '400 10px var(--kw-mono)', cursor: busy ? 'default' : 'pointer', opacity: busy ? .6 : 1 }}>cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ height: 30, padding: '0 14px', borderRadius: 6, border: `1px solid ${isDelete || isReject ? KW.pink : KW.green}`, background: 'transparent', color: isDelete || isReject ? KW.pink : KW.green, font: '700 10px var(--kw-mono)', cursor: busy ? 'default' : 'pointer', opacity: busy ? .6 : 1 }}>{busy ? 'working...' : action.label}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const isStaff = isStaffProfile(profile)
  const [pendingBuilds, setPendingBuilds] = useState([])
  const [pendingArticles, setPendingArticles] = useState([])
  const [publishedBuilds, setPublishedBuilds] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [action, setAction] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!isStaff) return
    setLoading(true)
    setError('')
    const [builds, articles, published, suggestionQueue, audit] = await Promise.all([
      fetchAdminPendingBuilds(),
      fetchAdminPendingWikiArticles(),
      fetchAdminPublishedBuilds(),
      fetchAdminSuggestions(),
      fetchAdminAuditLog(),
    ])
    if (builds.error || articles.error || published.error || audit.error) {
      setError('could not load admin queues. make sure the Phase 3 staff admin SQL has been run and your profile role is staff or admin.')
    }
    if (suggestionQueue.error) {
      setError('could not load suggestions. make sure the Phase 4 suggestions SQL has been run in Supabase.')
    }
    setPendingBuilds(builds.data)
    setPendingArticles(articles.data)
    setPublishedBuilds(published.data)
    setSuggestions(suggestionQueue.error ? [] : suggestionQueue.data)
    setAuditLog(audit.data)
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading) load()
  }, [authLoading, isStaff])

  const openAction = (nextAction) => {
    setAction(nextAction)
    setNote('')
    setError('')
    setMessage('')
  }

  const closeAction = () => {
    if (busy) return
    setAction(null)
    setNote('')
  }

  const runAction = async (nextAction = action, nextNote = note) => {
    if (!nextAction || busy) return
    setBusy(true)
    setError('')
    setMessage('')
    let result
    if (nextAction.kind === 'build' && ['publish', 'reject'].includes(nextAction.type)) {
      result = await moderateBuild({ id: nextAction.item.id, status: nextAction.type === 'publish' ? 'published' : 'rejected', note: nextNote })
    } else if (nextAction.kind === 'wiki article' && ['publish', 'reject'].includes(nextAction.type)) {
      result = await moderateWikiArticle({ id: nextAction.item.id, status: nextAction.type === 'publish' ? 'published' : 'rejected', note: nextNote })
    } else if (nextAction.kind === 'build' && nextAction.type === 'delete') {
      result = await deleteBuildAsStaff({ build: nextAction.item, note: nextNote })
    } else if (nextAction.kind === 'wiki article' && nextAction.type === 'delete') {
      result = await deleteWikiArticleAsStaff({ article: nextAction.item, note: nextNote })
    }
    setBusy(false)
    if (result?.error) {
      setError(result.error.message || 'admin action failed.')
      return
    }
    setAction(null)
    setNote('')
    setMessage(result?.storageError ? 'deleted, but uploaded photos could not be removed from storage.' : `${nextAction.label} complete.`)
    await load()
  }

  const saveStaffPick = async (build, order) => {
    setBusy(true)
    setError('')
    setMessage('')
    const { error: err } = await setBuildStaffPick({ id: build.id, picked: true, order })
    setBusy(false)
    if (err) {
      setError(err.message || 'could not update staff pick.')
      return
    }
    setMessage('staff pick updated.')
    await load()
  }

  const removeStaffPick = async (build) => {
    setBusy(true)
    setError('')
    setMessage('')
    const { error: err } = await setBuildStaffPick({ id: build.id, picked: false })
    setBusy(false)
    if (err) {
      setError(err.message || 'could not remove staff pick.')
      return
    }
    setMessage('staff pick removed.')
    await load()
  }

  const updateSuggestion = async (suggestion, status, note) => {
    setBusy(true)
    setError('')
    setMessage('')
    const { error: err } = await updateSuggestionStatus({ id: suggestion.id, status, note })
    setBusy(false)
    if (err) {
      setError(err.message || 'could not update suggestion.')
      return
    }
    setMessage(`suggestion marked ${status}.`)
    await load()
  }

  const viewBuild = (build) => navigate(`/builds/${buildRouteSlug(build)}`, { state: { from: 'admin' } })

  if (authLoading) return <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center', color: KW.text4, font: '400 11px var(--kw-mono)' }}>loading admin...</div>

  if (!user || !isStaff) {
    return (
      <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40 }}>
          <div style={{ background: KW.surface, border: `1px solid ${KW.border}`, borderRadius: 8, padding: 22, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ font: '700 18px var(--kw-mono)', color: KW.text, marginBottom: 8 }}>admin access required.</div>
            <div style={{ font: '400 11px/1.6 var(--kw-mono)', color: KW.text3, marginBottom: 16 }}>this page is only available to staff profiles.</div>
            <Button variant="secondary" onClick={() => navigate('/')}>back home</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ background: KW.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, padding: '32px var(--kw-page-x) 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          <div>
            <h1 style={{ font: '700 28px/1 var(--kw-mono)', color: KW.text, margin: '0 0 6px' }}>admin.</h1>
            <p style={{ font: '400 12px var(--kw-mono)', color: KW.text3, margin: 0 }}>
              review submissions, manage staff picks, and keep moderation notes.
            </p>
          </div>
          <StatusPill color={profile.role === 'admin' ? KW.green : KW.lavender}>{profile.role}</StatusPill>
        </div>

        {message && <div style={{ font: '400 10px var(--kw-mono)', color: KW.green, marginBottom: 12 }}>{message}</div>}
        {error && <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.pink, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>loading admin queues...</div>
        ) : (
          <>
            <Section title="pending builds." eyebrow="moderation" empty="no pending builds.">
              {pendingBuilds.map(build => (
                <ModerationRow
                  key={build.id}
                  title={build.name}
                  status={build.status}
                  meta={`${build.layout || 'unknown layout'} · ${build.submitted_by || 'community builder'} · ${new Date(build.created_at).toLocaleDateString('en-US')}`}
                  note={build.review_note}
                  onView={() => navigate(`/builds/${buildRouteSlug(build)}`, { state: { from: 'admin' } })}
                  onPublish={() => openAction({ kind: 'build', type: 'publish', label: 'publish', title: build.name, item: build })}
                  onReject={() => openAction({ kind: 'build', type: 'reject', label: 'reject', title: build.name, item: build })}
                  onDelete={() => openAction({ kind: 'build', type: 'delete', label: 'delete', title: build.name, item: build })}
                />
              ))}
            </Section>

            <Section title="pending wiki articles." eyebrow="moderation" empty="no pending wiki articles.">
              {pendingArticles.map(article => (
                <ModerationRow
                  key={article.id}
                  title={article.title}
                  status={article.status}
                  meta={`${article.category} · ${article.submitted_by || 'community writer'} · ${new Date(article.created_at).toLocaleDateString('en-US')}`}
                  note={article.review_note}
                  onView={() => navigate(`/wiki/${article.slug}`, { state: { from: 'admin' } })}
                  onPublish={() => openAction({ kind: 'wiki article', type: 'publish', label: 'publish', title: article.title, item: article })}
                  onReject={() => openAction({ kind: 'wiki article', type: 'reject', label: 'reject', title: article.title, item: article })}
                  onDelete={() => openAction({ kind: 'wiki article', type: 'delete', label: 'delete', title: article.title, item: article })}
                />
              ))}
            </Section>

            <Section title="open suggestions." eyebrow="community" empty="no open suggestions.">
              {suggestions.map(suggestion => (
                <SuggestionRow
                  key={suggestion.id}
                  suggestion={suggestion}
                  busy={busy}
                  onStatus={updateSuggestion}
                />
              ))}
            </Section>

            <Section title="published builds." eyebrow="staff picks" empty="no published builds available.">
              <div style={{ font: '400 10px/1.5 var(--kw-mono)', color: KW.text4, margin: '-2px 0 4px' }}>
                priority is only for homepage staff picks. lower numbers appear first.
              </div>
              {publishedBuilds.map(build => (
                <StaffPickRow
                  key={build.id}
                  build={build}
                  busy={busy}
                  onView={viewBuild}
                  onSave={saveStaffPick}
                  onRemove={removeStaffPick}
                  onDelete={(item) => openAction({ kind: 'build', type: 'delete', label: 'delete', title: item.name, item })}
                />
              ))}
            </Section>

            <Section title="recent actions." eyebrow="audit log" empty="no admin actions recorded yet.">
              {auditLog.map(item => <AuditRow key={item.id} item={item} />)}
            </Section>
          </>
        )}
      </div>
      <ConfirmAction
        action={action}
        note={note}
        setNote={setNote}
        busy={busy}
        onCancel={closeAction}
        onConfirm={() => runAction()}
      />
      <Footer />
    </div>
  )
}

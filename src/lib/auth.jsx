/* built by twelve. */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, fetchProfile, upsertProfile } from './supabase.js'

const AuthContext = createContext(null)

function defaultUsername(email) {
  return String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_|_$/g, '').slice(0, 24)
}

function fallbackUsername(user) {
  const base = defaultUsername(user?.user_metadata?.username || user?.email || user?.id || 'member')
  if (base.length >= 3) return base
  return `member_${String(user?.id || '').replace(/-/g, '').slice(0, 8) || 'user'}`
}

async function createFallbackProfile(user) {
  const base = fallbackUsername(user)
  const first = await upsertProfile({ id: user.id, username: base })
  if (!first.error) return first.data || null
  const suffix = String(user.id || '').replace(/-/g, '').slice(0, 6)
  const username = `${base.slice(0, Math.max(3, 23 - suffix.length))}_${suffix}`.slice(0, 24)
  const retry = await upsertProfile({ id: user.id, username })
  return retry.data || null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async (currentUser = user) => {
    if (!currentUser) {
      setProfile(null)
      return null
    }
    const { data } = await fetchProfile(currentUser.id)
    setProfile(data)
    return data
  }

  const ensureProfile = async (currentUser = user) => {
    if (!currentUser) {
      setProfile(null)
      return null
    }
    const existing = await refreshProfile(currentUser)
    if (existing) return existing
    const created = await createFallbackProfile(currentUser)
    setProfile(created)
    return created
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session || null)
      setUser(data.session?.user || null)
      if (data.session?.user) await ensureProfile(data.session.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)
      setUser(nextSession?.user || null)
      if (nextSession?.user) ensureProfile(nextSession.user)
      else setProfile(null)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password, username }) => {
    const cleanUsername = (username || defaultUsername(email)).trim().toLowerCase()
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: cleanUsername } },
    })
    if (result.error) return result
    if (result.data.user && result.data.session) {
      setSession(result.data.session)
      setUser(result.data.user)
      const { error } = await upsertProfile({ id: result.data.user.id, username: cleanUsername })
      if (error) return { ...result, error }
      await refreshProfile(result.data.user)
    }
    return result
  }

  const signIn = async ({ email, password }) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) return result
    if (result.data.session) setSession(result.data.session)
    if (result.data.user) {
      setUser(result.data.user)
      await ensureProfile(result.data.user)
    }
    return result
  }

  const signInWithGoogle = (redirectPath = '/profile') => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${redirectPath}` },
  })

  const signOut = async () => {
    const result = await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    return result
  }

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }), [session, user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

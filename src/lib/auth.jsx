/* built by twelve. — bytw12ve */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, fetchProfile, upsertProfile } from './supabase.js'

const AuthContext = createContext(null)

function defaultUsername(email) {
  return String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_|_$/g, '').slice(0, 24)
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

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session || null)
      setUser(data.session?.user || null)
      if (data.session?.user) await refreshProfile(data.session.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)
      setUser(nextSession?.user || null)
      if (nextSession?.user) refreshProfile(nextSession.user)
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
      let nextProfile = await refreshProfile(result.data.user)
      if (!nextProfile) {
        const fallbackUsername = result.data.user.user_metadata?.username || defaultUsername(result.data.user.email)
        const { data } = await upsertProfile({ id: result.data.user.id, username: fallbackUsername })
        nextProfile = data || null
        setProfile(nextProfile)
      }
    }
    return result
  }

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

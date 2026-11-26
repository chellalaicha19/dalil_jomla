import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type Profile } from './AuthContext'

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, phone, wilaya, role')
    .eq('id', userId)
    .single()
  return (data as Profile | null) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [fetchedFor, setFetchedFor] = useState<string | null>(null)

  // 1) Follow the login session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // 2) Load the profile of the logged-in user
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchProfile(userId).then((p) => {
      if (cancelled) return
      setProfile(p)
      setFetchedFor(userId)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  async function refreshProfile() {
    if (!userId) return
    setProfile(await fetchProfile(userId))
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const loading = !authReady || (userId !== undefined && fetchedFor !== userId)

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: userId ? profile : null,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
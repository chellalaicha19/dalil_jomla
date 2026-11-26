import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  wilaya: string | null
  role: 'wholesaler' | 'admin'
}

export type AuthState = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
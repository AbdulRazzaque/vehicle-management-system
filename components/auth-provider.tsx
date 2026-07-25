'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export type Role = 'Admin' | 'Viewer'

export type CurrentUser = {
  name: string
  email: string
  role: Role
  initials: string
}

const ADMIN: CurrentUser = {
  name: 'Daniel Okoro',
  email: 'daniel.okoro@fleetcore.io',
  role: 'Admin',
  initials: 'DO',
}

const VIEWER: CurrentUser = {
  name: 'Priya Nair',
  email: 'priya.nair@fleetcore.io',
  role: 'Viewer',
  initials: 'PN',
}

type AuthContextValue = {
  user: CurrentUser
  setRole: (role: Role) => void
  can: (permission: Permission) => boolean
}

// Permissions gated to Admin only; Viewers get read access everywhere.
export type Permission =
  | 'manage:vehicles'
  | 'manage:maintenance'
  | 'manage:repairs'
  | 'manage:inventory'
  | 'manage:expenses'
  | 'manage:users'
  | 'manage:documents'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(ADMIN)

  const setRole = (role: Role) => setUser(role === 'Admin' ? ADMIN : VIEWER)

  const can = (_permission: Permission) => user.role === 'Admin'

  return (
    <AuthContext.Provider value={{ user, setRole, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

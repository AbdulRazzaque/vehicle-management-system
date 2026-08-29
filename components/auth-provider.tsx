'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

export type Role = 'Admin' | 'User'

export type CurrentUser = {
  id: string
  name: string
  username?: string
  email?: string
  role: Role
  initials: string
}

type AuthContextValue = {
  user: CurrentUser | null
  isLoading: boolean
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>
  logout: () => Promise<void>
  can: (permission: Permission) => boolean
}

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
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          const u = data.user
          setUser({
            id: u.id,
            name: u.name,
            username: u.username || u.email,
            email: u.email,
            role: u.role,
            initials: u.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          })
          
          if (pathname === '/login') {
            router.push('/')
          }
        } else {
          setUser(null)
          if (pathname !== '/login') {
            router.push('/login')
          }
        }
      } else {
        setUser(null)
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
    } catch {
      setUser(null)
      if (pathname !== '/login') {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [pathname])

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          const u = data.user
          setUser({
            id: u.id,
            name: u.name,
            username: u.username || u.email,
            email: u.email,
            role: u.role,
            initials: u.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          })
          router.push('/')
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  const can = (permission: Permission) => {
    if (!user) return false
    if (user.role === 'Admin') return true
    if (user.role === 'User') {
      return (
        permission === 'manage:vehicles' ||
        permission === 'manage:maintenance' ||
        permission === 'manage:repairs'
      )
    }
    return false
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

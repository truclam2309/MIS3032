import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '../types/auth'
import type { Role } from '../types/procurement'

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('procurement-access-token')
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!localStorage.getItem('procurement-access-token')) return null
    const savedUser = localStorage.getItem('procurement-user')
    return savedUser ? JSON.parse(savedUser) as AuthUser : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('procurement-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('procurement-user')
    }
  }, [user])

  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      })
      if (!response.ok) return false

      const result = await response.json() as {
        access_token: string
        user: AuthUser
      }
      localStorage.setItem('procurement-access-token', result.access_token)
      setAccessToken(result.access_token)
      setUser(result.user)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('procurement-access-token')
  }

  function hasRole(roles: Role[]) {
    if (!user) return false

    // Admin có quyền truy cập toàn bộ hệ thống
    if (user.role === 'admin') return true

    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

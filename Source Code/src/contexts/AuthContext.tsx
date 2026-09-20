import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '../types/auth'
import type { Role } from '../types/procurement'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Employee Demo',
    email: 'employee@demo.com',
    password: '123456',
    role: 'employee',
  },
  {
    id: '3',
    name: 'Manager Demo',
    email: 'manager@demo.com',
    password: '123456',
    role: 'manager',
  },
  {
    id: '4',
    name: 'Finance Demo',
    email: 'finance@demo.com',
    password: '123456',
    role: 'finance',
  },
  {
    id: '5',
    name: 'Procurement Demo',
    email: 'procurement@demo.com',
    password: '123456',
    role: 'procurement',
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('procurement-user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('procurement-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('procurement-user')
    }
  }, [user])

  function login(email: string, password: string) {
    const foundUser = DEMO_USERS.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    )

    if (!foundUser) {
      return false
    }

    const { password: _, ...authUser } = foundUser
    setUser(authUser)

    return true
  }

  function logout() {
    setUser(null)
  }

  function hasRole(roles: Role[]) {
    if (!user) return false

    // Admin có quyền truy cập toàn bộ hệ thống
    if (user.role === 'admin') return true

    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
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
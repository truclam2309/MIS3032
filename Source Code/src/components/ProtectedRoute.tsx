import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types/procurement'

interface ProtectedRouteProps {
  roles?: Role[]
}

const ROLE_HOME: Record<Role, string> = {
  admin: '/dashboard',
  employee: '/dashboard',
  manager: '/dashboard',
  finance: '/dashboard',
  procurement: '/dashboard',
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, hasRole } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}
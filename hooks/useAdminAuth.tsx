'use client'

/**
 * useAdminAuth Hook & Provider
 *
 * Supplies admin user + role metadata to client components inside the
 * /admin area and exposes helpers for capability checks.
 *
 * @module hooks/useAdminAuth
 */

import { createContext, useContext, type ReactNode, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import type { AdminRole } from '@/lib/admin/auditLog'

interface AdminAuthContextValue {
  user: User
  role: AdminRole
  isSuperAdmin: boolean
  canManageContent: boolean
  canManageUsers: boolean
  canViewReports: boolean
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

interface AdminAuthProviderProps {
  value: {
    user: User
    role: AdminRole
  }
  children: ReactNode
}

/**
 * Provides admin auth context to child components.
 */
export function AdminAuthProvider({ value, children }: AdminAuthProviderProps) {
  const derivedValue = useMemo<AdminAuthContextValue>(() => {
    const isSuperAdmin = value.role === 'super_admin'
    return {
      user: value.user,
      role: value.role,
      isSuperAdmin,
      canManageContent: value.role === 'admin' || isSuperAdmin,
      canManageUsers: isSuperAdmin,
      canViewReports: value.role === 'admin' || isSuperAdmin,
    }
  }, [value.role, value.user])

  return (
    <AdminAuthContext.Provider value={derivedValue}>
      {children}
    </AdminAuthContext.Provider>
  )
}

/**
 * Hook to consume admin auth context.
 */
export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }

  return context
}

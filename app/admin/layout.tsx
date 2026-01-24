/**
 * Admin Layout
 *
 * Server component wrapper for all /admin routes. Handles auth, role checks,
 * and renders the admin chrome (sidebar + header).
 *
 * @module app/admin/layout
 */
import { type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminAuthProvider } from '@/hooks/useAdminAuth'
import type { AdminRole } from '@/lib/admin/auditLog'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const role = ((profile as any)?.role ?? 'user') as AdminRole

  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const adminName = (profile as any)?.full_name || user.email || 'Admin'

  return (
    <AdminAuthProvider value={{ user, role }}>
      <div className="flex min-h-screen bg-slate-100">
        <AdminSidebar adminName={adminName} adminRole={role} />
        <div className="flex flex-1 flex-col">
          <AdminHeader adminName={adminName} />
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}

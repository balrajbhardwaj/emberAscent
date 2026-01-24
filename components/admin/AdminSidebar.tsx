/**
 * AdminSidebar Component
 *
 * Vertical navigation for the admin panel with role indicator and
 * quick action buttons.
 *
 * @module components/admin/AdminSidebar
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Flag,
  LayoutDashboard,
  Settings,
  Users2,
  BookOpenCheck,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AdminSidebarProps {
  adminName: string
  adminRole: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Questions', href: '/admin/questions', icon: BookOpenCheck },
  { label: 'Users', href: '/admin/users', icon: Users2 },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/95 px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <ShieldAlert className="h-5 w-5 text-purple-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Ember Admin</p>
          <p className="text-xs text-slate-500">Content + Support Console</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-purple-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 rounded-lg border border-slate-200 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{adminName}</p>
          <Badge variant="outline" className="mt-1 text-xs capitalize">
            {adminRole.replace('_', ' ')}
          </Badge>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/practice">View as parent</Link>
        </Button>
      </div>
    </aside>
  )
}

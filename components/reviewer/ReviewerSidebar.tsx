'use client'

/**
 * Reviewer Sidebar Component
 *
 * Navigation sidebar for reviewer dashboard with:
 * - Reviewer info display
 * - Navigation links
 * - Quick actions
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  Home,
  BarChart3,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ReviewerSidebarProps {
  reviewerName: string
  qualifications: string | null
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/reviewer', icon: Home },
  { label: 'My Queue', href: '/reviewer/queue', icon: ClipboardList },
  { label: 'Completed', href: '/reviewer/completed', icon: BookOpen },
  { label: 'My Stats', href: '/reviewer/stats', icon: BarChart3 },
]

export default function ReviewerSidebar({
  reviewerName,
  qualifications,
}: ReviewerSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <ClipboardList className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Ember Reviewer</p>
          <p className="text-xs text-gray-500">Content Quality Assurance</p>
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
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-gray-400')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 rounded-lg border border-gray-200 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{reviewerName}</p>
          {qualifications && (
            <p className="text-xs text-gray-500 mt-1">{qualifications}</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/api/auth/signout">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Link>
        </Button>
      </div>
    </aside>
  )
}

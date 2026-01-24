/**
 * AdminHeader Component
 *
 * Top bar for the admin console containing quick actions, search,
 * and account affordances.
 */
'use client'

import { useRouter } from 'next/navigation'
import { Bell, PlusCircle, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  adminName: string
  subtitle?: string
  onRefresh?: () => void
}

export function AdminHeader({ adminName, subtitle = 'Stay close to quality + safety metrics', onRefresh }: AdminHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Welcome back</p>
          <h1 className="text-lg font-semibold text-slate-900">{adminName}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search questions, parents, sessions..."
              className="bg-slate-50 pl-10 pr-4"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  router.push(`/admin/questions?search=${encodeURIComponent((event.target as HTMLInputElement).value)}`)
                }
              }}
            />
          </div>

          <Button variant="outline" size="icon" onClick={() => onRefresh?.()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="sm" className={cn('bg-purple-600 text-white hover:bg-purple-700')} onClick={() => router.push('/admin/questions/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>
    </header>
  )
}

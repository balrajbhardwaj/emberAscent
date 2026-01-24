"use client"

/**
 * Client-side impersonation banner with countdown timer and quick action to
 * terminate the session. Rendered via the server wrapper so it only mounts when
 * an impersonation token exists.
 */
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface ImpersonationBannerClientProps {
  userName: string
  expiresAt: string
}

function formatDuration(ms: number) {
  if (ms <= 0) {
    return '00:00'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

export function ImpersonationBannerClient({
  userName,
  expiresAt,
}: ImpersonationBannerClientProps) {
  const router = useRouter()
  const [remaining, setRemaining] = useState('00:00')
  const [isEnding, setIsEnding] = useState(false)

  const expiresAtDate = useMemo(() => new Date(expiresAt).getTime(), [expiresAt])

  useEffect(() => {
    const updateRemaining = () => {
      const diff = expiresAtDate - Date.now()
      setRemaining(formatDuration(diff))
    }

    updateRemaining()
    const interval = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAtDate])

  const handleEnd = async () => {
    try {
      setIsEnding(true)
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to end impersonation')
      }

      toast({ title: 'Impersonation ended', description: 'Returned to admin view.' })
      router.push('/admin/users')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Unable to end impersonation',
        description: 'Please try again or refresh the page.',
      })
    } finally {
      setIsEnding(false)
    }
  }

  return (
    <div
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Viewing as {userName}
            </p>
            <p className="text-sm text-white/90">
              Impersonation expires in <span className="font-semibold">{remaining}</span>. Sensitive
              actions like payments or password changes are disabled.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          disabled={isEnding}
          aria-label="End impersonation session"
        >
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
          {isEnding ? 'Ending…' : 'End Impersonation'}
        </button>
      </div>
    </div>
  )
}

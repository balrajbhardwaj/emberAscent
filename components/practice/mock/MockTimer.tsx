'use client'

/**
 * Mock Timer Component
 *
 * Countdown timer for mock tests
 */

import { Clock } from 'lucide-react'

interface MockTimerProps {
  timeRemaining: number // in seconds
}

export default function MockTimer({ timeRemaining }: MockTimerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const isWarning = timeRemaining <= 300 // 5 minutes
  const isCritical = timeRemaining <= 60 // 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
        isCritical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isWarning
          ? 'bg-amber-100 text-amber-700'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      <Clock className="h-5 w-5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

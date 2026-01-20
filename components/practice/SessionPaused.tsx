/**
 * Session Paused Component
 * 
 * Overlay displayed when a practice session is paused.
 * 
 * Features:
 * - Semi-transparent overlay
 * - Resume button (primary action)
 * - End session button (secondary)
 * - Pause duration indicator
 * 
 * @module components/practice/SessionPaused
 */
"use client"

import { Play, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SessionPausedProps {
  onResume: () => void
  onEndSession: () => void
}

/**
 * Session Paused Overlay
 * 
 * Modal overlay when session is paused, allowing resume or end.
 * 
 * @param onResume - Handler to resume the session
 * @param onEndSession - Handler to end the session
 */
export function SessionPaused({
  onResume,
  onEndSession,
}: SessionPausedProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md p-6">
        <div className="space-y-6 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Play className="h-8 w-8 text-orange-600" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Session Paused</h2>
            <p className="mt-2 text-slate-600">
              Take your time. Your progress has been saved.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onResume}
              size="lg"
              className="w-full"
            >
              <Play className="mr-2 h-5 w-5" />
              Resume Practice
            </Button>
            <Button
              onClick={onEndSession}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <X className="mr-2 h-5 w-5" />
              End Session
            </Button>
          </div>

          {/* Tip */}
          <p className="text-xs text-slate-500">
            💡 Tip: Take a short break to refresh your mind!
          </p>
        </div>
      </Card>
    </div>
  )
}

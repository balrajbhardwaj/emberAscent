/**
 * Session Progress Bar Component
 * 
 * Displays progress during a practice session including:
 * - Questions answered / total
 * - Progress bar visualization
 * - Timer (for mock tests)
 * - Pause and exit controls
 * 
 * @module components/practice/SessionProgress
 */
"use client"

import { Pause, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SessionProgressProps {
  answered: number
  total: number
  timeElapsed: number
  timeLimit?: number
  onPause: () => void
  onExit: () => void
  showTimer?: boolean
}

/**
 * Session Progress Bar
 * 
 * Shows real-time progress through a practice session.
 * 
 * @param answered - Number of questions answered
 * @param total - Total number of questions
 * @param timeElapsed - Seconds elapsed since start
 * @param timeLimit - Time limit in seconds (for mock tests)
 * @param onPause - Handler to pause session
 * @param onExit - Handler to exit session
 * @param showTimer - Whether to display the timer
 */
export function SessionProgress({
  answered,
  total,
  timeElapsed,
  timeLimit,
  onPause,
  onExit,
  showTimer = false,
}: SessionProgressProps) {
  const percentage = Math.round((answered / total) * 100)
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate remaining time for mock tests
  const timeRemaining = timeLimit ? timeLimit - timeElapsed : null
  const isLowTime = timeRemaining !== null && timeRemaining < 300 // Less than 5 minutes

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 sm:px-6">
        {/* Top row: Stats and controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Progress stats */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-900">
              <span className="text-lg">{answered}</span>
              <span className="text-slate-500">/{total}</span>
            </div>

            {/* Timer (mock tests only) */}
            {showTimer && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 ${
                  isLowTime
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm font-semibold">
                  {timeRemaining !== null
                    ? formatTime(timeRemaining)
                    : formatTime(timeElapsed)}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPause}
              className="hidden sm:flex"
            >
              <Pause className="h-4 w-4" />
              <span className="ml-2">Pause</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPause}
              className="sm:hidden"
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onExit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={percentage} className="h-2" />
        </div>
      </div>
    </div>
  )
}

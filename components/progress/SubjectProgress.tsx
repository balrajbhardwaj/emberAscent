/**
 * Subject Progress Component
 * 
 * Displays progress for a single subject with:
 * - Circular progress indicator
 * - Accuracy percentage
 * - Questions attempted
 * - Trend indicator (up/down arrow)
 * 
 * @module components/progress/SubjectProgress
 */
"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface SubjectProgressProps {
  subject: string
  accuracy: number
  questionsAttempted: number
  trend: "up" | "down" | "neutral"
  trendValue: number
  color: "purple" | "blue" | "green"
  icon: string
  isLoading?: boolean
}

const COLOR_CLASSES = {
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    ring: "ring-purple-500",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    ring: "ring-blue-500",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    ring: "ring-green-500",
  },
}

/**
 * Circular Progress Indicator
 */
function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-32 w-32">
      <svg className="transform -rotate-90" width="128" height="128">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{value}%</span>
      </div>
    </div>
  )
}

/**
 * Subject Progress Card
 * 
 * Shows detailed progress for one subject with circular indicator.
 * 
 * @param subject - Subject name
 * @param accuracy - Accuracy percentage (0-100)
 * @param questionsAttempted - Total questions attempted
 * @param trend - Trend direction
 * @param trendValue - Trend percentage change
 * @param color - Color theme
 * @param icon - Subject icon emoji
 * @param isLoading - Loading state
 */
export function SubjectProgress({
  subject,
  accuracy,
  questionsAttempted,
  trend,
  trendValue,
  color,
  icon,
  isLoading = false,
}: SubjectProgressProps) {
  const colors = COLOR_CLASSES[color]

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>
    )
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className={`p-6 transition-all hover:shadow-md border-2 ${colors.border}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{subject}</h3>
          <div className={`text-3xl p-2 rounded-xl ${colors.bg}`}>
            {icon}
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center py-2">
          <CircularProgress value={accuracy} color={colors.text} />
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Questions Attempted</span>
            <span className="font-semibold text-slate-900">{questionsAttempted}</span>
          </div>

          {/* Trend */}
          {trend !== "neutral" && trendValue !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {Math.abs(trendValue)}% {trend === "up" ? "better" : "lower"} than last week
              </span>
            </div>
          )}

          {questionsAttempted === 0 && (
            <p className="text-sm text-slate-500 text-center pt-2">
              No practice yet. Start practicing to see your progress!
            </p>
          )}
        </div>

        {/* Progress bar (alternative view) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Mastery Level</span>
            <span>{accuracy >= 80 ? "Excellent" : accuracy >= 60 ? "Good" : "Keep Practicing"}</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Activity Timeline Component
 * 
 * Displays recent practice sessions in a timeline format.
 * Shows date, session type, subject, and score.
 * 
 * @module components/progress/ActivityTimeline
 */
"use client"

import { formatDistanceToNow } from "date-fns"
import { Zap, Target, Clock, BookOpen, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Session {
  id: string
  date: string
  sessionType: "quick" | "focus" | "mock"
  subject: string | null
  score: number
  questionsAnswered: number
  totalQuestions: number
}

interface ActivityTimelineProps {
  sessions: Session[]
  isLoading?: boolean
  isAscent?: boolean
}

const SESSION_CONFIG = {
  quick: {
    icon: Zap,
    label: "Quick Practice",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  focus: {
    icon: Target,
    label: "Focus Session",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  mock: {
    icon: Clock,
    label: "Mock Test",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
}

/**
 * Activity Timeline Item
 */
function TimelineItem({ session }: { session: Session }) {
  // Get session config with fallback for unknown types
  const config = SESSION_CONFIG[session.sessionType] || SESSION_CONFIG.quick
  const Icon = config.icon
  const percentage = Math.round((session.score / 100) * 100)

  return (
    <div className="flex gap-4 group">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-lg border-2 ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-0.5 h-full bg-slate-200 mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-900">{config.label}</h4>
              {session.subject && (
                <Badge variant="outline" className="text-xs">
                  {session.subject}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
            </p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              percentage >= 80 ? "text-green-600" :
              percentage >= 60 ? "text-amber-600" :
              "text-slate-600"
            }`}>
              {percentage}%
            </p>
            <p className="text-xs text-slate-500">
              {session.questionsAnswered}/{session.totalQuestions}
            </p>
          </div>
        </div>

        {/* View details button (appears on hover) */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          asChild
        >
          <Link href={`/progress/session/${session.id}`}>
            View Details
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

/**
 * Activity Timeline
 * 
 * Shows list of recent practice sessions.
 * 
 * @param sessions - Array of recent sessions
 * @param isLoading - Loading state
 * @param isAscent - Whether user has Ascent subscription
 */
export function ActivityTimeline({ sessions, isLoading = false, isAscent = false }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-slate-100">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">No Practice Sessions Yet</h3>
            <p className="text-sm text-slate-600">
              Start practicing to build your learning history!
            </p>
          </div>
          <Button asChild>
            <Link href="/practice">
              Start Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
        <p className="text-sm text-slate-600 mt-1">
          Your last {sessions.length} practice session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-0">
        {sessions.map((session, index) => (
          <div key={session.id}>
            <TimelineItem session={session} />
            {/* Remove connector line for last item */}
            {index === sessions.length - 1 && (
              <div className="flex gap-4">
                <div className="w-10" />
                <div className="flex-1 pb-0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade prompt for free tier users */}
      {!isAscent && sessions.length >= 5 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Want to see your full history?</h3>
              <p className="text-sm text-slate-700">
                Upgrade to Ascent to view all your practice sessions and unlock advanced analytics.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/pricing">
                Upgrade
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

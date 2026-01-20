/**
 * Session History Table Component
 * 
 * Displays paginated list of practice sessions with filtering.
 * Responsive: table on desktop, cards on mobile.
 * 
 * @module components/progress/SessionHistoryTable
 */
"use client"

import { formatDistanceToNow } from "date-fns"
import { Zap, Target, Clock, ChevronRight, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface Session {
  id: string
  date: string
  sessionType: "quick" | "focus" | "mock"
  subjects: string[]
  score: number
  questionsAnswered: number
  totalQuestions: number
  duration: number
}

interface SessionHistoryTableProps {
  sessions: Session[]
  isLoading?: boolean
}

const SESSION_CONFIG = {
  quick: {
    icon: Zap,
    label: "Quick",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  focus: {
    icon: Target,
    label: "Focus",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  mock: {
    icon: Clock,
    label: "Mock",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
}

/**
 * Format duration in seconds to readable format
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

/**
 * Mobile card view for a session
 */
function SessionCard({ session }: { session: Session }) {
  const config = SESSION_CONFIG[session.sessionType]
  const Icon = config.icon
  const percentage = Math.round((session.score / 100) * 100)

  return (
    <Link href={`/progress/history/${session.id}`}>
      <Card className="p-4 hover:shadow-md transition-all cursor-pointer group">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-900">{config.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-1">
            {session.subjects.map((subject) => (
              <Badge key={subject} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className={`text-2xl font-bold ${
                percentage >= 80 ? "text-green-600" :
                percentage >= 60 ? "text-amber-600" :
                "text-slate-600"
              }`}>
                {percentage}%
              </p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {session.questionsAnswered}
              </p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatDuration(session.duration)}
              </p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
          </div>

          {/* Date */}
          <p className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
          </p>
        </div>
      </Card>
    </Link>
  )
}

/**
 * Desktop table row for a session
 */
function SessionRow({ session }: { session: Session }) {
  const config = SESSION_CONFIG[session.sessionType]
  const Icon = config.icon
  const percentage = Math.round((session.score / 100) * 100)

  return (
    <Link href={`/progress/history/${session.id}`}>
      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group">
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-900">{config.label}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-wrap gap-1">
            {session.subjects.map((subject) => (
              <Badge key={subject} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${
              percentage >= 80 ? "text-green-600" :
              percentage >= 60 ? "text-amber-600" :
              "text-slate-600"
            }`}>
              {percentage}%
            </span>
            <span className="text-sm text-slate-500">
              ({session.questionsAnswered}/{session.totalQuestions})
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className="text-slate-900">{formatDuration(session.duration)}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-slate-600">
            {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
          </span>
        </td>
        <td className="py-4 px-4">
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </td>
      </tr>
    </Link>
  )
}

/**
 * Session History Table
 * 
 * Displays list of sessions with responsive layout.
 * 
 * @param sessions - Array of session history items
 * @param isLoading - Loading state
 */
export function SessionHistoryTable({ sessions, isLoading = false }: SessionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Mobile view */}
        <div className="md:hidden space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-slate-100">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">No Sessions Found</h3>
            <p className="text-sm text-slate-600">
              Try adjusting your filters or start a new practice session.
            </p>
          </div>
          <Button asChild>
            <Link href="/practice">Start Practice</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block">
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                  Subject
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                  Score
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                  Duration
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

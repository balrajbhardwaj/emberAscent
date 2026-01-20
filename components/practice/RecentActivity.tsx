/**
 * Recent Activity Component
 * 
 * Displays the last 3 practice sessions with:
 * - Session date
 * - Subject practiced
 * - Score/performance
 * - Link to view all activity on progress page
 * 
 * @module components/practice/RecentActivity
 */
"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface Session {
  id: string
  date: Date
  subject: string
  questionsCorrect: number
  questionsTotal: number
}

interface RecentActivityProps {
  sessions: Session[]
}

/**
 * Recent Activity List
 * 
 * Shows recent practice sessions with scores.
 * Links to full progress page for detailed history.
 * 
 * @param sessions - Array of recent practice sessions (max 3)
 */
export function RecentActivity({ sessions }: RecentActivityProps) {
  if (sessions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-slate-600">
            No practice sessions yet. Start practicing to see your activity here!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        <Link href="/progress">
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const scorePercentage = Math.round(
            (session.questionsCorrect / session.questionsTotal) * 100
          )
          const scoreColor =
            scorePercentage >= 80
              ? "text-green-600"
              : scorePercentage >= 60
              ? "text-orange-600"
              : "text-red-600"

          return (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
            >
              {/* Session Info */}
              <div className="flex-1">
                <p className="font-medium text-slate-900">{session.subject}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(session.date)}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className={`text-lg font-bold ${scoreColor}`}>
                  {scorePercentage}%
                </p>
                <p className="text-xs text-slate-500">
                  {session.questionsCorrect}/{session.questionsTotal}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * Format date to readable string
 * 
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "Today", "Yesterday", "Jan 15")
 */
function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return "Today"
  if (isYesterday) return "Yesterday"

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

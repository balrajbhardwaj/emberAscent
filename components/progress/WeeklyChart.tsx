/**
 * Weekly Chart Component
 * 
 * Bar chart showing daily practice activity for the last 7 days.
 * Highlights streak days with special styling.
 * 
 * @module components/progress/WeeklyChart
 */
"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DailyData {
  date: string
  questionsAnswered: number
  hasSession: boolean
}

interface WeeklyChartProps {
  data: DailyData[]
  isLoading?: boolean
}

/**
 * Format date for display (e.g., "Mon")
 */
function formatDay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

/**
 * Weekly Activity Chart
 * 
 * Visual bar chart of daily practice activity.
 * 
 * @param data - Array of daily activity data
 * @param isLoading - Loading state
 */
export function WeeklyChart({ data, isLoading = false }: WeeklyChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex items-end justify-between gap-2 h-48">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full h-32" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const maxQuestions = Math.max(...data.map((d) => d.questionsAnswered), 10)
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Weekly Activity</h2>
        <p className="text-sm text-slate-600 mt-1">Questions practiced each day</p>
      </div>

      {/* Chart */}
      <div className="relative pl-10">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-slate-500 text-right pr-2">
          <span>{maxQuestions}</span>
          <span>{Math.round(maxQuestions / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-48 border-b-2 border-slate-200">
          {data.map((day) => {
            const height = (day.questionsAnswered / maxQuestions) * 100
            const isToday = day.date === today

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-full">
                  <div className="w-full h-full relative flex items-end">
                    <svg
                      viewBox="0 0 20 100"
                      role="img"
                      aria-label={`${formatDay(day.date)} engagement bar showing ${day.questionsAnswered} questions`}
                      className={`w-full h-full transition-opacity ${
                        day.hasSession ? "hover:opacity-80" : ""
                      }`}
                    >
                      <rect
                        x="0"
                        width="20"
                        rx="6"
                        ry="6"
                        y={100 - Math.max(height, day.hasSession ? 8 : 0)}
                        height={Math.max(height, day.hasSession ? 8 : 0)}
                        className={
                          day.hasSession
                            ? isToday
                              ? "fill-orange-400"
                              : "fill-blue-400"
                            : "fill-slate-200"
                        }
                      />
                    </svg>

                    {/* Tooltip on hover */}
                    {day.hasSession && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {day.questionsAnswered} questions
                          {isToday && " (Today)"}
                        </div>
                        <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Day label */}
                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    isToday ? "text-orange-600" : "text-slate-600"
                  }`}>
                    {formatDay(day.date)}
                  </p>
                  {isToday && (
                    <p className="text-[10px] text-orange-500 font-semibold">Today</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-blue-500 to-blue-400" />
            <span className="text-slate-600">Practice Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-orange-500 to-orange-400" />
            <span className="text-slate-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200" />
            <span className="text-slate-600">No Practice</span>
          </div>
        </div>
      </div>

      {/* Encouragement message */}
      {data.every((d) => !d.hasSession) && (
        <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Start your streak!</strong> Practice every day to build consistency and improve faster.
          </p>
        </div>
      )}
    </Card>
  )
}

'use client'

/**
 * Streak Calendar Component
 *
 * 30-day calendar view showing practice history
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface CalendarDay {
  date: string
  dayOfWeek: string
  day: number
  practiced: boolean
  sessionCount: number
}

interface StreakCalendarProps {
  calendar: CalendarDay[]
}

export default function StreakCalendar({ calendar }: StreakCalendarProps) {
  const today = new Date().toISOString().split('T')[0]

  const getDayColor = (day: CalendarDay) => {
    if (day.date === today) {
      return day.practiced
        ? 'bg-green-500 text-white border-green-600'
        : 'bg-gray-100 border-blue-500 border-2'
    }
    if (day.practiced) {
      if (day.sessionCount >= 3) return 'bg-green-600 text-white'
      if (day.sessionCount === 2) return 'bg-green-500 text-white'
      return 'bg-green-400 text-white'
    }
    return 'bg-gray-100 text-gray-400'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>1 session</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>2 sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>3+ sessions</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center ${getDayColor(day)} transition-colors relative group`}
            >
              <div className="text-[10px] font-semibold">{day.dayOfWeek}</div>
              <div className="text-sm font-bold">{day.day}</div>
              {day.practiced && (
                <Check className="h-3 w-3 absolute bottom-0.5 right-0.5" />
              )}
              {day.date === today && !day.practiced && (
                <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse"></div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {day.date === today ? 'Today' : day.date}
                {day.practiced
                  ? ` - ${day.sessionCount} ${day.sessionCount === 1 ? 'session' : 'sessions'}`
                  : ' - No practice'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

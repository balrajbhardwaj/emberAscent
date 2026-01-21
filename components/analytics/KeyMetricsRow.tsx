/**
 * Key Metrics Row Component
 * 
 * Displays 4 key metric cards at the top of the analytics dashboard:
 * - Readiness Score (gauge)
 * - Weekly Progress
 * - Current Streak
 * - Time Practiced
 * 
 * @module components/analytics/KeyMetricsRow
 */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Flame, Clock, Target, Minus } from 'lucide-react'
import type { ChildAnalytics } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface KeyMetricsRowProps {
  analytics: ChildAnalytics | null
  readinessScore?: number
  isLoading: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  subtext: string
  icon: React.ReactNode
  trend?: {
    direction: 'up' | 'down' | 'stable'
    value: string
  }
  color: 'orange' | 'green' | 'blue' | 'purple'
  isLoading?: boolean
}

/**
 * Individual metric card
 */
function MetricCard({
  title,
  value,
  subtext,
  icon,
  trend,
  color,
  isLoading
}: MetricCardProps) {
  const colorClasses = {
    orange: 'from-orange-500 to-amber-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-violet-500'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    trend.direction === 'up' && 'text-green-600',
                    trend.direction === 'down' && 'text-red-600',
                    trend.direction === 'stable' && 'text-slate-500'
                  )}
                >
                  {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-0.5" />}
                  {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {trend.direction === 'stable' && <Minus className="h-3 w-3 mr-0.5" />}
                  {trend.value}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{subtext}</p>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Key Metrics Row
 * 
 * Displays the 4 most important metrics for quick overview.
 */
export function KeyMetricsRow({
  analytics,
  readinessScore,
  isLoading
}: KeyMetricsRowProps) {
  // Calculate metrics from analytics
  const weeklyQuestions = analytics?.summary.totalQuestionsAnswered || 0
  const weeklyAccuracy = analytics?.summary.overallAccuracy || 0
  const currentStreak = analytics?.summary.currentStreak || 0
  const totalMinutes = analytics?.summary.totalPracticeMinutes || 0

  // Calculate trends (comparing to previous period - simplified for now)
  const weekOverWeekChange = analytics?.trends.weekOverWeekChange || 0
  const accuracyTrend = analytics?.trends.accuracyTrend || 'stable'

  // Format time
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Readiness Score */}
      <MetricCard
        title="Readiness Score"
        value={readinessScore !== undefined ? readinessScore : '--'}
        subtext="Overall exam readiness"
        icon={<Target className="h-6 w-6" />}
        trend={
          readinessScore !== undefined
            ? {
                direction: weekOverWeekChange > 0 ? 'up' : weekOverWeekChange < 0 ? 'down' : 'stable',
                value: weekOverWeekChange > 0 ? `+${weekOverWeekChange}` : `${weekOverWeekChange}`
              }
            : undefined
        }
        color="orange"
        isLoading={isLoading}
      />

      {/* Weekly Progress */}
      <MetricCard
        title="Weekly Progress"
        value={weeklyQuestions}
        subtext={`${weeklyAccuracy.toFixed(0)}% accuracy`}
        icon={<TrendingUp className="h-6 w-6" />}
        trend={{
          direction: accuracyTrend === 'up' ? 'up' : accuracyTrend === 'down' ? 'down' : 'stable',
          value: accuracyTrend === 'up' ? 'Improving' : accuracyTrend === 'down' ? 'Declining' : 'Stable'
        }}
        color="blue"
        isLoading={isLoading}
      />

      {/* Current Streak */}
      <MetricCard
        title="Current Streak"
        value={currentStreak}
        subtext={currentStreak === 1 ? 'day' : 'days'}
        icon={<Flame className="h-6 w-6" />}
        trend={
          currentStreak >= 7
            ? { direction: 'up', value: '🔥 On fire!' }
            : currentStreak >= 3
            ? { direction: 'up', value: 'Keep it up!' }
            : undefined
        }
        color="green"
        isLoading={isLoading}
      />

      {/* Time Practiced */}
      <MetricCard
        title="Time Practiced"
        value={formatTime(totalMinutes)}
        subtext="This period"
        icon={<Clock className="h-6 w-6" />}
        color="purple"
        isLoading={isLoading}
      />
    </div>
  )
}

export default KeyMetricsRow

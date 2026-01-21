/**
 * Growth Chart Component
 * 
 * Line chart showing readiness/accuracy score over time.
 * Supports toggling between overall and subject-specific views.
 * 
 * @module components/analytics/GrowthChart
 */
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, LineChart } from 'lucide-react'
import type { ChildAnalytics } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface GrowthChartProps {
  analytics: ChildAnalytics | null
}

type ChartView = 'overall' | 'verbal_reasoning' | 'english' | 'mathematics'

/**
 * Simple SVG line chart for growth visualization
 */
function SimpleLineChart({
  data,
  height = 200,
  color = '#f97316'
}: {
  data: { date: string; value: number }[]
  height?: number
  color?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-slate-500 text-sm">No data available</p>
      </div>
    )
  }

  const width = 800
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const values = data.map(d => d.value)
  const minValue = Math.max(0, Math.min(...values) - 10)
  const maxValue = Math.min(100, Math.max(...values) + 10)
  
  const xScale = (index: number) => 
    padding.left + (index / (data.length - 1 || 1)) * chartWidth
  const yScale = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight

  // Create path
  const pathData = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`)
    .join(' ')

  // Create area fill
  const areaData = `${pathData} L ${xScale(data.length - 1)} ${yScale(minValue)} L ${xScale(0)} ${yScale(minValue)} Z`

  // Y-axis labels
  const yLabels = [minValue, (minValue + maxValue) / 2, maxValue].map(v => Math.round(v))

  // X-axis labels (show a few dates)
  const xLabelIndices = data.length <= 7 
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 2), data.length - 1]

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className="w-full"
      style={{ height }}
    >
      {/* Grid lines */}
      {yLabels.map((label, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={yScale(label)}
            x2={width - padding.right}
            y2={yScale(label)}
            stroke="#e2e8f0"
            strokeDasharray="4"
          />
          <text
            x={padding.left - 10}
            y={yScale(label)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-slate-500"
          >
            {label}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path
        d={areaData}
        fill={color}
        fillOpacity={0.1}
      />

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle
            cx={xScale(i)}
            cy={yScale(d.value)}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
          {/* Hover tooltip area */}
          <title>{`${d.date}: ${d.value}%`}</title>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabelIndices.map(i => (
        <text
          key={i}
          x={xScale(i)}
          y={height - 10}
          textAnchor="middle"
          className="text-xs fill-slate-500"
        >
          {formatDateLabel(data[i].date)}
        </text>
      ))}
    </svg>
  )
}

/**
 * Format date for x-axis label
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Growth Chart
 * 
 * Shows performance trend over time with subject toggle.
 */
export function GrowthChart({
  analytics
}: GrowthChartProps) {
  const [view, setView] = useState<ChartView>('overall')

  // Transform daily activity data for chart - filter by subject when applicable
  const chartData = useMemo(() => {
    if (!analytics?.dailyActivity) return []

    // For overall view, use the daily activity data as-is
    if (view === 'overall') {
      return analytics.dailyActivity.map(d => ({
        date: d.dateString,
        value: d.accuracy
      })).reverse() // Show chronologically
    }

    // For subject-specific view, we need subject-level daily data
    // Currently dailyActivity doesn't have per-subject breakdown
    // So we'll show a message that per-subject trends are coming soon
    // For now, show the same data but with subject color to indicate selection
    // TODO: Add per-subject daily activity to the SQL function
    
    // Use overall data for now (this is a known limitation)
    return analytics.dailyActivity.map(d => ({
      date: d.dateString,
      value: d.accuracy
    })).reverse()
  }, [analytics?.dailyActivity, view])

  // Get subject-specific stats from subjectBreakdown
  const subjectStats = useMemo(() => {
    if (view === 'overall' || !analytics?.subjectBreakdown) return null
    
    const subjectData = analytics.subjectBreakdown.find(s => s.subject === view)
    if (!subjectData) return null
    
    return {
      accuracy: subjectData.accuracy,
      totalQuestions: subjectData.totalQuestions,
      correctAnswers: subjectData.correctAnswers,
      masteryLevel: subjectData.masteryLevel
    }
  }, [analytics?.subjectBreakdown, view])

  // Get view color
  const getViewColor = (v: ChartView): string => {
    switch (v) {
      case 'verbal_reasoning': return '#a855f7' // purple
      case 'english': return '#3b82f6' // blue
      case 'mathematics': return '#22c55e' // green
      default: return '#f97316' // orange
    }
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!chartData || chartData.length < 2) return null

    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const change = last - first
    const average = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
    const max = Math.max(...chartData.map(d => d.value))
    const min = Math.min(...chartData.map(d => d.value))

    return {
      change,
      changePercent: first > 0 ? ((change / first) * 100).toFixed(1) : '0',
      average: average.toFixed(1),
      max,
      min,
      isImproving: change > 0
    }
  }, [chartData])

  const isLoading = !analytics

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Over Time</CardTitle>
          <CardDescription>Track your improvement journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-slate-600" />
              Growth Over Time
            </CardTitle>
            <CardDescription>
              Track accuracy trends across your learning journey
            </CardDescription>
          </div>

          {/* View toggle */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={view === 'overall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('overall')}
              className={cn(
                view === 'overall' && 'bg-orange-500 hover:bg-orange-600'
              )}
            >
              Overall
            </Button>
            <Button
              variant={view === 'verbal_reasoning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('verbal_reasoning')}
              className={cn(
                view === 'verbal_reasoning' && 'bg-purple-500 hover:bg-purple-600'
              )}
            >
              VR
            </Button>
            <Button
              variant={view === 'english' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('english')}
              className={cn(
                view === 'english' && 'bg-blue-500 hover:bg-blue-600'
              )}
            >
              English
            </Button>
            <Button
              variant={view === 'mathematics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('mathematics')}
              className={cn(
                view === 'mathematics' && 'bg-green-500 hover:bg-green-600'
              )}
            >
              Maths
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subject-specific stats when a subject is selected */}
        {view !== 'overall' && subjectStats && (
          <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-lg border-l-4" style={{ borderLeftColor: getViewColor(view) }}>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Subject Accuracy</p>
              <p className="text-lg font-semibold text-slate-900">{subjectStats.accuracy}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Questions</p>
              <p className="text-lg font-semibold text-slate-900">{subjectStats.totalQuestions}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Correct</p>
              <p className="text-lg font-semibold text-green-600">{subjectStats.correctAnswers}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Mastery</p>
              <p className="text-lg font-semibold capitalize" style={{ color: getViewColor(view) }}>
                {subjectStats.masteryLevel.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Overall summary stats */}
        {view === 'overall' && stats && (
          <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Change</p>
              <p className={cn(
                'text-lg font-semibold',
                stats.isImproving ? 'text-green-600' : stats.change < 0 ? 'text-red-600' : 'text-slate-600'
              )}>
                {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Average</p>
              <p className="text-lg font-semibold text-slate-900">{stats.average}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Best</p>
              <p className="text-lg font-semibold text-green-600">{stats.max}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Range</p>
              <p className="text-lg font-semibold text-slate-600">
                {stats.min}% - {stats.max}%
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-lg border border-slate-200 p-4 bg-white">
          {view !== 'overall' && (
            <p className="text-xs text-slate-400 mb-2 text-center">
              Showing overall daily trends. Per-subject daily charts coming soon.
            </p>
          )}
          <SimpleLineChart
            data={chartData}
            color={getViewColor(view)}
            height={250}
          />
        </div>

        {/* Trend insight - only show for overall view */}
        {view === 'overall' && stats && (
          <div className={cn(
            'flex items-center gap-2 p-3 rounded-lg',
            stats.isImproving ? 'bg-green-50' : stats.change < 0 ? 'bg-amber-50' : 'bg-slate-50'
          )}>
            <TrendingUp className={cn(
              'h-5 w-5',
              stats.isImproving ? 'text-green-600' : stats.change < 0 ? 'text-amber-600' : 'text-slate-600'
            )} />
            <p className="text-sm">
              {stats.isImproving 
                ? `Great progress! Accuracy improved by ${stats.changePercent}% over this period.`
                : stats.change < 0
                ? `Accuracy dipped by ${Math.abs(Number(stats.changePercent))}%. Keep practicing to get back on track!`
                : 'Accuracy has remained stable. Keep up the consistent practice!'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GrowthChart

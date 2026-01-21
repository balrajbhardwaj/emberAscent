/**
 * Weakness Heatmap Component
 * 
 * Flagship visualization for the Ascent tier analytics dashboard.
 * Displays a grid showing performance across subjects and topics
 * with color-coded cells indicating mastery levels.
 * 
 * @module components/analytics/WeaknessHeatmap
 */
"use client"

import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { HeatmapLegend } from "./HeatmapLegend"
import { HeatmapCell } from "./HeatmapCell"
import type { 
  WeaknessHeatmapData, 
  HeatmapCell as HeatmapCellType 
} from "@/types/analytics"

interface WeaknessHeatmapProps {
  data: WeaknessHeatmapData | null
  onTopicClick?: (subject: string, topic: string) => void
  showLabels?: boolean
  interactive?: boolean
  isLoading?: boolean
  className?: string
}

/**
 * Weakness Heatmap
 * 
 * Displays a color-coded grid of performance by subject and topic.
 * Red indicates areas needing focus, green indicates mastery.
 * 
 * @param data - Heatmap data from analytics
 * @param onTopicClick - Callback when a topic cell is clicked
 * @param showLabels - Whether to show percentage labels in cells
 * @param interactive - Whether cells are clickable
 * @param isLoading - Loading state
 */
export function WeaknessHeatmap({
  data,
  onTopicClick,
  showLabels = true,
  interactive = true,
  isLoading = false,
  className
}: WeaknessHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ subject: string; topic: string } | null>(null)

  if (isLoading) {
    return <WeaknessHeatmapSkeleton />
  }

  if (!data || data.cells.length === 0) {
    return <WeaknessHeatmapEmpty />
  }

  // Group cells by topic for row display
  const topicGroups = groupCellsByTopic(data.cells)
  const subjects = data.subjects

  const handleCellClick = (subject: string, topic: string) => {
    if (!interactive) return
    setSelectedCell({ subject, topic })
    onTopicClick?.(subject, topic)
  }

  return (
    <div className={cn("", className)}>
      {/* Header with description */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Track performance across subjects and topics
        </p>
        <HeatmapLegend />
      </div>
      
      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row - Subject Names */}
          <div className="grid gap-1 mb-2" style={{ 
            gridTemplateColumns: `180px repeat(${subjects.length}, 1fr)` 
          }}>
            <div className="text-sm font-medium text-slate-500 p-2">Topic</div>
            {subjects.map((subject) => (
              <div 
                key={subject} 
                className="text-sm font-medium text-slate-700 p-2 text-center capitalize"
              >
                {formatSubjectName(subject)}
              </div>
            ))}
          </div>

          {/* Data Rows - Topics */}
          <div className="space-y-1">
            {Array.from(topicGroups.entries()).map(([topic, cells]) => (
              <div 
                key={topic}
                className="grid gap-1"
                style={{ 
                  gridTemplateColumns: `180px repeat(${subjects.length}, 1fr)` 
                }}
              >
                {/* Topic Name */}
                <div className="text-sm text-slate-700 p-2 truncate" title={topic}>
                  {topic}
                </div>
                
                {/* Cells for each subject */}
                {subjects.map((subject) => {
                  const cell = cells.find(c => c.subject === subject)
                  const isSelected = selectedCell?.subject === subject && selectedCell?.topic === topic
                  
                  return (
                    <HeatmapCell
                      key={`${subject}-${topic}`}
                      cell={cell || null}
                      showLabel={showLabels}
                      interactive={interactive}
                      isSelected={isSelected}
                      onClick={() => cell && handleCellClick(subject, topic)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <HeatmapSummary data={data} />
      </div>
    </div>
  )
}

/**
 * Group heatmap cells by topic for row display
 */
function groupCellsByTopic(cells: HeatmapCellType[]): Map<string, HeatmapCellType[]> {
  const groups = new Map<string, HeatmapCellType[]>()
  
  cells.forEach(cell => {
    const existing = groups.get(cell.topic) || []
    groups.set(cell.topic, [...existing, cell])
  })
  
  return groups
}

/**
 * Format subject name for display
 */
function formatSubjectName(subject: string): string {
  const names: Record<string, string> = {
    'mathematics': 'Maths',
    'english': 'English',
    'verbal_reasoning': 'VR'
  }
  return names[subject] || subject
}

/**
 * Heatmap Summary Statistics
 */
function HeatmapSummary({ data }: { data: WeaknessHeatmapData }) {
  const cells = data.cells
  const needsFocus = cells.filter(c => c.needsFocus).length
  const mastered = cells.filter(c => c.masteryLevel === 'mastered').length
  const proficient = cells.filter(c => c.masteryLevel === 'proficient').length
  const totalTopics = cells.length

  const avgAccuracy = cells.reduce((sum, c) => sum + c.accuracy, 0) / (cells.length || 1)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{totalTopics}</div>
        <div className="text-sm text-slate-500">Topics Practiced</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{mastered + proficient}</div>
        <div className="text-sm text-slate-500">Topics Mastered</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{needsFocus}</div>
        <div className="text-sm text-slate-500">Need Focus</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900">{avgAccuracy.toFixed(0)}%</div>
        <div className="text-sm text-slate-500">Avg. Accuracy</div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for heatmap
 */
function WeaknessHeatmapSkeleton() {
  return (
    <div className="space-y-2">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      {/* Row skeletons */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state for heatmap
 */
function WeaknessHeatmapEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-slate-100 p-4 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
        </svg>
      </div>
      <h3 className="font-medium text-slate-900 mb-2">No data yet</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        Complete some practice sessions to see performance data across different topics.
      </p>
      <a 
        href="/practice" 
        className="mt-4 inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
      >
        Start Practice
      </a>
    </div>
  )
}

export default WeaknessHeatmap

/**
 * Heatmap Cell Component
 * 
 * Individual cell in the weakness heatmap showing performance
 * for a specific subject-topic combination.
 * 
 * @module components/analytics/HeatmapCell
 */
"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { HeatmapCell as HeatmapCellType, TrendDirection } from "@/types/analytics"

interface HeatmapCellProps {
  cell: HeatmapCellType | null
  showLabel?: boolean
  interactive?: boolean
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Individual heatmap cell
 * 
 * Displays color-coded performance with optional trend indicator.
 * Colors range from red (needs focus) to green (mastered).
 * 
 * @param cell - Cell data with accuracy and trend
 * @param showLabel - Whether to show percentage label
 * @param interactive - Whether cell is clickable
 * @param isSelected - Whether cell is currently selected
 * @param onClick - Click handler
 */
export function HeatmapCell({
  cell,
  showLabel = true,
  interactive = true,
  isSelected = false,
  onClick
}: HeatmapCellProps) {
  // Empty cell state
  if (!cell) {
    return (
      <div className="h-12 rounded bg-slate-100 flex items-center justify-center">
        <span className="text-xs text-slate-400">-</span>
      </div>
    )
  }

  const { backgroundColor, textColor, borderColor } = getCellColors(cell.accuracy)
  const TrendIcon = getTrendIcon(cell.trend)

  const cellContent = (
    <div
      className={cn(
        "h-12 rounded flex items-center justify-center gap-1 transition-all duration-200",
        backgroundColor,
        textColor,
        interactive && "cursor-pointer hover:scale-105 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        borderColor,
        "border"
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.()
        }
      }}
    >
      {showLabel && (
        <span className="text-sm font-medium">{cell.accuracy.toFixed(0)}%</span>
      )}
      {TrendIcon && (
        <TrendIcon className={cn("h-3 w-3", getTrendColor(cell.trend))} />
      )}
    </div>
  )

  // Wrap in tooltip for additional info
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cellContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <CellTooltipContent cell={cell} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Get background and text colors based on accuracy
 */
function getCellColors(accuracy: number): { 
  backgroundColor: string
  textColor: string
  borderColor: string 
} {
  if (accuracy >= 85) {
    return {
      backgroundColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600'
    }
  }
  if (accuracy >= 75) {
    return {
      backgroundColor: 'bg-green-400',
      textColor: 'text-green-900',
      borderColor: 'border-green-500'
    }
  }
  if (accuracy >= 65) {
    return {
      backgroundColor: 'bg-green-300',
      textColor: 'text-green-900',
      borderColor: 'border-green-400'
    }
  }
  if (accuracy >= 55) {
    return {
      backgroundColor: 'bg-yellow-300',
      textColor: 'text-yellow-900',
      borderColor: 'border-yellow-400'
    }
  }
  if (accuracy >= 45) {
    return {
      backgroundColor: 'bg-orange-400',
      textColor: 'text-white',
      borderColor: 'border-orange-500'
    }
  }
  if (accuracy >= 35) {
    return {
      backgroundColor: 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-orange-600'
    }
  }
  return {
    backgroundColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600'
  }
}

/**
 * Get trend icon component
 */
function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return null // Don't show icon for stable
  }
}

/**
 * Get trend color class
 */
function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return 'text-green-200'
    case 'down':
      return 'text-red-200'
    default:
      return 'text-slate-400'
  }
}

/**
 * Tooltip content for cell
 */
function CellTooltipContent({ cell }: { cell: HeatmapCellType }) {
  const masteryLabels: Record<string, string> = {
    'mastered': 'Mastered',
    'proficient': 'Proficient',
    'developing': 'Developing',
    'needs_practice': 'Needs Practice'
  }

  const trendLabels: Record<string, string> = {
    'up': 'Improving',
    'down': 'Declining',
    'stable': 'Stable'
  }

  return (
    <div className="space-y-2">
      <div>
        <div className="font-medium">{cell.topic}</div>
        <div className="text-xs text-slate-400 capitalize">
          {formatSubjectName(cell.subject)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="text-slate-400">Accuracy:</div>
        <div className="font-medium">{cell.accuracy.toFixed(1)}%</div>
        
        <div className="text-slate-400">Questions:</div>
        <div>{cell.correctAnswers}/{cell.totalQuestions}</div>
        
        <div className="text-slate-400">Level:</div>
        <div className={getMasteryColorClass(cell.masteryLevel)}>
          {masteryLabels[cell.masteryLevel] || cell.masteryLevel}
        </div>
        
        <div className="text-slate-400">Trend:</div>
        <div className="flex items-center gap-1">
          {cell.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {cell.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          {cell.trend === 'stable' && <Minus className="h-3 w-3 text-slate-400" />}
          {trendLabels[cell.trend]}
        </div>
      </div>

      {cell.lastPracticedAt && (
        <div className="text-xs text-slate-400 pt-1 border-t border-slate-700">
          Last practiced: {formatDate(cell.lastPracticedAt)}
        </div>
      )}

      {cell.needsFocus && (
        <div className="text-xs text-amber-400 font-medium pt-1">
          ⚠️ This topic needs focus
        </div>
      )}
    </div>
  )
}

/**
 * Format subject name for display
 */
function formatSubjectName(subject: string): string {
  const names: Record<string, string> = {
    'mathematics': 'Mathematics',
    'english': 'English',
    'verbal_reasoning': 'Verbal Reasoning'
  }
  return names[subject] || subject
}

/**
 * Get color class for mastery level
 */
function getMasteryColorClass(level: string): string {
  switch (level) {
    case 'mastered':
      return 'text-green-400'
    case 'proficient':
      return 'text-blue-400'
    case 'developing':
      return 'text-amber-400'
    case 'needs_practice':
      return 'text-red-400'
    default:
      return ''
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short' 
  })
}

export default HeatmapCell

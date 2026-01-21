/**
 * Heatmap Legend Component
 * 
 * Color scale legend explaining the heatmap colors.
 * 
 * @module components/analytics/HeatmapLegend
 */
"use client"

import { cn } from "@/lib/utils"

interface HeatmapLegendProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
}

/**
 * Color scale legend for heatmap
 * 
 * Shows the gradient from red (weak) to green (strong)
 * with explanatory labels.
 * 
 * @param orientation - Horizontal or vertical layout
 * @param showLabels - Whether to show text labels
 */
export function HeatmapLegend({
  className,
  orientation = 'horizontal',
  showLabels = true
}: HeatmapLegendProps) {
  const isHorizontal = orientation === 'horizontal'

  const colors = [
    { bg: 'bg-red-500', label: '0-35%', description: 'Needs Focus' },
    { bg: 'bg-orange-500', label: '35-45%', description: 'Struggling' },
    { bg: 'bg-orange-400', label: '45-55%', description: 'Developing' },
    { bg: 'bg-yellow-300', label: '55-65%', description: 'Progressing' },
    { bg: 'bg-green-300', label: '65-75%', description: 'Competent' },
    { bg: 'bg-green-400', label: '75-85%', description: 'Proficient' },
    { bg: 'bg-green-500', label: '85-100%', description: 'Mastered' },
  ]

  return (
    <div 
      className={cn(
        "flex gap-1",
        isHorizontal ? "flex-row items-center" : "flex-col",
        className
      )}
    >
      {showLabels && (
        <span className="text-xs text-slate-500 mr-2">
          {isHorizontal ? 'Weak' : 'Needs Focus'}
        </span>
      )}
      
      <div 
        className={cn(
          "flex gap-0.5",
          isHorizontal ? "flex-row" : "flex-col"
        )}
      >
        {colors.map((color, index) => (
          <div
            key={index}
            className={cn(
              color.bg,
              isHorizontal ? "w-6 h-4" : "w-4 h-6",
              index === 0 && (isHorizontal ? "rounded-l" : "rounded-t"),
              index === colors.length - 1 && (isHorizontal ? "rounded-r" : "rounded-b")
            )}
            title={`${color.label}: ${color.description}`}
          />
        ))}
      </div>

      {showLabels && (
        <span className="text-xs text-slate-500 ml-2">
          {isHorizontal ? 'Strong' : 'Mastered'}
        </span>
      )}
    </div>
  )
}

/**
 * Detailed legend with full descriptions
 */
export function HeatmapLegendDetailed({ className }: { className?: string }) {
  const levels = [
    { bg: 'bg-red-500', text: 'text-white', range: '0-35%', label: 'Needs Focus', description: 'Significant practice needed' },
    { bg: 'bg-orange-400', text: 'text-white', range: '45-55%', label: 'Developing', description: 'Making progress' },
    { bg: 'bg-yellow-300', text: 'text-yellow-900', range: '55-65%', label: 'Progressing', description: 'Building understanding' },
    { bg: 'bg-green-300', text: 'text-green-900', range: '65-75%', label: 'Competent', description: 'Good grasp of concepts' },
    { bg: 'bg-green-500', text: 'text-white', range: '85-100%', label: 'Mastered', description: 'Excellent understanding' },
  ]

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-slate-700">Performance Levels</h4>
      <div className="space-y-1">
        {levels.map((level, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className={cn(
                "w-8 h-6 rounded flex items-center justify-center text-xs font-medium",
                level.bg,
                level.text
              )}
            >
              {level.range.split('-')[0]}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-900">{level.label}</span>
              <span className="text-sm text-slate-500 ml-2">({level.range})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeatmapLegend

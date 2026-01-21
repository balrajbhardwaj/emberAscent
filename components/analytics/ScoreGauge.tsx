/**
 * Score Gauge Component
 * 
 * Animated circular gauge for displaying scores.
 * Used in Readiness Score and other analytics displays.
 * 
 * @module components/analytics/ScoreGauge
 */
"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { ReadinessTier } from "@/types/analytics"

interface ScoreGaugeProps {
  score: number
  tier?: ReadinessTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

/**
 * Circular Score Gauge
 * 
 * Animated SVG gauge that fills based on score percentage.
 * Color changes based on tier or score value.
 * 
 * @param score - Score value (0-100)
 * @param tier - Optional tier for color coding
 * @param size - Size variant
 * @param showLabel - Whether to show score label inside
 * @param animated - Whether to animate on mount
 */
export function ScoreGauge({
  score,
  tier,
  size = 'md',
  showLabel = true,
  animated = true,
  className
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  // Animate score on mount
  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }

    const duration = 1000 // 1 second animation
    const steps = 60
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animated])

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-3xl' }
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const offset = circumference - progress

  // Color based on tier or score
  const strokeColor = getStrokeColor(tier || getTierFromScore(score))
  const bgColor = 'stroke-slate-200'

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          className={bgColor}
        />
        
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          className={cn(strokeColor, "transition-all duration-1000 ease-out")}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-slate-900", config.fontSize)}>
            {displayScore}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      )}
    </div>
  )
}

/**
 * Get tier from score value
 */
function getTierFromScore(score: number): ReadinessTier {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 55) return 'developing'
  return 'needs_focus'
}

/**
 * Get stroke color class based on tier
 */
function getStrokeColor(tier: ReadinessTier): string {
  switch (tier) {
    case 'excellent':
      return 'stroke-green-500'
    case 'good':
      return 'stroke-blue-500'
    case 'developing':
      return 'stroke-amber-500'
    case 'needs_focus':
      return 'stroke-red-500'
    default:
      return 'stroke-slate-500'
  }
}

/**
 * Mini gauge for inline display
 */
export function ScoreGaugeMini({ 
  score, 
  className 
}: { 
  score: number
  className?: string 
}) {
  return (
    <ScoreGauge
      score={score}
      size="sm"
      showLabel={true}
      animated={false}
      className={className}
    />
  )
}

export default ScoreGauge

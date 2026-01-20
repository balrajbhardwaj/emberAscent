/**
 * Ember Score Badge Component
 * 
 * Compact badge displaying question quality score with flame icon(s).
 * Shows on question cards throughout the app.
 * 
 * @module components/ember-score/EmberScoreBadge
 */
"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTierInfo } from "@/lib/scoring/emberScore"
import type { ScoreTier } from "@/types/scoring"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EmberScoreBadgeProps {
  score: number
  tier?: ScoreTier
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  onClick?: () => void
  className?: string
}

/**
 * EmberScoreBadge - Displays Ember Score with visual tier indicators
 * 
 * @param score - Ember Score (0-100)
 * @param tier - Score tier (auto-calculated if not provided)
 * @param size - Badge size variant
 * @param showTooltip - Whether to show tooltip on hover
 * @param onClick - Click handler for expanding details
 * @param className - Additional CSS classes
 */
export function EmberScoreBadge({
  score,
  tier,
  size = 'md',
  showTooltip = true,
  onClick,
  className,
}: EmberScoreBadgeProps) {
  // Calculate tier if not provided
  const actualTier = tier || (score >= 90 ? 'verified' : score >= 75 ? 'confident' : 'draft')
  const tierInfo = getTierInfo(actualTier)

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }

  const flameSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  // Color variants by tier
  const colorClasses = {
    verified: 'bg-green-100 text-green-700 border-green-300',
    confident: 'bg-amber-100 text-amber-700 border-amber-300',
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const flameColor = {
    verified: 'text-green-600',
    confident: 'text-amber-600',
    draft: 'text-slate-600',
  }

  const badge = (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center rounded-full border-2 font-medium transition-all",
        sizeClasses[size],
        colorClasses[actualTier],
        onClick && "cursor-pointer hover:scale-105 hover:shadow-md",
        !onClick && "cursor-default",
        actualTier === 'verified' && "animate-pulse-subtle",
        className
      )}
      aria-label={`Ember Score: ${score} - ${tierInfo.label}`}
    >
      {/* Flame icons based on tier */}
      {Array.from({ length: tierInfo.flames }).map((_, i) => (
        <Flame
          key={i}
          className={cn(flameSize[size], flameColor[actualTier])}
          fill="currentColor"
        />
      ))}
      
      {/* Score number */}
      <span className="font-bold tabular-nums">{score}</span>
    </button>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">{tierInfo.label} Quality</p>
            <p className="text-muted-foreground">{tierInfo.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

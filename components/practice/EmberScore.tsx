/**
 * Ember Score Display Component
 * 
 * Displays the Ember Score (0-100) showing content quality and trust level.
 * 
 * Features:
 * - Compact view with flame icons based on score tier
 * - Expandable to show detailed breakdown
 * - Three score tiers: Verified (90-100), Confident (75-89), Draft (60-74)
 * - Clickable to open transparency modal
 * 
 * Score Breakdown:
 * - Curriculum alignment percentage
 * - Expert verification status
 * - Community rating
 * - Question provenance
 * 
 * @module components/practice/EmberScore
 */
"use client"

import { useState } from "react"
import { Flame, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EmberScoreInfo } from "./EmberScoreInfo"

interface EmberScoreBreakdown {
  curriculumAlignment: number
  expertVerified: boolean
  communityRating: number
  generatedBy: string
  reviewedBy: string
  curriculumReference: string
}

interface EmberScoreProps {
  score: number
  breakdown: EmberScoreBreakdown
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
}

/**
 * Ember Score Badge
 * 
 * Shows content quality score with flame icons and optional detailed breakdown.
 * 
 * @param score - Ember Score value (0-100)
 * @param breakdown - Detailed score breakdown information
 * @param showDetails - Whether to show expandable details (default: false)
 * @param size - Badge size variant (sm, md, lg)
 */
export function EmberScore({
  score,
  breakdown,
  showDetails = false,
  size = "md",
}: EmberScoreProps) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Determine score tier
  const tier = score >= 90 ? "verified" : score >= 75 ? "confident" : "draft"
  const flames = score >= 90 ? 3 : score >= 75 ? 2 : 1
  const tierLabel = tier === "verified" ? "Verified" : tier === "confident" ? "Confident" : "Draft"
  
  const tierColors = {
    verified: "text-green-600 bg-green-50 border-green-200",
    confident: "text-amber-600 bg-amber-50 border-amber-200",
    draft: "text-slate-600 bg-slate-50 border-slate-200",
  }

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  if (!showDetails) {
    // Compact view
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all hover:scale-105 ${tierColors[tier]} ${sizes[size]}`}
          >
            {Array.from({ length: flames }).map((_, i) => (
              <Flame key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span>{score}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Ember Score: {score} ({tierLabel})
              </p>
              <p className="text-xs text-slate-600">
                This score shows content quality and trustworthiness
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Curriculum Aligned:</span>
                <span className="font-medium">{breakdown.curriculumAlignment}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expert Verified:</span>
                <span className="font-medium">
                  {breakdown.expertVerified ? "✓" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Community Rating:</span>
                <span className="font-medium">{breakdown.communityRating}/5</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setShowInfoModal(true)}
            >
              <Info className="mr-1 h-3 w-3" />
              How are questions made?
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Expanded view with modal
  return (
    <>
      <div className={`flex items-center gap-2 ${sizes[size]}`}>
        <div className={`flex items-center gap-1 rounded-full border px-3 py-1.5 ${tierColors[tier]}`}>
          {Array.from({ length: flames }).map((_, i) => (
            <Flame key={i} className="h-4 w-4 fill-current" />
          ))}
          <span className="font-semibold">{score}</span>
          <span className="text-xs opacity-75">{tierLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInfoModal(true)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {showInfoModal && (
        <EmberScoreInfo
          score={score}
          breakdown={breakdown}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </>
  )
}

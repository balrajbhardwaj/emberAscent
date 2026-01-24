/**
 * Ascent Trust Level Display Component
 * 
 * Displays the Ascent Trust Level (0-100) showing content quality and reliability.
 * 
 * Features:
 * - Compact view with dot indicators based on trust tier
 * - Expandable to show detailed breakdown
 * - Three tiers: Expert (90-100), Reviewed (75-89), Standard (60-74)
 * - Clickable to open transparency modal
 * 
 * Trust Breakdown:
 * - Curriculum alignment percentage
 * - Expert verification status
 * - Community rating
 * - Question provenance
 * 
 * @module components/practice/EmberScore
 */
"use client"

import { useState } from "react"
import Link from "next/link"
import { Info } from "lucide-react"
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

interface AscentTrustLevelProps {
  score: number
  questionId?: string
  breakdown?: EmberScoreBreakdown
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
  onOpenProvenance?: () => void
}

// Default breakdown when not provided
const defaultBreakdown: EmberScoreBreakdown = {
  curriculumAlignment: 0,
  expertVerified: false,
  communityRating: 0,
  generatedBy: "AI Generated",
  reviewedBy: "",
  curriculumReference: "",
}

// Shield indicator component - shows trust level with filled shields
function TrustShields({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-3.5 w-3.5 transition-all ${
            i < filled ? color.replace('bg-', 'text-') : "text-slate-300"
          }`}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ))}
    </div>
  )
}

/**
 * Ascent Trust Level Badge
 * 
 * Shows content quality score with dot indicators and optional detailed breakdown.
 * 
 * @param score - Trust Level value (0-100)
 * @param breakdown - Detailed score breakdown information
 * @param showDetails - Whether to show expandable details (default: false)
 * @param size - Badge size variant (sm, md, lg)
 */
export function EmberScore({
  score,
  questionId,
  breakdown = defaultBreakdown,
  showDetails = false,
  size = "md",
  onOpenProvenance,
}: AscentTrustLevelProps) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Guard against undefined/null score
  if (score === undefined || score === null || isNaN(score)) {
    return null
  }

  // Determine trust tier
  const tier = score >= 90 ? "expert" : score >= 75 ? "reviewed" : "standard"
  const dots = score >= 90 ? 3 : score >= 75 ? 2 : 1
  const tierLabel = tier === "expert" ? "Expert" : tier === "reviewed" ? "Reviewed" : "Standard"
  
  const tierColors = {
    expert: "text-blue-600 bg-blue-50 border-blue-200",
    reviewed: "text-green-600 bg-green-50 border-green-200",
    standard: "text-slate-700 bg-slate-100 border-slate-300",
  }

  const dotColors = {
    expert: "bg-blue-500",
    reviewed: "bg-green-500",
    standard: "bg-slate-600",
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
            className={`inline-flex items-center gap-2 rounded-full border font-medium transition-all hover:scale-105 ${tierColors[tier]} ${sizes[size]}`}
          >
            <TrustShields filled={dots} total={3} color={dotColors[tier]} />
            <span>{score}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Ascent Trust Level: {score} ({tierLabel})
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
              asChild
            >
              <Link href="/how-questions-are-made">
                <Info className="mr-1 h-3 w-3" />
                How are questions made?
              </Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Expanded view with modal or panel trigger
  return (
    <>
      <div className={`flex items-center gap-2 ${sizes[size]}`}>
        <button 
          onClick={onOpenProvenance || (() => setShowInfoModal(true))}
          className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all hover:scale-105 hover:shadow-md ${tierColors[tier]}`}
          title="Click to see how this question was made"
        >
          <TrustShields filled={dots} total={3} color={dotColors[tier]} />
          <span className="font-semibold">{score}</span>
          <span className="text-xs opacity-75">{tierLabel}</span>
          
          {/* Hover hint */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              See question history
            </div>
          </div>
        </button>
      </div>

      {showInfoModal && questionId && !onOpenProvenance && (
        <EmberScoreInfo
          score={score}
          breakdown={breakdown}
          questionId={questionId}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </>
  )
}

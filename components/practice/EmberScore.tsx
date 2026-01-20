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
  breakdown?: EmberScoreBreakdown
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
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

// Dot indicator component
function TrustDots({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            i < filled ? color : "bg-slate-300"
          }`}
        />
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
  breakdown = defaultBreakdown,
  showDetails = false,
  size = "md",
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
            <TrustDots filled={dots} total={3} color={dotColors[tier]} />
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

  // Expanded view with modal
  return (
    <>
      <div className={`flex items-center gap-2 ${sizes[size]}`}>
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${tierColors[tier]}`}>
          <TrustDots filled={dots} total={3} color={dotColors[tier]} />
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

/**
 * Ascent Trust Level Information Modal
 * 
 * Displays detailed transparency information about question quality and provenance.
 * 
 * Features:
 * - Explains Ascent Trust Level meaning and calculation
 * - Shows specific question's creation process
 * - Displays curriculum alignment details
 * - Links to quality standards documentation
 * 
 * @module components/practice/EmberScoreInfo
 */
"use client"

import { X, CheckCircle, Users, BookOpen, Sparkles } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EmberScoreBreakdown {
  curriculumAlignment: number
  expertVerified: boolean
  communityRating: number
  generatedBy: string
  reviewedBy: string
  curriculumReference: string
}

interface EmberScoreInfoProps {
  score: number
  breakdown: EmberScoreBreakdown
  onClose: () => void
}

// Dot indicator component for modal
function TrustDots({ filled, total, color, size = "md" }: { filled: number; total: number; color: string; size?: "sm" | "md" }) {
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
  const gapSize = size === "sm" ? "gap-1" : "gap-1.5"
  
  return (
    <div className={`flex items-center ${gapSize}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full transition-all ${
            i < filled ? color : "bg-slate-300"
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Ascent Trust Level Information Modal
 * 
 * Full-screen dialog explaining the question's quality score and provenance.
 * 
 * @param score - Trust Level value (0-100)
 * @param breakdown - Detailed score breakdown and metadata
 * @param onClose - Handler to close the modal
 */
export function EmberScoreInfo({
  score,
  breakdown,
  onClose,
}: EmberScoreInfoProps) {
  // Determine tier for visual styling
  const tier = score >= 90 ? "expert" : score >= 75 ? "reviewed" : "standard"
  const dots = score >= 90 ? 3 : score >= 75 ? 2 : 1
  const tierLabel = tier === "expert" ? "Expert Verified" : tier === "reviewed" ? "Reviewed" : "Standard"
  
  const dotColors = {
    expert: "bg-green-500",
    reviewed: "bg-amber-500",
    standard: "bg-slate-500",
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  Ascent Trust Level: {score}
                </h2>
                <TrustDots filled={dots} total={3} color={dotColors[tier]} size="md" />
              </div>
              <Badge variant="secondary">{tierLabel}</Badge>
              <p className="mt-1 text-sm text-slate-600">
                Trust and quality rating for this question
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* What is Ascent Trust Level */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              What is Ascent Trust Level?
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              The Ascent Trust Level is our transparency rating (0-100) that shows how much we
              trust this question's quality, accuracy, and curriculum alignment. Higher
              scores mean more verification and review.
            </p>
            
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <span className="font-medium">90-100: Expert Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <span className="font-medium">75-89: Reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-500" />
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <span className="font-medium">60-74: Standard</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Trust Level Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Curriculum Alignment
                  </p>
                  <p className="text-xs text-slate-600">
                    {breakdown.curriculumReference}
                  </p>
                </div>
                <Badge variant="secondary">
                  {breakdown.curriculumAlignment}%
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Expert Verification
                  </p>
                  <p className="text-xs text-slate-600">
                    {breakdown.expertVerified
                      ? `Reviewed by ${breakdown.reviewedBy}`
                      : "Pending expert review"}
                  </p>
                </div>
                <Badge variant={breakdown.expertVerified ? "default" : "secondary"}>
                  {breakdown.expertVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Community Rating
                  </p>
                  <p className="text-xs text-slate-600">
                    Based on parent and teacher feedback
                  </p>
                </div>
                <Badge variant="secondary">
                  {breakdown.communityRating}/5 ⭐
                </Badge>
              </div>
            </div>
          </div>

          {/* Question Provenance */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              How was this question made?
            </h3>
            
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium">Generated by: {breakdown.generatedBy}</p>
                  <p className="text-xs text-slate-600">
                    AI-powered question generation aligned to UK curriculum
                  </p>
                </div>
              </div>
              
              {breakdown.expertVerified && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <p className="font-medium">Reviewed by: {breakdown.reviewedBy}</p>
                    <p className="text-xs text-slate-600">
                      Verified for accuracy and appropriateness
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Score Tiers Explanation */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Score Tiers</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  🔥🔥🔥 90-100
                </Badge>
                <p className="text-slate-600">
                  <strong>Verified</strong> - Expert reviewed and curriculum aligned
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  🔥🔥 75-89
                </Badge>
                <p className="text-slate-600">
                  <strong>Confident</strong> - High quality, awaiting expert review
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  🔥 60-74
                </Badge>
                <p className="text-slate-600">
                  <strong>Draft</strong> - Good quality, undergoing verification
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">
              We're committed to transparency in AI-generated content
            </p>
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

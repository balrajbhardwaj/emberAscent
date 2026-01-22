/**
 * Ember Score Detail Modal
 * 
 * Expanded view showing complete score breakdown, provenance, and quality information.
 * This is the detailed transparency view that builds trust with parents.
 * 
 * @module components/ember-score/EmberScoreDetail
 */
"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronUp, Info, Flame } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getTierInfo, formatScoreBreakdown } from "@/lib/scoring/emberScore"
import { ProvenanceTimeline } from "./ProvenanceTimeline"
import type { EmberScoreResult } from "@/types/scoring"

interface QuestionMetadata {
  id: string // Add question ID for provenance lookup
  subject: string
  topic: string
  curriculumReference?: string
  examBoard: string
  createdAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  totalAttempts?: number
  successRate?: number
}

interface EmberScoreDetailProps {
  isOpen: boolean
  onClose: () => void
  scoreResult: EmberScoreResult
  questionMetadata: QuestionMetadata
  onOpenInfo?: () => void
}

/**
 * EmberScoreDetail - Full transparency view of question quality
 * 
 * Shows:
 * - Score overview with tier
 * - Detailed breakdown by component
 * - Question provenance (how it was made)
 * - Community statistics
 */
export function EmberScoreDetail({
  isOpen,
  onClose,
  scoreResult,
  questionMetadata,
  onOpenInfo,
}: EmberScoreDetailProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("breakdown")
  const tierInfo = getTierInfo(scoreResult.tier)
  const formattedBreakdown = formatScoreBreakdown(scoreResult.breakdown)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold">Ember Score</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Overview */}
          <div className="rounded-lg border-2 p-6 text-center ember-score-overview" data-tier={tierInfo.color}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: tierInfo.flames }).map((_, i) => (
                <Flame
                  key={i}
                  className="h-8 w-8"
                  fill={tierInfo.color === 'green' ? 'rgb(34 197 94)' : 
                       tierInfo.color === 'amber' ? 'rgb(245 158 11)' : 
                       'rgb(100 116 139)'}
                  color={tierInfo.color === 'green' ? 'rgb(34 197 94)' : 
                         tierInfo.color === 'amber' ? 'rgb(245 158 11)' : 
                         'rgb(100 116 139)'}
                />
              ))}
            </div>
            
            <div className="text-6xl font-bold mb-2">{scoreResult.score}</div>
            
            <Badge 
              variant="secondary" 
              className={cn(
                "text-base px-4 py-1",
                tierInfo.color === 'green' && "bg-green-100 text-green-700",
                tierInfo.color === 'amber' && "bg-amber-100 text-amber-700",
                tierInfo.color === 'gray' && "bg-slate-100 text-slate-700"
              )}
            >
              {tierInfo.label}
            </Badge>
            
            <p className="text-sm text-muted-foreground mt-2">
              {tierInfo.description}
            </p>

            {onOpenInfo && (
              <Button
                variant="link"
                size="sm"
                onClick={onOpenInfo}
                className="mt-2 text-xs"
              >
                <Info className="h-3 w-3 mr-1" />
                What does this mean?
              </Button>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("breakdown")}
              className="flex items-center justify-between w-full text-left font-semibold hover:opacity-70 transition-opacity"
            >
              <span>Score Breakdown</span>
              {expandedSection === "breakdown" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {expandedSection === "breakdown" && (
              <div className="space-y-4 pt-2">
                {formattedBreakdown.map((item) => (
                  <div key={item.component} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.component}</span>
                      <span className="text-muted-foreground">
                        {item.score} / {item.maxScore}
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total Score</span>
                    <span>{scoreResult.score} / 100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Provenance */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("provenance")}
              className="flex items-center justify-between w-full text-left font-semibold hover:opacity-70 transition-opacity"
            >
              <span>Question History & Provenance</span>
              {expandedSection === "provenance" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {expandedSection === "provenance" && (
              <div className="space-y-4 pt-2">
                {/* Quick Stats */}
                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Generated by:</span>{" "}
                    <span className="text-muted-foreground">Claude AI (Anthropic)</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Generation date:</span>{" "}
                    <span className="text-muted-foreground">
                      {questionMetadata.createdAt.toLocaleDateString()}
                    </span>
                  </div>

                  {questionMetadata.reviewedBy && (
                    <>
                      <div>
                        <span className="font-medium">Review status:</span>{" "}
                        <Badge variant="secondary" className="ml-1">
                          Expert Reviewed
                        </Badge>
                      </div>
                      
                      <div>
                        <span className="font-medium">Reviewed by:</span>{" "}
                        <span className="text-muted-foreground">
                          {questionMetadata.reviewedBy}
                        </span>
                      </div>
                    </>
                  )}

                  <div>
                    <span className="font-medium">Curriculum:</span>{" "}
                    <span className="text-muted-foreground">
                      {questionMetadata.curriculumReference || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Exam alignment:</span>{" "}
                    <span className="text-muted-foreground">
                      {questionMetadata.examBoard.toUpperCase()} Assessment Style
                    </span>
                  </div>

                  {questionMetadata.totalAttempts !== undefined && (
                    <>
                      <div>
                        <span className="font-medium">Times practiced:</span>{" "}
                        <span className="text-muted-foreground">
                          {questionMetadata.totalAttempts.toLocaleString()}
                        </span>
                      </div>

                      {questionMetadata.successRate !== undefined && (
                        <div>
                          <span className="font-medium">Success rate:</span>{" "}
                          <span className="text-muted-foreground">
                            {questionMetadata.successRate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Full Provenance Timeline */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-sm mb-3">Complete Question History</h4>
                  <ProvenanceTimeline questionId={questionMetadata.id} />
                </div>

                <p className="text-xs text-muted-foreground italic">
                  All questions are generated using AI and reviewed by education experts 
                  to ensure accuracy and curriculum alignment. Full transparency is our commitment.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

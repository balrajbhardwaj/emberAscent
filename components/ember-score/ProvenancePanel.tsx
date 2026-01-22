/**
 * Provenance Panel Component
 * 
 * Non-obstructive slide-in panel showing question transparency information.
 * Emphasizes trust and transparency as core values.
 * 
 * @module components/ember-score/ProvenancePanel
 */
"use client"

import { useState } from "react"
import { X, Shield, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProvenanceTimeline } from "./ProvenanceTimeline"

interface ProvenancePanelProps {
  isOpen: boolean
  onClose: () => void
  questionId: string
  questionData: {
    subject: string
    topic: string
    emberScore: number
    curriculumReference?: string
    createdAt?: Date
  }
}

/**
 * ProvenancePanel - Slide-in transparency panel
 * 
 * Shows complete question provenance without obstructing practice.
 * Can be kept open while answering questions.
 */
export function ProvenancePanel({
  isOpen,
  onClose,
  questionId,
  questionData,
}: ProvenancePanelProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  
  const scoreTier = questionData.emberScore >= 90 ? 'verified' : 
                    questionData.emberScore >= 75 ? 'confident' : 'standard'
  
  const tierInfo = {
    verified: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Expert Verified',
      description: 'This question has been reviewed and approved by education experts.'
    },
    confident: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'High Quality',
      description: 'This question meets our quality standards and is awaiting expert review.'
    },
    standard: {
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      label: 'Standard Quality',
      description: 'This question is curriculum-aligned and ready for practice.'
    }
  }

  const currentTier = tierInfo[scoreTier]

  return (
    <>
      {/* Backdrop - subtle, doesn't block interaction */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/5 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50",
          "transform transition-transform duration-300 ease-in-out",
          "border-l border-slate-200",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Question Transparency
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  Complete visibility into how this question was made
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Trust Score Card */}
              <div className={cn(
                "rounded-lg border-2 p-5",
                currentTier.bgColor,
                currentTier.borderColor
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center",
                      currentTier.bgColor,
                      currentTier.borderColor,
                      "border-2"
                    )}>
                      <span className={cn("text-2xl font-bold", currentTier.color)}>
                        {questionData.emberScore}
                      </span>
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-lg", currentTier.color)}>
                        {currentTier.label}
                      </h3>
                      <p className="text-xs text-slate-600">Ember Score</p>
                    </div>
                  </div>
                  <CheckCircle className={cn("h-8 w-8", currentTier.color)} />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {currentTier.description}
                </p>
              </div>

              {/* About This Question */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">About This Question</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Subject</p>
                    <Badge variant="secondary" className="capitalize">
                      {questionData.subject}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Topic</p>
                    <p className="font-medium text-slate-900">{questionData.topic}</p>
                  </div>
                  {questionData.curriculumReference && (
                    <div className="col-span-2">
                      <p className="text-slate-600 mb-1">Curriculum Reference</p>
                      <Badge variant="outline" className="font-mono text-xs">
                        {questionData.curriculumReference}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete History - Collapsible */}
              <div className="space-y-3 border rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Complete History</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      {isHistoryExpanded ? 'Hide' : 'Show'} timeline
                    </span>
                    <div className={cn(
                      "transition-transform",
                      isHistoryExpanded ? "rotate-180" : ""
                    )}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {isHistoryExpanded && (
                  <div className="p-4 border-t bg-white">
                    <p className="text-sm text-slate-600 mb-4">
                      Every step in this question's lifecycle—from creation to review.
                    </p>
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <ProvenanceTimeline questionId={questionId} />
                    </div>
                  </div>
                )}
              </div>

              {/* Why This Matters */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Why This Matters
                </h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p>
                      <strong>Your child deserves the best.</strong> Every question they practice 
                      should be accurate, appropriate, and aligned to the curriculum.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p>
                      <strong>No black boxes.</strong> You should know exactly where content comes 
                      from and who verified it. No hidden algorithms.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p>
                      <strong>Trust through openness.</strong> We show you everything—creation, 
                      review process, and quality checks. You decide if it's right for your family.
                    </p>
                  </div>
                </div>
              </div>

              {/* Our Promise to You */}
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Our Promise to You
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    ✓ Every question is aligned to the UK National Curriculum
                  </p>
                  <p>
                    ✓ Expert educators review our content for accuracy
                  </p>
                  <p>
                    ✓ Complete transparency—see how everything is made
                  </p>
                  <p>
                    ✓ Continuous improvement based on feedback
                  </p>
                  <p className="mt-3 text-xs text-slate-600 italic">
                    Questions that don't meet our standards aren't shown to children. Quality first, always.
                  </p>
                </div>
              </div>

              {/* Learn More */}
              <div className="text-center pt-4 pb-2">
                <p className="text-xs text-slate-600 mb-3">
                  Want to learn more about our quality standards?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/how-questions-are-made" target="_blank">
                      How Questions Are Made
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/transparency" target="_blank">
                      Our Commitment
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

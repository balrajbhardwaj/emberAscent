/**
 * Explanation Panel Component
 * 
 * Displays answer explanations after a question is answered.
 * 
 * Features:
 * - Slide-up panel on mobile, side panel on desktop
 * - Three explanation styles: Step-by-Step, Visual/Analogy, Worked Example
 * - Smooth animations and transitions
 * - Dismissible with "Got it!" button
 * - Report issue option for confused students
 * 
 * @module components/practice/ExplanationPanel
 */
"use client"

import { X, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExplanationTabs, ExplanationStyle } from "./ExplanationTabs"
import { useState } from "react"

interface QuestionExplanations {
  stepByStep: string
  visual: string
  example: string
}

interface ExplanationPanelProps {
  explanations: QuestionExplanations
  isVisible: boolean
  onClose: () => void
}

/**
 * Explanation Panel
 * 
 * Shows different explanation styles for answered questions.
 * Slides up from bottom on mobile, appears as side panel on desktop.
 * 
 * @param explanations - Three explanation styles for the question
 * @param isVisible - Whether the panel is currently visible
 * @param onClose - Handler to close the panel
 */
export function ExplanationPanel({
  explanations,
  isVisible,
  onClose,
}: ExplanationPanelProps) {
  const [activeTab, setActiveTab] = useState<ExplanationStyle>("step-by-step")

  if (!isVisible) return null

  const currentExplanation =
    activeTab === "step-by-step"
      ? explanations.stepByStep
      : activeTab === "visual"
      ? explanations.visual
      : explanations.example

  return (
    <>
      {/* Mobile: Slide-up panel */}
      <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose}>
        <Card
          className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t-4 border-blue-500"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Explanation
                </h3>
                <p className="text-sm text-slate-600">
                  Choose your learning style
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <ExplanationTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {currentExplanation}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              <Button onClick={onClose} className="w-full">
                Got it!
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-slate-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                Still confused? Report issue
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop: Side panel */}
      <Card className="hidden lg:block sticky top-6 h-fit space-y-4 border-l-4 border-blue-500 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Explanation</h3>
            <p className="text-sm text-slate-600">Choose your learning style</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <ExplanationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {currentExplanation}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-slate-600">
            <AlertCircle className="mr-2 h-4 w-4" />
            Still confused? Report issue
          </Button>
        </div>
      </Card>
    </>
  )
}

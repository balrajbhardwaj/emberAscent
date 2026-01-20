/**
 * Session Question Layout Component
 * 
 * Main practice screen layout that orchestrates:
 * - SessionProgress at top
 * - QuestionCard in center
 * - ExplanationPanel slide-in
 * - Navigation controls
 * - Keyboard shortcuts
 * 
 * @module components/practice/SessionQuestion
 */
"use client"

import { useEffect, useState } from "react"
import { SessionProgress } from "./SessionProgress"
import { QuestionCard } from "./QuestionCard"
import { ExplanationPanel } from "./ExplanationPanel"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye } from "lucide-react"
import { SessionQuestion as SessionQuestionType } from "@/hooks/usePracticeSession"

interface SessionQuestionProps {
  question: SessionQuestionType
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string | null
  isAnswered: boolean
  timeElapsed: number
  timeLimit?: number
  showTimer: boolean
  onSelectAnswer: (answerId: string) => void
  onNext: () => void
  onPause: () => void
  onExit: () => void
}

/**
 * Session Question Screen
 * 
 * Main practice interface with question, progress, and controls.
 * Handles keyboard shortcuts for accessibility.
 * 
 * @param question - Current question data
 * @param questionNumber - Current question number (1-indexed)
 * @param totalQuestions - Total questions in session
 * @param selectedAnswer - Currently selected answer ID
 * @param isAnswered - Whether question has been answered
 * @param timeElapsed - Seconds elapsed in session
 * @param timeLimit - Time limit in seconds (for mock tests)
 * @param showTimer - Whether to show timer
 * @param onSelectAnswer - Handler for answer selection
 * @param onNext - Handler for next question
 * @param onPause - Handler to pause session
 * @param onExit - Handler to exit session
 */
export function SessionQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  timeElapsed,
  timeLimit,
  showTimer,
  onSelectAnswer,
  onNext,
  onPause,
  onExit,
}: SessionQuestionProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  // Auto-show explanation after answering
  useEffect(() => {
    if (isAnswered && !showExplanation) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        setShowExplanation(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAnswered])

  // Reset explanation when question changes
  useEffect(() => {
    setShowExplanation(false)
  }, [question.id])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Number keys 1-5 for answer selection (only if not answered)
      if (!isAnswered && e.key >= "1" && e.key <= "5") {
        const index = parseInt(e.key) - 1
        if (index < question.options.length) {
          onSelectAnswer(question.options[index].id)
        }
        return
      }

      // Enter key for next question (only if answered)
      if (isAnswered && e.key === "Enter") {
        onNext()
        return
      }

      // E key to toggle explanation (only if answered)
      if (isAnswered && e.key.toLowerCase() === "e") {
        setShowExplanation((prev) => !prev)
        return
      }

      // Escape key to pause
      if (e.key === "Escape") {
        onPause()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [question, isAnswered, selectedAnswer, onSelectAnswer, onNext, onPause])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Progress Bar */}
      <SessionProgress
        answered={questionNumber - 1}
        total={totalQuestions}
        timeElapsed={timeElapsed}
        timeLimit={timeLimit}
        onPause={onPause}
        onExit={onExit}
        showTimer={showTimer}
      />

      {/* Main Content */}
      <div className="flex-1 container max-w-4xl py-6 sm:py-8">
        <div className="space-y-6">
          {/* Question Number */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Question {questionNumber}</p>
              <p className="text-xs text-slate-500">
                {question.subject} {question.topic && `• ${question.topic}`}
              </p>
            </div>
          </div>

          {/* Question Card */}
          <QuestionCard
            question={{
              id: question.id,
              questionText: question.questionText,
              subject: question.subject,
              emberScore: question.emberScore ?? 75, // Fallback to 75
              emberScoreBreakdown: {
                curriculumAlignment: 85,
                expertVerified: true,
                communityRating: 4.5,
                generatedBy: "System",
                reviewedBy: "Expert",
                curriculumReference: question.topic || "",
              },
              options: question.options.map((opt, idx) => ({
                id: opt.id,
                letter: String.fromCharCode(65 + idx),
                text: opt.text,
              })),
              correctAnswerId: question.correctAnswerId,
            }}
            onAnswer={onSelectAnswer}
            showResult={isAnswered}
            selectedAnswer={selectedAnswer}
            isLoading={false}
          />

          {/* Controls */}
          {isAnswered && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Show/Hide Explanation Button */}
              <Button
                variant="outline"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showExplanation ? "Hide" : "Show"} Explanation
              </Button>

              {/* Next Question Button */}
              <Button
                size="lg"
                onClick={onNext}
                className="flex-1 sm:flex-none flex items-center gap-2"
              >
                {questionNumber === totalQuestions ? "Finish" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          {!isAnswered && (
            <p className="text-xs text-center text-slate-500">
              💡 Tip: Use number keys 1-{question.options.length} to select answers
            </p>
          )}
          {isAnswered && (
            <p className="text-xs text-center text-slate-500">
              💡 Tip: Press Enter to continue • Press E to toggle explanation
            </p>
          )}
        </div>
      </div>

      {/* Explanation Panel */}
      {isAnswered && (
        <ExplanationPanel
          explanations={{
            stepByStep: question.explanations.stepByStep,
            visual: question.explanations.visual || "No visual explanation available.",
            example: question.explanations.example || "No worked example available.",
          }}
          isVisible={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

/**
 * Question Card Component
 * 
 * Core interactive component for displaying questions and collecting answers.
 * 
 * Features:
 * - Clean, readable question display
 * - Large touch-friendly answer options
 * - Subject and Ember Score badges
 * - Bookmark functionality
 * - Visual feedback for correct/incorrect answers
 * - Loading states with skeletons
 * - Support for 4-5 multiple choice options
 * 
 * Answer States:
 * - Default: Unselected, clickable
 * - Selected: Highlighted before submission
 * - Correct: Green background after submission
 * - Incorrect: Red background for wrong answer, green for correct
 * 
 * @module components/practice/QuestionCard
 */
"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmberScore } from "./EmberScore"
import { CurriculumBadge } from "@/components/curriculum/CurriculumReference"
import { cn } from "@/lib/utils"

interface QuestionOption {
  id: string
  letter: string
  text: string
}

interface Question {
  id: string
  questionText: string
  subject: string
  emberScore: number
  emberScoreBreakdown: {
    curriculumAlignment: number
    expertVerified: boolean
    communityRating: number
    generatedBy: string
    reviewedBy: string
    curriculumReference: string
  }
  options: QuestionOption[]
  correctAnswerId: string
}

interface QuestionCardProps {
  question: Question
  onAnswer: (answerId: string) => void
  showResult: boolean
  selectedAnswer: string | null
  isLoading: boolean
  questionNumber?: number
  totalQuestions?: number
  isBookmarked?: boolean
  onToggleBookmark?: () => void
}

/**
 * Question Card
 * 
 * Main question display component with answer selection.
 * 
 * @param question - Question data object
 * @param onAnswer - Handler when an answer is selected
 * @param showResult - Whether to show correct/incorrect feedback
 * @param selectedAnswer - Currently selected answer ID
 * @param isLoading - Loading state for question data
 * @param questionNumber - Current question number (e.g., 3)
 * @param totalQuestions - Total questions in session (e.g., 10)
 * @param isBookmarked - Whether question is bookmarked
 * @param onToggleBookmark - Handler to bookmark/unbookmark
 */
export function QuestionCard({
  question,
  onAnswer,
  showResult,
  selectedAnswer,
  isLoading,
  questionNumber,
  totalQuestions,
  isBookmarked = false,
  onToggleBookmark,
}: QuestionCardProps) {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(
    selectedAnswer
  )

  if (isLoading) {
    return <QuestionCardSkeleton />
  }

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return // Don't allow changes after submission
    setLocalSelectedAnswer(answerId)
    onAnswer(answerId)
  }

  // Subject badge colors
  const subjectColors: Record<string, string> = {
    "Verbal Reasoning": "bg-purple-100 text-purple-700 border-purple-200",
    English: "bg-blue-100 text-blue-700 border-blue-200",
    Maths: "bg-green-100 text-green-700 border-green-200",
  }

  const subjectColor = subjectColors[question.subject] || "bg-slate-100 text-slate-700"

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Badge */}
          <Badge className={`border ${subjectColor}`} variant="outline">
            {question.subject}
          </Badge>

          {/* Ember Score */}
          {question.emberScore !== undefined && question.emberScore !== null && (
            <EmberScore
              score={question.emberScore}
              breakdown={question.emberScoreBreakdown}
              size="sm"
            />
          )}

          {/* Curriculum Reference */}
          {question.emberScoreBreakdown?.curriculumReference && (
            <CurriculumBadge 
              code={question.emberScoreBreakdown.curriculumReference}
              showTooltip
            />
          )}

          {/* Question Number */}
          {questionNumber && totalQuestions && (
            <span className="text-sm text-slate-600">
              Question {questionNumber} of {totalQuestions}
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        {onToggleBookmark && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleBookmark}
            className="shrink-0"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 fill-orange-500 text-orange-500" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Question Body */}
      <div className="space-y-6 p-4 sm:p-6">
        {/* Question Text */}
        <div className="prose prose-slate max-w-none">
          <p className="text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
            {question.questionText}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = localSelectedAnswer === option.id
            const isCorrect = option.id === question.correctAnswerId
            const isIncorrect = showResult && isSelected && !isCorrect

            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={showResult}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all",
                  "hover:border-slate-300 hover:bg-slate-50",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                  "disabled:cursor-not-allowed",
                  // Default state
                  !showResult && !isSelected && "border-slate-200 bg-white",
                  // Selected (before result)
                  !showResult && isSelected && "border-orange-500 bg-orange-50",
                  // Correct answer (after result)
                  showResult && isCorrect && "border-green-500 bg-green-50",
                  // Incorrect answer (after result)
                  isIncorrect && "border-red-500 bg-red-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Letter Badge */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold",
                      !showResult && !isSelected && "bg-slate-100 text-slate-700",
                      !showResult && isSelected && "bg-orange-500 text-white",
                      showResult && isCorrect && "bg-green-500 text-white",
                      isIncorrect && "bg-red-500 text-white"
                    )}
                  >
                    {option.letter}
                  </div>

                  {/* Answer Text */}
                  <p
                    className={cn(
                      "flex-1 text-base leading-relaxed",
                      !showResult && "text-slate-700",
                      showResult && isCorrect && "font-medium text-green-900",
                      isIncorrect && "text-red-900"
                    )}
                  >
                    {option.text}
                  </p>

                  {/* Result Indicator */}
                  {showResult && isCorrect && (
                    <span className="text-sm font-medium text-green-700">
                      ✓ Correct
                    </span>
                  )}
                  {isIncorrect && (
                    <span className="text-sm font-medium text-red-700">✗ Wrong</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

/**
 * Question Card Skeleton Loader
 * 
 * Loading state placeholder matching the question card layout.
 */
function QuestionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Question Body Skeleton */}
      <div className="space-y-6 p-4 sm:p-6">
        {/* Question Text */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </Card>
  )
}

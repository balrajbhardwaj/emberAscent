/**
 * Quick Review Section Component
 * 
 * Bite-sized learning section on practice home page with:
 * - 4 random questions from different subjects
 * - Answer directly on the page without navigation
 * - Immediate feedback on answers
 * - Collapsible on mobile, expanded on desktop
 * - Once per day feature - saves to database
 * - Counts toward progress and Recent Activity
 * 
 * @module components/practice/QuickReviewSection
 */
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  createQuickByteSession, 
  submitQuickByteAnswer, 
  completeQuickByteSession 
} from "@/app/(dashboard)/practice/quick-byte/actions"

interface QuestionOption {
  id: string
  text: string
}

interface QuickQuestion {
  id: string
  subject: string
  questionText: string
  options: QuestionOption[]
  correctAnswerId: string
  explanation: string
}

interface QuickReviewSectionProps {
  questions: QuickQuestion[]
  childId: string
  isCompletedToday?: boolean
  onAnswerSubmit?: (questionId: string, answerId: string, isCorrect: boolean) => void
}

/**
 * Quick Review Section
 * 
 * Displays 4 random questions in a responsive grid for quick practice.
 * Desktop: 1x4 grid (4 cards side by side)
 * Mobile: Collapsible section
 * Saves answers to database for progress tracking.
 * 
 * @param questions - Array of 4 random questions
 * @param childId - Child ID for tracking answers
 * @param onAnswerSubmit - Optional callback when answer is submitted
 */
export function QuickReviewSection({ questions, childId, isCompletedToday = false, onAnswerSubmit }: QuickReviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(isCompletedToday)

  // Create session on mount
  useEffect(() => {
    const initSession = async () => {
      const questionIds = questions.map((q) => q.id)
      const newSessionId = await createQuickByteSession(childId, questionIds)
      if (newSessionId) {
        setSessionId(newSessionId)
      }
    }
    
    if (questions.length > 0 && !sessionId) {
      initSession()
    }
  }, [questions, childId, sessionId])

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    if (revealed[questionId]) return // Already answered
    
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }

  const handleReveal = async (questionId: string, correctAnswerId: string) => {
    const selectedAnswer = answers[questionId]
    if (!selectedAnswer || !sessionId) return

    const isCorrect = selectedAnswer === correctAnswerId
    
    // Save to database
    await submitQuickByteAnswer(sessionId, childId, questionId, selectedAnswer, correctAnswerId)
    
    setRevealed((prev) => ({ ...prev, [questionId]: true }))
    
    onAnswerSubmit?.(questionId, selectedAnswer, isCorrect)
    
    // Check if all questions are answered
    const newRevealed = { ...revealed, [questionId]: true }
    if (Object.keys(newRevealed).length === questions.length) {
      // All done! Complete the session
      await completeQuickByteSession(sessionId)
      setIsComplete(true)
    }
  }

  const getAnsweredCount = () => {
    return Object.keys(revealed).length
  }

  const getCorrectCount = () => {
    return questions.filter((q) => revealed[q.id] && answers[q.id] === q.correctAnswerId).length
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      "Verbal Reasoning": "bg-violet-100 text-violet-700",
      "English": "bg-sky-100 text-sky-700",
      "Maths": "bg-emerald-100 text-emerald-700",
      "Mathematics": "bg-emerald-100 text-emerald-700",
    }
    return colors[subject] || "bg-slate-100 text-slate-700"
  }

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      "Verbal Reasoning": "🧠",
      "English": "📚",
      "Maths": "🔢",
      "Mathematics": "🔢",
    }
    return icons[subject] || "📝"
  }

  return (
    <Card className="overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4 sm:cursor-default sm:p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500">
            {isComplete ? (
              <PartyPopper className="h-5 w-5 text-white" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            {isComplete ? (
              <>
                <h2 className="text-lg font-bold text-slate-900">Well done! 🎉</h2>
                <p className="text-sm text-slate-600">
                  You&apos;ve completed today&apos;s Quick Byte! Come back tomorrow for more.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">Take a Quick Byte! 🍪</h2>
                <p className="text-sm text-slate-600">
                  4 quick questions • Answer right here!
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getAnsweredCount() > 0 && !isComplete && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {getCorrectCount()}/{getAnsweredCount()} correct
            </Badge>
          )}
          {isComplete && !isCompletedToday && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hidden sm:inline-flex">
              {getCorrectCount()}/{questions.length} correct
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Questions Grid */}
      {isExpanded && !isCompletedToday && (
        <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 lg:grid-cols-4">
          {questions.map((question, index) => {
            const selectedAnswer = answers[question.id]
            const isRevealed = revealed[question.id]
            const isCorrect = isRevealed && selectedAnswer === question.correctAnswerId

            return (
              <Card
                key={question.id}
                className={cn(
                  "relative overflow-hidden border-2 transition-all",
                  isRevealed && isCorrect && "border-green-300 bg-green-50",
                  isRevealed && !isCorrect && "border-red-300 bg-red-50",
                  !isRevealed && "border-slate-200 hover:border-orange-300"
                )}
              >
                <div className="p-4">
                  {/* Question Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={getSubjectColor(question.subject)} variant="secondary">
                      {getSubjectIcon(question.subject)} Q{index + 1}
                    </Badge>
                    {isRevealed && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="mb-3 text-sm font-medium text-slate-900 line-clamp-3">
                    {question.questionText}
                  </p>

                  {/* Options */}
                  <div className="mb-3 space-y-2">
                    {question.options.map((option) => {
                      const isSelected = selectedAnswer === option.id
                      const isCorrectOption = option.id === question.correctAnswerId
                      const showCorrect = isRevealed && isCorrectOption
                      const showIncorrect = isRevealed && isSelected && !isCorrectOption

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectAnswer(question.id, option.id)}
                          disabled={isRevealed}
                          className={cn(
                            "w-full rounded-lg border-2 p-2 text-left text-xs transition-all",
                            isSelected && !isRevealed && "border-orange-400 bg-orange-50",
                            !isSelected && !isRevealed && "border-slate-200 hover:border-orange-200 hover:bg-slate-50",
                            showCorrect && "border-green-500 bg-green-100",
                            showIncorrect && "border-red-500 bg-red-100",
                            isRevealed && !showCorrect && !showIncorrect && "border-slate-200 bg-slate-50 opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                                isSelected && !isRevealed && "border-orange-500 bg-orange-500",
                                !isSelected && !isRevealed && "border-slate-300",
                                showCorrect && "border-green-600 bg-green-600",
                                showIncorrect && "border-red-600 bg-red-600"
                              )}
                            >
                              {(isSelected || showCorrect) && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="flex-1 break-words">{option.text}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Check Answer Button */}
                  {!isRevealed && (
                    <Button
                      size="sm"
                      onClick={() => handleReveal(question.id, question.correctAnswerId)}
                      disabled={!selectedAnswer}
                      className="w-full"
                    >
                      Check Answer
                    </Button>
                  )}

                  {/* Explanation */}
                  {isRevealed && (
                    <div className="mt-3 rounded-lg bg-white/50 p-2">
                      <p className="text-xs text-slate-600">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </Card>
  )
}

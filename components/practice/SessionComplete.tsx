/**
 * Session Complete Component
 * 
 * Displays results after completing a practice session including:
 * - Score summary with celebration
 * - Time taken
 * - Performance breakdown by topic
 * - Action buttons (review, practice again, home)
 * 
 * @module components/practice/SessionComplete
 */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Clock, Target, TrendingUp, ArrowRight, RotateCcw, Home } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SessionResults {
  correct: number
  total: number
  timeElapsed: number
  topicBreakdown: Array<{
    topic: string
    correct: number
    total: number
  }>
  streakMaintained: boolean
}

interface SessionCompleteProps {
  results: SessionResults
  onReviewMistakes: () => void
  onPracticeAgain: () => void
}

/**
 * Session Complete Screen
 * 
 * Celebrates completion and shows detailed results.
 * 
 * @param results - Session results data
 * @param sessionType - Type of session completed
 * @param onReviewMistakes - Handler to review incorrect answers
 * @param onPracticeAgain - Handler to start a new session
 */
export function SessionComplete({
  results,
  onReviewMistakes,
  onPracticeAgain,
}: SessionCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  
  const percentage = Math.round((results.correct / results.total) * 100)
  const isExcellent = percentage >= 80

  useEffect(() => {
    if (isExcellent) {
      setShowConfetti(true)
      // Simple confetti effect (in production, use a library like canvas-confetti)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [isExcellent])

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  // Get message based on score
  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! 🌟"
    if (percentage >= 80) return "Excellent work! 🎉"
    if (percentage >= 70) return "Great job! 👏"
    if (percentage >= 60) return "Good effort! 💪"
    return "Keep practicing! 📚"
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-4xl shadow-lg">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{getMessage()}</h1>
        <p className="mt-2 text-slate-600">You've completed your practice session</p>
      </div>

      {/* Score Card */}
      <Card className="overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-orange-600">{percentage}%</div>
          <p className="mt-2 text-lg text-slate-700">
            {results.correct} out of {results.total} correct
          </p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Time Taken */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Time Taken</p>
              <p className="text-xl font-semibold text-slate-900">
                {formatTime(results.timeElapsed)}
              </p>
            </div>
          </div>
        </Card>

        {/* Accuracy */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Accuracy</p>
              <p className="text-xl font-semibold text-slate-900">{percentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Streak Indicator */}
      {results.streakMaintained && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <p className="font-semibold text-orange-700">Streak Maintained!</p>
              <p className="text-sm text-orange-600">
                You've practiced for another day. Keep it up!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Topic Breakdown */}
      {results.topicBreakdown.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Performance by Topic
            </h2>
          </div>
          <div className="space-y-4">
            {results.topicBreakdown.map((topic) => {
              const topicPercentage = Math.round((topic.correct / topic.total) * 100)
              return (
                <div key={topic.topic}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{topic.topic}</span>
                    <span className="text-slate-600">
                      {topic.correct}/{topic.total}
                    </span>
                  </div>
                  <Progress value={topicPercentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {results.correct < results.total && (
          <Button
            variant="outline"
            onClick={onReviewMistakes}
            className="flex-1"
          >
            Review Mistakes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        <Button onClick={onPracticeAgain} className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" />
          Practice Again
        </Button>
        <Link href="/practice" className="flex-1">
          <Button variant="outline" className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

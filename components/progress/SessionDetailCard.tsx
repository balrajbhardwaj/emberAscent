/**
 * Session Detail Card Component
 * 
 * Displays summary of a practice session with score visualization
 * and subject-level breakdown.
 * 
 * @module components/progress/SessionDetailCard
 */
"use client"

import { formatDistanceToNow } from "date-fns"
import { Zap, Target, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SubjectBreakdown {
  subject: string
  correct: number
  total: number
  accuracy: number
}

interface SessionDetailCardProps {
  sessionType: "quick" | "focus" | "mock"
  date: string
  score: number
  questionsAnswered: number
  totalQuestions: number
  duration: number
  subjectBreakdown: SubjectBreakdown[]
}

const SESSION_CONFIG = {
  quick: {
    icon: Zap,
    label: "Quick Practice",
    color: "from-blue-500 to-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  focus: {
    icon: Target,
    label: "Focus Mode",
    color: "from-purple-500 to-purple-600",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  mock: {
    icon: Clock,
    label: "Mock Exam",
    color: "from-orange-500 to-orange-600",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
}

/**
 * Format duration in seconds to readable format
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Session Detail Card
 * 
 * Large card with session summary and breakdown.
 * 
 * @param sessionType - Type of session (quick/focus/mock)
 * @param date - Session date
 * @param score - Overall score (0-100)
 * @param questionsAnswered - Number of questions answered
 * @param totalQuestions - Total questions in session
 * @param duration - Session duration in seconds
 * @param subjectBreakdown - Per-subject accuracy data
 */
export function SessionDetailCard({
  sessionType,
  date,
  score,
  questionsAnswered,
  totalQuestions,
  duration,
  subjectBreakdown,
}: SessionDetailCardProps) {
  const config = SESSION_CONFIG[sessionType]
  const Icon = config.icon
  const percentage = Math.round((score / 100) * 100)
  
  // Determine score message
  const scoreMessage =
    percentage >= 80
      ? "Excellent work! 🎉"
      : percentage >= 60
      ? "Good effort! Keep practicing 📚"
      : "Keep going! Practice makes perfect 💪"
    percentage >= 80
      ? "Excellent work! 🎉"
      : percentage >= 60
      ? "Good effort! Keep practicing 📚"
      : "Keep going! Practice makes perfect 💪"
  
  const scoreGradient =
    percentage >= 80
      ? "from-green-500 to-emerald-600"
      : percentage >= 60
      ? "from-amber-500 to-orange-600"
      : "from-slate-500 to-slate-600"
  
  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${scoreGradient}`}>
      <div className="p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{config.label}</h2>
              <p className="text-white/80 text-sm">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge className={`${config.badge} bg-white/90`}>
            {formatDuration(duration)}
          </Badge>
        </div>
        
        {/* Large Score Display */}
        <div className="text-center mb-6">
          <div className="text-7xl md:text-8xl font-bold mb-2">
            {percentage}%
          </div>
          <p className="text-xl text-white/90 mb-1">{scoreMessage}</p>
          <p className="text-white/70 text-sm">
            {questionsAnswered} of {totalQuestions} questions answered
          </p>
        </div>
        
        {/* Subject Breakdown */}
        {subjectBreakdown.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 text-white/90">
              Subject Breakdown
            </h3>
            <div className="space-y-3">
              {subjectBreakdown.map((subject) => (
                <div key={subject.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{subject.subject}</span>
                    <span className="text-sm font-semibold">
                      {Math.round(subject.accuracy)}% ({subject.correct}/{subject.total})
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

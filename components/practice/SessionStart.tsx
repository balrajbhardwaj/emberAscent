/**
 * Session Start Component
 * 
 * Pre-session configuration screen before starting practice.
 * Shows session details, options, and tips.
 * 
 * @module components/practice/SessionStart
 */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Zap, BookOpen, AlertCircle } from "lucide-react"
import { SessionType } from "@/hooks/usePracticeSession"

interface SessionStartProps {
  sessionType: SessionType
  selectedSubject?: string
  selectedTopics?: string[]
  onStart: () => void
  onSelectSubject?: () => void
  isLoading?: boolean
}

const SESSION_CONFIG = {
  quick: {
    title: "Quick Practice",
    description: "A quick 10-question practice session to keep your skills sharp.",
    questionCount: 10,
    estimatedTime: "5-7 minutes",
    hasTimer: false,
    icon: Zap,
    color: "bg-blue-500",
    tips: [
      "Perfect for daily practice streaks",
      "Questions from all subjects",
      "No time pressure - take your time",
    ],
  },
  focus: {
    title: "Focus Session",
    description: "Deep practice on a specific subject or topic of your choice.",
    questionCount: 25,
    estimatedTime: "15-20 minutes",
    hasTimer: false,
    icon: Target,
    color: "bg-purple-500",
    tips: [
      "Choose your subject to practice",
      "Build mastery in specific areas",
      "Adaptive difficulty based on performance",
    ],
  },
  mock: {
    title: "Mock Test",
    description: "Full-length timed test simulating real exam conditions.",
    questionCount: 50,
    estimatedTime: "45 minutes",
    hasTimer: true,
    icon: Clock,
    color: "bg-orange-500",
    tips: [
      "Timed test - 45 minutes",
      "All subjects covered",
      "Practice exam conditions",
      "Can't pause or go back",
    ],
  },
}

/**
 * Session Start Screen
 * 
 * Shows session configuration and starts practice.
 * For focus mode, allows subject selection.
 * 
 * @param sessionType - Type of session (quick/focus/mock)
 * @param selectedSubject - Selected subject for focus mode
 * @param selectedTopics - Selected topics for focus mode
 * @param onStart - Handler to start session
 * @param onSelectSubject - Handler to open subject selector (focus mode)
 * @param isLoading - Loading state during session creation
 */
export function SessionStart({
  sessionType,
  selectedSubject,
  selectedTopics,
  onStart,
  onSelectSubject,
  isLoading = false,
}: SessionStartProps) {
  const config = SESSION_CONFIG[sessionType]
  const Icon = config.icon

  const canStart =
    sessionType !== "focus" || (selectedSubject && selectedTopics && selectedTopics.length > 0)

  return (
    <div className="container max-w-3xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`mx-auto w-16 h-16 rounded-2xl ${config.color} flex items-center justify-center shadow-lg`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-slate-600 max-w-md mx-auto">{config.description}</p>
        </div>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>What to expect in this practice session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Question Count */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{config.questionCount}</p>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {config.hasTimer ? "Time Limit" : "Estimated Time"}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">{config.estimatedTime}</p>
                </div>
              </div>
            </div>

            {/* Timer Warning for Mock Tests */}
            {config.hasTimer && (
              <div className="flex gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-orange-900">Timed Test</p>
                  <p className="text-sm text-orange-700">
                    This is a timed test. The session will automatically end when time runs out.
                    You won't be able to pause or go back to previous questions.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Mode: Subject Selection */}
        {sessionType === "focus" && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Selection</CardTitle>
              <CardDescription>Choose which subject and topics to practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedSubject && selectedTopics && selectedTopics.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{selectedSubject}</p>
                      <p className="text-sm text-slate-600">
                        {selectedTopics.length} {selectedTopics.length === 1 ? "topic" : "topics"} selected
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onSelectSubject}>
                      Change
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <Button onClick={onSelectSubject} className="w-full">
                  Select Subject & Topics
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {config.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={onStart}
            disabled={!canStart || isLoading}
          >
            {isLoading ? "Creating Session..." : "Start Practice"}
          </Button>
        </div>
      </div>
    </div>
  )
}

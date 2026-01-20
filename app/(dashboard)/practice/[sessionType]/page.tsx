/**
 * Dynamic Practice Session Page
 * 
 * Handles all session types: quick, focus, mock
 * Manages session lifecycle from start to completion
 * 
 * @module app/(dashboard)/practice/[sessionType]
 */
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePracticeSession, SessionType, SessionState } from "@/hooks/usePracticeSession"
import { SessionStart } from "@/components/practice/SessionStart"
import { SessionQuestion } from "@/components/practice/SessionQuestion"
import { SessionComplete } from "@/components/practice/SessionComplete"
import { SessionPaused } from "@/components/practice/SessionPaused"
import { createSession } from "./actions"
import { useToast } from "@/hooks/use-toast"

type PageState = "loading" | "start" | "active" | "complete"

export default function PracticeSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const sessionType = params.sessionType as SessionType

  const [pageState, setPageState] = useState<PageState>("loading")
  const [initialSession, setInitialSession] = useState<SessionState | null>(null)

  // Practice session hook
  const {
    session,
    currentQuestion,
    isLoading,
    error,
    submitAnswer,
    nextQuestion,
    pauseSession,
    resumeSession,
    endSession,
    isAnswered,
    selectedAnswer,
  } = usePracticeSession(initialSession)

  // Validate session type
  useEffect(() => {
    if (!["quick", "focus", "mock"].includes(sessionType)) {
      toast({
        title: "Invalid session type",
        description: "Please select a valid practice mode.",
        variant: "destructive",
      })
      router.push("/practice")
    }
  }, [sessionType, router, toast])

  // Load existing session or show start screen
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Try to load session from localStorage first
        const savedSession = localStorage.getItem(`session_${sessionType}_current`)
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          setInitialSession(parsed)
          setPageState("active")
          return
        }

        // No existing session - show start screen
        setPageState("start")
      } catch (err) {
        console.error("Error loading session:", err)
        setPageState("start")
      }
    }

    initializeSession()
  }, [sessionType])

  // Handle session creation
  const handleStartSession = async (options?: { subject?: string; topics?: string[] }) => {
    try {
      setPageState("loading")

      const newSession = await createSession(sessionType, options)
      
      if (!newSession) {
        throw new Error("Failed to create session")
      }

      setInitialSession(newSession)
      setPageState("active")

      toast({
        title: "Session started!",
        description: `Get ready for ${newSession.questions.length} questions.`,
      })
    } catch (err) {
      console.error("Error creating session:", err)
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      })
      setPageState("start")
    }
  }

  // Handle answer submission
  const handleSelectAnswer = (answerId: string) => {
    submitAnswer(answerId)
  }

  // Handle next question
  const handleNext = () => {
    if (!session) return

    // Check if this was the last question
    if (session.currentIndex === session.questions.length - 1) {
      setPageState("complete")
      endSession()
    } else {
      nextQuestion()
    }
  }

  // Handle pause
  const handlePause = () => {
    pauseSession()
  }

  // Handle resume
  const handleResume = () => {
    resumeSession()
  }

  // Handle exit
  const handleExit = () => {
    if (confirm("Are you sure you want to exit? Your progress will be saved.")) {
      router.push("/practice")
    }
  }

  // Handle end session from pause
  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session?")) {
      await endSession()
    }
  }

  // Handle review mistakes
  const handleReviewMistakes = () => {
    // TODO: Implement review mode
    toast({
      title: "Coming soon!",
      description: "Review mode will be available in the next update.",
    })
  }

  // Handle practice again
  const handlePracticeAgain = () => {
    setInitialSession(null)
    setPageState("start")
  }

  // Error display
  if (error) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-slate-700 mb-6">{error}</p>
        <button
          onClick={() => router.push("/practice")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Practice
        </button>
      </div>
    )
  }

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading session...</p>
      </div>
    )
  }

  // Start screen
  if (pageState === "start") {
    return (
      <SessionStart
        sessionType={sessionType}
        onStart={() => handleStartSession()}
        isLoading={isLoading}
      />
    )
  }

  // Complete screen
  if (pageState === "complete" && session) {
    const correctAnswers = session.questions.filter(
      (q) => session.answers[q.id] === q.correctAnswerId
    ).length

    // Calculate topic breakdown
    const topicBreakdownMap = session.questions.reduce((acc, question) => {
      const topic = question.topic || question.subject
      if (!acc[topic]) {
        acc[topic] = { correct: 0, total: 0 }
      }
      acc[topic].total++
      if (session.answers[question.id] === question.correctAnswerId) {
        acc[topic].correct++
      }
      return acc
    }, {} as Record<string, { correct: number; total: number }>)

    const topicBreakdown = Object.entries(topicBreakdownMap).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
    }))

    return (
      <SessionComplete
        results={{
          correct: correctAnswers,
          total: session.questions.length,
          timeElapsed: session.timeElapsed,
          topicBreakdown,
          streakMaintained: correctAnswers >= session.questions.length * 0.7, // 70% threshold
        }}
        onReviewMistakes={handleReviewMistakes}
        onPracticeAgain={handlePracticeAgain}
      />
    )
  }

  // Active session
  if (!session || !currentQuestion) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <p className="text-slate-600">Loading question...</p>
      </div>
    )
  }

  return (
    <>
      <SessionQuestion
        question={currentQuestion}
        questionNumber={session.currentIndex + 1}
        totalQuestions={session.questions.length}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        timeElapsed={session.timeElapsed}
        timeLimit={session.timeLimit}
        showTimer={sessionType === "mock"}
        onSelectAnswer={handleSelectAnswer}
        onNext={handleNext}
        onPause={handlePause}
        onExit={handleExit}
      />

      {/* Pause Overlay */}
      {session.isPaused && (
        <SessionPaused onResume={handleResume} onEndSession={handleEndSession} />
      )}
    </>
  )
}

/**
 * Practice Session Custom Hook
 * 
 * Manages practice session state and flow including:
 * - Session initialization
 * - Question queue management
 * - Answer submission
 * - Progress tracking
 * - Timer management (for mock tests)
 * - Session completion
 * 
 * @module hooks/usePracticeSession
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export type SessionType = "quick" | "focus" | "mock"

export interface SessionQuestion {
  id: string
  questionText: string
  subject: string
  topic: string | null
  difficulty: string
  emberScore: number
  curriculumReference: string | null
  options: Array<{
    id: string
    text: string
  }>
  correctAnswerId: string
  explanations: {
    stepByStep: string
    visual: string | null
    example: string | null
  }
}

export interface SessionState {
  sessionId: string
  childId: string
  type: SessionType
  questions: SessionQuestion[]
  currentIndex: number
  answers: Record<string, string> // questionId -> answerId
  questionStartTimes: Record<string, number> // questionId -> timestamp (ms)
  questionTimings: Record<string, number> // questionId -> seconds taken
  startedAt: Date
  timeElapsed: number // seconds
  timeLimit?: number // seconds (for mock tests)
  isPaused: boolean
  isComplete: boolean
}

export interface UsePracticeSessionReturn {
  session: SessionState | null
  currentQuestion: SessionQuestion | null
  isLoading: boolean
  error: string | null
  progress: {
    answered: number
    total: number
    percentage: number
  }
  submitAnswer: (answerId: string) => void
  nextQuestion: () => void
  previousQuestion: () => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => Promise<void>
  isAnswered: boolean
  selectedAnswer: string | null
}

/**
 * Practice Session Hook
 * 
 * Manages the complete practice session lifecycle.
 * 
 * @param initialSession - Initial session state (from server)
 * @returns Session state and control functions
 */
export function usePracticeSession(
  initialSession: SessionState | null
): UsePracticeSessionReturn {
  const router = useRouter()
  const [session, setSession] = useState<SessionState | null>(initialSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track start time when question changes
  useEffect(() => {
    if (!session || !currentQuestion || session.isComplete) return
    
    // Mark start time if not already tracked
    if (!session.questionStartTimes[currentQuestion.id]) {
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          questionStartTimes: {
            ...prev.questionStartTimes,
            [currentQuestion.id]: Date.now()
          }
        }
      })
    }
  }, [session?.currentIndex, currentQuestion?.id])

  // Timer effect for session time tracking
  useEffect(() => {
    if (!session || session.isPaused || session.isComplete) return

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev
        
        const newElapsed = prev.timeElapsed + 1

        // Check time limit for mock tests
        if (prev.timeLimit && newElapsed >= prev.timeLimit) {
          // Time's up - auto-complete session
          handleTimeUp()
          return prev
        }

        return { ...prev, timeElapsed: newElapsed }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.isPaused, session?.isComplete])

  // Auto-save session state to localStorage
  useEffect(() => {
    if (session && !session.isComplete) {
      localStorage.setItem(`session_${session.sessionId}`, JSON.stringify(session))
    }
  }, [session])

  const currentQuestion = session
    ? session.questions[session.currentIndex] || null
    : null

  const isAnswered = session
    ? currentQuestion?.id ? Boolean(session.answers[currentQuestion.id]) : false
    : false

  const selectedAnswer = session && currentQuestion
    ? session.answers[currentQuestion.id] || null
    : null

  const progress = session
    ? {
        answered: Object.keys(session.answers).length,
        total: session.questions.length,
        percentage: Math.round(
          (Object.keys(session.answers).length / session.questions.length) * 100
        ),
      }
    : { answered: 0, total: 0, percentage: 0 }

  const submitAnswer = useCallback(async (answerId: string) => {
    if (!session || !currentQuestion) return

    // Calculate actual time spent on this question
    const questionStartTime = session.questionStartTimes[currentQuestion.id] || Date.now()
    const timeSpent = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000))

    setSession((prev) => {
      if (!prev) return prev
      
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: answerId,
        },
        questionTimings: {
          ...prev.questionTimings,
          [currentQuestion.id]: timeSpent
        }
      }
    })

    // Submit to server via action
    try {
      const { submitAttempt } = await import("@/app/(dashboard)/practice/[sessionType]/actions")
      
      await submitAttempt(
        session.sessionId,
        session.childId,
        currentQuestion.id,
        answerId,
        currentQuestion.correctAnswerId,
        timeSpent
      )
    } catch (error) {
      console.error("Error submitting attempt:", error)
      // Continue even if submission fails - we'll calculate from answers on completion
    }
  }, [session, currentQuestion])

  const nextQuestion = useCallback(() => {
    if (!session) return

    if (session.currentIndex < session.questions.length - 1) {
      setSession((prev) => {
        if (!prev) return prev
        return { ...prev, currentIndex: prev.currentIndex + 1 }
      })
    } else {
      // Last question - mark as complete
      setSession((prev) => {
        if (!prev) return prev
        return { ...prev, isComplete: true }
      })
    }
  }, [session])

  const previousQuestion = useCallback(() => {
    if (!session || session.currentIndex === 0) return

    setSession((prev) => {
      if (!prev) return prev
      return { ...prev, currentIndex: prev.currentIndex - 1 }
    })
  }, [session])

  const pauseSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev
      return { ...prev, isPaused: true }
    })
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev
      return { ...prev, isPaused: false }
    })
  }, [])

  const endSession = useCallback(async () => {
    if (!session) return

    setIsLoading(true)
    try {
      // Mark as complete
      setSession((prev) => {
        if (!prev) return prev
        return { ...prev, isComplete: true }
      })

      // Import completeSession dynamically to avoid circular dependencies
      const { completeSession } = await import("@/app/(dashboard)/practice/[sessionType]/actions")
      
      // Complete session on server
      await completeSession(session.sessionId)

      // Clear localStorage
      localStorage.removeItem(`session_${session.sessionId}`)

      // Navigate to results
      router.push(`/practice/session/${session.sessionId}/results`)
    } catch (err) {
      setError("Failed to end session")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [session, router])

  const handleTimeUp = useCallback(async () => {
    await endSession()
  }, [endSession])

  return {
    session,
    currentQuestion,
    isLoading,
    error,
    progress,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    pauseSession,
    resumeSession,
    endSession,
    isAnswered,
    selectedAnswer,
  }
}

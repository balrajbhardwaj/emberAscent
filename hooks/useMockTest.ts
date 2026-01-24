/**
 * Mock Test Hook
 *
 * Custom hook for managing mock test state, timer, and navigation
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface MockTestResponse {
  id: string
  question_id: string
  display_order: number
  answer_given: string | null
  flagged_for_review: boolean
  visited_at: string | null
  question: {
    id: string
    subject: string
    topic: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    correct_answer: string
    explanation: string | null
    difficulty: string
    ember_score: number
  }
}

interface MockTestSession {
  id: string
  time_limit_seconds: number
  started_at: string
  flagged_questions: string[]
  responses: MockTestResponse[]
}

interface UseMockTestReturn {
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  timeRemaining: number
  isTimerRunning: boolean
  pauseTimer: () => void
  resumeTimer: () => void
  handleAnswer: (questionId: string, answer: string) => Promise<void>
  handleFlag: (questionId: string) => Promise<void>
  handleSubmit: () => Promise<void>
  getQuestionState: (index: number) => 'not-visited' | 'visited' | 'answered' | 'flagged'
  getAnsweredCount: () => number
  getFlaggedCount: () => number
  isSubmitting: boolean
}

export function useMockTest(
  session: MockTestSession,
  onSubmit: (timeTaken: number) => Promise<void>
): UseMockTestReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(session.time_limit_seconds)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responses, setResponses] = useState(session.responses)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timeRemaining])

  // Warning toasts
  useEffect(() => {
    if (timeRemaining === 600) {
      // 10 minutes
      toast.warning('10 minutes remaining')
    } else if (timeRemaining === 300) {
      // 5 minutes
      toast.warning('5 minutes remaining', {
        description: 'Review your answers before time runs out',
      })
    } else if (timeRemaining === 60) {
      // 1 minute
      toast.error('1 minute remaining!', {
        description: 'Test will auto-submit soon',
      })
    }
  }, [timeRemaining])

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false)
  }, [])

  const resumeTimer = useCallback(() => {
    setIsTimerRunning(true)
  }, [])

  const handleAnswer = useCallback(async (questionId: string, answer: string) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.question_id === questionId
          ? {
              ...r,
              answer_given: answer,
              visited_at: r.visited_at || new Date().toISOString(),
            }
          : r
      )
    )

    // Save to database
    try {
      const response = await fetch('/api/practice/mock/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionId,
          answer,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save answer')
      }
    } catch (error) {
      console.error('Error saving answer:', error)
      toast.error('Failed to save answer. Please try again.')
    }
  }, [session.id])

  const handleFlag = useCallback(async (questionId: string) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.question_id === questionId
          ? { ...r, flagged_for_review: !r.flagged_for_review }
          : r
      )
    )

    // Save to database
    try {
      const response = await fetch('/api/practice/mock/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to flag question')
      }
    } catch (error) {
      console.error('Error flagging question:', error)
    }
  }, [session.id])

  const handleAutoSubmit = useCallback(async () => {
    toast.info('Time expired - submitting test automatically')
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    await onSubmit(timeTaken)
  }, [onSubmit])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setIsTimerRunning(false)

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    await onSubmit(timeTaken)
  }, [onSubmit])

  const getQuestionState = useCallback(
    (index: number) => {
      const response = responses[index]
      if (response.flagged_for_review) return 'flagged'
      if (response.answer_given) return 'answered'
      if (response.visited_at) return 'visited'
      return 'not-visited'
    },
    [responses]
  )

  const getAnsweredCount = useCallback(() => {
    return responses.filter((r) => r.answer_given).length
  }, [responses])

  const getFlaggedCount = useCallback(() => {
    return responses.filter((r) => r.flagged_for_review).length
  }, [responses])

  // Mark current question as visited
  useEffect(() => {
    const currentResponse = responses[currentQuestionIndex]
    if (currentResponse && !currentResponse.visited_at) {
      setResponses((prev) =>
        prev.map((r, i) =>
          i === currentQuestionIndex
            ? { ...r, visited_at: new Date().toISOString() }
            : r
        )
      )
    }
  }, [currentQuestionIndex, responses])

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    timeRemaining,
    isTimerRunning,
    pauseTimer,
    resumeTimer,
    handleAnswer,
    handleFlag,
    handleSubmit,
    getQuestionState,
    getAnsweredCount,
    getFlaggedCount,
    isSubmitting,
  }
}

/**
 * Adaptive Practice Session Hook
 * 
 * React hook for managing adaptive difficulty practice sessions.
 * Automatically fetches next questions based on performance and
 * updates difficulty in real-time.
 * 
 * Features:
 * - Adaptive question selection
 * - Performance tracking
 * - Difficulty adjustment notifications
 * - Loading and error states
 * 
 * @module hooks/useAdaptiveSession
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Question } from '@/types'
import type { DifficultyLevel } from '@/types/adaptive'

interface AdaptiveInfo {
  currentDifficulty: DifficultyLevel
  recentAccuracy: number
  totalAttempts: number
  currentStreak: number
}

interface DifficultyAdjustmentInfo {
  currentDifficulty: string
  shouldAdjust: boolean
  recommendedDifficulty: string
  adjustmentReason: string
}

interface UseAdaptiveSessionProps {
  childId: string
  topicId: string
  sessionId?: string
  onDifficultyAdjust?: (adjustment: DifficultyAdjustmentInfo) => void
}

interface UseAdaptiveSessionReturn {
  // Current question
  currentQuestion: Question | null
  adaptiveInfo: AdaptiveInfo | null
  
  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  
  // Error state
  error: string | null
  
  // Session exhausted (no more questions)
  isExhausted: boolean
  
  // Actions
  fetchNextQuestion: () => Promise<void>
  submitAnswer: (questionId: string, isCorrect: boolean, timeSpentSeconds?: number) => Promise<void>
  reset: () => void
}

/**
 * Hook for managing adaptive practice sessions
 * 
 * @param props - Configuration options
 * @returns Adaptive session state and actions
 * 
 * @example
 * const {
 *   currentQuestion,
 *   adaptiveInfo,
 *   isLoading,
 *   fetchNextQuestion,
 *   submitAnswer
 * } = useAdaptiveSession({
 *   childId: 'child_123',
 *   topicId: 'topic_456',
 *   sessionId: 'session_789',
 *   onDifficultyAdjust: (adjustment) => {
 *     toast.success(adjustment.adjustmentReason)
 *   }
 * })
 */
export function useAdaptiveSession({
  childId,
  topicId,
  sessionId,
  onDifficultyAdjust,
}: UseAdaptiveSessionProps): UseAdaptiveSessionReturn {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [adaptiveInfo, setAdaptiveInfo] = useState<AdaptiveInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExhausted, setIsExhausted] = useState(false)
  
  /**
   * Fetch next adaptive question
   */
  const fetchNextQuestion = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        childId,
        topicId,
      })
      
      if (sessionId) {
        params.append('sessionId', sessionId)
      }
      
      const response = await fetch(`/api/adaptive/next-question?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        if (data.exhausted) {
          setIsExhausted(true)
          setError('No more questions available in this topic')
        } else {
          setError(data.error || 'Failed to fetch next question')
        }
        return
      }
      
      setCurrentQuestion(data.question)
      setAdaptiveInfo(data.adaptiveInfo)
      setIsExhausted(false)
    } catch (err) {
      console.error('Error fetching next question:', err)
      setError('Network error: Failed to fetch question')
    } finally {
      setIsLoading(false)
    }
  }, [childId, topicId, sessionId])
  
  /**
   * Submit answer and update performance
   */
  const submitAnswer = useCallback(async (
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Get question details for subtopic
      const subtopicName = (currentQuestion as any)?.subtopic_name || null
      
      const response = await fetch('/api/adaptive/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          questionId,
          topicId,
          isCorrect,
          timeSpentSeconds,
          sessionId,
          subtopicName,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to submit answer')
        return
      }
      
      // Handle difficulty adjustment
      if (data.adjustment?.shouldAdjust) {
        onDifficultyAdjust?.(data.adjustment)
        
        // Update adaptive info with new difficulty
        if (adaptiveInfo) {
          setAdaptiveInfo({
            ...adaptiveInfo,
            currentDifficulty: data.adjustment.currentDifficulty as DifficultyLevel,
          })
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
      setError('Network error: Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }, [childId, topicId, sessionId, currentQuestion, adaptiveInfo, onDifficultyAdjust])
  
  /**
   * Reset session state
   */
  const reset = useCallback(() => {
    setCurrentQuestion(null)
    setAdaptiveInfo(null)
    setError(null)
    setIsExhausted(false)
  }, [])
  
  return {
    currentQuestion,
    adaptiveInfo,
    isLoading,
    isSubmitting,
    error,
    isExhausted,
    fetchNextQuestion,
    submitAnswer,
    reset,
  }
}

/**
 * Hook for fetching performance summary
 * 
 * @param childId - Child's unique ID
 * @param topicId - Topic ID
 * @returns Performance data and loading state
 * 
 * @example
 * const { performance, masteryLevel, isLoading } = usePerformanceSummary(
 *   'child_123',
 *   'topic_456'
 * )
 */
export function usePerformanceSummary(childId: string, topicId: string) {
  const [performance, setPerformance] = useState<any>(null)
  const [masteryLevel, setMasteryLevel] = useState<string>('beginner')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchPerformance() {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams({ childId, topicId })
        const response = await fetch(`/api/adaptive/performance?${params}`)
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Failed to fetch performance')
          return
        }
        
        setPerformance(data.performance)
        setMasteryLevel(data.masteryLevel)
      } catch (err) {
        console.error('Error fetching performance:', err)
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (childId && topicId) {
      fetchPerformance()
    }
  }, [childId, topicId])
  
  return {
    performance,
    masteryLevel,
    isLoading,
    error,
  }
}

/**
 * Get difficulty display properties
 * 
 * @param difficulty - Difficulty level
 * @returns Display name and color
 */
export function getDifficultyDisplay(difficulty: DifficultyLevel) {
  const displays: Record<DifficultyLevel, { name: string; color: string; icon: string }> = {
    foundation: {
      name: 'Foundation',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '🌱',
    },
    standard: {
      name: 'Standard',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: '📚',
    },
    challenge: {
      name: 'Challenge',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      icon: '🚀',
    },
  }
  
  return displays[difficulty]
}

/**
 * Get mastery level display properties
 * 
 * @param masteryLevel - Mastery level string
 * @returns Display name, color, and description
 */
export function getMasteryDisplay(masteryLevel: string) {
  const displays: Record<string, { name: string; color: string; description: string }> = {
    beginner: {
      name: 'Beginner',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      description: 'Just getting started',
    },
    developing: {
      name: 'Developing',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      description: 'Building foundations',
    },
    progressing: {
      name: 'Progressing',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Making steady progress',
    },
    advanced: {
      name: 'Advanced',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Demonstrating strong skills',
    },
    mastered: {
      name: 'Mastered',
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Excellent understanding',
    },
  }
  
  return displays[masteryLevel] || displays.beginner
}

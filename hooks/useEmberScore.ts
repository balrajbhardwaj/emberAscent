/**
 * useEmberScore Hook
 * 
 * React hook for fetching and interacting with Ember Scores.
 * Provides real-time score data and feedback submission.
 * 
 * @module hooks/useEmberScore
 */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { calculateEmberScore } from "@/lib/scoring/emberScore"
import type { EmberScoreResult, QuestionForScoring } from "@/types/scoring"

interface UseEmberScoreOptions {
  questionId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseEmberScoreReturn {
  score: EmberScoreResult | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  submitFeedback: (type: "error" | "helpful", details?: string) => Promise<void>
}

/**
 * Hook for accessing and interacting with Ember Scores
 * 
 * Features:
 * - Fetches score data from database
 * - Calculates score on the fly if needed
 * - Auto-refresh option for real-time updates
 * - Feedback submission (helpful votes, error reports)
 * 
 * @param options Configuration options
 * @returns Score data, loading state, error state, and actions
 * 
 * @example
 * ```tsx
 * function QuestionComponent({ questionId }) {
 *   const { score, isLoading, submitFeedback } = useEmberScore({ questionId })
 * 
 *   if (isLoading) return <Skeleton />
 * 
 *   return (
 *     <div>
 *       <EmberScoreBadge score={score?.score} tier={score?.tier} />
 *       <button onClick={() => submitFeedback("helpful")}>
 *         Helpful
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useEmberScore({
  questionId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseEmberScoreOptions): UseEmberScoreReturn {
  const [score, setScore] = useState<EmberScoreResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  /**
   * Fetch question data and calculate score
   */
  const fetchScore = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch question with all score-related data
      const { data: question, error: fetchError } = await supabase
        .from("questions")
        .select(`
          id,
          ember_score,
          ember_score_breakdown,
          curriculum_reference,
          review_status,
          helpful_count,
          practice_count
        `)
        .eq("id", questionId)
        .single()

      if (fetchError) throw fetchError
      if (!question) throw new Error("Question not found")

      // Fetch error reports separately
      const { data: errorReports } = await supabase
        .from("error_reports")
        .select("id, report_type, status, created_at")
        .eq("question_id", questionId)

      // If score exists in database, use it
      if (question.ember_score !== null && question.ember_score_breakdown) {
        setScore({
          score: question.ember_score,
          breakdown: question.ember_score_breakdown,
          tier: question.ember_score >= 90 ? "verified" : question.ember_score >= 75 ? "confident" : "draft",
          lastCalculated: new Date(),
        })
      } else {
        // Calculate score on the fly
        const questionForScoring: QuestionForScoring = {
          id: question.id,
          curriculumReference: question.curriculum_reference,
          reviewStatus: question.review_status,
          errorReports: errorReports || [],
          communityStats: {
            helpfulCount: question.helpful_count || 0,
            practiceCount: question.practice_count || 0,
          },
        }

        const calculatedScore = calculateEmberScore(questionForScoring)
        setScore(calculatedScore)
      }
    } catch (err) {
      console.error("Error fetching Ember Score:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh score (useful after user actions)
   */
  const refresh = async () => {
    await fetchScore()
  }

  /**
   * Submit feedback (helpful vote or error report)
   * 
   * @param type Type of feedback
   * @param details Optional details for error reports
   */
  const submitFeedback = async (type: "error" | "helpful", details?: string) => {
    try {
      if (type === "helpful") {
        // Increment helpful count using RPC
        const { error: updateError } = await supabase.rpc("increment_helpful_count", {
          question_id: questionId,
        })

        if (updateError) {
          // Fallback: direct update (requires correct permissions)
          console.warn("RPC failed, attempting direct update", updateError)
        }
      } else if (type === "error") {
        // Create error report (this will trigger score recalculation via trigger)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error("User not authenticated")
        
        const { error: reportError } = await supabase
          .from("error_reports")
          .insert({
            question_id: questionId,
            reported_by: user.id,
            report_type: "other",
            description: details || "User reported an issue",
            status: "pending",
          })

        if (reportError) throw reportError
      }

      // Refresh score after feedback
      await refresh()
    } catch (err) {
      console.error("Error submitting feedback:", err)
      throw err
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchScore()
  }, [questionId])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchScore()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, questionId])

  return {
    score,
    isLoading,
    error,
    refresh,
    submitFeedback,
  }
}

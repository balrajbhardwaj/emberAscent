/**
 * Topic Progress Hook
 * 
 * Fetches and calculates mastery percentages for topics based on
 * a child's performance history.
 * 
 * @module hooks/useTopicProgress
 */
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface TopicMastery {
  topicId: string
  mastery: number // 0-100 percentage
  questionsAnswered: number
  questionsCorrect: number
  lastPracticed: Date | null
}

export interface SubjectMastery {
  subjectId: string
  mastery: number // 0-100 percentage
  topicsCount: number
  topicsMastery: Record<string, TopicMastery>
}

interface UseTopicProgressReturn {
  subjectMastery: Record<string, SubjectMastery>
  isLoading: boolean
  error: string | null
  refreshProgress: () => Promise<void>
}

/**
 * Hook to fetch and manage topic progress for a child
 * 
 * Calculates mastery percentages based on recent attempts.
 * Caches results and provides refresh function.
 * 
 * @param childId - Child identifier
 * @returns Progress data and loading states
 */
export function useTopicProgress(childId: string | null): UseTopicProgressReturn {
  const [subjectMastery, setSubjectMastery] = useState<Record<string, SubjectMastery>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = async () => {
    if (!childId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      // Fetch all attempts for this child with question data
      const { data: attempts, error: fetchError } = await supabase
        .from("question_attempts")
        .select(`
          question_id,
          is_correct,
          created_at,
          questions (
            subject,
            topic
          )
        `)
        .eq("child_id", childId)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!attempts || attempts.length === 0) {
        setSubjectMastery({})
        setIsLoading(false)
        return
      }

      // Group attempts by subject and topic
      const subjectData: Record<string, {
        topics: Record<string, {
          correct: number
          total: number
          lastPracticed: Date
        }>
      }> = {}

      attempts.forEach((attempt: any) => {
        if (!attempt.questions) return

        const subject = attempt.questions.subject
        const topic = attempt.questions.topic || "general"

        if (!subjectData[subject]) {
          subjectData[subject] = { topics: {} }
        }

        if (!subjectData[subject].topics[topic]) {
          subjectData[subject].topics[topic] = {
            correct: 0,
            total: 0,
            lastPracticed: new Date(attempt.created_at),
          }
        }

        subjectData[subject].topics[topic].total++
        if (attempt.is_correct) {
          subjectData[subject].topics[topic].correct++
        }

        // Update last practiced date if more recent
        const attemptDate = new Date(attempt.created_at)
        if (attemptDate > subjectData[subject].topics[topic].lastPracticed) {
          subjectData[subject].topics[topic].lastPracticed = attemptDate
        }
      })

      // Calculate mastery percentages
      const masteryData: Record<string, SubjectMastery> = {}

      Object.entries(subjectData).forEach(([subject, data]) => {
        const topicsMastery: Record<string, TopicMastery> = {}
        let totalCorrect = 0
        let totalAnswered = 0

        Object.entries(data.topics).forEach(([topicId, topicData]) => {
          const mastery = topicData.total > 0
            ? Math.round((topicData.correct / topicData.total) * 100)
            : 0

          topicsMastery[topicId] = {
            topicId,
            mastery,
            questionsAnswered: topicData.total,
            questionsCorrect: topicData.correct,
            lastPracticed: topicData.lastPracticed,
          }

          totalCorrect += topicData.correct
          totalAnswered += topicData.total
        })

        const overallMastery = totalAnswered > 0
          ? Math.round((totalCorrect / totalAnswered) * 100)
          : 0

        masteryData[subject] = {
          subjectId: subject,
          mastery: overallMastery,
          topicsCount: Object.keys(data.topics).length,
          topicsMastery,
        }
      })

      setSubjectMastery(masteryData)
    } catch (err) {
      console.error("Error fetching topic progress:", err)
      setError(err instanceof Error ? err.message : "Failed to load progress")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [childId])

  return {
    subjectMastery,
    isLoading,
    error,
    refreshProgress: fetchProgress,
  }
}

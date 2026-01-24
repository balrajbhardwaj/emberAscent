'use client'

/**
 * Review Session Hook
 *
 * Manages review session state including:
 * - Current assignment
 * - Timer
 * - Queue navigation
 * - Submission handling
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  submitReview,
  skipQuestion,
  type ReviewSubmission,
} from '@/app/reviewer/review/actions'

export function useReviewSession(assignmentId: string, reviewerId: string, questionId: string) {
  const router = useRouter()
  const [startTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTimeSpent = useCallback(() => {
    return Math.floor((Date.now() - startTime) / 1000)
  }, [startTime])

  const handleSubmit = async (submission: Omit<ReviewSubmission, 'timeSpentSeconds'>) => {
    setIsSubmitting(true)

    const result = await submitReview(
      assignmentId,
      reviewerId,
      questionId,
      {
        ...submission,
        timeSpentSeconds: getTimeSpent(),
      }
    )

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to submit review')
      return
    }

    toast.success('Review submitted successfully')

    if (result.hasMore && result.nextAssignmentId) {
      router.push(`/reviewer/review/${result.nextAssignmentId}`)
    } else {
      router.push('/reviewer')
      toast.success('All reviews completed!')
    }
  }

  const handleSkip = async () => {
    const result = await skipQuestion(assignmentId, reviewerId)

    if (!result.success) {
      toast.error('Failed to skip question')
      return
    }

    if (result.hasMore && result.nextAssignmentId) {
      router.push(`/reviewer/review/${result.nextAssignmentId}`)
    } else {
      router.push('/reviewer')
    }
  }

  return {
    handleSubmit,
    handleSkip,
    isSubmitting,
    timeSpent: getTimeSpent(),
  }
}

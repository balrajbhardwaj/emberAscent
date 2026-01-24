'use server'

/**
 * Review Actions
 *
 * Server actions for reviewer workflow:
 * - Starting review sessions
 * - Submitting reviews
 * - Skipping questions
 * - Tracking review progress
 *
 * @module app/reviewer/review/actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ReviewSubmission {
  outcome: 'approved' | 'needs_edit' | 'rejected'
  feedback?: string
  editsMade?: Record<string, unknown>
  timeSpentSeconds: number
  checklist?: {
    questionClear: boolean
    correctAnswerValid: boolean
    distractorsPlausible: boolean
    difficultyAccurate: boolean
    ageAppropriate: boolean
    explanationsHelpful: boolean
    noErrors: boolean
    curriculumAligned: boolean
  }
}

/**
 * Start a review session
 * Returns the first assignment ID to review
 */
export async function startReviewSession(reviewerId: string) {
  const supabase = await createClient()

  // Get next assignment
  const { data: assignment, error } = await supabase
    .from('review_assignments')
    .select('id')
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned'])
    .order('assigned_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !assignment) {
    return { success: false, error: 'No assignments in queue' }
  }

  // Mark as in progress
  await supabase
    .from('review_assignments')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', assignment.id)

  return { success: true, assignmentId: assignment.id }
}

/**
 * Submit a review
 */
export async function submitReview(
  assignmentId: string,
  reviewerId: string,
  questionId: string,
  submission: ReviewSubmission
) {
  const supabase = await createClient()

  // Create review submission
  const { error: submitError } = await supabase
    .from('review_submissions')
    .insert({
      assignment_id: assignmentId,
      reviewer_id: reviewerId,
      question_id: questionId,
      outcome: submission.outcome,
      feedback: submission.feedback,
      edits_made: submission.editsMade || {},
      time_spent_seconds: submission.timeSpentSeconds,
      submitted_at: new Date().toISOString(),
    })

  if (submitError) {
    console.error('Failed to submit review', submitError)
    return { success: false, error: 'Failed to submit review' }
  }

  // If question was edited, update the question
  if (submission.outcome === 'needs_edit' && submission.editsMade) {
    const updates = submission.editsMade
    await supabase
      .from('questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
  }

  // Get next assignment
  const { data: nextAssignment } = await supabase
    .from('review_assignments')
    .select('id')
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned'])
    .order('assigned_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  revalidatePath('/reviewer')
  revalidatePath('/reviewer/queue')

  return {
    success: true,
    nextAssignmentId: nextAssignment?.id || null,
    hasMore: !!nextAssignment,
  }
}

/**
 * Skip a question
 */
export async function skipQuestion(assignmentId: string, reviewerId: string) {
  const supabase = await createClient()

  // Mark assignment as skipped
  await supabase
    .from('review_assignments')
    .update({ status: 'skipped', updated_at: new Date().toISOString() })
    .eq('id', assignmentId)

  // Get next assignment
  const { data: nextAssignment } = await supabase
    .from('review_assignments')
    .select('id')
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned'])
    .order('assigned_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  revalidatePath('/reviewer')
  revalidatePath('/reviewer/queue')

  return {
    success: true,
    nextAssignmentId: nextAssignment?.id || null,
    hasMore: !!nextAssignment,
  }
}

/**
 * Get assignment details
 */
export async function getAssignment(assignmentId: string) {
  const supabase = await createClient()

  const { data: assignment, error } = await supabase
    .from('review_assignments')
    .select(
      `
      *,
      question:questions(*),
      reviewer:reviewers(display_name, qualifications)
    `
    )
    .eq('id', assignmentId)
    .single()

  if (error || !assignment) {
    console.error('Assignment not found', error)
    return null
  }

  return assignment
}

/**
 * Get queue summary
 */
export async function getQueueSummary(reviewerId: string) {
  const supabase = await createClient()

  const { data: assignments, count } = await supabase
    .from('review_assignments')
    .select('id, status', { count: 'exact' })
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned', 'in_progress'])

  const inProgress = assignments?.find((a) => a.status === 'in_progress')

  return {
    total: count ?? 0,
    currentAssignmentId: inProgress?.id || null,
  }
}

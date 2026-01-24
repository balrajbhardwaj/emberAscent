'use server'

/**
 * Reviewer Dashboard Server Actions
 *
 * Functions for retrieving reviewer stats, earnings, and queue info
 *
 * @module lib/reviewer/dashboard
 */

import { createClient } from '@/lib/supabase/server'

export interface ReviewerStats {
  questionsInQueue: number
  completedThisWeek: number
  completedTotal: number
  avgReviewTimeSeconds: number
  approvalRate: number
}

export interface ReviewerEarnings {
  thisMonth: number
  lastMonth: number
  total: number
  pendingPayment: number
}

/**
 * Get reviewer statistics
 */
export async function getReviewerStats(
  reviewerId: string
): Promise<ReviewerStats | null> {
  const supabase = await createClient()

  // Get reviewer info
  const { data: reviewer } = await supabase
    .from('reviewers')
    .select('questions_reviewed, avg_review_time_seconds')
    .eq('id', reviewerId)
    .single()

  if (!reviewer) return null

  // Get queue count
  const { count: queueCount } = await supabase
    .from('review_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned', 'in_progress'])

  // Get completed this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { count: weekCount } = await supabase
    .from('review_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', reviewerId)
    .gte('submitted_at', weekAgo.toISOString())

  // Get approval rate
  const { data: outcomes } = await supabase
    .from('review_submissions')
    .select('outcome')
    .eq('reviewer_id', reviewerId)

  const approvalRate = outcomes
    ? (outcomes.filter((o) => o.outcome === 'approved').length / outcomes.length) * 100
    : 0

  return {
    questionsInQueue: queueCount ?? 0,
    completedThisWeek: weekCount ?? 0,
    completedTotal: reviewer.questions_reviewed,
    avgReviewTimeSeconds: reviewer.avg_review_time_seconds,
    approvalRate: Math.round(approvalRate),
  }
}

/**
 * Get reviewer earnings
 */
export async function getReviewerEarnings(
  reviewerId: string
): Promise<ReviewerEarnings | null> {
  const supabase = await createClient()

  // Get reviewer hourly rate
  const { data: reviewer } = await supabase
    .from('reviewers')
    .select('hourly_rate')
    .eq('id', reviewerId)
    .single()

  if (!reviewer || !reviewer.hourly_rate) {
    return {
      thisMonth: 0,
      lastMonth: 0,
      total: 0,
      pendingPayment: 0,
    }
  }

  const hourlyRate = parseFloat(reviewer.hourly_rate.toString())

  // Get this month's reviews
  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  thisMonthStart.setHours(0, 0, 0, 0)

  const { data: thisMonthReviews } = await supabase
    .from('review_submissions')
    .select('time_spent_seconds')
    .eq('reviewer_id', reviewerId)
    .gte('submitted_at', thisMonthStart.toISOString())

  const thisMonthSeconds = thisMonthReviews?.reduce(
    (sum, r) => sum + (r.time_spent_seconds || 0),
    0
  ) || 0
  const thisMonthEarnings = (thisMonthSeconds / 3600) * hourlyRate

  // Get last month's reviews
  const lastMonthStart = new Date(thisMonthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)

  const { data: lastMonthReviews } = await supabase
    .from('review_submissions')
    .select('time_spent_seconds')
    .eq('reviewer_id', reviewerId)
    .gte('submitted_at', lastMonthStart.toISOString())
    .lt('submitted_at', thisMonthStart.toISOString())

  const lastMonthSeconds = lastMonthReviews?.reduce(
    (sum, r) => sum + (r.time_spent_seconds || 0),
    0
  ) || 0
  const lastMonthEarnings = (lastMonthSeconds / 3600) * hourlyRate

  // Get total earnings
  const { data: allReviews } = await supabase
    .from('review_submissions')
    .select('time_spent_seconds')
    .eq('reviewer_id', reviewerId)

  const totalSeconds = allReviews?.reduce(
    (sum, r) => sum + (r.time_spent_seconds || 0),
    0
  ) || 0
  const totalEarnings = (totalSeconds / 3600) * hourlyRate

  return {
    thisMonth: Math.round(thisMonthEarnings * 100) / 100,
    lastMonth: Math.round(lastMonthEarnings * 100) / 100,
    total: Math.round(totalEarnings * 100) / 100,
    pendingPayment: Math.round(thisMonthEarnings * 100) / 100,
  }
}

/**
 * Get reviewer's queue
 */
export async function getReviewQueue(reviewerId: string) {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('review_assignments')
    .select(
      `
      *,
      question:questions(*)
    `
    )
    .eq('reviewer_id', reviewerId)
    .in('status', ['assigned', 'in_progress'])
    .order('assigned_at', { ascending: true })
    .limit(50)

  return assignments ?? []
}

/**
 * Get reviewer profile
 */
export async function getReviewerProfile(userId: string) {
  const supabase = await createClient()

  const { data: reviewer } = await supabase
    .from('reviewers')
    .select('*')
    .eq('user_id', userId)
    .single()

  return reviewer
}

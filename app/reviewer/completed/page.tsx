/**
 * Completed Reviews Page
 *
 * History of completed reviews with filters
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReviewerProfile } from '@/lib/reviewer/dashboard'
import CompletedClient from './CompletedClient'

export default async function CompletedReviewsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reviewer = await getReviewerProfile(user.id)
  if (!reviewer) {
    redirect('/dashboard')
  }

  // Fetch completed submissions with question and assignment data
  const { data: submissions } = await supabase
    .from('review_submissions')
    .select(`
      id,
      outcome,
      feedback,
      edits_made,
      time_spent_seconds,
      created_at,
      question_id,
      questions!inner (
        id,
        subject,
        topic,
        difficulty,
        year_group,
        question_text,
        ember_score
      )
    `)
    .eq('reviewer_id', reviewer.id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Transform data to match interface
  const transformedSubmissions = submissions?.map(sub => ({
    id: sub.id,
    outcome: sub.outcome,
    feedback: sub.feedback,
    edits_made: sub.edits_made,
    time_spent_seconds: sub.time_spent_seconds,
    created_at: sub.created_at,
    question: Array.isArray(sub.questions) ? sub.questions[0] : sub.questions
  })) ?? []

  return <CompletedClient submissions={transformedSubmissions} />
}

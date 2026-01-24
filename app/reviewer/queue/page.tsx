/**
 * Review Queue Page
 *
 * Lists all assigned review questions
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReviewerProfile } from '@/lib/reviewer/dashboard'
import QueueClient from './QueueClient'

export default async function ReviewQueuePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reviewer = await getReviewerProfile(user.id)
  if (!reviewer) {
    redirect('/dashboard')
  }

  // Fetch assignments with question data
  const { data: assignments } = await supabase
    .from('review_assignments')
    .select(`
      id,
      status,
      assigned_at,
      due_at,
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
    .in('status', ['assigned', 'in_progress'])
    .order('assigned_at', { ascending: true })

  // Transform data to match interface
  const transformedAssignments = assignments?.map(asn => ({
    id: asn.id,
    status: asn.status,
    assigned_at: asn.assigned_at,
    due_at: asn.due_at,
    question: Array.isArray(asn.questions) ? asn.questions[0] : asn.questions
  })) ?? []

  return <QueueClient assignments={transformedAssignments} />
}

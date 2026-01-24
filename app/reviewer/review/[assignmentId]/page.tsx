/**
 * Review Assignment Page
 *
 * Full-screen review interface for evaluating questions
 */

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAssignment, getQueueSummary } from '../actions'
import { getReviewerProfile } from '@/lib/reviewer/dashboard'
import ReviewInterface from '@/components/reviewer/ReviewInterface'

interface PageProps {
  params: {
    assignmentId: string
  }
}

export default async function ReviewAssignmentPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reviewer = await getReviewerProfile(user.id)
  if (!reviewer) {
    redirect('/dashboard')
  }

  const assignment = await getAssignment(params.assignmentId)
  if (!assignment) {
    notFound()
  }

  const queueSummary = await getQueueSummary(reviewer.id)

  return (
    <ReviewInterface
      assignment={assignment}
      reviewerId={reviewer.id}
      queueTotal={queueSummary.total}
    />
  )
}

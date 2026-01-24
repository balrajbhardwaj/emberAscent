/**
 * Review Start Page
 *
 * Landing page for starting a review session
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReviewerProfile } from '@/lib/reviewer/dashboard'
import ReviewStartClient from './ReviewStartClient'

export default async function ReviewStartPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reviewer = await getReviewerProfile(user.id)
  if (!reviewer) {
    redirect('/dashboard')
  }

  // Auto-start if there's an in-progress assignment
  const { data: inProgress } = await supabase
    .from('review_assignments')
    .select('id')
    .eq('reviewer_id', reviewer.id)
    .eq('status', 'in_progress')
    .limit(1)
    .maybeSingle()

  if (inProgress) {
    redirect(`/reviewer/review/${inProgress.id}`)
  }

  // Get queue count
  const { count: queueCount } = await supabase
    .from('review_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', reviewer.id)
    .eq('status', 'assigned')

  return <ReviewStartClient reviewerId={reviewer.id} queueCount={queueCount ?? 0} />
}

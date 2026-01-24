/**
 * Reviewer Dashboard Page
 *
 * Main dashboard for reviewers showing:
 * - Welcome message
 * - Key stats (queue, completed, earnings)
 * - Quick start button
 * - Recent reviews
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
import { getReviewerProfile, getReviewerStats, getReviewerEarnings } from '@/lib/reviewer/dashboard'
import ReviewerStats from '@/components/reviewer/ReviewerStats'

export const metadata = {
  title: 'Reviewer Dashboard | Ember Ascent',
  description: 'Content review dashboard for educators',
}

export default async function ReviewerDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reviewer = await getReviewerProfile(user.id)
  if (!reviewer) {
    redirect('/dashboard')
  }

  const stats = await getReviewerStats(reviewer.id)
  const earnings = await getReviewerEarnings(reviewer.id)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {reviewer.display_name}
        </h1>
        <p className="text-gray-500">
          {reviewer.qualifications || 'Content Reviewer'}
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<Skeleton className="h-48" />}>
        <ReviewerStats stats={stats} earnings={earnings} reviewerId={reviewer.id} />
      </Suspense>
    </div>
  )
}

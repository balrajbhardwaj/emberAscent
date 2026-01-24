/**
 * Reviewer Layout
 *
 * Layout for reviewer dashboard with simplified navigation
 * focused on review tasks and earnings
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReviewerProfile } from '@/lib/reviewer/dashboard'
import ReviewerSidebar from '@/components/reviewer/ReviewerSidebar'

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user has reviewer role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'reviewer') {
    redirect('/dashboard')
  }

  // Get reviewer profile
  const reviewer = await getReviewerProfile(user.id)

  if (!reviewer || reviewer.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reviewer Access Pending
          </h1>
          <p className="text-gray-600">
            Your reviewer account is being set up. Please check back soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ReviewerSidebar
        reviewerName={reviewer.display_name}
        qualifications={reviewer.qualifications}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}

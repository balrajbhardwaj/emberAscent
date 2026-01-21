/**
 * Analytics Dashboard Page
 * 
 * Premium analytics dashboard for Ascent tier subscribers.
 * Shows comprehensive learning insights including:
 * - Key metrics overview
 * - Weakness heatmap
 * - Readiness score
 * - Growth charts
 * - Study recommendations
 * 
 * Free tier users see a blurred preview with upgrade prompt.
 * 
 * @module app/(dashboard)/analytics/page
 */

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { AnalyticsPreview } from '@/components/analytics/AnalyticsPreview'
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton'

/**
 * Analytics Page
 * 
 * Server component that renders analytics based on selected child.
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent childId={params.childId} />
    </Suspense>
  )
}

/**
 * Analytics Content Component
 * 
 * Fetches user data and displays analytics for the selected child.
 */
async function AnalyticsContent({ childId }: { childId?: string }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[Analytics] childId from URL:', childId)
  console.log('[Analytics] user:', user?.id)
  
  if (!user) {
    redirect('/login')
  }

  // Get profile with subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  // Get all active children for this user
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, name, avatar_url, year_group')
    .eq('parent_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  console.log('[Analytics] children found:', children?.length, 'error:', childrenError)

  // Handle no children
  if (!children || children.length === 0) {
    return (
      <div className="container max-w-7xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            No Active Child Profile
          </h1>
          <p className="text-slate-600">
            Please select or create a child profile to view analytics.
          </p>
        </div>
      </div>
    )
  }

  // Select child based on childId param or default to first child
  const selectedChild = childId
    ? children.find((c) => c.id === childId) || children[0]
    : children[0]

  // Check subscription tier
  const subscriptionTier = profile?.subscription_tier || 'free'
  const isPremium = subscriptionTier === 'ascent' || subscriptionTier === 'summit'

  // Free tier users see preview
  if (!isPremium) {
    return (
      <AnalyticsPreview 
        childName={selectedChild.name}
        subscriptionTier={subscriptionTier}
      />
    )
  }

  // Premium users see full dashboard
  return (
    <div className="container max-w-7xl py-8">
      <AnalyticsDashboard
        childId={selectedChild.id}
        childName={selectedChild.name}
        subscriptionTier={subscriptionTier}
      />
    </div>
  )
}

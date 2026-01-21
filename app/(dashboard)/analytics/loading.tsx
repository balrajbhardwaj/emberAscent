/**
 * Analytics Loading State
 * 
 * Skeleton loading UI for the analytics dashboard.
 * 
 * @module app/(dashboard)/analytics/loading
 */

import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton'

export default function AnalyticsLoading() {
  return (
    <div className="container max-w-7xl py-8">
      <AnalyticsSkeleton />
    </div>
  )
}

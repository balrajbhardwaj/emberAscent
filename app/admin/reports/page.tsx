/**
 * Admin Error Reports Page
 *
 * Main error reports management interface with:
 * - Tabbed view (Pending, In Progress, Resolved, All)
 * - Report queue with filters
 * - Quick stats and actions
 */

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ReportsManagementClient from './ReportsManagementClient'

export const metadata = {
  title: 'Error Reports | Admin',
  description: 'Manage user-reported question issues',
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Reports</h1>
        <p className="text-gray-500">
          Review and resolve user-reported question issues
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        <ReportsManagementClient />
      </Suspense>
    </div>
  )
}

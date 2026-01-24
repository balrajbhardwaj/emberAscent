/**
 * Report Detail Page
 *
 * Detailed view of individual error report with:
 * - Report information and context
 * - Question preview with inline editor
 * - Resolution actions and status updates
 */

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getReport } from '../actions'
import ReportDetail from '@/components/admin/reports/ReportDetail'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Report #${params.id.slice(0, 8)} | Admin`,
    description: 'Error report details and resolution',
  }
}

export default async function ReportDetailPage({ params }: PageProps) {
  const report = await getReport(params.id)

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ReportDetail report={report} />
      </Suspense>
    </div>
  )
}

'use client'

/**
 * Report Detail Component
 *
 * Detailed report view with:
 * - Report metadata and context
 * - Question preview with inline editing
 * - Status update controls
 * - Resolution workflow
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  updateReportStatus,
  resolveReport,
  assignReport,
} from '@/app/admin/reports/actions'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import QuestionEditor from './QuestionEditor'

interface ReportDetailProps {
  report: {
    id: string
    question_id: string
    user_id: string
    report_type: string
    description: string
    status: string
    assigned_to: string | null
    resolution_notes: string | null
    created_at: string
    updated_at: string
    resolved_at: string | null
    question?: any
    reporter?: {
      email: string
      full_name: string | null
    }
    assignee?: {
      email: string
      full_name: string | null
    }
  }
}

export default function ReportDetail({ report }: ReportDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user: adminUser } = useAdminAuth()
  const [resolutionNotes, setResolutionNotes] = useState(
    report.resolution_notes || ''
  )
  const [loading, setLoading] = useState(false)
  const [questionUpdates, setQuestionUpdates] = useState<any>({})

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      pending: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      dismissed: 'outline',
    }
    return (
      <Badge variant={variants[status] ?? 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const handleAssignToMe = async () => {
    if (!adminUser) return

    setLoading(true)
    const result = await assignReport(report.id, adminUser.id, adminUser.id)
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Report Assigned',
        description: 'This report has been assigned to you',
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to assign report',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!adminUser) return

    setLoading(true)
    const result = await updateReportStatus(
      report.id,
      newStatus,
      adminUser.id,
      resolutionNotes
    )
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `Report marked as ${newStatus.replace('_', ' ')}`,
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  const handleResolve = async () => {
    if (!adminUser) return

    if (!resolutionNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide resolution notes',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const result = await resolveReport(
      report.id,
      resolutionNotes,
      adminUser.id,
      Object.keys(questionUpdates).length > 0 ? questionUpdates : undefined
    )
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Report Resolved',
        description: 'The report has been marked as resolved',
      })
      router.push('/admin/reports')
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to resolve report',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Report #{report.id.slice(0, 8)}
          </h1>
          <p className="text-gray-500">
            Reported {format(new Date(report.created_at), 'PPP')}
          </p>
        </div>
        {getStatusBadge(report.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Report Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Report Type</div>
                <Badge variant="outline" className="capitalize">
                  {report.report_type.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">Description</div>
                <div className="text-sm mt-1">{report.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Reporter</div>
                <div className="text-sm">
                  {report.reporter?.full_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {report.reporter?.email}
                </div>
              </div>
              {report.assignee && (
                <div>
                  <div className="text-sm text-gray-500">Assigned To</div>
                  <div className="text-sm">
                    {report.assignee.full_name || report.assignee.email}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Editor */}
          {report.question && (
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionEditor
                  question={report.question}
                  onUpdate={setQuestionUpdates}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.status === 'pending' && (
                <Button
                  onClick={handleAssignToMe}
                  disabled={loading}
                  className="w-full"
                >
                  Assign to Me
                </Button>
              )}
              {report.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Mark In Progress
                </Button>
              )}
              {report.status !== 'resolved' && (
                <Button
                  onClick={() => handleStatusChange('dismissed')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Dismiss Report
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Resolution */}
          {report.status !== 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle>Resolve Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Resolution Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Explain how this issue was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleResolve}
                  disabled={loading || !resolutionNotes.trim()}
                  className="w-full"
                >
                  Mark as Resolved
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resolved Info */}
          {report.status === 'resolved' && report.resolution_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">{report.resolution_notes}</div>
                {report.resolved_at && (
                  <div className="text-xs text-gray-500">
                    Resolved {format(new Date(report.resolved_at), 'PPP')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Report Queue Component
 *
 * Table displaying error reports with:
 * - Status badges
 * - Report type indicators
 * - Question preview
 * - Quick actions
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'

interface Report {
  id: string
  question_id: string
  report_type: string
  description: string
  status: string
  created_at: string
  question?: {
    subject: string
    topic: string
    question_text: string
    difficulty: string
    ember_score: number
  }
  reporter?: {
    email: string
    full_name: string | null
  }
}

interface ReportQueueProps {
  reports: Report[]
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export default function ReportQueue({
  reports,
  onSortChange,
  sortField = 'created_at',
  sortDirection = 'desc',
}: ReportQueueProps) {
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

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className="capitalize text-xs">
        {type.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const handleSort = (field: string) => {
    if (!onSortChange) return
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newDirection)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('status')}
            >
              Status
              {sortField === 'status' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              Reported
              {sortField === 'created_at' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No reports found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {report.question ? (
                    <div className="max-w-xs">
                      <div className="font-medium text-sm">
                        {report.question.subject} - {report.question.topic}
                      </div>
                      <div className="text-xs text-gray-500">
                        {truncateText(report.question.question_text, 60)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {report.question.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {report.question.ember_score}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Question not found</span>
                  )}
                </TableCell>
                <TableCell>{getTypeBadge(report.report_type)}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-sm text-gray-600">
                    {truncateText(report.description, 80)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {report.reporter?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {report.reporter?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/reports/${report.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

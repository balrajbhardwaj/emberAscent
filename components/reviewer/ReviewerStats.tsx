'use client'

/**
 * Reviewer Stats Component
 *
 * Displays reviewer statistics and earnings with:
 * - Stats cards
 * - Earnings summary
 * - Quick start button
 */

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react'
import type { ReviewerStats as Stats, ReviewerEarnings } from '@/lib/reviewer/dashboard'

interface ReviewerStatsProps {
  stats: Stats | null
  earnings: ReviewerEarnings | null
  reviewerId: string
}

export default function ReviewerStats({ stats, earnings }: ReviewerStatsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-6">
      {/* Quick Start */}
      {stats && stats.questionsInQueue > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Ready to review?
                </h3>
                <p className="text-sm text-blue-700">
                  You have {stats.questionsInQueue} question{stats.questionsInQueue !== 1 ? 's' : ''} waiting
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/reviewer/review">Start Reviewing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Queue</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.questionsInQueue ?? 0}
            </div>
            <p className="text-xs text-gray-500">Questions assigned</p>
          </CardContent>
        </Card>

        {/* Completed This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedThisWeek ?? 0}
            </div>
            <p className="text-xs text-gray-500">Questions reviewed</p>
          </CardContent>
        </Card>

        {/* Average Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatTime(stats.avgReviewTimeSeconds) : '0m'}
            </div>
            <p className="text-xs text-gray-500">Per review</p>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.approvalRate ?? 0}%
            </div>
            <p className="text-xs text-gray-500">Questions approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings */}
      {earnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-gray-500">This Month</div>
                <div className="text-2xl font-bold text-green-600">
                  £{earnings.thisMonth.toFixed(2)}
                </div>
                <Badge variant="secondary" className="mt-1">
                  Pending Payment
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Month</div>
                <div className="text-xl font-semibold">
                  £{earnings.lastMonth.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Earned</div>
                <div className="text-xl font-semibold">
                  £{earnings.total.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.completedTotal ?? 0} reviews completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Review Guidelines</h3>
              <p className="text-sm text-gray-500">
                Best practices for quality assurance
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/reviewer/guidelines">View Guidelines</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

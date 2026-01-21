/**
 * Analytics Error Boundary
 * 
 * Error handling for the analytics dashboard.
 * 
 * @module app/(dashboard)/analytics/error
 */
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AnalyticsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  useEffect(() => {
    console.error('Analytics error:', error)
  }, [error])

  return (
    <div className="container max-w-7xl py-12">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            We couldn&apos;t load your analytics data. This might be a temporary issue.
          </p>
          
          {error.message && (
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg font-mono">
              {error.message}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <a href="/progress">Go to Progress</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

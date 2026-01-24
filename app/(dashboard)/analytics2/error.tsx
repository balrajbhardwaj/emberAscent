'use client'

/**
 * Analytics2 Error Boundary
 * 
 * Handles errors that occur during analytics data loading or rendering.
 * Provides user-friendly error messages without exposing internal details.
 * 
 * @module app/(dashboard)/analytics2/error
 */

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Analytics2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging (without exposing to user)
    console.error('Analytics2 Error:', error)
  }, [error])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-red-900">
                Unable to Load Analytics
              </CardTitle>
              <CardDescription className="text-red-700 mt-2">
                We encountered an issue while loading your analytics data.
                This could be due to a temporary connection issue or a problem with your session.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href="/home" className="gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-red-200">
            <p className="text-sm text-red-700">
              <strong>Troubleshooting tips:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 mt-2 space-y-1">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Sign out and sign back in</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>

          {error.digest && (
            <div className="pt-2">
              <p className="text-xs text-red-500">
                Error ID: {error.digest}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

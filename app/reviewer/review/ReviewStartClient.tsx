'use client'

/**
 * Review Start Client Component
 *
 * Client-side component for starting review session
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { startReviewSession } from './actions'

interface ReviewStartClientProps {
  reviewerId: string
  queueCount: number
}

export default function ReviewStartClient({ reviewerId, queueCount }: ReviewStartClientProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    if (queueCount === 0) {
      toast.error('No questions in queue')
      return
    }

    setIsStarting(true)
    const result = await startReviewSession(reviewerId)
    setIsStarting(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to start session')
      return
    }

    router.push(`/reviewer/review/${result.assignmentId}`)
  }

  const estimatedMinutes = queueCount * 2 // Rough estimate

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Question Review
        </h1>
        <p className="text-gray-500">
          Review AI-generated questions for quality and accuracy
        </p>
      </div>

      {queueCount === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-500">
              No questions in your review queue right now. Check back later.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <a href="/reviewer">Back to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Queue Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">
                    {queueCount} Question{queueCount !== 1 ? 's' : ''} Ready
                  </h3>
                  <p className="text-blue-700">
                    Estimated time: ~{estimatedMinutes} minutes
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={isStarting}
                >
                  {isStarting ? 'Starting...' : 'Start Reviewing'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Review Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• Check all answer options</li>
                  <li>• Verify correct answer</li>
                  <li>• Assess difficulty level</li>
                  <li>• Review explanations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Efficiency Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• Use keyboard shortcuts</li>
                  <li>• Focus on quality first</li>
                  <li>• Skip if unsure</li>
                  <li>• Take breaks regularly</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Quality Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• Clear question wording</li>
                  <li>• Valid correct answer</li>
                  <li>• Plausible distractors</li>
                  <li>• Curriculum aligned</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

'use client'

/**
 * Review Interface Component
 *
 * Full-screen interface for reviewing questions with:
 * - Progress indicator
 * - Question display
 * - Review panel with verdict and checklist
 * - Inline editing capabilities
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useReviewSession } from '@/hooks/useReviewSession'
import type { ReviewSubmission } from '@/app/reviewer/review/actions'
import ReviewQuestion from './ReviewQuestion'
import ReviewPanel from './ReviewPanel'

interface ReviewInterfaceProps {
  assignment: {
    id: string
    question_id: string
    question: any
    reviewer_id: string
  }
  reviewerId: string
  queueTotal: number
}

export default function ReviewInterface({
  assignment,
  reviewerId,
  queueTotal,
}: ReviewInterfaceProps) {
  const [editMode, setEditMode] = useState(false)
  const [edits, setEdits] = useState<Record<string, unknown>>({})

  const { handleSubmit, handleSkip, isSubmitting } = useReviewSession(
    assignment.id,
    reviewerId,
    assignment.question_id
  )

  const question = assignment.question

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-semibold">Question Review</h1>
              <p className="text-sm text-gray-500">
                {queueTotal} question{queueTotal !== 1 ? 's' : ''} in queue
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip Question
            </Button>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Display */}
          <div className="lg:col-span-2">
            <ReviewQuestion
              question={question}
              editMode={editMode}
              onEdit={setEdits}
            />
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            <ReviewPanel
              questionId={question.id}
              editMode={editMode}
              onToggleEditMode={() => setEditMode(!editMode)}
              onSubmit={(submission: Omit<ReviewSubmission, 'timeSpentSeconds' | 'editsMade'>) => handleSubmit({ ...submission, editsMade: edits })}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

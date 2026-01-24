'use client'

/**
 * Review Panel Component
 *
 * Side panel for review actions with:
 * - Quick verdict buttons
 * - Quality checklist
 * - Feedback textarea
 * - Submit button
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CheckCircle2, Edit3, XCircle } from 'lucide-react'
import type { ReviewSubmission } from '@/app/reviewer/review/actions'

interface ReviewPanelProps {
  questionId: string
  editMode: boolean
  onToggleEditMode: () => void
  onSubmit: (submission: Omit<ReviewSubmission, 'timeSpentSeconds' | 'editsMade'>) => void
  isSubmitting: boolean
}

export default function ReviewPanel({
  editMode,
  onToggleEditMode,
  onSubmit,
  isSubmitting,
}: ReviewPanelProps) {
  const [verdict, setVerdict] = useState<'approved' | 'needs_edit' | 'rejected' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [checklist, setChecklist] = useState({
    questionClear: true,
    correctAnswerValid: true,
    distractorsPlausible: true,
    difficultyAccurate: true,
    ageAppropriate: true,
    explanationsHelpful: true,
    noErrors: true,
    curriculumAligned: true,
  })

  const handleVerdictSelect = (selectedVerdict: typeof verdict) => {
    setVerdict(selectedVerdict)
    if (selectedVerdict === 'needs_edit' && !editMode) {
      onToggleEditMode()
    }
  }

  const handleSubmit = () => {
    if (!verdict) return

    onSubmit({
      outcome: verdict,
      feedback: feedback || undefined,
      checklist,
    })
  }

  const allChecksPassed = Object.values(checklist).every((v) => v)
  const canSubmit = verdict !== null

  return (
    <div className="space-y-4">
      {/* Verdict Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Verdict</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={verdict === 'approved' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => handleVerdictSelect('approved')}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Approve - Question is Good
          </Button>
          <Button
            variant={verdict === 'needs_edit' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => handleVerdictSelect('needs_edit')}
          >
            <Edit3 className="mr-2 h-5 w-5" />
            Needs Edit - Minor Fixes
          </Button>
          <Button
            variant={verdict === 'rejected' ? 'destructive' : 'outline'}
            className="w-full justify-start"
            onClick={() => handleVerdictSelect('rejected')}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Reject - Problematic
          </Button>
        </CardContent>
      </Card>

      {/* Edit Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="edit-mode" className="font-semibold">
                Edit Mode
              </Label>
              <p className="text-sm text-gray-500">
                Directly edit question fields
              </p>
            </div>
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={onToggleEditMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Checklist */}
      {(verdict === 'needs_edit' || verdict === 'rejected') && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries({
              questionClear: 'Question text is clear',
              correctAnswerValid: 'Correct answer is valid',
              distractorsPlausible: 'Distractors are plausible',
              difficultyAccurate: 'Difficulty rating is accurate',
              ageAppropriate: 'Appropriate for year group',
              explanationsHelpful: 'Explanations are helpful',
              noErrors: 'No spelling/grammar errors',
              curriculumAligned: 'Curriculum alignment correct',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  id={key}
                  checked={checklist[key as keyof typeof checklist]}
                  onCheckedChange={(checked) =>
                    setChecklist((prev) => ({ ...prev, [key]: checked }))
                  }
                />
                <Label htmlFor={key} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>
            Feedback {verdict === 'rejected' && <span className="text-red-500">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={
              verdict === 'rejected'
                ? 'Explain why this question should be rejected (required)'
                : 'Add optional feedback or notes...'
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {!allChecksPassed && verdict !== 'approved' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              ⚠️ Some quality checks failed
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={
              !canSubmit ||
              isSubmitting ||
              (verdict === 'rejected' && !feedback.trim())
            }
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Next'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

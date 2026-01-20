/**
 * Session Feedback Component
 * 
 * Post-session feedback collection with:
 * - Star rating (1-5)
 * - Specific aspect questions
 * - Open text feedback
 * 
 * Displayed after completing a practice session.
 * 
 * @module components/practice/SessionFeedback
 */

"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface SessionFeedbackProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  childId: string
}

export function SessionFeedback({
  isOpen,
  onClose,
  sessionId,
  childId,
}: SessionFeedbackProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [difficultyAppropriate, setDifficultyAppropriate] = useState<boolean | null>(null)
  const [explanationsHelpful, setExplanationsHelpful] = useState<boolean | null>(null)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [positiveFeedback, setPositiveFeedback] = useState('')
  const [improvementSuggestions, setImprovementSuggestions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please add a rating",
        description: "Select at least one star to continue.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get parent ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Submit feedback
      const { error } = await supabase
        .from('session_feedback')
        .insert({
          session_id: sessionId,
          child_id: childId,
          parent_id: user.id,
          rating,
          difficulty_appropriate: difficultyAppropriate,
          explanations_helpful: explanationsHelpful,
          would_recommend: wouldRecommend,
          positive_feedback: positiveFeedback || null,
          improvement_suggestions: improvementSuggestions || null,
        })

      if (error) {
        if (error.code === '23505') {
          // Duplicate - already submitted
          toast({
            title: "Already submitted",
            description: "You've already given feedback for this session.",
          })
          onClose()
          return
        }
        throw error
      }

      toast({
        title: "Thank you!",
        description: "Your feedback helps us create better learning experiences.",
      })

      onClose()
    } catch (error) {
      console.error('Error submitting session feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How was your practice session?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve Ember Ascent for all learners
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Overall experience</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Great"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Quick Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Was the difficulty level appropriate?</Label>
              <div className="flex gap-2">
                <Button
                  variant={difficultyAppropriate === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyAppropriate(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={difficultyAppropriate === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyAppropriate(false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Were the explanations helpful?</Label>
              <div className="flex gap-2">
                <Button
                  variant={explanationsHelpful === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExplanationsHelpful(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={explanationsHelpful === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExplanationsHelpful(false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Would you recommend Ember Ascent?</Label>
              <div className="flex gap-2">
                <Button
                  variant={wouldRecommend === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWouldRecommend(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={wouldRecommend === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWouldRecommend(false)}
                >
                  No
                </Button>
              </div>
            </div>
          </div>

          {/* Open Text Feedback */}
          <div className="space-y-2">
            <Label htmlFor="positive" className="text-sm">
              What did you enjoy? (optional)
            </Label>
            <Textarea
              id="positive"
              placeholder="Tell us what worked well..."
              value={positiveFeedback}
              onChange={(e) => setPositiveFeedback(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement" className="text-sm">
              What could be better? (optional)
            </Label>
            <Textarea
              id="improvement"
              placeholder="Any suggestions for improvement..."
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

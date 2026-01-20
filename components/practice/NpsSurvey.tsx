/**
 * NPS Survey Component
 * 
 * Net Promoter Score modal for measuring overall satisfaction.
 * 
 * Shows:
 * - 0-10 scale rating
 * - Optional feedback text
 * - Triggered at key milestones (10 sessions, 30 sessions)
 * 
 * @module components/practice/NpsSurvey
 */

"use client"

import { useState } from "react"
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

interface NpsSurveyProps {
  isOpen: boolean
  onClose: () => void
  childId?: string
  triggerType: 'session_10' | 'session_30' | 'manual' | 'prompted'
  totalSessions: number
}

export function NpsSurvey({
  isOpen,
  onClose,
  childId,
  triggerType,
  totalSessions,
}: NpsSurveyProps) {
  const [score, setScore] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (score === null) {
      toast({
        title: "Please select a score",
        description: "Choose a number from 0 to 10.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get parent ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Submit NPS survey
      const { error } = await supabase
        .from('nps_surveys')
        .insert({
          parent_id: user.id,
          child_id: childId || null,
          score,
          feedback_text: feedbackText || null,
          trigger_type: triggerType,
          total_sessions_at_time: totalSessions,
        })

      if (error) throw error

      // Show appropriate thank you message
      let thankYouMessage = "Thank you for your feedback!"
      if (score >= 9) {
        thankYouMessage = "We're thrilled you love Ember Ascent! 🎉"
      } else if (score >= 7) {
        thankYouMessage = "Thanks for your feedback. We'll keep improving!"
      } else {
        thankYouMessage = "Thank you for your honest feedback. We'll work hard to improve."
      }

      toast({
        title: thankYouMessage,
        description: "Your input helps us build a better learning platform.",
      })

      onClose()
    } catch (error) {
      console.error('Error submitting NPS survey:', error)
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const getScoreLabel = (score: number) => {
    if (score <= 6) return "Not likely"
    if (score <= 8) return "Somewhat likely"
    return "Very likely"
  }

  const getScoreColor = (score: number) => {
    if (score <= 6) return "text-red-600"
    if (score <= 8) return "text-amber-600"
    return "text-green-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Question</DialogTitle>
          <DialogDescription>
            How likely are you to recommend Ember Ascent to a friend or colleague?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 0-10 Scale */}
          <div className="space-y-3">
            <Label>Select a score (0 = Not at all likely, 10 = Extremely likely)</Label>
            
            <div className="flex justify-between items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore(num)}
                  className={`
                    flex items-center justify-center h-12 w-full rounded-md text-sm font-semibold
                    transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary
                    ${
                      score === num
                        ? num <= 6
                          ? 'bg-red-600 text-white'
                          : num <= 8
                          ? 'bg-amber-500 text-white'
                          : 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>

            {score !== null && (
              <p className={`text-sm font-semibold text-center ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            )}
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Label htmlFor="nps-feedback">
              {score !== null && score >= 9
                ? "What do you love most about Ember Ascent? (optional)"
                : score !== null && score >= 7
                ? "What could we do better? (optional)"
                : score !== null
                ? "What's the main reason for your score? (optional)"
                : "Care to tell us why? (optional)"}
            </Label>
            <Textarea
              id="nps-feedback"
              placeholder="Your feedback helps us improve..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
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
            disabled={score === null || isSubmitting}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

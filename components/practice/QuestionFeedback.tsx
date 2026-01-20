/**
 * Question Feedback Component
 * 
 * Allows learners to mark questions as helpful/not helpful
 * without interrupting practice flow.
 * 
 * Features:
 * - Thumbs up/down buttons
 * - Optional issue type selection when marking unhelpful
 * - Prevents duplicate feedback
 * - Updates question helpful counts
 * 
 * @module components/practice/QuestionFeedback
 */

"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface QuestionFeedbackProps {
  questionId: string
  childId: string
  sessionId?: string
  onFeedbackSubmitted?: () => void
}

const issueTypes = [
  { value: 'unclear', label: 'Question is unclear' },
  { value: 'incorrect', label: 'Answer seems wrong' },
  { value: 'too_easy', label: 'Too easy' },
  { value: 'too_hard', label: 'Too difficult' },
  { value: 'other', label: 'Other issue' },
]

export function QuestionFeedback({ 
  questionId, 
  childId, 
  sessionId,
  onFeedbackSubmitted 
}: QuestionFeedbackProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueType, setIssueType] = useState<string>('')
  const [feedbackText, setFeedbackText] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  const handleFeedback = async (isHelpful: boolean) => {
    setIsSubmitting(true)
    try {
      // Get parent ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Submit feedback
      const { error } = await supabase
        .from('question_feedback')
        .insert({
          question_id: questionId,
          child_id: childId,
          parent_id: user.id,
          is_helpful: isHelpful,
          session_id: sessionId || null,
        })

      if (error) {
        // Check if duplicate feedback
        if (error.code === '23505') {
          toast({
            title: "Already submitted",
            description: "You've already given feedback on this question.",
            variant: "destructive",
          })
          setFeedbackGiven(isHelpful)
          return
        }
        throw error
      }

      setFeedbackGiven(isHelpful)

      // If not helpful, show issue form
      if (!isHelpful) {
        setShowIssueForm(true)
      } else {
        toast({
          title: "Thanks for your feedback!",
          description: "Your input helps us improve our questions.",
        })
      }

      onFeedbackSubmitted?.()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIssueSubmit = async () => {
    if (!issueType) return

    setIsSubmitting(true)
    try {
      // Update feedback with issue details
      const { error } = await supabase
        .from('question_feedback')
        .update({
          issue_type: issueType,
          feedback_text: feedbackText || null,
        })
        .eq('question_id', questionId)
        .eq('child_id', childId)

      if (error) throw error

      toast({
        title: "Issue reported",
        description: "Thank you for helping us improve this question.",
      })

      setShowIssueForm(false)
      onFeedbackSubmitted?.()
    } catch (error) {
      console.error('Error submitting issue:', error)
      toast({
        title: "Error",
        description: "Failed to submit issue details.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Already gave feedback - show thank you
  if (feedbackGiven !== null && !showIssueForm) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {feedbackGiven ? (
          <>
            <ThumbsUp className="h-4 w-4 text-green-600 fill-green-600" />
            <span>Thanks for your feedback!</span>
          </>
        ) : (
          <>
            <ThumbsDown className="h-4 w-4 text-orange-600 fill-orange-600" />
            <span>We'll work on improving this question</span>
          </>
        )}
      </div>
    )
  }

  // Show issue form for unhelpful feedback
  if (showIssueForm) {
    return (
      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">What's the issue?</Label>
          <RadioGroup value={issueType} onValueChange={setIssueType}>
            {issueTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="text-sm cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-text" className="text-sm">
            Additional details (optional)
          </Label>
          <Textarea
            id="feedback-text"
            placeholder="Tell us more about the issue..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleIssueSubmit}
            disabled={!issueType || isSubmitting}
            size="sm"
          >
            Submit
          </Button>
          <Button
            onClick={() => setShowIssueForm(false)}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
          >
            Skip
          </Button>
        </div>
      </div>
    )
  }

  // Initial feedback buttons
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback(true)}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback(false)}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </Button>
      </div>
    </div>
  )
}

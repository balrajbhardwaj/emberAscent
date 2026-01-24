/**
 * Question Feedback Widget
 *
 * Compact post-question feedback control that captures helpfulness, explanation
 * clarity, and perceived difficulty while keeping the flow unobtrusive.
 *
 * @module components/feedback/QuestionFeedback
 */

"use client"

import { useState } from "react"
import { Loader2, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { useFeedback } from "@/hooks/useFeedback"
import { useToast } from "@/hooks/use-toast"
import type { DifficultyAccuracy, ExplanationClarity } from "@/lib/feedback/collector"
import { cn } from "@/lib/utils"

const clarityOptions: { label: string; value: ExplanationClarity }[] = [
  { label: "Crystal clear", value: "clear" },
  { label: "A little mixed", value: "mixed" },
  { label: "Still confusing", value: "confusing" },
]

const difficultyOptions: { label: string; value: DifficultyAccuracy }[] = [
  { label: "Too easy", value: "too_easy" },
  { label: "Just right", value: "just_right" },
  { label: "Too hard", value: "too_hard" },
]

export interface QuestionFeedbackProps {
  questionId: string
  childId: string
  sessionId?: string
  explanationStyle?: string
  onSubmitted?: () => void
}

/**
 * Renders the inline question feedback controls.
 */
export function QuestionFeedback({
  questionId,
  childId,
  sessionId,
  explanationStyle,
  onSubmitted,
}: QuestionFeedbackProps) {
  const { submitQuestionFeedback, hasQuestionFeedback, loading } = useFeedback({ childId })
  const { toast } = useToast()

  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [clarity, setClarity] = useState<ExplanationClarity | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<DifficultyAccuracy | undefined>(undefined)
  const [note, setNote] = useState("")
  const [expanded, setExpanded] = useState(false)

  const alreadySubmitted = hasQuestionFeedback(questionId)
  const isSubmitting = loading.question

  if (alreadySubmitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ThumbsUp className="h-4 w-4 text-primary" />
        <span>Thanks for the feedback – every vote improves Ember Ascent.</span>
      </div>
    )
  }

  const handleHelpfulSelect = (value: boolean) => {
    setHelpful(value)
    if (!value) {
      setExpanded(true)
    }
  }

  const handleSubmit = async () => {
    if (helpful === null) {
      toast({
        title: "Choose an option",
        description: "Tap thumbs up or down before sending feedback.",
        variant: "destructive",
      })
      return
    }

    try {
      await submitQuestionFeedback({
        questionId,
        sessionId,
        isHelpful: helpful,
        explanationClarity: clarity,
        explanationStyle,
        difficultyAccuracy: difficulty,
        detail: note || undefined,
        extraContext: explanationStyle ? { explanationStyle } : undefined,
      })
      onSubmitted?.()
      setExpanded(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="rounded-2xl border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Was this helpful?</p>
          <p className="text-xs text-muted-foreground">Answers stay private and guide future improvements.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={helpful === true ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleHelpfulSelect(true)}
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4" /> Helpful
          </Button>
          <Button
            variant={helpful === false ? "destructive" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleHelpfulSelect(false)}
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4" /> Not really
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Explanation clarity</p>
          <div className="flex flex-wrap gap-2">
            {clarityOptions.map((option) => (
              <Badge
                key={option.value}
                variant={clarity === option.value ? "default" : "outline"}
                className={cn('cursor-pointer px-3 py-1 text-xs', clarity === option.value && 'shadow-sm')}
                onClick={() => setClarity(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Difficulty fit</p>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={difficulty === option.value ? "secondary" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setDifficulty(option.value)}
                disabled={isSubmitting}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Collapsible open={expanded} onOpenChange={setExpanded} className="mt-3">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> Tell us more
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-3 space-y-2">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="What made this question great — or tricky?"
          />
          <p className="text-[11px] text-muted-foreground">Optional. We anonymise and only share internally.</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 text-sm">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send feedback
        </Button>
        <span className="text-[11px] text-muted-foreground">Tap once — no pop-ups, promise.</span>
      </div>
    </div>
  )
}

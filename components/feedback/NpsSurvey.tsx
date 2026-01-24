/**
 * NPS Survey Modal
 *
 * Collects Net Promoter Score feedback with contextual follow-up prompts.
 *
 * @module components/feedback/NpsSurvey
 */

"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useFeedback } from "@/hooks/useFeedback"
import { useToast } from "@/hooks/use-toast"
import type { NpsTriggerReason } from "@/lib/feedback/collector"
import { cn } from "@/lib/utils"

export interface NpsSurveyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerReason: NpsTriggerReason
  childId?: string
}

const scores = Array.from({ length: 11 }, (_, idx) => idx)

/**
 * Displays the Net Promoter Score modal experience.
 */
export function NpsSurvey({ open, onOpenChange, triggerReason, childId }: NpsSurveyProps) {
  const { submitNpsResponse, loading, hasSubmittedNps } = useFeedback({ childId })
  const { toast } = useToast()

  const [score, setScore] = useState<number | null>(null)
  const [note, setNote] = useState("")

  const isSubmitting = loading.nps

  const followUpPrompt = useMemo(() => {
    if (score === null) return ""
    if (score <= 6) return "What could we improve?"
    if (score <= 8) return "What would make it a perfect 10?"
    return "What do you love about Ember Ascent?"
  }, [score])

  const handleSubmit = async () => {
    if (score === null) {
      toast({
        title: "Pick a score",
        description: "Use the 0-10 scale before sending.",
        variant: "destructive",
      })
      return
    }

    try {
      await submitNpsResponse({
        score,
        followUp: note || undefined,
        triggerReason,
        childId,
      })
      setNote("")
      setScore(null)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNote("")
      setScore(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open && !hasSubmittedNps} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How likely are you to recommend Ember Ascent?</DialogTitle>
          <DialogDescription>
            0 = Not at all likely · 10 = Extremely likely. Takes <span className="font-semibold">10 seconds.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {scores.map((value) => (
            <Button
              key={value}
              type="button"
              variant={score === value ? 'default' : 'outline'}
              size="sm"
              className={cn('w-10', score === value && 'shadow-md')}
              onClick={() => setScore(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        {followUpPrompt && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{followUpPrompt}</p>
            <Textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional, but super helpful"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </Button>
          <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

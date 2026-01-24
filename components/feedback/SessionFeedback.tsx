/**
 * Session Feedback Card
 *
 * lightweight panel shown at the end of a practice session capturing rating,
 * quick tags, and optional comments without forcing a response.
 *
 * @module components/feedback/SessionFeedback
 */

"use client"

import { useMemo, useState } from "react"
import { Loader2, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useFeedback } from "@/hooks/useFeedback"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const TAG_OPTIONS = [
  { slug: "fun", label: "Fun" },
  { slug: "challenging", label: "Challenging" },
  { slug: "learned-something", label: "Learned something" },
  { slug: "confusing", label: "Confusing" },
]

export interface SessionFeedbackProps {
  childId: string
  sessionId: string
  onSubmitted?: () => void
  onSkip?: () => void
}

/**
 * Renders the post-session feedback prompt.
 */
export function SessionFeedback({ childId, sessionId, onSubmitted, onSkip }: SessionFeedbackProps) {
  const { submitSessionFeedback, hasSessionFeedback, loading } = useFeedback({ childId })
  const { toast } = useToast()

  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set())

  const alreadySubmitted = hasSessionFeedback(sessionId)
  const isSubmitting = loading.session

  const tagList = useMemo(() => Array.from(selectedTags), [selectedTags])

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Pick a rating",
        description: "One to five stars helps us tune sessions.",
        variant: "destructive",
      })
      return
    }

    try {
      await submitSessionFeedback({
        sessionId,
        rating,
        comment: comment || undefined,
        tags: tagList,
      })
      onSubmitted?.()
    } catch (error) {
      console.error(error)
    }
  }

  if (alreadySubmitted) {
    return (
      <div className="rounded-2xl border bg-emerald-50/60 p-4 text-sm text-emerald-900">
        Thanks for sharing! We log session sentiment to improve recommendations.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">How was your practice today?</p>
        <p className="text-xs text-muted-foreground">Optional, but your perspective keeps Ember Ascent honest.</p>
      </div>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setRating(value)}
            className={cn(
              'rounded-full p-2 transition-colors',
              rating >= value ? 'text-yellow-500' : 'text-muted-foreground'
            )}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            <Star className={cn('h-7 w-7', rating >= value && 'fill-yellow-400 text-yellow-500')} />
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Quick tags</p>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <Badge
              key={tag.slug}
              variant={selectedTags.has(tag.slug) ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1 text-xs"
              onClick={() => toggleTag(tag.slug)}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>

      <Textarea
        className="mt-4"
        placeholder="Anything else we should know?"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 text-sm">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit feedback
        </Button>
        <Button variant="ghost" size="sm" onClick={onSkip} type="button">
          Skip
        </Button>
      </div>
    </div>
  )
}

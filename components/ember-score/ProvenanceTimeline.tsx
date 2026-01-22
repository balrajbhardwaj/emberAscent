/**
 * Provenance Timeline Component
 * 
 * Displays the complete audit trail for a question.
 * Shows creation, reviews, score changes, and other lifecycle events.
 * 
 * @module components/ember-score/ProvenanceTimeline
 */
"use client"

import { useEffect, useState } from "react"
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  User,
  Bot,
  Shield,
  Sparkles
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Type definitions moved here to avoid server imports
type ProvenanceEventType =
  | 'created'
  | 'modified'
  | 'reviewed'
  | 'published'
  | 'unpublished'
  | 'score_changed'
  | 'error_reported'
  | 'error_resolved'
  | 'feedback_received'

type ActorType = 'system' | 'admin' | 'expert' | 'ai' | 'user'

interface ProvenanceEvent {
  id: string
  questionId: string
  eventType: ProvenanceEventType
  eventData: Record<string, any>
  actorId?: string
  actorName?: string
  actorType: ActorType
  occurredAt: Date
}

interface ProvenanceTimelineProps {
  questionId: string
  className?: string
}

/**
 * ProvenanceTimeline - Visual timeline of question lifecycle
 * 
 * Displays chronological history of:
 * - Question creation
 * - Expert reviews
 * - Score changes
 * - Error reports and resolutions
 * - Publication status changes
 * 
 * @param questionId - Question ID to display timeline for
 * @param className - Additional CSS classes
 */
export function ProvenanceTimeline({ questionId, className }: ProvenanceTimelineProps) {
  const [events, setEvents] = useState<ProvenanceEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTimeline() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/questions/${questionId}/provenance`)
        if (!response.ok) {
          throw new Error('Failed to fetch provenance')
        }
        const data = await response.json()
        setEvents(data.timeline || [])
      } catch (err) {
        console.error('Error fetching provenance:', err)
        setError('Failed to load timeline')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeline()
  }, [questionId])

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No timeline events available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => (
        <TimelineEvent 
          key={event.id} 
          event={event} 
          isFirst={index === 0}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  )
}

/**
 * TimelineEvent - Single event in the timeline
 */
function TimelineEvent({ 
  event, 
  isFirst, 
  isLast 
}: { 
  event: ProvenanceEvent
  isFirst: boolean
  isLast: boolean
}) {
  const { icon, color, bgColor, borderColor } = getEventStyle(event.eventType)
  const Icon = icon

  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
      )}

      {/* Event icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
        bgColor,
        borderColor
      )}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>

      {/* Event content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">
              {getEventTitle(event.eventType)}
            </h4>
            {isFirst && (
              <Badge variant="secondary" className="text-xs">Latest</Badge>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(event.occurredAt, { addSuffix: true })}
          </time>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {formatEventDescription(event)}
        </p>

        {/* Actor information */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getActorIcon(event.actorType)}
          <span>{event.actorName || 'System'}</span>
          {event.actorType && (
            <Badge variant="outline" className="text-xs">
              {event.actorType}
            </Badge>
          )}
        </div>

        {/* Additional event data */}
        {renderEventDetails(event)}
      </div>
    </div>
  )
}

/**
 * Get event styling based on type
 */
function getEventStyle(eventType: string) {
  const styles = {
    created: {
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    reviewed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    published: {
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    unpublished: {
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    score_changed: {
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    error_reported: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    error_resolved: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    feedback_received: {
      icon: User,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
  }

  return styles[eventType as keyof typeof styles] || {
    icon: Clock,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  }
}

/**
 * Format event data for display
 */
function formatEventDescription(event: ProvenanceEvent): string {
  const data = event.eventData

  switch (event.eventType) {
    case 'created':
      return `Question created for ${data.subject || 'unknown subject'} - ${data.topic || 'general topic'}`
    
    case 'reviewed':
      return `Review status changed to ${data.new_status || 'reviewed'}`
    
    case 'published':
      return data.reason === 'score_below_threshold' 
        ? 'Published after meeting quality threshold'
        : 'Published and made available to learners'
    
    case 'unpublished':
      return data.reason === 'score_below_threshold'
        ? 'Unpublished - score fell below minimum threshold'
        : 'Unpublished for review'
    
    case 'score_changed':
      return `Ember Score changed from ${data.old_score} (${data.old_tier}) to ${data.new_score} (${data.new_tier})`
    
    case 'error_reported':
      return `Error reported: ${data.report_type || 'general issue'}`
    
    case 'error_resolved':
      return `Error ${data.resolution || 'resolved'}: ${data.report_type || 'issue'}`
    
    case 'feedback_received':
      return `Feedback received: ${data.type || 'general feedback'}`
    
    case 'modified':
      return `Question content updated`
    
    default:
      return `Event: ${event.eventType}`
  }
}

/**
 * Get event title
 */
function getEventTitle(eventType: string): string {
  const titles: Record<string, string> = {
    created: 'Question Created',
    modified: 'Question Modified',
    reviewed: 'Expert Review',
    published: 'Published',
    unpublished: 'Unpublished',
    score_changed: 'Quality Score Changed',
    error_reported: 'Error Reported',
    error_resolved: 'Error Resolved',
    feedback_received: 'Feedback Received',
  }

  return titles[eventType] || eventType
}

/**
 * Get actor icon
 */
function getActorIcon(actorType: string) {
  const icons: Record<string, any> = {
    system: <Shield className="h-3 w-3" />,
    admin: <User className="h-3 w-3" />,
    expert: <CheckCircle className="h-3 w-3" />,
    ai: <Bot className="h-3 w-3" />,
    user: <User className="h-3 w-3" />,
  }

  return icons[actorType] || <Clock className="h-3 w-3" />
}

/**
 * Render additional event details
 */
function renderEventDetails(event: ProvenanceEvent) {
  const data = event.eventData

  if (event.eventType === 'score_changed' && data.old_score && data.new_score) {
    const isIncrease = data.new_score > data.old_score
    const Icon = isIncrease ? TrendingUp : TrendingDown
    const colorClass = isIncrease ? 'text-green-600' : 'text-red-600'

    return (
      <div className="mt-2 p-2 rounded-md bg-muted text-xs flex items-center gap-2">
        <Icon className={cn("h-4 w-4", colorClass)} />
        <span>
          Score {isIncrease ? 'increased' : 'decreased'} by{' '}
          {Math.abs(data.new_score - data.old_score)} points
        </span>
      </div>
    )
  }

  if (event.eventType === 'reviewed' && data.reviewed_by) {
    return (
      <div className="mt-2 p-2 rounded-md bg-muted text-xs">
        <strong>Reviewed by:</strong> {data.reviewed_by}
      </div>
    )
  }

  if (event.eventType === 'error_reported' && data.description) {
    return (
      <div className="mt-2 p-2 rounded-md bg-muted text-xs">
        <strong>Details:</strong> {data.description}
      </div>
    )
  }

  return null
}

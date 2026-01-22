/**
 * Question Provenance Tracking Service
 * 
 * Logs and retrieves question lifecycle events for transparency.
 * Supports OGL v3.0 compliance and audit requirements.
 * 
 * @module lib/provenance/tracker
 */

import { createClient } from "@/lib/supabase/server"

/**
 * Event types for question provenance
 */
export type ProvenanceEventType =
  | 'created'
  | 'modified'
  | 'reviewed'
  | 'published'
  | 'unpublished'
  | 'score_changed'
  | 'error_reported'
  | 'error_resolved'
  | 'feedback_received'

/**
 * Actor types
 */
export type ActorType = 'system' | 'admin' | 'expert' | 'ai' | 'user'

/**
 * Provenance event record
 */
export interface ProvenanceEvent {
  id: string
  questionId: string
  eventType: ProvenanceEventType
  eventData: Record<string, any>
  actorId?: string
  actorName?: string
  actorType: ActorType
  occurredAt: Date
}

/**
 * Log a provenance event
 * 
 * @param questionId - Question ID
 * @param eventType - Type of event
 * @param eventData - Event details
 * @param actorType - Type of actor performing the action
 * @returns Event ID or null if failed
 * 
 * @example
 * ```ts
 * await logProvenanceEvent(
 *   'q123',
 *   'reviewed',
 *   { reviewedBy: 'Emily Carter', status: 'approved' },
 *   'expert'
 * )
 * ```
 */
export async function logProvenanceEvent(
  questionId: string,
  eventType: ProvenanceEventType,
  eventData: Record<string, any> = {},
  actorType: ActorType = 'system'
): Promise<string | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('log_provenance_event', {
      p_question_id: questionId,
      p_event_type: eventType,
      p_event_data: eventData,
      p_actor_type: actorType,
    })

    if (error) {
      console.error('Failed to log provenance event:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error logging provenance event:', error)
    return null
  }
}

/**
 * Log question creation event
 * 
 * @param questionId - Question ID
 * @param generatorInfo - Information about how question was generated
 * @returns Event ID or null if failed
 * 
 * @example
 * ```ts
 * await logCreation('q123', {
 *   generator: 'claude-sonnet-4',
 *   prompt_version: '1.2',
 *   subject: 'Maths',
 *   topic: 'Fractions'
 * })
 * ```
 */
export async function logCreation(
  questionId: string,
  generatorInfo: Record<string, any>
): Promise<string | null> {
  return logProvenanceEvent(questionId, 'created', generatorInfo, 'ai')
}

/**
 * Log question review event
 * 
 * @param questionId - Question ID
 * @param reviewerInfo - Reviewer details
 * @param outcome - Review outcome ('approved', 'needs_revision', 'rejected')
 * @returns Event ID or null if failed
 * 
 * @example
 * ```ts
 * await logReview('q123', {
 *   reviewer_name: 'Emily Carter',
 *   reviewer_id: 'r456'
 * }, 'approved')
 * ```
 */
export async function logReview(
  questionId: string,
  reviewerInfo: { reviewer_name: string; reviewer_id?: string },
  outcome: 'approved' | 'needs_revision' | 'rejected'
): Promise<string | null> {
  return logProvenanceEvent(
    questionId,
    'reviewed',
    { ...reviewerInfo, outcome },
    'expert'
  )
}

/**
 * Log question edit event
 * 
 * @param questionId - Question ID
 * @param editorId - ID of user who made the edit
 * @param changes - Object describing what changed
 * @returns Event ID or null if failed
 * 
 * @example
 * ```ts
 * await logEdit('q123', 'admin-123', {
 *   field: 'question_text',
 *   old_value: 'What is 2+2?',
 *   new_value: 'What is the sum of 2 and 2?'
 * })
 * ```
 */
export async function logEdit(
  questionId: string,
  editorId: string,
  changes: Record<string, any>
): Promise<string | null> {
  const supabase = await createClient()
  
  // First log the event with actor_id
  const { data, error } = await supabase.rpc('log_provenance_event', {
    p_question_id: questionId,
    p_event_type: 'modified',
    p_event_data: changes,
    p_actor_type: 'admin',
  })

  if (error) {
    console.error('Failed to log edit event:', error)
    return null
  }

  return data
}

/**
 * Log Ember Score change event
 * 
 * @param questionId - Question ID
 * @param oldScore - Previous score
 * @param newScore - New score
 * @param reason - Reason for change (e.g., 'after_review', 'community_feedback')
 * @returns Event ID or null if failed
 * 
 * @example
 * ```ts
 * await logScoreUpdate('q123', 72, 94, 'after_review')
 * ```
 */
export async function logScoreUpdate(
  questionId: string,
  oldScore: number,
  newScore: number,
  reason: string
): Promise<string | null> {
  // Determine tier for old and new scores
  const getScoreTier = (score: number) => {
    if (score >= 90) return 'verified'
    if (score >= 75) return 'confident'
    return 'draft'
  }

  return logProvenanceEvent(
    questionId,
    'score_changed',
    {
      old_score: oldScore,
      new_score: newScore,
      old_tier: getScoreTier(oldScore),
      new_tier: getScoreTier(newScore),
      reason,
    },
    'system'
  )
}

/**
 * Get provenance timeline for a question
 * 
 * @param questionId - Question ID
 * @returns Array of provenance events in chronological order (newest first)
 * 
 * @example
 * ```ts
 * const timeline = await getQuestionProvenance('q123')
 * console.log(`${timeline.length} events in timeline`)
 * ```
 */
export async function getQuestionProvenance(
  questionId: string
): Promise<ProvenanceEvent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_question_provenance', {
      p_question_id: questionId,
    })

    if (error) {
      console.error('Failed to fetch provenance:', error)
      return []
    }

    return (data || []).map((event: any) => ({
      id: event.id,
      questionId,
      eventType: event.event_type,
      eventData: event.event_data || {},
      actorName: event.actor_name,
      actorType: event.actor_type,
      occurredAt: new Date(event.occurred_at),
    }))
  } catch (error) {
    console.error('Error fetching provenance:', error)
    return []
  }
}

/**
 * Get attribution information for content
 * 
 * @param contentType - Type of content ('question', 'explanation', 'image')
 * @param contentId - Content ID
 * @returns Attribution details or null
 */
export async function getContentAttribution(
  contentType: 'question' | 'explanation' | 'image',
  contentId: string
): Promise<{
  source: string
  license: string
  attribution: string
  details: Record<string, any>
} | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('content_attributions')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      source: data.source_type,
      license: data.license,
      attribution: data.attribution_text || 'No attribution available',
      details: data.source_details || {},
    }
  } catch (error) {
    console.error('Error fetching attribution:', error)
    return null
  }
}

/**
 * Create attribution record for new content
 * 
 * @param contentType - Type of content
 * @param contentId - Content ID
 * @param sourceType - Source of content
 * @param details - Additional source details
 * @param attributionText - Attribution text
 * @returns Success boolean
 */
export async function createContentAttribution(
  contentType: 'question' | 'explanation' | 'image',
  contentId: string,
  sourceType: 'ai_generated' | 'curriculum_derived' | 'expert_created' | 'community',
  details: Record<string, any> = {},
  attributionText?: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_attributions')
      .insert({
        content_type: contentType,
        content_id: contentId,
        source_type: sourceType,
        source_details: details,
        license: 'OGL-3.0',
        attribution_text: attributionText || generateDefaultAttribution(sourceType),
      })

    if (error) {
      console.error('Failed to create attribution:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating attribution:', error)
    return false
  }
}

/**
 * Generate default attribution text
 * 
 * @param sourceType - Source type
 * @returns Attribution text
 */
function generateDefaultAttribution(
  sourceType: string
): string {
  switch (sourceType) {
    case 'ai_generated':
      return `Content generated using Claude AI (Anthropic) aligned with UK National Curriculum objectives. Licensed under OGL v3.0.`
    
    case 'curriculum_derived':
      return `Content derived from UK National Curriculum materials. Crown Copyright. Licensed under Open Government License v3.0.`
    
    case 'expert_created':
      return `Content created by education experts specifically for Ember Ascent. Licensed under OGL v3.0.`
    
    case 'community':
      return `Community-contributed content. Licensed under OGL v3.0.`
    
    default:
      return `Content licensed under Open Government License v3.0.`
  }
}

/**
 * Get provenance summary for transparency reporting
 * 
 * @param questionId - Question ID
 * @returns Summary object with key metrics
 */
export async function getProvenanceSummary(questionId: string): Promise<{
  totalEvents: number
  created: Date | null
  lastModified: Date | null
  reviewCount: number
  errorCount: number
  resolvedErrorCount: number
  scoreChanges: number
}> {
  try {
    const timeline = await getQuestionProvenance(questionId)

    const createdEvent = timeline.find((e) => e.eventType === 'created')
    const lastEvent = timeline[0] // Newest first

    return {
      totalEvents: timeline.length,
      created: createdEvent?.occurredAt || null,
      lastModified: lastEvent?.occurredAt || null,
      reviewCount: timeline.filter((e) => e.eventType === 'reviewed').length,
      errorCount: timeline.filter((e) => e.eventType === 'error_reported').length,
      resolvedErrorCount: timeline.filter((e) => e.eventType === 'error_resolved').length,
      scoreChanges: timeline.filter((e) => e.eventType === 'score_changed').length,
    }
  } catch (error) {
    console.error('Error generating provenance summary:', error)
    return {
      totalEvents: 0,
      created: null,
      lastModified: null,
      reviewCount: 0,
      errorCount: 0,
      resolvedErrorCount: 0,
      scoreChanges: 0,
    }
  }
}

/**
 * Format event data for display
 * 
 * @param event - Provenance event
 * @returns Formatted description string
 */
export function formatEventDescription(event: ProvenanceEvent): string {
  const data = event.eventData

  switch (event.eventType) {
    case 'created':
      return `Question created for ${data.subject} - ${data.topic}`
    
    case 'reviewed':
      return `Review status changed to ${data.new_status}`
    
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
      return `Error reported: ${data.report_type}`
    
    case 'error_resolved':
      return `Error ${data.resolution}: ${data.report_type}`
    
    case 'feedback_received':
      return `Feedback received: ${data.type}`
    
    default:
      return `Event: ${event.eventType}`
  }
}

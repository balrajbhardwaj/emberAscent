/**
 * Practice Session from Recommendation API
 * 
 * Creates a pre-configured practice session directly from a study recommendation.
 * This eliminates the need for manual session configuration when following
 * AI-generated study recommendations.
 * 
 * Features:
 * - Auto-selects questions based on recommended topics
 * - Applies difficulty appropriate to current accuracy
 * - Sets question count based on estimated time
 * - Creates "focus" mode session automatically
 * 
 * @module app/api/practice/session/from-recommendation/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectQuestions, QuestionCriteria } from '@/lib/questions/selector'
import { handleApiError, AuthError, ValidationError } from '@/lib/errors/apiErrors'

export const dynamic = 'force-dynamic'

// Support both legacy nested format and new flat format
interface LegacyRecommendationConfig {
  subject: string
  topics: string[]
  difficulty?: 'foundation' | 'standard' | 'challenge'
  estimatedMinutes: number
}

interface FlatRequestBody {
  childId: string
  subject: string
  topic?: string
  questionCount?: number
  difficulty?: 'Foundation' | 'Standard' | 'Challenge'
}

interface LegacyRequestBody {
  childId: string
  recommendation: LegacyRecommendationConfig
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new AuthError()
    }

    // Parse request body - support both formats
    const body = await request.json()
    
    // Normalize to common format
    let subject: string
    let topics: string[] = []
    let difficulty: 'foundation' | 'standard' | 'challenge' | undefined
    let questionCount: number
    
    if (body.recommendation) {
      // Legacy nested format
      const { childId, recommendation } = body as LegacyRequestBody
      if (!childId) throw new ValidationError('Child ID is required')
      if (!recommendation?.subject) throw new ValidationError('Recommendation configuration is required')
      
      subject = recommendation.subject
      topics = recommendation.topics || []
      difficulty = recommendation.difficulty
      // Calculate from estimatedMinutes
      const MINUTES_PER_QUESTION = 1.5
      questionCount = Math.max(5, Math.min(30, Math.round((recommendation.estimatedMinutes || 15) / MINUTES_PER_QUESTION)))
    } else {
      // New flat format from StudyRecommendationsCard
      const { childId, subject: subj, topic, questionCount: count, difficulty: diff } = body as FlatRequestBody
      if (!childId) throw new ValidationError('Child ID is required')
      if (!subj) throw new ValidationError('Subject is required')
      
      subject = subj
      topics = topic ? [topic] : []
      difficulty = diff?.toLowerCase() as 'foundation' | 'standard' | 'challenge' | undefined
      questionCount = count || 10
    }

    const childId = body.childId

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id, year_group')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      throw new ValidationError('Child not found')
    }

    if (child.parent_id !== user.id) {
      throw new AuthError('Access denied')
    }

    // Build question criteria
    const criteria: QuestionCriteria = {
      childId,
      sessionType: 'focus',
      count: questionCount,
      subject: subject === 'all' ? undefined : subject,
      topics: topics.length > 0 ? topics : undefined,
      // Apply difficulty filter if specified
      ...(difficulty && { difficulty })
    }

    console.log('[FROM-RECOMMENDATION] Creating session with criteria:', {
      childId,
      subject: criteria.subject,
      topics: criteria.topics,
      count: questionCount,
      difficulty
    })

    // Select questions
    const selectedQuestions = await selectQuestions(criteria)

    if (selectedQuestions.length === 0) {
      // Try without topic filter if no questions found
      if (criteria.topics) {
        console.log('[FROM-RECOMMENDATION] No questions with topics, trying subject only')
        const fallbackCriteria = { ...criteria, topics: undefined }
        const fallbackQuestions = await selectQuestions(fallbackCriteria)
        
        if (fallbackQuestions.length === 0) {
          return NextResponse.json(
            { error: 'No questions available for this recommendation' },
            { status: 404 }
          )
        }
        
        selectedQuestions.push(...fallbackQuestions)
      } else {
        return NextResponse.json(
          { error: 'No questions available for this recommendation' },
          { status: 404 }
        )
      }
    }

    // Create session record
    const { data: sessionData, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        child_id: childId,
        session_type: 'focus',
        total_questions: selectedQuestions.length,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError || !sessionData) {
      console.error('[FROM-RECOMMENDATION] Session creation failed:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create practice session' },
        { status: 500 }
      )
    }

    const sessionId = (sessionData as any).id

    console.log('[FROM-RECOMMENDATION] Session created:', {
      sessionId,
      questionCount: selectedQuestions.length,
      subject,
      topics
    })

    return NextResponse.json({
      success: true,
      sessionId,
      questionCount: selectedQuestions.length,
      redirect: `/practice/session/${sessionId}`,
      // Include question IDs for pre-loading on client
      questionIds: selectedQuestions.map(q => q.id)
    })

  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/practice/session/from-recommendation',
      context: { action: 'create_session_from_recommendation' }
    })
  }
}

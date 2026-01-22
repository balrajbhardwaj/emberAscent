/**
 * Performance Tracking API
 * 
 * POST /api/adaptive/performance
 * 
 * Records a question attempt and updates adaptive difficulty tracking.
 * Automatically adjusts difficulty based on performance.
 * 
 * Request Body:
 * {
 *   childId: string
 *   questionId: string
 *   topicId: string
 *   isCorrect: boolean
 *   timeSpentSeconds?: number
 *   sessionId?: string
 *   subtopicName?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   adjustment?: {
 *     currentDifficulty: string
 *     shouldAdjust: boolean
 *     recommendedDifficulty: string
 *     adjustmentReason: string
 *   }
 * }
 * 
 * @module app/api/adaptive/performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface PerformanceRequest {
  childId: string
  questionId: string
  topicId: string
  isCorrect: boolean
  timeSpentSeconds?: number
  sessionId?: string
  subtopicName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PerformanceRequest = await request.json()
    
    const { 
      childId, 
      questionId, 
      topicId, 
      isCorrect, 
      timeSpentSeconds,
      sessionId,
      subtopicName,
    } = body
    
    // Validate required fields
    if (!childId || !questionId || !topicId || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Get question difficulty for history tracking
    const { data: question } = await supabase
      .from('questions')
      .select('difficulty')
      .eq('id', questionId)
      .single()
    
    const difficultyAtAttempt = question?.difficulty || 'standard'
    
    // Record in child_question_history
    const { error: historyError } = await supabase
      .from('child_question_history')
      .insert({
        child_id: childId,
        question_id: questionId,
        difficulty_at_attempt: difficultyAtAttempt,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSeconds,
        session_id: sessionId,
        topic_id: topicId,
        subtopic_name: subtopicName,
        attempted_at: new Date().toISOString(),
      })
    
    if (historyError) {
      console.error('Error recording question history:', historyError)
      // Don't fail the request if history recording fails
    }
    
    // Update topic performance and get adjustment recommendation
    const { data: adjustment, error: performanceError } = await supabase
      .rpc('update_topic_performance', {
        p_child_id: childId,
        p_topic_id: topicId,
        p_is_correct: isCorrect,
        p_window_size: 5,
      })
      .single()
    
    if (performanceError) {
      console.error('Error updating performance:', performanceError)
      return NextResponse.json(
        { error: 'Failed to update performance' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      adjustment: {
        currentDifficulty: (adjustment as any).current_difficulty,
        shouldAdjust: (adjustment as any).should_adjust,
        recommendedDifficulty: (adjustment as any).recommended_difficulty,
        adjustmentReason: (adjustment as any).adjustment_reason,
      },
    })
  } catch (error) {
    console.error('Performance tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/adaptive/performance
 * 
 * Retrieves performance summary for a child and topic
 * 
 * Query Parameters:
 * - childId: Child's unique ID (required)
 * - topicId: Topic ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const topicId = searchParams.get('topicId')
    
    if (!childId || !topicId) {
      return NextResponse.json(
        { error: 'Missing required parameters: childId and topicId' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Get performance tracker
    const { data: tracker, error: trackerError } = await supabase
      .rpc('get_child_performance_tracker', {
        p_child_id: childId,
        p_topic_id: topicId,
      })
      .single()
    
    if (trackerError) {
      console.error('Error fetching performance:', trackerError)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      )
    }
    
    // Get mastery level
    const { data: masteryLevel, error: masteryError } = await supabase
      .rpc('get_topic_mastery_level', {
        p_child_id: childId,
        p_topic_id: topicId,
      })
      .single()
    
    if (masteryError) {
      console.error('Error fetching mastery level:', masteryError)
    }
    
    return NextResponse.json({
      performance: tracker,
      masteryLevel: masteryLevel || 'beginner',
    })
  } catch (error) {
    console.error('Performance retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

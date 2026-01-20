/**
 * Adaptive Question Selection API
 * 
 * GET /api/adaptive/next-question
 * 
 * Selects the next optimal question for a child based on:
 * - Current difficulty level (adaptive)
 * - Performance history
 * - Topic coverage
 * - Weak area focus
 * 
 * Query Parameters:
 * - childId: Child unique ID (required)
 * - topicId: Topic ID (required)
 * - sessionId: Practice session ID (optional, for excluding current session questions)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectNextQuestion } from '@/lib/adaptive/questionSelector'
import type { DifficultyLevel } from '@/types/adaptive'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const topicId = searchParams.get('topicId')
    const sessionId = searchParams.get('sessionId')
    
    // Validate required parameters
    if (!childId || !topicId) {
      return NextResponse.json(
        { error: 'Missing required parameters: childId and topicId' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Get current performance tracker
    const { data: tracker, error: trackerError } = await supabase
      .rpc('get_child_performance_tracker', {
        p_child_id: childId,
        p_topic_id: topicId,
      })
      .single()
    
    if (trackerError) {
      console.error('Error fetching performance tracker:', trackerError)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      )
    }
    
    // Get current difficulty or default to foundation
    const currentDifficulty: DifficultyLevel = 
      (tracker?.current_difficulty as DifficultyLevel) || 'foundation'
    
    // Get questions already attempted in this session (to exclude)
    const excludeQuestionIds: string[] = []
    
    if (sessionId) {
      const { data: sessionAttempts } = await supabase
        .from('child_question_history')
        .select('question_id')
        .eq('child_id', childId)
        .eq('session_id', sessionId)
      
      if (sessionAttempts) {
        excludeQuestionIds.push(...sessionAttempts.map((a: any) => a.question_id))
      }
    }
    
    // Select next question using adaptive algorithm
    const questionId = await selectNextQuestion({
      childId,
      topicId,
      currentDifficulty,
      excludeQuestionIds,
    })
    
    if (!questionId) {
      return NextResponse.json(
        { 
          error: 'No suitable questions available', 
          exhausted: true 
        },
        { status: 404 }
      )
    }
    
    // Fetch complete question data
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()
    
    if (questionError || !question) {
      console.error('Error fetching question:', questionError)
      return NextResponse.json(
        { error: 'Failed to fetch question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      question,
      adaptiveInfo: {
        currentDifficulty,
        recentAccuracy: tracker?.recent_accuracy || 0,
        totalAttempts: tracker?.total_questions_in_topic || 0,
        currentStreak: tracker?.current_streak || 0,
      },
    })
  } catch (error) {
    console.error('Adaptive question selection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

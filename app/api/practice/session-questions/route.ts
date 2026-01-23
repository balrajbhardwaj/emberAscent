/**
 * Session Questions API
 * 
 * GET /api/practice/session-questions
 * 
 * Selects questions for a practice session using the proper selector
 * that ensures:
 * - No duplicate questions (by ID or question_text)
 * - Balanced subject distribution (maths/english)
 * - Appropriate difficulty based on performance
 * - Avoids recently seen questions
 * 
 * Query Parameters:
 * - childId: Child unique ID (required)
 * - sessionType: 'quick' | 'focus' | 'mock' (required)
 * - subject: Subject filter (optional)
 * - count: Number of questions (optional, defaults based on session type)
 */

import { NextRequest, NextResponse } from 'next/server'
import { selectQuestions, QuestionCriteria } from '@/lib/questions/selector'
import { handleApiError } from '@/lib/errors/apiErrors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const sessionType = searchParams.get('sessionType') as 'quick' | 'focus' | 'mock'
    const subject = searchParams.get('subject')
    const countParam = searchParams.get('count')
    
    // Validate required parameters
    if (!childId || !sessionType) {
      return NextResponse.json(
        { error: 'Missing required parameters: childId and sessionType' },
        { status: 400 }
      )
    }
    
    // Validate session type
    if (!['quick', 'focus', 'mock'].includes(sessionType)) {
      return NextResponse.json(
        { error: 'Invalid sessionType. Must be quick, focus, or mock' },
        { status: 400 }
      )
    }
    
    // Determine question count based on session type
    const defaultCounts = { quick: 10, focus: 25, mock: 50 }
    const count = countParam ? parseInt(countParam, 10) : defaultCounts[sessionType]
    
    // Build question criteria
    const criteria: QuestionCriteria = {
      childId,
      sessionType,
      count,
    }
    
    // Add subject filter if specified and not 'mixed'
    if (subject && subject !== 'mixed') {
      criteria.subject = subject.toLowerCase()
    }
    
    // Select questions using the proper selector with deduplication
    const questions = await selectQuestions(criteria)
    
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this criteria', questions: [] },
        { status: 200 }
      )
    }
    
    return NextResponse.json({
      questions,
      count: questions.length,
      criteria: {
        sessionType,
        subject: subject || 'mixed',
        requestedCount: count,
      }
    })
    
  } catch (error) {
    console.error('[SESSION_QUESTIONS_API] Error:', error)
    return handleApiError(error)
  }
}

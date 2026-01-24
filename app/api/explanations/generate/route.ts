/**
 * API Route: Generate AI-Powered Explanations
 * 
 * Generates three types of explanations for practice questions:
 * - Step-by-step procedural breakdown
 * - Visual/conceptual illustration
 * - Worked example with similar problem
 * 
 * Security:
 * - Requires authentication (parent session)
 * - Rate limiting via Vercel/edge functions
 * - Input validation with Zod
 * 
 * @module app/api/explanations/generate/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExplanations, type QuestionContext } from '@/lib/claude/explanation-generator'
import { z } from 'zod'

/**
 * Request body validation schema
 */
const GenerateExplanationSchema = z.object({
  questionId: z.string(),
  // Optional: Allow direct context for testing
  questionText: z.string().optional(),
  correctAnswer: z.string().optional(),
  existingExplanation: z.array(z.string()).optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['Foundation', 'Standard', 'Challenge']).optional(),
})

/**
 * POST /api/explanations/generate
 * 
 * Generate AI explanations for a specific question
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = GenerateExplanationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { questionId, questionText, correctAnswer, existingExplanation, topic, difficulty } = validation.data

    console.log('🔍 Generating explanations for:', questionId)

    // Try to fetch question from database
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, subject, topic, question_text, correct_answer, difficulty, year_group, explanations')
      .eq('id', questionId)
      .single()

    // Use database question or test data
    let context: QuestionContext
    
    if (question && !questionError) {
      console.log('✅ Question found in database')
      context = {
        id: question.id,
        subject: question.subject,
        topic: question.topic || 'General',
        questionText: question.question_text,
        correctAnswer: question.correct_answer,
        difficulty: question.difficulty as 'Foundation' | 'Standard' | 'Challenge',
        yearGroup: question.year_group || 5,
        existingStepByStep: question.explanations?.step_by_step || null
      }
    } else if (questionText && correctAnswer) {
      console.log('⚠️ Using test data (question not in database)')
      context = {
        id: questionId,
        subject: 'Mathematics',
        topic: topic || 'General',
        questionText,
        correctAnswer,
        difficulty: difficulty || 'Foundation',
        yearGroup: 5,
        existingStepByStep: existingExplanation 
          ? (Array.isArray(existingExplanation) ? existingExplanation.join('\n') : existingExplanation)
          : null
      }
    } else {
      console.error('❌ Question not found and no test data provided')
      return NextResponse.json(
        { error: 'Question not found in database. Provide questionText and correctAnswer for testing.' },
        { status: 404 }
      )
    }

    // Generate explanations using Claude
    console.log('🤖 Calling Claude AI...')
    const result = await generateExplanations(context)

    if (!result.success) {
      console.error('❌ Explanation generation failed:', result.error)
      return NextResponse.json(
        { error: 'Failed to generate explanations', details: result.error },
        { status: 500 }
      )
    }

    console.log('✅ Explanations generated successfully')
    console.log('📊 Tokens used:', result.tokensUsed)

    // Optional: Store generated explanations in database for caching
    // This prevents repeated API calls for the same question
    // Only cache if question exists in database
    if (result.explanations && question) {
      console.log('💾 Caching explanations to database...')
      const updatedExplanations = {
        step_by_step: result.explanations.stepByStep,
        visual: result.explanations.visualIllustration,
        worked_example: result.explanations.workedExample
      }

      // Update question explanations (non-blocking)
      supabase
        .from('questions')
        .update({ explanations: updatedExplanations })
        .eq('id', questionId)
        .then(({ error }: { error: any }) => {
          if (error) {
            console.error('Failed to cache explanations:', error)
          } else {
            console.log('✅ Explanations cached')
          }
        })
    }

    // Return generated explanations
    return NextResponse.json({
      success: true,
      questionId,
      explanations: result.explanations,
      tokensUsed: result.tokensUsed
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/explanations/generate?questionId=...
 * 
 * Retrieve cached explanations or generate new ones
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get question ID from query params
    const searchParams = request.nextUrl.searchParams
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId query parameter required' },
        { status: 400 }
      )
    }

    // Fetch question with explanations
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, explanations')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if all explanation types exist
    const hasAllExplanations = 
      question.explanations?.step_by_step &&
      question.explanations?.visual &&
      question.explanations?.worked_example

    if (hasAllExplanations) {
      // Return cached explanations
      return NextResponse.json({
        success: true,
        questionId: question.id,
        explanations: {
          stepByStep: question.explanations.step_by_step,
          visualIllustration: question.explanations.visual,
          workedExample: question.explanations.worked_example
        },
        cached: true
      })
    } else {
      // Explanations incomplete - suggest using POST to generate
      return NextResponse.json({
        success: false,
        error: 'Explanations not available. Use POST to generate.',
        available: {
          stepByStep: !!question.explanations?.step_by_step,
          visualIllustration: !!question.explanations?.visual,
          workedExample: !!question.explanations?.worked_example
        }
      }, { status: 404 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * API Route: Question Validation
 * 
 * Validates AI-generated questions before database insertion.
 * Supports single question or batch validation.
 * 
 * Security:
 * - Admin-only endpoint (checked via RLS and auth)
 * - Validates input structure with Zod
 * - Stores results in question_validations table
 * 
 * @module app/api/validate/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  validateQuestion, 
  validateBatch,
  generateValidationReport,
  type MathQuestion 
} from '@/lib/validation'
import { z } from 'zod'

/**
 * Validation request schemas
 */
const SingleQuestionSchema = z.object({
  question: z.record(z.string(), z.any()) // MathQuestion schema - validated by validation pipeline
})

const BatchQuestionsSchema = z.object({
  questions: z.array(z.record(z.string(), z.any())).min(1).max(100) // Max 100 questions per batch
})

/**
 * POST /api/validate
 * 
 * Validate one or more math questions
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check - admin only
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Determine if single or batch validation
    if (body.question) {
      // Single question validation
      const validation = SingleQuestionSchema.safeParse(body)
      
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request format', details: validation.error.issues },
          { status: 400 }
        )
      }

      const result = await validateQuestion(body.question as MathQuestion)
      
      // Store validation result
      await supabase.from('question_validations').insert({
        question_id: result.question_id,
        passed: result.passed,
        checks: result.checks,
        errors: result.errors,
        warnings: result.warnings,
        auto_corrected: !!result.corrected_data,
        corrections_applied: result.corrected_data || null
      })

      return NextResponse.json({
        success: true,
        result
      })

    } else if (body.questions) {
      // Batch validation
      const validation = BatchQuestionsSchema.safeParse(body)
      
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request format', details: validation.error.issues },
          { status: 400 }
        )
      }

      const batchResult = await validateBatch(body.questions as MathQuestion[])
      
      // Store all validation results
      const validationRecords = []
      
      // Add failed validations to database
      for (const failed of batchResult.failed) {
        validationRecords.push({
          question_id: failed.question_id,
          passed: false,
          checks: failed.checks,
          errors: failed.errors,
          warnings: failed.warnings,
          auto_corrected: !!failed.corrected_data,
          corrections_applied: failed.corrected_data || null
        })
      }
      
      // Add passed validations (optional - can be filtered)
      for (const passed of batchResult.passed) {
        validationRecords.push({
          question_id: passed.question_id,
          passed: true,
          checks: [],
          errors: [],
          warnings: []
        })
      }

      if (validationRecords.length > 0) {
        await supabase.from('question_validations').insert(validationRecords)
      }

      // Generate report
      const report = generateValidationReport([
        ...batchResult.failed,
        ...batchResult.passed.map(q => ({
          question_id: q.question_id,
          passed: true,
          checks: [],
          errors: [],
          warnings: []
        }))
      ])

      return NextResponse.json({
        success: true,
        total: batchResult.total,
        passed: batchResult.passed.length,
        failed: batchResult.failed.length,
        auto_corrected: batchResult.auto_corrected,
        failed_details: batchResult.failed,
        report
      })

    } else {
      return NextResponse.json(
        { error: 'Request must include either "question" or "questions" field' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/validate?questionId=...
 * 
 * Retrieve validation history for a specific question
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check - admin only
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      // Get validation statistics
      const { data: stats, error: statsError } = await supabase
        .rpc('get_validation_stats')

      if (statsError) {
        throw statsError
      }

      return NextResponse.json({
        success: true,
        stats: stats[0] || {}
      })
    }

    // Get validation history for specific question
    const { data: history, error: historyError } = await supabase
      .from('question_validations')
      .select('*')
      .eq('question_id', questionId)
      .order('validation_run_at', { ascending: false })

    if (historyError) {
      throw historyError
    }

    return NextResponse.json({
      success: true,
      questionId,
      history
    })

  } catch (error) {
    console.error('Validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

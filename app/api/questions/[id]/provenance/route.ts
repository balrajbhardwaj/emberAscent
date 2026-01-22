/**
 * Question Provenance API Route
 * 
 * GET /api/questions/[id]/provenance
 * 
 * Returns the complete provenance timeline for a question.
 * Public endpoint - transparency is a core feature.
 * 
 * @module app/api/questions/[id]/provenance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getQuestionProvenance } from '@/lib/provenance/tracker'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    const timeline = await getQuestionProvenance(questionId)

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error('Error fetching provenance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch provenance data' },
      { status: 500 }
    )
  }
}

/**
 * Readiness Score API Route
 * 
 * GET /api/analytics/readiness?childId={childId}
 * 
 * Returns readiness score data with component breakdown.
 * Requires authentication and ownership verification.
 * 
 * @module app/api/analytics/readiness
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getReadinessScore } from '@/lib/analytics/aggregator'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json(
        { error: 'childId is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id, name')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    if (child.parent_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check subscription tier (readiness score is Ascent tier feature)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    
    if (tier === 'free') {
      // Return teaser for free tier
      return NextResponse.json({
        data: null,
        preview: true,
        message: 'Upgrade to Ascent to see your child\'s Readiness Score'
      })
    }

    // Fetch readiness score
    const data = await getReadinessScore(childId)

    if (!data) {
      return NextResponse.json({
        data: null,
        message: 'Not enough practice data to calculate readiness score'
      })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error in readiness API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

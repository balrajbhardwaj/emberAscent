/**
 * Study Plan API Endpoint
 * 
 * Returns personalized weekly study plan for a child.
 * Requires Ascent or Summit tier subscription.
 * 
 * @module app/api/analytics/study-plan/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklyPlan } from '@/lib/analytics/studyPlanGenerator'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const childId = searchParams.get('childId')

  if (!childId) {
    return NextResponse.json(
      { error: 'Child ID is required' },
      { status: 400 }
    )
  }

  // Verify child belongs to user
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('id, parent_id')
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

  // Check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const subscriptionTier = (profile as any)?.subscription_tier || 'free'
  
  if (subscriptionTier !== 'ascent' && subscriptionTier !== 'summit') {
    return NextResponse.json(
      { error: 'Premium subscription required', tier: subscriptionTier },
      { status: 403 }
    )
  }

  try {
    // Generate study plan
    const plan = await generateWeeklyPlan(childId)

    if (!plan) {
      return NextResponse.json(
        { error: 'Could not generate study plan' },
        { status: 500 }
      )
    }

    return NextResponse.json(plan)

  } catch (error) {
    console.error('Error generating study plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Comprehensive Analytics API Endpoint
 * 
 * Returns full analytics data for a child.
 * Requires Ascent or Summit tier subscription.
 * 
 * @module app/api/analytics/comprehensive/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getChildAnalytics, getDateRangeFromPreset } from '@/lib/analytics/aggregator'
import type { DateRangePreset } from '@/types/analytics'

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
  const range = searchParams.get('range') as DateRangePreset || 'last_30_days'

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
    // Get date range
    const dateRange = getDateRangeFromPreset(range)
    
    // Fetch analytics
    const analytics = await getChildAnalytics(childId, dateRange)

    if (!analytics) {
      return NextResponse.json(
        { error: 'Could not fetch analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

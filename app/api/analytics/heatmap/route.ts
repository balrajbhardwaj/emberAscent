/**
 * Weakness Heatmap API Route
 * 
 * GET /api/analytics/heatmap?childId={childId}
 * 
 * Returns heatmap data for the weakness visualization.
 * Requires authentication and ownership verification.
 * 
 * @module app/api/analytics/heatmap
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeaknessHeatmap } from '@/lib/analytics/aggregator'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
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

    // Check subscription tier (heatmap is Ascent tier feature)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    
    if (tier === 'free') {
      // Return limited preview data for free tier
      return NextResponse.json({
        data: null,
        preview: true,
        message: 'Upgrade to Ascent to access the full weakness heatmap'
      })
    }

    // Fetch heatmap data
    const data = await getWeaknessHeatmap(childId)
    console.log('[Heatmap API] Data fetched:', JSON.stringify(data, null, 2))

    if (!data) {
      console.log('[Heatmap API] No data returned')
      return NextResponse.json({
        data: null,
        message: 'No practice data available yet'
      })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error in heatmap API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

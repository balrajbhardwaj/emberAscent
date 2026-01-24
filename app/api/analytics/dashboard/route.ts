/**
 * Consolidated Analytics Dashboard API
 * 
 * Returns all pre-computed analytics data from database functions.
 * NO calculations done in API layer - all logic pushed to database.
 * 
 * @module app/api/analytics/dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, AuthError, NotFoundError } from '@/lib/errors/apiErrors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new AuthError()
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get('childId')
    const range = searchParams.get('range') || 'last_30_days'
    const days = parseInt(searchParams.get('days') || '30', 10)

    if (!childId) {
      return NextResponse.json(
        { error: 'Child ID is required' },
        { status: 400 }
      )
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id, year_group')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      throw new NotFoundError('Child not found')
    }

    if (child.parent_id !== user.id) {
      throw new AuthError('Access denied')
    }

    // Get subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const subscriptionTier = (profile as any)?.subscription_tier || 'free'
    const isAscent = subscriptionTier === 'ascent' || subscriptionTier === 'summit'

    // ============================================
    // FETCH ALL PRE-COMPUTED DATA FROM DATABASE
    // All calculations done in database functions
    // ============================================

    console.log('[DASHBOARD_API] Fetching analytics for child:', childId, 'days:', days)

    // 1. Comprehensive Analytics
    const { data: comprehensiveData, error: comprehensiveError } = await supabase
      .rpc('get_comprehensive_analytics', { p_child_id: childId, p_days: days })

    if (comprehensiveError) {
      console.error('[DASHBOARD_API] Comprehensive analytics failed:', comprehensiveError)
    }

    // 2. Readiness Score
    const { data: readinessData, error: readinessError } = await supabase
      .rpc('calculate_readiness_score_v2', { p_child_id: childId, p_days: days })

    if (readinessError) {
      console.error('[DASHBOARD_API] Readiness calculation failed:', readinessError)
    }

    // 3. Weakness Heatmap
    const { data: heatmapData, error: heatmapError } = await supabase
      .rpc('get_weakness_heatmap_v2', { p_child_id: childId, p_days: days })

    if (heatmapError) {
      console.error('[DASHBOARD_API] Heatmap generation failed:', heatmapError)
    }

    // 4. Learning Health
    const { data: learningHealthData, error: learningHealthError } = await supabase
      .rpc('calculate_learning_health_v2', { p_child_id: childId, p_days: days })

    if (learningHealthError) {
      console.error('[DASHBOARD_API] Learning health calculation failed:', learningHealthError)
    }

    // 5. Benchmarking (Ascent+ only)
    let benchmarkData = null
    if (isAscent) {
      const { data: benchmark, error: benchmarkError } = await supabase
        .rpc('calculate_benchmark_percentiles', { p_child_id: childId, p_days: days })

      if (benchmarkError) {
        console.error('[DASHBOARD_API] Benchmark calculation failed:', benchmarkError)
      } else {
        benchmarkData = benchmark
      }
    }

    console.log('[DASHBOARD_API] All functions completed successfully')

    // ============================================
    // RETURN CONSOLIDATED RESPONSE
    // Just pass through pre-computed data
    // ============================================
    const comprehensive = comprehensiveData || {
      totalQuestions: 0,
      accuracy: 0,
      subjects: 0,
      subjectBreakdown: [],
      difficultyBreakdown: []
    }

    const readiness = readinessData || {
      overallScore: 0,
      accuracyScore: 0,
      coverageScore: 0,
      consistencyScore: 0,
      speedScore: 0,
      improvementScore: 0
    }

    const heatmap = Array.isArray(heatmapData) ? heatmapData : []

    const learningHealth = learningHealthData || {
      rushFactor: 0,
      fatigueDropOff: 0,
      stagnantTopics: 0
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensive: {
          summary: {
            totalQuestionsAnswered: comprehensive.totalQuestions || 0,
            overallAccuracy: comprehensive.accuracy || 0,
          },
          subjectBreakdown: comprehensive.subjectBreakdown || [],
          difficultyBreakdown: comprehensive.difficultyBreakdown || [],
          topicBreakdown: heatmap.map((item: any) => ({
            topic: item.topic,
            subject: item.subject,
            total: item.total_attempts || 0,
            correct: item.correct_attempts || 0,
            accuracy: item.accuracy || 0,
          })),
        },
        readiness: {
          overallScore: Math.round(readiness.overallScore || 0),
          breakdown: {
            accuracy: Math.round(readiness.accuracyPercent || 0),
            coverage: Math.round(readiness.coveragePercent || 0),
            consistency: Math.round(readiness.consistencyPercent || 0),
          },
        },
        heatmap: {
          cells: heatmap,
        },
        benchmark: benchmarkData,
        learningHealth: {
          rushFactor: learningHealth.rushFactor || 0,
          fatigueDropOff: learningHealth.fatigueDropOff || 0,
          stagnantTopics: learningHealth.stagnantTopics || 0,
        },
        meta: {
          childId,
          range,
          days,
          timestamp: new Date().toISOString(),
        },
      },
    })

  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/analytics/dashboard',
      context: {
        childId: request.nextUrl.searchParams.get('childId'),
        range: request.nextUrl.searchParams.get('range'),
      },
    })
  }
}

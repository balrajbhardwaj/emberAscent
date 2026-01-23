/**
 * Learning Health Check API Route
 * 
 * Provides behavioral indicators that may affect exam performance:
 * - Rush Factor: Questions answered too quickly
 * - Fatigue Drop-off: Accuracy decline during sessions  
 * - Stagnant Topics: Topics with no improvement
 * 
 * Uses database functions for accurate calculations based on
 * time_taken_seconds and session patterns.
 * 
 * @module app/api/analytics/learning-health/route
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleApiError, AuthError, NotFoundError } from "@/lib/errors/apiErrors"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * GET /api/analytics/learning-health
 * 
 * Fetches learning health metrics for a child
 * 
 * Query params:
 * - childId: UUID of child (required)
 * - days: Number of days to analyze (default: 30)
 * 
 * @returns JSON with rushFactor, fatigueDropOff, stagnantTopics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")
    const days = parseInt(searchParams.get("days") || "30")

    // Validate childId
    if (!childId) {
      return NextResponse.json(
        { error: "childId is required" },
        { status: 400 }
      )
    }

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: "days must be between 1 and 365" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AuthError()
    }

    // Verify parent owns this child
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, parent_id, name")
      .eq("id", childId)
      .eq("parent_id", user.id)
      .single()

    if (childError || !child) {
      throw new NotFoundError("Child profile not found")
    }

    // Call the database function to get all metrics at once
    const { data: healthCheck, error: healthError } = await supabase
      .rpc("get_learning_health_check", {
        p_child_id: childId,
        p_days: days
      })

    if (healthError) {
      console.error("[Learning Health API] Database error:", healthError)
      return NextResponse.json(
        { error: "Failed to calculate learning health metrics" },
        { status: 500 }
      )
    }

    // Parse the JSON result from the function
    const metrics = typeof healthCheck === 'string' 
      ? JSON.parse(healthCheck) 
      : healthCheck

    // Return the metrics
    return NextResponse.json({
      success: true,
      data: {
        rushFactor: Number(metrics.rushFactor || 0),
        fatigueDropOff: Number(metrics.fatigueDropOff || 0),
        stagnantTopics: Number(metrics.stagnantTopics || 0),
        calculatedAt: metrics.calculatedAt,
      },
      meta: {
        childId,
        childName: child.name,
        daysAnalyzed: days,
      }
    })

  } catch (error) {
    return handleApiError(error, { endpoint: '/api/analytics/learning-health' })
  }
}

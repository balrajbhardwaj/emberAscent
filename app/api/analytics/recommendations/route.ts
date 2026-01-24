/**
 * Recommendation Interactions API
 * 
 * GET: Fetch recommendation stats for a child (attempt counts, dismissals)
 * POST: Record a new interaction (start, complete, dismiss)
 * 
 * @module app/api/analytics/recommendations
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Validation schemas
const getQuerySchema = z.object({
  childId: z.string().uuid("Invalid child ID"),
})

const postBodySchema = z.object({
  childId: z.string().uuid("Invalid child ID"),
  recommendationType: z.enum(["subject", "topic", "weakness", "challenge"]),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  difficulty: z.enum(["Foundation", "Standard", "Challenge"]).optional(),
  interactionType: z.enum(["started", "completed", "dismissed"]),
  sessionId: z.string().uuid().optional(),
  dismissedReason: z.string().optional(),
})

/**
 * GET /api/analytics/recommendations?childId=xxx
 * 
 * Returns recommendation interaction stats for a child
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse and validate query params
    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get("childId")
    
    const validation = getQuerySchema.safeParse({ childId })
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    // Verify parent owns this child
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, parent_id")
      .eq("id", validation.data.childId)
      .single()
    
    if (childError || !child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      )
    }
    
    if (child.parent_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }
    
    // Fetch recommendation interactions grouped by subject/topic
    const { data: interactions, error: interactionsError } = await supabase
      .from("recommendation_interactions")
      .select("*")
      .eq("child_id", validation.data.childId)
      .order("performed_at", { ascending: false })
    
    if (interactionsError) {
      console.error("Error fetching interactions:", interactionsError)
      return NextResponse.json(
        { error: "Failed to fetch recommendation data" },
        { status: 500 }
      )
    }
    
    // Process interactions into stats per subject/topic
    const statsMap = new Map<string, {
      subject: string
      topic: string | null
      startedCount: number
      completedCount: number
      lastAttempted: string | null
      isDismissed: boolean
      dismissedAt: string | null
      dismissedReason: string | null
    }>()
    
    for (const interaction of interactions || []) {
      const key = `${interaction.subject}:${interaction.topic || ""}`
      
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          subject: interaction.subject,
          topic: interaction.topic,
          startedCount: 0,
          completedCount: 0,
          lastAttempted: null,
          isDismissed: false,
          dismissedAt: null,
          dismissedReason: null,
        })
      }
      
      const stats = statsMap.get(key)!
      
      if (interaction.interaction_type === "started") {
        stats.startedCount++
        if (!stats.lastAttempted || interaction.performed_at > stats.lastAttempted) {
          stats.lastAttempted = interaction.performed_at
        }
      } else if (interaction.interaction_type === "completed") {
        stats.completedCount++
        if (!stats.lastAttempted || interaction.performed_at > stats.lastAttempted) {
          stats.lastAttempted = interaction.performed_at
        }
      } else if (interaction.interaction_type === "dismissed" && interaction.is_active) {
        stats.isDismissed = true
        stats.dismissedAt = interaction.performed_at
        stats.dismissedReason = interaction.dismissed_reason
      }
    }
    
    return NextResponse.json({
      stats: Array.from(statsMap.values()),
      totalInteractions: interactions?.length || 0,
    })
    
  } catch (error) {
    console.error("Recommendation stats error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/recommendations
 * 
 * Records a new recommendation interaction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse and validate body
    const body = await request.json()
    const validation = postBodySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    // Verify parent owns this child
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, parent_id")
      .eq("id", data.childId)
      .single()
    
    if (childError || !child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      )
    }
    
    if (child.parent_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }
    
    // Insert the interaction record
    const { data: interaction, error: insertError } = await supabase
      .from("recommendation_interactions")
      .insert({
        child_id: data.childId,
        recommendation_type: data.recommendationType,
        subject: data.subject,
        topic: data.topic || null,
        difficulty: data.difficulty || null,
        interaction_type: data.interactionType,
        session_id: data.sessionId || null,
        performed_by: user.id,
        dismissed_reason: data.dismissedReason || null,
        is_active: true,
      })
      .select()
      .single()
    
    if (insertError) {
      console.error("Error recording interaction:", insertError)
      return NextResponse.json(
        { error: "Failed to record interaction" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      interaction,
    })
    
  } catch (error) {
    console.error("Record interaction error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analytics/recommendations
 * 
 * Undoes a dismissal (reactivates a recommendation)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get("childId")
    const subject = searchParams.get("subject")
    const topic = searchParams.get("topic")
    
    if (!childId || !subject) {
      return NextResponse.json(
        { error: "childId and subject are required" },
        { status: 400 }
      )
    }
    
    // Verify parent owns this child
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id, parent_id")
      .eq("id", childId)
      .single()
    
    if (childError || !child || child.parent_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }
    
    // Soft-delete the dismissal by setting is_active = false
    let query = supabase
      .from("recommendation_interactions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("child_id", childId)
      .eq("subject", subject)
      .eq("interaction_type", "dismissed")
      .eq("is_active", true)
    
    if (topic) {
      query = query.eq("topic", topic)
    } else {
      query = query.is("topic", null)
    }
    
    const { error: updateError } = await query
    
    if (updateError) {
      console.error("Error undoing dismissal:", updateError)
      return NextResponse.json(
        { error: "Failed to undo dismissal" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Undo dismissal error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

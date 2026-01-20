/**
 * Quick Byte Server Actions
 * 
 * Handles submission and tracking of Quick Byte answers.
 * Creates a special session type for these bite-sized learning moments.
 * 
 * @module app/(dashboard)/practice/quick-byte/actions
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Check if Quick Byte was completed today
 * 
 * @param childId - Child ID to check
 * @returns Boolean indicating if completed today
 */
export async function hasCompletedQuickByteToday(childId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data } = await supabase
      .from("practice_sessions")
      .select("id")
      .eq("child_id", childId)
      .eq("session_type", "quick_byte")
      .not("completed_at", "is", null)
      .gte("created_at", today.toISOString())
      .limit(1)
    
    return (data?.length || 0) > 0
  } catch (error) {
    console.error("Error checking Quick Byte status:", error)
    return false
  }
}

/**
 * Create Quick Byte session
 * 
 * @param childId - Child ID
 * @param questionIds - Array of question IDs in the Quick Byte
 * @returns Session ID
 */
export async function createQuickByteSession(
  childId: string,
  questionIds: string[]
): Promise<string | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        child_id: childId,
        session_type: "quick_byte",
        subject: null, // Mixed subjects
        total_questions: questionIds.length,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error || !data) {
      console.error("Error creating Quick Byte session:", error)
      return null
    }
    
    return data.id
  } catch (error) {
    console.error("Error creating Quick Byte session:", error)
    return null
  }
}

/**
 * Submit Quick Byte answer
 * 
 * @param sessionId - Session ID
 * @param childId - Child ID
 * @param questionId - Question ID
 * @param answerId - Selected answer ID
 * @param correctAnswerId - Correct answer ID
 * @returns Success boolean
 */
export async function submitQuickByteAnswer(
  sessionId: string,
  childId: string,
  questionId: string,
  answerId: string,
  correctAnswerId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("question_attempts")
      .insert({
        session_id: sessionId,
        child_id: childId,
        question_id: questionId,
        selected_answer: answerId,
        is_correct: answerId === correctAnswerId,
        time_taken_seconds: 10, // Approximate for Quick Byte
      })
    
    if (error) {
      console.error("Error submitting Quick Byte answer:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Error submitting Quick Byte answer:", error)
    return false
  }
}

/**
 * Complete Quick Byte session
 * 
 * @param sessionId - Session ID
 * @returns Success boolean
 */
export async function completeQuickByteSession(sessionId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get attempts to calculate score
    const { data: attempts } = await supabase
      .from("question_attempts")
      .select("is_correct")
      .eq("session_id", sessionId)
    
    const correctCount = attempts?.filter((a) => a.is_correct).length || 0
    
    const { error } = await supabase
      .from("practice_sessions")
      .update({
        completed_at: new Date().toISOString(),
        correct_answers: correctCount,
      })
      .eq("id", sessionId)
    
    if (error) {
      console.error("Error completing Quick Byte session:", error)
      return false
    }
    
    // Revalidate practice page to show updated stats
    revalidatePath("/practice")
    
    return true
  } catch (error) {
    console.error("Error completing Quick Byte session:", error)
    return false
  }
}

/**
 * Child Profile Setup Actions
 * 
 * Server actions for onboarding new parents by creating their first child profile.
 * Called during the initial setup flow after account registration.
 * 
 * Features:
 * - Creates child profile linked to authenticated parent
 * - Validates child name, year group, and optional fields
 * - Ensures parent is authenticated before allowing creation
 * 
 * @module app/(auth)/setup/actions
 */
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/auth-helpers"
import { childSetupSchema } from "@/lib/validations/child"

export type ChildSetupActionResponse = {
  success: boolean
  error?: string
  message?: string
}

/**
 * Create initial child profile during onboarding
 * 
 * Creates the first child profile for a newly registered parent.
 * This is typically called from the /setup page after successful signup.
 * Requires an authenticated session.
 * 
 * @param formData - Form data containing:
 *   - name: Child's first name (2-50 chars)
 *   - yearGroup: UK year group (4, 5, or 6)
 *   - targetSchool: Optional target school name
 *   - avatarUrl: Optional avatar ID (emoji identifier)
 * 
 * @returns Promise resolving to ChildSetupActionResponse
 *   - success: true if child profile created
 *   - message: Success message with child's name
 *   - error: Error message if failed
 * 
 * @example
 * const formData = new FormData()
 * formData.append('name', 'Emma')
 * formData.append('yearGroup', '5')
 * formData.append('targetSchool', 'King Edward VI Grammar')
 * formData.append('avatarUrl', 'girl-1')
 * const result = await createInitialChild(formData)
 */
export async function createInitialChild(
  formData: FormData
): Promise<ChildSetupActionResponse> {
  try {
    // Get authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a child profile",
      }
    }

    // Extract and validate form data
    const rawData = {
      name: formData.get("name") as string,
      yearGroup: parseInt(formData.get("yearGroup") as string),
      targetSchool: formData.get("targetSchool") as string || undefined,
      avatarUrl: formData.get("avatarUrl") as string || undefined,
    }

    const validatedData = childSetupSchema.safeParse(rawData)

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const { name, yearGroup, targetSchool, avatarUrl } = validatedData.data

    const supabase = await createClient()

    // Create child record
    const { error: insertError } = await supabase.from("children").insert({
      parent_id: user.id,
      name,
      year_group: yearGroup,
      target_school: targetSchool || null,
      avatar_url: avatarUrl || null,
      is_active: true,
    } as any)

    if (insertError) {
      console.error("Child creation error:", insertError)
      return {
        success: false,
        error: "Failed to create child profile. Please try again.",
      }
    }

    revalidatePath("/", "layout")

    return {
      success: true,
      message: `${name}'s profile has been created!`,
    }
  } catch (error) {
    console.error("Create child error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

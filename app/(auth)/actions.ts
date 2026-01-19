/**
 * Authentication Server Actions
 * 
 * Handles all server-side authentication operations for Ember Ascent.
 * These actions are called from client components and run securely on the server.
 * 
 * Features:
 * - User registration with profile creation
 * - Email/password authentication
 * - Password reset via email
 * - Session management and redirects
 * 
 * Security:
 * - All inputs validated with Zod schemas
 * - Supabase Auth for secure credential handling
 * - Profile records created in sync with auth users
 * 
 * @module app/(auth)/actions
 */
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth"

// Response type for auth actions
export type AuthActionResponse = {
  success: boolean
  error?: string
  message?: string
}

/**
 * Sign up a new user
 * 
 * Creates a new user account with email/password authentication,
 * generates a profile record in the database, and sends a verification email.
 * 
 * @param formData - Form data containing:
 *   - fullName: User's full name (min 2 chars)
 *   - email: Valid email address
 *   - password: Password (min 8 chars, with uppercase, lowercase, number)
 *   - confirmPassword: Must match password
 * 
 * @returns Promise resolving to AuthActionResponse
 *   - success: true if account created
 *   - message: Success message to display
 *   - error: Error message if failed
 * 
 * @example
 * const formData = new FormData()
 * formData.append('fullName', 'John Smith')
 * formData.append('email', 'john@example.com')
 * formData.append('password', 'SecurePass123')
 * formData.append('confirmPassword', 'SecurePass123')
 * const result = await signUp(formData)
 */
export async function signUp(formData: FormData): Promise<AuthActionResponse> {
  try {
    // Extract and validate form data
    const rawData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validatedData = signUpSchema.safeParse(rawData)

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const { fullName, email, password } = validatedData.data

    const supabase = await createClient()

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    })

    if (signUpError) {
      return {
        success: false,
        error: signUpError.message,
      }
    }

    // Create profile record
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        subscription_tier: "free",
        subscription_status: "active",
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't return error to user as auth was successful
      }
    }

    revalidatePath("/", "layout")

    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Sign in an existing user
 * 
 * Authenticates user with email/password and creates a session.
 * On success, redirects to /practice (or /setup if no children exist).
 * 
 * @param formData - Form data containing:
 *   - email: User's email address
 *   - password: User's password
 * 
 * @returns Promise resolving to AuthActionResponse or redirect
 *   - Redirects to /practice on success
 *   - Returns error object if authentication fails
 * 
 * @throws {Error} Re-throws NEXT_REDIRECT errors for proper routing
 * 
 * @example
 * const formData = new FormData()
 * formData.append('email', 'john@example.com')
 * formData.append('password', 'SecurePass123')
 * await signIn(formData) // Redirects on success
 */
export async function signIn(formData: FormData): Promise<AuthActionResponse> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validatedData = signInSchema.safeParse(rawData)

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const { email, password } = validatedData.data

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    revalidatePath("/", "layout")
    redirect("/practice")
  } catch (error) {
    // If it's a redirect, re-throw it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    
    console.error("Sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Sign out the current user
 * 
 * Terminates the user's session and redirects to login page.
 * Clears all session cookies and revalidates the layout.
 * 
 * @returns Promise that resolves after redirect to /login
 * 
 * @example
 * <Button onClick={() => signOut()}>Log Out</Button>
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("Sign out error:", error)
  } finally {
    redirect("/login")
  }
}

/**
 * Send password reset email
 * 
 * Sends an email with a magic link to reset the user's password.
 * For security, returns success even if email doesn't exist in system.
 * 
 * @param formData - Form data containing:
 *   - email: Email address to send reset link to
 * 
 * @returns Promise resolving to AuthActionResponse
 *   - success: true if email sent (or account doesn't exist)
 *   - message: Success message to display
 *   - error: Error message if operation fails
 * 
 * @example
 * const formData = new FormData()
 * formData.append('email', 'john@example.com')
 * const result = await resetPassword(formData)
 */
export async function resetPassword(
  formData: FormData
): Promise<AuthActionResponse> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email") as string,
    }

    const validatedData = resetPasswordSchema.safeParse(rawData)

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const { email } = validatedData.data

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Update password after reset link is clicked
 * 
 * Updates the user's password after they click the reset link from email.
 * Requires a valid reset token in the session (handled by Supabase).
 * 
 * @param formData - Form data containing:
 *   - password: New password (min 8 chars, with uppercase, lowercase, number)
 *   - confirmPassword: Must match password
 * 
 * @returns Promise resolving to AuthActionResponse
 *   - success: true if password updated
 *   - message: Success message to display
 *   - error: Error message if operation fails
 * 
 * @example
 * const formData = new FormData()
 * formData.append('password', 'NewSecurePass123')
 * formData.append('confirmPassword', 'NewSecurePass123')
 * const result = await updatePassword(formData)
 */
export async function updatePassword(
  formData: FormData
): Promise<AuthActionResponse> {
  try {
    // Extract and validate form data
    const rawData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validatedData = updatePasswordSchema.safeParse(rawData)

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const { password } = validatedData.data

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/", "layout")

    return {
      success: true,
      message: "Password updated successfully!",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

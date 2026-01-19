/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating all authentication-related forms.
 * These ensure type safety and consistent validation across the app.
 * 
 * Schemas:
 * - emailSchema: Email address validation
 * - passwordSchema: Password requirements (8+ chars, mixed case, numbers)
 * - signUpSchema: User registration form
 * - signInSchema: Login form
 * - resetPasswordSchema: Password reset email form
 * - updatePasswordSchema: New password form after reset
 * 
 * @module lib/validations/auth
 */
import { z } from "zod"

// Email validation schema
export const emailSchema = z.string().email("Please enter a valid email address")

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  )

// Sign up schema
export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Update password schema
export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

/**
 * Child Profile Validation Schemas
 * 
 * Zod schemas for validating child profile creation and updates.
 * Ensures data integrity for learner accounts.
 * 
 * Validations:
 * - Name: 2-50 characters
 * - Year group: Must be 4, 5, or 6 (UK education system)
 * - Target school: Optional, max 100 characters
 * - Avatar: Optional string identifier
 * 
 * @module lib/validations/child
 */
import { z } from "zod"

// Year group validation
export const yearGroupSchema = z.number().int().min(4).max(6)

// Child setup schema
export const childSetupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  yearGroup: yearGroupSchema,
  targetSchool: z.string().max(100).optional(),
  avatarUrl: z.string().optional(),
})

// Type exports
export type ChildSetupInput = z.infer<typeof childSetupSchema>

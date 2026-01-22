/**
 * Standardized API Error Handling
 * 
 * Provides secure error handling for API routes that:
 * - Never exposes internal error details to clients
 * - Logs errors with internal codes for debugging
 * - Returns user-friendly error messages
 * - Follows UK GDPR and ICO Children's Code requirements
 * 
 * @module lib/errors/apiErrors
 */

import { NextResponse } from 'next/server'

/**
 * Custom application error class
 * 
 * Use this for expected errors with user-friendly messages
 */
export class AppError extends Error {
  constructor(
    public userMessage: string,
    public internalCode: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(userMessage)
    this.name = 'AppError'
  }
}

/**
 * Validation error - for invalid user input
 */
export class ValidationError extends AppError {
  constructor(userMessage: string, metadata?: Record<string, any>) {
    super(userMessage, 'VALIDATION_ERROR', 400, metadata)
    this.name = 'ValidationError'
  }
}

/**
 * Authentication error - for unauthorized access
 */
export class AuthError extends AppError {
  constructor(userMessage: string = 'Unauthorized access') {
    super(userMessage, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(userMessage: string = 'Resource not found') {
    super(userMessage, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Rate limit error - for too many requests
 */
export class RateLimitError extends AppError {
  constructor(userMessage: string = 'Too many requests. Please try again later.') {
    super(userMessage, 'RATE_LIMIT_EXCEEDED', 429)
    this.name = 'RateLimitError'
  }
}

/**
 * Standardized error response handler
 * 
 * NEVER exposes internal error details to clients
 * Logs errors securely without PII
 * 
 * @param error - The error to handle
 * @param context - Optional context for logging (no PII)
 * @returns NextResponse with appropriate error message
 * 
 * @example
 * try {
 *   // ... API logic
 * } catch (error) {
 *   return handleApiError(error, { endpoint: '/api/analytics' })
 * }
 */
export function handleApiError(
  error: unknown,
  context?: Record<string, any>
): NextResponse {
  // Handle known AppError instances
  if (error instanceof AppError) {
    // Log internal code and context (no PII)
    console.error(`[${error.internalCode}]`, {
      context,
      metadata: error.metadata,
      statusCode: error.statusCode,
    })
    
    return NextResponse.json(
      { error: error.userMessage },
      { status: error.statusCode }
    )
  }
  
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string }
    
    // Log error code only, not the message (may contain sensitive info)
    console.error('[SUPABASE_ERROR]', {
      code: supabaseError.code,
      context,
    })
    
    // Map common Supabase errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'PGRST116': 'Resource not found',
      '23505': 'This item already exists',
      '23503': 'Cannot delete this item because it is being used',
      '42P01': 'Database configuration error',
    }
    
    const userMessage = errorMap[supabaseError.code] || 'Unable to complete request. Please try again.'
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
  
  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    console.error('[VALIDATION_ERROR]', { context })
    return NextResponse.json(
      { error: 'Invalid request data. Please check your input.' },
      { status: 400 }
    )
  }
  
  // Unknown error - NEVER expose details
  console.error('[UNKNOWN_ERROR]', {
    type: error instanceof Error ? error.constructor.name : typeof error,
    context,
    // Log message in development only
    ...(process.env.NODE_ENV === 'development' && error instanceof Error
      ? { message: error.message }
      : {}),
  })
  
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}

/**
 * Async error wrapper for API route handlers
 * 
 * Automatically catches and handles errors
 * 
 * @param handler - The async route handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   // ... your API logic
 *   return NextResponse.json({ data })
 * })
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Rate Limiting Configuration
 * 
 * Simple in-memory rate limiting implementation for API protection.
 * For production with multiple instances, consider Redis-based solution.
 * 
 * @module lib/security/rateLimiter
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  requests: number
  windowMs: number // milliseconds
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (e.g., IP:path)
 * @param config - Rate limit configuration
 * @returns Rate limit check result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // No entry or expired entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    })
    return {
      success: true,
      remaining: config.requests - 1,
      resetTime,
    }
  }

  // Entry exists and is valid
  if (entry.count < config.requests) {
    entry.count++
    return {
      success: true,
      remaining: config.requests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  // Rate limit exceeded
  return {
    success: false,
    remaining: 0,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - strict limits
  '/api/auth': { requests: 5, windowMs: 60 * 1000 }, // 5 req/min
  
  // Practice endpoints - generous for active learning
  '/api/questions': { requests: 200, windowMs: 60 * 1000 }, // 200 req/min
  '/api/adaptive': { requests: 100, windowMs: 60 * 1000 }, // 100 req/min
  
  // Analytics endpoints - moderate limits
  '/api/analytics': { requests: 50, windowMs: 60 * 1000 }, // 50 req/min
  
  // Report endpoints - lower limits
  '/api/reports': { requests: 20, windowMs: 60 * 1000 }, // 20 req/min
  
  // Default for other API routes
  default: { requests: 100, windowMs: 60 * 1000 }, // 100 req/min
}

/**
 * Get rate limit config for a given path
 * 
 * @param path - Request path
 * @returns Rate limit configuration
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
  // Check for exact match first
  if (RATE_LIMITS[path]) {
    return RATE_LIMITS[path]
  }
  
  // Check for prefix match
  for (const [key, config] of Object.entries(RATE_LIMITS)) {
    if (key !== 'default' && path.startsWith(key)) {
      return config
    }
  }
  
  // Return default
  return RATE_LIMITS.default
}

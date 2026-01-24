/**
 * Claude AI Client Configuration
 * 
 * Provides a configured Anthropic client for generating explanations
 * and validating question content.
 * 
 * Security:
 * - API key stored in environment variable
 * - Never expose API key in client-side code
 * - Rate limiting handled by API routes
 * 
 * @module lib/claude/client
 */

import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not set!')
  console.error('📝 Add it to .env.local file in project root')
  console.error('🔑 Get your API key from: https://console.anthropic.com/')
  throw new Error(
    'ANTHROPIC_API_KEY environment variable is required. ' +
    'Add it to your .env.local file. Get your key from https://console.anthropic.com/'
  )
}

console.log('✅ ANTHROPIC_API_KEY is configured')

/**
 * Configured Anthropic client instance
 * Uses Claude Sonnet 4 model for optimal quality/cost balance
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Model constants for consistent usage across features
 */
export const CLAUDE_MODELS = {
  /** Latest Claude Sonnet 4 - Best for complex reasoning */
  SONNET_4: 'claude-sonnet-4-20250514',
  /** Claude Sonnet 3.5 - Good balance of speed and quality */
  SONNET_3_5: 'claude-3-5-sonnet-20241022',
  /** Claude Haiku - Fast and cost-effective for simple tasks */
  HAIKU: 'claude-3-haiku-20240307',
} as const

/**
 * Default model for educational content generation
 */
export const DEFAULT_MODEL = CLAUDE_MODELS.SONNET_4

/**
 * Token limits for different use cases
 */
export const TOKEN_LIMITS = {
  /** Explanation generation (up to 3 explanation types) */
  EXPLANATIONS: 2000,
  /** Question validation */
  VALIDATION: 4000,
  /** Question generation */
  GENERATION: 8000,
} as const

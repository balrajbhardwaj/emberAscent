/**
 * AI-Powered Explanation Generator
 * 
 * Generates three types of explanations for practice questions:
 * 1. Step-by-Step: Detailed procedural breakdown
 * 2. Visual Illustration: Conceptual/diagram-based explanation
 * 3. Worked Example: Similar problem with full solution
 * 
 * Uses existing step-by-step explanations as context when available
 * to ensure consistency and leverage existing content.
 * 
 * @module lib/claude/explanation-generator
 */

import { anthropic, DEFAULT_MODEL, TOKEN_LIMITS } from './client'
import { buildExplanationPrompt } from './prompt-templates'

/**
 * Question data required for explanation generation
 */
export interface QuestionContext {
  id: string
  subject: string
  topic: string
  questionText: string
  correctAnswer: string
  difficulty: 'Foundation' | 'Standard' | 'Challenge'
  yearGroup: number
  existingStepByStep?: string | null
}

/**
 * Generated explanation types
 */
export interface GeneratedExplanations {
  stepByStep: string
  visualIllustration: string
  workedExample: string
}

/**
 * Result of explanation generation request
 */
export interface ExplanationGenerationResult {
  success: boolean
  explanations?: GeneratedExplanations
  error?: string
  tokensUsed?: number
}

/**
 * Generate all three explanation types for a question
 * Uses prompt template factory for consistent, high-quality prompts
 * 
 * @param context - Question context and metadata
 * @returns Generated explanations or error
 */
export async function generateExplanations(
  context: QuestionContext
): Promise<ExplanationGenerationResult> {
  try {
    // Use template factory to build optimized prompt
    const prompt = buildExplanationPrompt(context)
    
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: TOKEN_LIMITS.EXPLANATIONS,
      temperature: 0.7, // Slightly creative but consistent
      system: EXPLANATION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        error: 'No text content in Claude response'
      }
    }

    // Parse JSON response
    const parsed = parseExplanationResponse(textContent.text)
    if (!parsed) {
      return {
        success: false,
        error: 'Failed to parse Claude response as valid JSON'
      }
    }

    return {
      success: true,
      explanations: parsed,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    }

  } catch (error) {
    console.error('Explanation generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * System prompt defining Claude's role and constraints
 */
const EXPLANATION_SYSTEM_PROMPT = `You are an expert UK primary school tutor specializing in 11+ exam preparation.

Your task is to generate three different types of explanations for educational questions following EXACT formatting requirements.

**Guidelines:**
- Write for children aged 7-11 (UK Year 3-6)
- Use age-appropriate, encouraging language
- Follow the formatting templates precisely
- Output ONLY valid JSON (no markdown, no extra text)

**Quality Standards:**
- Step-by-Step: Clear numbered steps showing all work
- Visual Illustration: MUST be actual visual diagram with emojis/ASCII, NOT text description
- Worked Example: Similar problem with color-coded parts for pattern recognition

Be creative with visuals but maintain consistency for similar question types.`

// NOTE: buildExplanationPrompt is now imported from prompt-templates.ts
// This provides consistent, topic-specific prompts via template factory

/**
 * Parse and validate Claude's JSON response
 */
function parseExplanationResponse(text: string): GeneratedExplanations | null {
  try {
    // Remove potential markdown code block markers
    const cleaned = text
      .replace(/^```json\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Validate structure
    if (
      typeof parsed.stepByStep === 'string' &&
      typeof parsed.visualIllustration === 'string' &&
      typeof parsed.workedExample === 'string' &&
      parsed.stepByStep.length > 0 &&
      parsed.visualIllustration.length > 0 &&
      parsed.workedExample.length > 0
    ) {
      return {
        stepByStep: parsed.stepByStep,
        visualIllustration: parsed.visualIllustration,
        workedExample: parsed.workedExample
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Generate single explanation type (for partial regeneration)
 * 
 * @param context - Question context
 * @param type - Which explanation type to generate
 * @returns Generated explanation text
 */
export async function generateSingleExplanation(
  context: QuestionContext,
  type: 'stepByStep' | 'visualIllustration' | 'workedExample'
): Promise<{ success: boolean; explanation?: string; error?: string }> {
  try {
    const typeDescriptions = {
      stepByStep: 'a step-by-step procedural explanation',
      visualIllustration: 'a visual/conceptual explanation with analogies',
      workedExample: 'a worked example with a similar problem'
    }

    const prompt = `${buildExplanationPrompt(context)}

Generate ONLY ${typeDescriptions[type]}.
Return a plain text explanation (no JSON, no formatting).`

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: TOKEN_LIMITS.EXPLANATIONS / 3,
      temperature: 0.7,
      system: EXPLANATION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        error: 'No text content in response'
      }
    }

    return {
      success: true,
      explanation: textContent.text.trim()
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

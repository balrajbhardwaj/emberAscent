/**
 * Arithmetic Validator (Layer 2)
 * 
 * Validates computational accuracy of math questions by:
 * - Evaluating expressions using mathjs
 * - Comparing computed results with expected results
 * - Verifying display answer matches computation
 * 
 * @module lib/validation/validators/arithmetic
 */

import { create, all, type MathNumericType } from 'mathjs'
import type { MathQuestion, CheckResult } from '../types/question'

const math = create(all)

/**
 * Validate arithmetic computation for a math question
 * 
 * @param question - Math question to validate
 * @returns Array of check results
 */
export function validateArithmetic(question: MathQuestion): CheckResult[] {
  const results: CheckResult[] = []
  const { computational_verification, computed_answer, answer_format } = question
  
  if (!computational_verification?.expression) {
    results.push({
      check_name: 'has_verification_expression',
      passed: false,
      details: 'No computational_verification.expression provided',
      severity: 'error'
    })
    return results
  }
  
  try {
    // Evaluate the expression
    const computed = math.evaluate(computational_verification.expression)
    const expectedFromClaude = parseExpectedResult(
      computational_verification.expected_result,
      computational_verification.result_format
    )
    
    // Check if our computation matches Claude's expected result
    const computationMatches = compareResults(computed, expectedFromClaude as MathNumericType, computational_verification.result_format)
    
    results.push({
      check_name: 'computation_verification',
      passed: computationMatches,
      details: computationMatches
        ? `Expression "${computational_verification.expression}" = ${computed} ✓`
        : `Expression "${computational_verification.expression}" = ${computed}, but Claude expected ${expectedFromClaude}`,
      severity: 'critical'
    })
    
    // Check if computed result matches the display answer (accounting for format)
    const displayAnswer = parseDisplayAnswer(computed_answer, answer_format)
    const displayMatches = compareResults(computed, displayAnswer as MathNumericType, answer_format)
    
    results.push({
      check_name: 'display_answer_verification',
      passed: displayMatches,
      details: displayMatches
        ? `Computed result matches displayed answer "${computed_answer}"`
        : `Computed ${computed} but displayed answer is "${computed_answer}"`,
      severity: 'critical'
    })
    
  } catch (error) {
    results.push({
      check_name: 'computation_execution',
      passed: false,
      details: `Failed to evaluate expression: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'critical'
    })
  }
  
  return results
}

/**
 * Parse expected result from Claude's response
 */
function parseExpectedResult(result: string, format: string): number | object {
  // Handle different formats
  if (format === 'fraction') {
    // Parse "Fraction(8, 7)" or "8/7"
    const fractionMatch = result.match(/Fraction\((\d+),\s*(\d+)\)/)
    if (fractionMatch) {
      return math.fraction(parseInt(fractionMatch[1]), parseInt(fractionMatch[2]))
    }
    const simpleMatch = result.match(/(-?\d+)\/(\d+)/)
    if (simpleMatch) {
      return math.fraction(parseInt(simpleMatch[1]), parseInt(simpleMatch[2]))
    }
  }
  return parseFloat(result)
}

/**
 * Parse display answer based on format
 */
function parseDisplayAnswer(answer: string, format: string): number | object {
  switch (format) {
    case 'mixed_number':
    case 'mixed_number_unsimplified': {
      // Parse "1 5/35" -> improper fraction
      const mixedMatch = answer.match(/(-?\d+)\s+(\d+)\/(\d+)/)
      if (mixedMatch) {
        const whole = parseInt(mixedMatch[1])
        const num = parseInt(mixedMatch[2])
        const den = parseInt(mixedMatch[3])
        return math.fraction(whole * den + num, den)
      }
      break
    }
    case 'fraction': {
      const fracMatch = answer.match(/(-?\d+)\/(\d+)/)
      if (fracMatch) {
        return math.fraction(parseInt(fracMatch[1]), parseInt(fracMatch[2]))
      }
      break
    }
    case 'percentage': {
      return parseFloat(answer.replace('%', ''))
    }
    default: {
      return parseFloat(answer)
    }
  }
  return parseFloat(answer)
}

/**
 * Compare two results accounting for type and precision
 */
function compareResults(a: MathNumericType, b: MathNumericType, _format?: string): boolean {
  try {
    // Handle fraction comparison
    if (isFraction(a) && isFraction(b)) {
      return Boolean(math.equal(a, b))
    }
    
    // Handle numeric comparison with tolerance for floating point
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) < 0.0001
    }
    
    // Generic mathjs equality
    return Boolean(math.equal(a, b))
  } catch {
    return false
  }
}

/**
 * Type guard to check if value is a Fraction
 */
function isFraction(value: unknown): boolean {
  return value !== null && 
         typeof value === 'object' && 
         'n' in value && 
         'd' in value
}

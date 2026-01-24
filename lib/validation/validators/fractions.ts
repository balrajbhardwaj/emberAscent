/**
 * Fraction Validator (Layer 2)
 * 
 * Validates fraction-specific operations:
 * - Mixed number conversions (improper ↔ mixed)
 * - Simplification status
 * - Fraction format correctness
 * 
 * @module lib/validation/validators/fractions
 */

import type { MathQuestion, CheckResult } from '../types/question'

/**
 * Validate fraction operations and formats
 * 
 * @param question - Math question to validate
 * @returns Array of check results
 */
export function validateFractions(question: MathQuestion): CheckResult[] {
  const results: CheckResult[] = []
  
  // Only validate if this is a fraction question
  if (!['fraction', 'mixed_number', 'mixed_number_unsimplified'].includes(question.answer_format)) {
    return results
  }
  
  const { working, computed_answer, answer_format } = question
  
  // Parse the computed_result from working
  const computedResultStr = working.computed_result
  
  // Validate the conversion from improper to mixed (if applicable)
  if (answer_format.includes('mixed_number')) {
    const conversionCheck = validateMixedNumberConversion(computedResultStr, computed_answer)
    results.push(conversionCheck)
  }
  
  // Check simplification status
  if (answer_format === 'mixed_number_unsimplified') {
    const simplificationCheck = validateUnsimplified(computed_answer)
    results.push(simplificationCheck)
  } else if (answer_format === 'fraction' || answer_format === 'mixed_number') {
    // Should be simplified
    const simplificationCheck = validateSimplified(computed_answer)
    results.push(simplificationCheck)
  }
  
  return results
}

/**
 * Validate conversion from improper fraction to mixed number
 */
function validateMixedNumberConversion(computed: string, displayed: string): CheckResult {
  // Parse mixed number: "1 5/35"
  const mixedMatch = displayed.match(/(-?\d+)\s+(\d+)\/(\d+)/)
  
  if (!mixedMatch) {
    return {
      check_name: 'mixed_number_format',
      passed: false,
      details: `Cannot parse mixed number format: "${displayed}"`,
      severity: 'error'
    }
  }
  
  const whole = parseInt(mixedMatch[1])
  const numerator = parseInt(mixedMatch[2])
  const denominator = parseInt(mixedMatch[3])
  
  // Verify: whole * denominator + numerator should give the original improper numerator
  // Parse the improper fraction from computed (e.g., "40/35")
  const improperMatch = computed.match(/(\d+)\/(\d+)/)
  
  if (improperMatch) {
    const originalNum = parseInt(improperMatch[1])
    const originalDen = parseInt(improperMatch[2])
    
    const reconstructed = whole * denominator + numerator
    const valid = reconstructed === originalNum && denominator === originalDen
    
    return {
      check_name: 'mixed_number_conversion',
      passed: valid,
      details: valid
        ? `${computed} correctly converts to ${displayed}`
        : `Conversion error: ${computed} should be ${Math.floor(originalNum/originalDen)} ${originalNum % originalDen}/${originalDen}, got ${displayed}`,
      severity: 'critical'
    }
  }
  
  return {
    check_name: 'mixed_number_conversion',
    passed: true,
    details: 'Could not fully verify conversion, format appears correct',
    severity: 'warning'
  }
}

/**
 * Validate that fraction is NOT simplified (for unsimplified questions)
 */
function validateUnsimplified(answer: string): CheckResult {
  // Check that the fraction part could be simplified (confirming it's intentionally unsimplified)
  const match = answer.match(/(\d+)\/(\d+)/)
  
  if (!match) {
    return {
      check_name: 'simplification_status',
      passed: true,
      details: 'No fraction component to check',
      severity: 'warning'
    }
  }
  
  const num = parseInt(match[1])
  const den = parseInt(match[2])
  const gcd = greatestCommonDivisor(num, den)
  
  return {
    check_name: 'simplification_status',
    passed: true, // Not an error, just informational
    details: gcd > 1 
      ? `Fraction ${num}/${den} is unsimplified (GCD=${gcd}), as expected for this format`
      : `Fraction ${num}/${den} is already in simplest form (might not be intentional for unsimplified format)`,
    severity: gcd > 1 ? 'warning' : 'warning'
  }
}

/**
 * Validate that fraction IS simplified (for standard fraction questions)
 */
function validateSimplified(answer: string): CheckResult {
  // Parse fraction from answer (could be "3/4" or "1 3/4")
  const fracMatch = answer.match(/(\d+)\/(\d+)/)
  
  if (!fracMatch) {
    return {
      check_name: 'simplification_status',
      passed: true,
      details: 'No fraction to check',
      severity: 'warning'
    }
  }
  
  const num = parseInt(fracMatch[1])
  const den = parseInt(fracMatch[2])
  const gcd = greatestCommonDivisor(num, den)
  
  return {
    check_name: 'simplification_status',
    passed: gcd === 1,
    details: gcd === 1
      ? `Fraction ${num}/${den} is properly simplified`
      : `Fraction ${num}/${den} can be simplified further (GCD=${gcd}). Should be ${num/gcd}/${den/gcd}`,
    severity: gcd === 1 ? 'warning' : 'error'
  }
}

/**
 * Calculate greatest common divisor using Euclidean algorithm
 */
function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

/**
 * Simplify a fraction to lowest terms
 */
export function simplifyFraction(numerator: number, denominator: number): { num: number; den: number } {
  const gcd = greatestCommonDivisor(numerator, denominator)
  return {
    num: numerator / gcd,
    den: denominator / gcd
  }
}

/**
 * Convert improper fraction to mixed number
 */
export function toMixedNumber(numerator: number, denominator: number): {
  whole: number
  num: number
  den: number
} {
  const whole = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  
  return {
    whole,
    num: remainder,
    den: denominator
  }
}

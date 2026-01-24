/**
 * Consistency Validator (Layer 3)
 * 
 * Validates that Claude's self-verification is accurate by checking:
 * - Computed answer exists in options
 * - Correct option points to computed answer
 * - No duplicate options
 * - Self-verification status matches actual state
 * 
 * @module lib/validation/validators/consistency
 */

import type { MathQuestion, CheckResult } from '../types/question'

/**
 * Validate question consistency between answer, options, and correct_option
 * 
 * @param question - Math question to validate
 * @returns Array of check results
 */
export function validateConsistency(question: MathQuestion): CheckResult[] {
  const results: CheckResult[] = []
  
  // Check 1: computed_answer exists in options
  const optionValues = Object.values(question.options)
  const answerInOptions = optionValues.some(
    value => normalizeAnswer(value) === normalizeAnswer(question.computed_answer)
  )
  
  results.push({
    check_name: 'answer_exists_in_options',
    passed: answerInOptions,
    details: answerInOptions 
      ? `Computed answer "${question.computed_answer}" found in options`
      : `Computed answer "${question.computed_answer}" NOT found in options: [${optionValues.join(', ')}]`,
    severity: 'critical'
  })
  
  // Check 2: correct_option points to computed_answer
  const selectedOptionValue = question.options[question.correct_option]
  const optionMatchesAnswer = normalizeAnswer(selectedOptionValue) === normalizeAnswer(question.computed_answer)
  
  results.push({
    check_name: 'correct_option_matches_computed',
    passed: optionMatchesAnswer,
    details: optionMatchesAnswer
      ? `Option ${question.correct_option} ("${selectedOptionValue}") matches computed answer`
      : `MISMATCH: Option ${question.correct_option} is "${selectedOptionValue}" but computed answer is "${question.computed_answer}"`,
    severity: 'critical'
  })
  
  // Check 3: If answer is in options but wrong option selected, find correct option
  if (answerInOptions && !optionMatchesAnswer) {
    const correctOptionKey = Object.entries(question.options)
      .find(([_, value]) => normalizeAnswer(value) === normalizeAnswer(question.computed_answer))?.[0] as 'a' | 'b' | 'c' | 'd' | 'e' | undefined
    
    if (correctOptionKey) {
      results.push({
        check_name: 'suggested_correction',
        passed: false,
        details: `correct_option should be "${correctOptionKey}" not "${question.correct_option}"`,
        severity: 'error'
      })
    }
  }
  
  // Check 4: Self-verification status
  const selfVerificationValid = question.verification.verification_status === 'VERIFIED'
  
  results.push({
    check_name: 'self_verification_status',
    passed: selfVerificationValid,
    details: selfVerificationValid
      ? 'Claude self-verification passed'
      : `Claude self-reported: ${question.verification.verification_status}`,
    severity: selfVerificationValid ? 'warning' : 'error'
  })
  
  // Check 5: No duplicate options
  const normalizedOptions = optionValues.map(normalizeAnswer)
  const uniqueOptions = new Set(normalizedOptions)
  const noDuplicates = uniqueOptions.size === optionValues.length
  
  results.push({
    check_name: 'no_duplicate_options',
    passed: noDuplicates,
    details: noDuplicates
      ? 'All options are unique'
      : `Duplicate options detected: ${findDuplicates(normalizedOptions).join(', ')}`,
    severity: 'error'
  })
  
  // Check 6: All required fields present
  const hasRequiredFields = !!(
    question.question_id &&
    question.subject &&
    question.topic &&
    question.question_text &&
    question.computed_answer &&
    question.correct_option &&
    Object.keys(question.options).length === 5
  )
  
  results.push({
    check_name: 'required_fields_present',
    passed: hasRequiredFields,
    details: hasRequiredFields
      ? 'All required fields present'
      : 'Missing required fields',
    severity: 'critical'
  })
  
  return results
}

/**
 * Normalize answer string for comparison
 * Handles whitespace, case, and common formatting variations
 */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    // Normalize fractions: "1 5/35" and "1  5/35" should match
    .replace(/(\d+)\s+(\d+\/\d+)/g, '$1 $2')
    // Normalize decimals: remove trailing zeros
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '')
}

/**
 * Find duplicate values in an array
 */
function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item)
    }
    seen.add(item)
  }
  
  return Array.from(duplicates)
}

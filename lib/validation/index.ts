/**
 * Validation Pipeline Orchestrator
 * 
 * Coordinates all validation layers:
 * - Layer 3: Consistency validation (answer-option matching)
 * - Layer 2: Computational validation (arithmetic, fractions)
 * 
 * Aggregates results, attempts auto-corrections, and provides
 * comprehensive validation reports.
 * 
 * @module lib/validation
 */

import type { 
  MathQuestion, 
  ValidationResult, 
  CheckResult, 
  ValidationError,
  BatchValidationResult 
} from './types/question'
import { validateConsistency } from './validators/consistency'
import { validateArithmetic } from './validators/arithmetic'
import { validateFractions } from './validators/fractions'

/**
 * Validate a single math question through all validation layers
 * 
 * @param question - Math question to validate
 * @returns Comprehensive validation result
 */
export async function validateQuestion(question: MathQuestion): Promise<ValidationResult> {
  const allChecks: CheckResult[] = []
  const errors: ValidationError[] = []
  
  // Layer 3: Consistency checks (always run)
  const consistencyChecks = validateConsistency(question)
  allChecks.push(...consistencyChecks)
  
  // Layer 2: Computational verification (for mathematics questions)
  if (question.subject === 'Mathematics') {
    const arithmeticChecks = validateArithmetic(question)
    allChecks.push(...arithmeticChecks)
    
    const fractionChecks = validateFractions(question)
    allChecks.push(...fractionChecks)
  }
  
  // Aggregate results
  const criticalFailures = allChecks.filter(c => !c.passed && c.severity === 'critical')
  const errorFailures = allChecks.filter(c => !c.passed && c.severity === 'error')
  
  // Convert failures to error objects
  for (const failure of [...criticalFailures, ...errorFailures]) {
    errors.push({
      code: failure.check_name.toUpperCase(),
      message: failure.details,
      field: mapCheckToField(failure.check_name),
      auto_fixable: isAutoFixable(failure),
      suggested_fix: extractSuggestedFix(failure)
    })
  }
  
  // Attempt auto-correction for fixable errors
  let correctedData: Partial<MathQuestion> | undefined
  if (errors.some(e => e.auto_fixable)) {
    correctedData = attemptAutoCorrection(question, errors)
  }
  
  return {
    question_id: question.question_id,
    passed: criticalFailures.length === 0 && errorFailures.length === 0,
    checks: allChecks,
    errors,
    warnings: allChecks
      .filter(c => !c.passed && c.severity === 'warning')
      .map(c => ({ code: c.check_name, message: c.details })),
    corrected_data: correctedData
  }
}

/**
 * Map check name to field name
 */
function mapCheckToField(checkName: string): string {
  const mapping: Record<string, string> = {
    'answer_exists_in_options': 'options',
    'correct_option_matches_computed': 'correct_option',
    'computation_verification': 'computational_verification.expression',
    'display_answer_verification': 'computed_answer',
    'mixed_number_conversion': 'computed_answer',
    'required_fields_present': 'multiple',
    'has_verification_expression': 'computational_verification'
  }
  return mapping[checkName] || checkName
}

/**
 * Determine if a check failure can be auto-fixed
 */
function isAutoFixable(check: CheckResult): boolean {
  // Option mismatch is auto-fixable if we can find the correct option
  return check.check_name === 'suggested_correction' ||
         (check.check_name === 'correct_option_matches_computed' && 
          check.details.includes('should be'))
}

/**
 * Extract suggested fix from check details
 */
function extractSuggestedFix(check: CheckResult): string | undefined {
  const match = check.details.match(/should be "([a-e])"/)
  return match ? `Set correct_option to "${match[1]}"` : undefined
}

/**
 * Attempt to auto-correct fixable errors
 */
function attemptAutoCorrection(
  question: MathQuestion, 
  errors: ValidationError[]
): Partial<MathQuestion> | undefined {
  const corrections: Partial<MathQuestion> = {}
  
  for (const error of errors) {
    if (error.auto_fixable && error.field === 'correct_option') {
      // Find the correct option by matching computed_answer
      const correctKey = Object.entries(question.options)
        .find(([_, value]) => 
          normalizeForComparison(value) === normalizeForComparison(question.computed_answer)
        )?.[0] as 'a' | 'b' | 'c' | 'd' | 'e' | undefined
      
      if (correctKey) {
        corrections.correct_option = correctKey
      }
    }
  }
  
  return Object.keys(corrections).length > 0 ? corrections : undefined
}

/**
 * Normalize strings for comparison
 */
function normalizeForComparison(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Validate multiple questions in batch
 * 
 * @param questions - Array of math questions to validate
 * @returns Batch validation results with passed/failed breakdown
 */
export async function validateBatch(
  questions: MathQuestion[]
): Promise<BatchValidationResult> {
  const passed: MathQuestion[] = []
  const failed: ValidationResult[] = []
  let autoCorrectedCount = 0
  
  for (const question of questions) {
    const result = await validateQuestion(question)
    
    if (result.passed) {
      passed.push(question)
    } else if (result.corrected_data) {
      // Apply auto-corrections and add to passed
      const corrected = { ...question, ...result.corrected_data }
      passed.push(corrected)
      autoCorrectedCount++
    } else {
      failed.push(result)
    }
  }
  
  return {
    total: questions.length,
    passed,
    failed,
    auto_corrected: autoCorrectedCount
  }
}

/**
 * Generate validation summary report
 * 
 * @param results - Array of validation results
 * @returns Human-readable summary
 */
export function generateValidationReport(results: ValidationResult[]): string {
  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = total - passed
  const autoCorrected = results.filter(r => r.corrected_data).length
  
  const lines = [
    `Validation Report`,
    `================`,
    `Total Questions: ${total}`,
    `Passed: ${passed} (${Math.round(passed/total*100)}%)`,
    `Failed: ${failed} (${Math.round(failed/total*100)}%)`,
    `Auto-Corrected: ${autoCorrected}`,
    ``,
    `Failed Questions:`
  ]
  
  for (const result of results.filter(r => !r.passed)) {
    lines.push(``)
    lines.push(`Question ID: ${result.question_id}`)
    lines.push(`Errors:`)
    for (const error of result.errors) {
      lines.push(`  - [${error.code}] ${error.message}`)
      if (error.suggested_fix) {
        lines.push(`    Fix: ${error.suggested_fix}`)
      }
    }
  }
  
  return lines.join('\n')
}

// Re-export types for convenience
export type {
  MathQuestion,
  ValidationResult,
  CheckResult,
  ValidationError,
  BatchValidationResult
} from './types/question'

/**
 * Validation Pipeline Type Definitions
 * 
 * TypeScript interfaces for the question validation system.
 * Based on the Validation Pipeline Build Spec.
 * 
 * @module lib/validation/types/question
 */

export interface MathQuestion {
  question_id: string
  subject: 'Mathematics'
  topic: string
  subtopic: string
  difficulty: 'Foundation' | 'Standard' | 'Challenge'
  year_group: 'Year 3' | 'Year 4' | 'Year 5' | 'Year 6'
  question_text: string
  working: WorkingSteps
  answer_format: AnswerFormat
  computed_answer: string
  options: Record<'a' | 'b' | 'c' | 'd' | 'e', string>
  correct_option: 'a' | 'b' | 'c' | 'd' | 'e'
  verification: Verification
  computational_verification: ComputationalVerification
}

export interface WorkingSteps {
  [key: string]: string // step_1, step_2, etc.
  final_calculation: string
  computed_result: string
}

export type AnswerFormat = 
  | 'integer' 
  | 'decimal' 
  | 'fraction' 
  | 'mixed_number' 
  | 'mixed_number_unsimplified'
  | 'percentage' 
  | 'ratio'

export interface Verification {
  computed_answer_matches_option: boolean
  matched_option_value: string
  verification_status: 'VERIFIED' | 'MISMATCH' | 'ANSWER_NOT_IN_OPTIONS'
}

export interface ComputationalVerification {
  expression: string
  expected_result: string
  result_format: 'fraction' | 'decimal' | 'integer'
}

export interface ValidationResult {
  question_id: string
  passed: boolean
  checks: CheckResult[]
  errors: ValidationError[]
  warnings: ValidationWarning[]
  corrected_data?: Partial<MathQuestion>
}

export interface CheckResult {
  check_name: string
  passed: boolean
  details: string
  severity: 'critical' | 'error' | 'warning'
}

export interface ValidationError {
  code: string
  message: string
  field: string
  expected?: string
  received?: string
  auto_fixable: boolean
  suggested_fix?: string
}

export interface ValidationWarning {
  code: string
  message: string
}

/**
 * Batch validation result
 */
export interface BatchValidationResult {
  total: number
  passed: MathQuestion[]
  failed: ValidationResult[]
  auto_corrected: number
}

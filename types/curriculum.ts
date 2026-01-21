/**
 * Curriculum Alignment Types
 * 
 * Types for UK National Curriculum objectives and 11+ question taxonomy.
 * Used for curriculum alignment validation and display on question cards.
 * 
 * Legal: National Curriculum content is Crown Copyright under OGL v3.0
 * 
 * @module types/curriculum
 */

// =============================================================================
// CURRICULUM OBJECTIVES
// =============================================================================

/**
 * UK National Curriculum objective (KS2)
 * Stored in curriculum_objectives table
 */
export interface CurriculumObjective {
  id: string
  running_number: string | null
  code: string                    // Y5-MATH-F-03
  dfe_code: string | null         // 5F-2 (official DfE code)
  subject: CurriculumSubject
  key_stage: 'KS2'
  year_group: 3 | 4 | 5 | 6
  strand: string                  // e.g., "Fractions", "Number and Place Value"
  sub_strand: string | null       // e.g., "Comparing fractions"
  objective_text: string          // Full curriculum statement
  keywords: string[]              // Searchable terms
  statutory: boolean              // Statutory vs non-statutory guidance
  source_document: string | null  // Which PDF it came from
  source_link: string | null      // Link to PDF
  source_page: number | null      // Page number in source
  created_at: string
  updated_at: string
}

export type CurriculumSubject = 'Mathematics' | 'English'

// =============================================================================
// 11+ QUESTION TYPES (VR/NVR)
// =============================================================================

/**
 * 11+ Question type taxonomy
 * For VR and NVR which have no official curriculum
 */
export interface QuestionTypeTaxonomy {
  id: string
  code: string                    // VR-GL-SYN, NVR-GL-SEQ
  category: QuestionCategory
  exam_board: ExamBoard
  type_name: string               // e.g., "Synonyms", "Figure Sequences"
  type_description: string | null // Detailed description
  difficulty_range: string | null // Foundation, Standard, Challenge
  typical_age_range: string | null // 9-10, 10-11
  keywords: string[]
  created_at: string
}

export type QuestionCategory = 'Verbal Reasoning' | 'Non-Verbal Reasoning'
export type ExamBoard = 'GL' | 'CEM' | 'Generic'

// =============================================================================
// ALIGNMENT JUNCTION TABLES
// =============================================================================

/**
 * Question to Curriculum Objective alignment
 * Links questions to specific NC objectives
 */
export interface QuestionCurriculumAlignment {
  id: string
  question_id: string
  objective_id: string
  alignment_strength: AlignmentStrength
  alignment_confidence: number    // 0-100
  validated_by: ValidationType | null
  validated_at: string | null
  validator_notes: string | null
  created_at: string
  
  // Joined data (when fetched with relations)
  objective?: CurriculumObjective
}

/**
 * Question to 11+ Type alignment
 * Links VR/NVR questions to question types
 */
export interface QuestionTypeAlignment {
  id: string
  question_id: string
  type_id: string
  created_at: string
  
  // Joined data (when fetched with relations)
  type?: QuestionTypeTaxonomy
}

export type AlignmentStrength = 'primary' | 'secondary' | 'related'
export type ValidationType = 'ai' | 'expert' | 'community'

// =============================================================================
// STRAND CODES (for internal reference)
// =============================================================================

/**
 * Mathematics strand codes used in curriculum objectives
 */
export const MATHS_STRANDS = {
  NPV: 'Number and Place Value',
  AS: 'Addition and Subtraction',
  MD: 'Multiplication and Division',
  ASMD: 'Four Operations',
  F: 'Fractions',
  M: 'Measurement',
  G: 'Geometry',
  PD: 'Position and Direction',
  S: 'Statistics',
  RP: 'Ratio and Proportion',
  A: 'Algebra'
} as const

export type MathsStrand = keyof typeof MATHS_STRANDS

/**
 * English strand codes used in curriculum objectives
 */
export const ENGLISH_STRANDS = {
  WR: 'Word Reading',
  C: 'Comprehension',
  T: 'Transcription',
  CO: 'Composition',
  VGP: 'Vocabulary Grammar Punctuation',
  SL: 'Spoken Language'
} as const

export type EnglishStrand = keyof typeof ENGLISH_STRANDS

// =============================================================================
// 11+ TYPE CODES
// =============================================================================

/**
 * Verbal Reasoning question type codes (GL Assessment)
 */
export const VR_TYPES = {
  SYN: 'Synonyms',
  ANT: 'Antonyms',
  ODD: 'Odd One Out',
  ANA: 'Word Analogies',
  HID: 'Hidden Words',
  COM: 'Compound Words',
  LET: 'Letter Series',
  COD: 'Letter Codes',
  NUM: 'Number Series',
  LOG: 'Logic Problems',
  CLO: 'Cloze/Missing Words'
} as const

export type VRType = keyof typeof VR_TYPES

/**
 * Non-Verbal Reasoning question type codes (GL Assessment)
 */
export const NVR_TYPES = {
  SEQ: 'Figure Sequences',
  MAT: 'Matrices',
  ODD: 'Odd One Out',
  ANA: 'Visual Analogies',
  COD: 'Codes',
  REF: 'Reflection/Rotation',
  FOL: 'Paper Folding',
  CUB: 'Cube Nets',
  SPA: 'Spatial Reasoning',
  CLS: 'Figure Classification'
} as const

export type NVRType = keyof typeof NVR_TYPES

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format curriculum code for display
 * e.g., "Y5-MATH-F-03" → "Y5 Maths - Fractions"
 */
export function formatCurriculumCode(code: string): string {
  const parts = code.split('-')
  if (parts.length < 3) return code
  
  const year = parts[0] // Y5
  const subject = parts[1] === 'MATH' ? 'Maths' : parts[1]
  const strand = MATHS_STRANDS[parts[2] as MathsStrand] || parts[2]
  
  return `${year} ${subject} - ${strand}`
}

/**
 * Get year group from curriculum code
 * e.g., "Y5-MATH-F-03" → 5
 */
export function getYearFromCode(code: string): number | null {
  const match = code.match(/^Y(\d)/)
  return match ? parseInt(match[1]) : null
}

/**
 * Check if a curriculum code is for Mathematics
 */
export function isMathsCode(code: string): boolean {
  return code.includes('-MATH-')
}

/**
 * Check if a curriculum code is for English
 */
export function isEnglishCode(code: string): boolean {
  return code.includes('-ENG-')
}

/**
 * Check if a code is for Verbal Reasoning
 */
export function isVRCode(code: string): boolean {
  return code.startsWith('VR-')
}

/**
 * Check if a code is for Non-Verbal Reasoning
 */
export function isNVRCode(code: string): boolean {
  return code.startsWith('NVR-')
}

// =============================================================================
// QUESTION BANK TYPES (for import)
// =============================================================================

/**
 * Question format from Gemini question bank JSON files
 */
export interface QuestionBankItem {
  question_id: string
  subject: string
  topic: string
  subtopic: string
  difficulty: 'Foundation' | 'Standard' | 'Challenge'
  year_group: string              // "Year 3", "Year 4", etc.
  curriculum_ref: string          // e.g., "Y5-MATH-F-03"
  question_text: string
  question_type: 'multiple_choice'
  options: {
    id: string
    text: string
  }[]
  correct_option_id: string
  working: {
    [key: string]: string
  }
  answer_format: string
  computed_answer: string
  explanation: string
  tags: string[]
}

/**
 * Parse year group string to number
 * e.g., "Year 5" → 5
 */
export function parseYearGroup(yearGroup: string): number {
  const match = yearGroup.match(/Year\s*(\d+)/i)
  return match ? parseInt(match[1]) : 5 // Default to Year 5
}

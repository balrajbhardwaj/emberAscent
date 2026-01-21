/**
 * Curriculum Alignment Helpers
 * 
 * Utilities for working with curriculum objectives and question types.
 * Provides functions for fetching, searching, and validating alignments.
 * 
 * @module lib/curriculum/helpers
 */

import { createClient } from "@/lib/supabase/client"
import type { 
  CurriculumObjective, 
  QuestionTypeTaxonomy,
  QuestionCurriculumAlignment,
} from "@/types/curriculum"

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch curriculum objectives for a question
 * Returns objectives sorted by alignment strength (primary first)
 */
export async function getQuestionObjectives(
  questionId: string
): Promise<CurriculumObjective[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('question_curriculum_alignment')
    .select(`
      alignment_strength,
      objective:curriculum_objectives(*)
    `)
    .eq('question_id', questionId)
    .order('alignment_strength')
  
  if (error || !data) {
    console.error('Error fetching question objectives:', error)
    return []
  }
  
  return data
    .map(d => d.objective as unknown as CurriculumObjective)
    .filter(Boolean)
}

/**
 * Fetch question types for a question (11+ VR/NVR)
 */
export async function getQuestionTypes(
  questionId: string
): Promise<QuestionTypeTaxonomy[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('question_type_alignment')
    .select(`
      type:question_type_taxonomy(*)
    `)
    .eq('question_id', questionId)
  
  if (error || !data) {
    console.error('Error fetching question types:', error)
    return []
  }
  
  return data
    .map(d => d.type as unknown as QuestionTypeTaxonomy)
    .filter(Boolean)
}

/**
 * Fetch a curriculum objective by code
 */
export async function getObjectiveByCode(
  code: string
): Promise<CurriculumObjective | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('curriculum_objectives')
    .select('*')
    .eq('code', code)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as CurriculumObjective
}

/**
 * Fetch all curriculum objectives for a subject and year
 */
export async function getObjectivesBySubjectAndYear(
  subject: string,
  yearGroup: number
): Promise<CurriculumObjective[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('curriculum_objectives')
    .select('*')
    .eq('subject', subject)
    .eq('year_group', yearGroup)
    .order('strand')
    .order('code')
  
  if (error || !data) {
    console.error('Error fetching objectives:', error)
    return []
  }
  
  return data as CurriculumObjective[]
}

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Search curriculum objectives by keywords
 */
export async function searchObjectives(
  query: string,
  filters?: {
    subject?: string
    year_group?: number
    strand?: string
  }
): Promise<CurriculumObjective[]> {
  const supabase = createClient()
  
  let queryBuilder = supabase
    .from('curriculum_objectives')
    .select('*')
    .or(`objective_text.ilike.%${query}%,code.ilike.%${query}%`)
  
  if (filters?.subject) {
    queryBuilder = queryBuilder.eq('subject', filters.subject)
  }
  if (filters?.year_group) {
    queryBuilder = queryBuilder.eq('year_group', filters.year_group)
  }
  if (filters?.strand) {
    queryBuilder = queryBuilder.eq('strand', filters.strand)
  }
  
  const { data, error } = await queryBuilder.limit(20)
  
  if (error || !data) {
    console.error('Error searching objectives:', error)
    return []
  }
  
  return data as CurriculumObjective[]
}

/**
 * Suggest curriculum alignment based on question text and metadata
 * Uses keyword matching to find relevant objectives
 */
export async function suggestAlignment(
  questionText: string,
  subject: string,
  yearGroup?: number
): Promise<CurriculumObjective[]> {
  const supabase = createClient()
  
  // Extract potential keywords from question
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'for', 'of', 'what', 'how']
  const words = questionText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w))
    .slice(0, 10) // Limit to 10 keywords
  
  if (words.length === 0) {
    return []
  }
  
  // Build query to search in keywords array
  let queryBuilder = supabase
    .from('curriculum_objectives')
    .select('*')
    .eq('subject', subject)
  
  if (yearGroup) {
    queryBuilder = queryBuilder.eq('year_group', yearGroup)
  }
  
  // Search for any matching keywords
  queryBuilder = queryBuilder.overlaps('keywords', words)
  
  const { data, error } = await queryBuilder.limit(5)
  
  if (error || !data) {
    console.error('Error suggesting alignment:', error)
    return []
  }
  
  return data as CurriculumObjective[]
}

// =============================================================================
// ALIGNMENT FUNCTIONS
// =============================================================================

/**
 * Create a curriculum alignment for a question
 */
export async function createAlignment(
  questionId: string,
  objectiveId: string,
  strength: 'primary' | 'secondary' | 'related' = 'primary',
  confidence?: number
): Promise<QuestionCurriculumAlignment | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('question_curriculum_alignment')
    .upsert({
      question_id: questionId,
      objective_id: objectiveId,
      alignment_strength: strength,
      alignment_confidence: confidence,
      validated_by: 'ai',
      validated_at: new Date().toISOString()
    }, { onConflict: 'question_id,objective_id' })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating alignment:', error)
    return null
  }
  
  return data as QuestionCurriculumAlignment
}

/**
 * Link a question to its curriculum objective by code
 * Used during question import to create alignments
 */
export async function linkQuestionToCurriculum(
  questionId: string,
  curriculumCode: string
): Promise<boolean> {
  const supabase = createClient()
  
  // First, find the objective by code
  const { data: objective } = await supabase
    .from('curriculum_objectives')
    .select('id')
    .eq('code', curriculumCode)
    .single()
  
  if (!objective) {
    console.warn(`Curriculum objective not found: ${curriculumCode}`)
    return false
  }
  
  // Create the alignment
  const { error } = await supabase
    .from('question_curriculum_alignment')
    .upsert({
      question_id: questionId,
      objective_id: objective.id,
      alignment_strength: 'primary',
      alignment_confidence: 90,
      validated_by: 'ai'
    }, { onConflict: 'question_id,objective_id' })
  
  if (error) {
    console.error('Error linking question to curriculum:', error)
    return false
  }
  
  // Also update the question's primary_curriculum_code field
  await supabase
    .from('questions')
    .update({ primary_curriculum_code: curriculumCode })
    .eq('id', questionId)
  
  return true
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Check if a question is curriculum-aligned
 * Used for Ember Score / Ascent Trust Level calculation
 */
export async function isQuestionAligned(questionId: string): Promise<{
  aligned: boolean
  alignmentCount: number
  validatedCount: number
  primaryObjective: CurriculumObjective | null
}> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('question_curriculum_alignment')
    .select(`
      id,
      validated_by,
      alignment_strength,
      objective:curriculum_objectives(*)
    `)
    .eq('question_id', questionId)
  
  if (error || !data) {
    return { 
      aligned: false, 
      alignmentCount: 0, 
      validatedCount: 0,
      primaryObjective: null
    }
  }
  
  // Find primary alignment - objective is a nested object from the join
  const primaryAlignment = data.find(d => d.alignment_strength === 'primary')
  const primaryObjective = primaryAlignment?.objective as unknown as CurriculumObjective | null
  
  return {
    aligned: data.length > 0,
    alignmentCount: data.length,
    validatedCount: data.filter(d => d.validated_by).length,
    primaryObjective: primaryObjective || null
  }
}

/**
 * Get curriculum coverage statistics for a child
 * Shows which objectives have been practiced
 */
export async function getChildCurriculumCoverage(
  childId: string,
  subject?: string,
  yearGroup?: number
): Promise<{
  totalObjectives: number
  practicedObjectives: number
  masteredObjectives: number
  coverage: number
}> {
  const supabase = createClient()
  
  // Get total objectives for the criteria
  let objectivesQuery = supabase
    .from('curriculum_objectives')
    .select('id', { count: 'exact' })
  
  if (subject) {
    objectivesQuery = objectivesQuery.eq('subject', subject)
  }
  if (yearGroup) {
    objectivesQuery = objectivesQuery.eq('year_group', yearGroup)
  }
  
  const { count: totalObjectives } = await objectivesQuery
  
  // Get practiced objectives (via question_attempts -> questions -> alignments)
  const { data: attemptedQuestions } = await supabase
    .from('question_attempts')
    .select('question_id')
    .eq('child_id', childId)
  
  if (!attemptedQuestions || attemptedQuestions.length === 0) {
    return {
      totalObjectives: totalObjectives || 0,
      practicedObjectives: 0,
      masteredObjectives: 0,
      coverage: 0
    }
  }
  
  const questionIds = [...new Set(attemptedQuestions.map(a => a.question_id))]
  
  // Get unique objectives from attempted questions
  const { data: alignments } = await supabase
    .from('question_curriculum_alignment')
    .select('objective_id')
    .in('question_id', questionIds)
  
  const practicedObjectiveIds = [...new Set(alignments?.map(a => a.objective_id) || [])]
  
  return {
    totalObjectives: totalObjectives || 0,
    practicedObjectives: practicedObjectiveIds.length,
    masteredObjectives: 0, // TODO: Calculate based on accuracy threshold
    coverage: totalObjectives ? (practicedObjectiveIds.length / totalObjectives) * 100 : 0
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all unique strands for a subject
 */
export async function getStrands(subject: string): Promise<string[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('curriculum_objectives')
    .select('strand')
    .eq('subject', subject)
    .order('strand')
  
  if (error || !data) {
    return []
  }
  
  return [...new Set(data.map(d => d.strand))]
}

/**
 * Get question type taxonomy by code
 */
export async function getQuestionTypeByCode(
  code: string
): Promise<QuestionTypeTaxonomy | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('question_type_taxonomy')
    .select('*')
    .eq('code', code)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as QuestionTypeTaxonomy
}

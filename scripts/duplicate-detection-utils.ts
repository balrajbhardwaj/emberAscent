/**
 * Duplicate Detection Utilities for Question Import
 * 
 * These functions should be added to import scripts to prevent duplicate questions
 * from being imported into the database.
 * 
 * Usage:
 * 1. Add these functions to your import script (import-y3-questions.ts, import-y4-questions.ts, etc.)
 * 2. Call findDuplicateExternalIds() and findDuplicateContent() before transforming questions
 * 3. Filter out duplicates before inserting into database
 * 4. Check existing questions in database before inserting new batch
 * 
 * @module scripts/duplicate-detection-utils
 */

/**
 * Check for duplicate external_ids within a batch
 * Returns Map of duplicate IDs and their occurrence count
 */
export function findDuplicateExternalIds<T extends { question_id: string }>(
  questions: T[]
): Map<string, number> {
  const idCounts = new Map<string, number>()
  const duplicates = new Map<string, number>()
  
  for (const q of questions) {
    const count = (idCounts.get(q.question_id) || 0) + 1
    idCounts.set(q.question_id, count)
    if (count > 1) {
      duplicates.set(q.question_id, count)
    }
  }
  
  return duplicates
}

/**
 * Check for duplicate question content (same text + options + answer)
 * Returns Map of content hashes to arrays of question IDs with that content
 */
export function findDuplicateContent<T extends {
  question_id: string
  question_text: string
  correct_option: string
  options: { a?: string; b?: string; c?: string; d?: string; e?: string }
}>(questions: T[]): Map<string, string[]> {
  const contentMap = new Map<string, string[]>()
  const duplicates = new Map<string, string[]>()
  
  for (const q of questions) {
    // Create content hash from question_text + correct_option + all options (sorted)
    const optionsStr = JSON.stringify(
      [q.options.a, q.options.b, q.options.c, q.options.d, q.options.e].sort()
    )
    const contentKey = `${q.question_text}||${q.correct_option}||${optionsStr}`
    
    const ids = contentMap.get(contentKey) || []
    ids.push(q.question_id)
    contentMap.set(contentKey, ids)
    
    if (ids.length > 1) {
      duplicates.set(contentKey, ids)
    }
  }
  
  return duplicates
}

/**
 * Remove duplicate questions from batch (keeps first occurrence)
 * Returns cleaned array and count of removed duplicates
 */
export function removeDuplicatesFromBatch<T extends {
  question_id: string
  question_text: string
  correct_option: string
  options: { a?: string; b?: string; c?: string; d?: string; e?: string }
}>(questions: T[]): { cleaned: T[]; removed: number } {
  const seenExternalIds = new Set<string>()
  const seenContent = new Set<string>()
  
  const cleaned = questions.filter(q => {
    // Check external_id
    if (seenExternalIds.has(q.question_id)) {
      return false
    }
    seenExternalIds.add(q.question_id)
    
    // Check content
    const optionsStr = JSON.stringify(
      [q.options.a, q.options.b, q.options.c, q.options.d, q.options.e].sort()
    )
    const contentKey = `${q.question_text}||${q.correct_option}||${optionsStr}`
    
    if (seenContent.has(contentKey)) {
      return false
    }
    seenContent.add(contentKey)
    
    return true
  })
  
  return {
    cleaned,
    removed: questions.length - cleaned.length
  }
}

/**
 * Check which questions already exist in database by external_id
 * Returns Set of existing external_ids
 */
export async function getExistingExternalIds(
  supabase: any,
  externalIds: string[]
): Promise<Set<string>> {
  if (externalIds.length === 0) {
    return new Set()
  }
  
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('external_id')
    .in('external_id', externalIds)
  
  return new Set(existingQuestions?.map((q: any) => q.external_id) || [])
}

/**
 * Example usage in import script:
 * 
 * ```typescript
 * // After loading questions from JSON
 * const duplicateExternalIds = findDuplicateExternalIds(questions)
 * const duplicateContent = findDuplicateContent(questions)
 * 
 * if (duplicateExternalIds.size > 0) {
 *   console.log(`   ⚠️  Found ${duplicateExternalIds.size} duplicate external_ids`)
 *   for (const [id, count] of duplicateExternalIds) {
 *     console.log(`      - ${id} appears ${count} times`)
 *   }
 * }
 * 
 * if (duplicateContent.size > 0) {
 *   console.log(`   ⚠️  Found ${duplicateContent.size} duplicate question contents`)
 * }
 * 
 * // Remove duplicates from batch
 * const { cleaned, removed } = removeDuplicatesFromBatch(questions)
 * if (removed > 0) {
 *   console.log(`   🧹 Removed ${removed} duplicate(s) from batch`)
 *   questions = cleaned
 * }
 * 
 * // Transform questions
 * const transformedQuestions = questions.map(transformQuestion)
 * 
 * // Check database for existing questions
 * const externalIds = transformedQuestions.map(q => q.external_id).filter(id => id != null)
 * const existingIds = await getExistingExternalIds(supabase, externalIds)
 * 
 * // Split into new vs existing
 * const newQuestions = transformedQuestions.filter(q => !existingIds.has(q.external_id))
 * const skippedCount = transformedQuestions.length - newQuestions.length
 * 
 * // Insert only new questions
 * if (newQuestions.length > 0) {
 *   const { data, error } = await supabase
 *     .from('questions')
 *     .insert(newQuestions)
 *     .select('id, external_id')
 *   
 *   if (!error) {
 *     console.log(`✅ Inserted ${data.length} new questions`)
 *   }
 * }
 * 
 * if (skippedCount > 0) {
 *   console.log(`⏭️  Skipped ${skippedCount} existing questions`)
 * }
 * ```
 */

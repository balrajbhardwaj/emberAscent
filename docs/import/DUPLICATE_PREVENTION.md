# Import Script Duplicate Prevention

## Overview
This document explains how to prevent duplicate questions during the import process for Y3, Y4, Y5, and Y6 questions.

## Problem
The Y3 import revealed that duplicate questions can be imported:
- **Duplicate external_ids** in the same batch (e.g., `ENG-GRM-punc-F-Y3-00184` and `ENG-GRM-punc-F-Y3-00808`)
- **Duplicate content** (same question_text, options, and correct_answer)
- **Reimporting existing questions** from previous runs

## Solution
Three-layer duplicate detection:

### Layer 1: Pre-Import Batch Validation
**Check for duplicates within the JSON file before importing**

```typescript
import { 
  findDuplicateExternalIds, 
  findDuplicateContent, 
  removeDuplicatesFromBatch 
} from './duplicate-detection-utils'

// After loading questions from JSON
const duplicateExternalIds = findDuplicateExternalIds(questions)
const duplicateContent = findDuplicateContent(questions)

if (duplicateExternalIds.size > 0) {
  console.log(`⚠️  Found ${duplicateExternalIds.size} duplicate external_ids in batch`)
}

if (duplicateContent.size > 0) {
  console.log(`⚠️  Found ${duplicateContent.size} duplicate question contents in batch`)
}

// Remove duplicates (keeps first occurrence)
const { cleaned, removed } = removeDuplicatesFromBatch(questions)
if (removed > 0) {
  console.log(`🧹 Removed ${removed} duplicate(s) from batch before import`)
  questions = cleaned
}
```

### Layer 2: Database Existence Check
**Check which questions already exist in database before inserting**

```typescript
import { getExistingExternalIds } from './duplicate-detection-utils'

// After transforming questions
const externalIds = transformedQuestions.map(q => q.external_id).filter(id => id != null)
const existingIds = await getExistingExternalIds(supabase, externalIds)

// Split into new vs existing
const newQuestions = transformedQuestions.filter(q => !existingIds.has(q.external_id))
const skippedCount = transformedQuestions.length - newQuestions.length

// Insert only new questions
if (newQuestions.length > 0) {
  const { data, error } = await supabase
    .from('questions')
    .insert(newQuestions)
    .select('id, external_id')
  
  if (!error) {
    console.log(`✅ Inserted ${data.length} new questions`)
  }
}

if (skippedCount > 0) {
  console.log(`⏭️  Skipped ${skippedCount} existing questions`)
}
```

### Layer 3: Database Unique Constraint
**Database-level protection (already in place)**

```sql
-- Unique index on external_id (migration 017)
CREATE UNIQUE INDEX idx_questions_external_id 
  ON questions(external_id) 
  WHERE external_id IS NOT NULL;
```

This prevents duplicate external_ids at the database level as a last resort.

## Implementation Checklist

### For Y3/Y4 (Already Imported)
- [x] Utility functions created (`duplicate-detection-utils.ts`)
- [ ] Run duplicate detection queries on existing data
- [ ] Clean up identified duplicates using cleanup scripts
- [ ] Verify no child progress lost

### For Y5/Y6 (Future Imports)
- [ ] Import `duplicate-detection-utils.ts` into import scripts
- [ ] Add pre-import validation before transformation
- [ ] Check database for existing questions before insert
- [ ] Update progress reporting to show skipped duplicates
- [ ] Test with small batch (220 questions) before full import

## Updated Import Flow

```
1. Load JSON file
   ↓
2. Detect duplicates in batch (Layer 1)
   - Find duplicate external_ids
   - Find duplicate content
   - Remove duplicates (keep first)
   ↓
3. Transform to database format
   ↓
4. Check database for existing external_ids (Layer 2)
   - Query existing questions
   - Filter out already-imported questions
   ↓
5. Insert only new questions
   ↓
6. Report statistics
   - ✅ Inserted: X new questions
   - ⏭️  Skipped: Y existing questions
   - 🧹 Removed: Z batch duplicates
```

## Detection Criteria

### Duplicate External ID
```typescript
// Same question_id
"ENG-GRM-punc-F-Y3-00184" === "ENG-GRM-punc-F-Y3-00184"
```

### Duplicate Content
```typescript
// Same question_text + correct_option + all options (sorted)
const contentKey = `${question_text}||${correct_option}||${JSON.stringify([a,b,c,d,e].sort())}`
```

**Why sort options?**
- Prevents false positives if options appear in different order
- Still catches true duplicates even if option letters are swapped

## Example Output

```
📂 Processing: y5-mathematics-operations-easy.json
   Found 220 questions
   ⚠️  Found 2 duplicate external_ids in batch:
      - MATH-OPS-add-E-Y5-00123 appears 2 times
      - MATH-OPS-mult-E-Y5-00089 appears 2 times
   ⚠️  Found 1 duplicate question content in batch:
      - Same content: MATH-OPS-add-E-Y5-00045, MATH-OPS-add-E-Y5-00187
   🧹 Removed 3 duplicate(s) from batch before import
   
   Processing batch 1/5... ✅ 44 new, ⏭️  0 skipped (already exist)
   Processing batch 2/5... ✅ 43 new, ⏭️  1 skipped (already exist)
   Processing batch 3/5... ✅ 43 new, ⏭️  0 skipped (already exist)
   Processing batch 4/5... ✅ 44 new, ⏭️  0 skipped (already exist)
   Processing batch 5/5... ✅ 43 new, ⏭️  0 skipped (already exist)
   
   📊 Results:
      ✅ Inserted: 217
      ⏭️  Skipped (duplicates): 1
      🧹 Removed from batch: 3
      📦 Total processed: 217
```

## Files Modified

1. **New:** `scripts/duplicate-detection-utils.ts` - Utility functions
2. **New:** `docs/import/DUPLICATE_PREVENTION.md` - This guide
3. **Update:** `scripts/import-y3-questions.ts` - Add duplicate detection
4. **Update:** `scripts/import-y4-questions.ts` - Add duplicate detection
5. **Future:** `scripts/import-y5-questions.ts` - Include from start
6. **Future:** `scripts/import-y6-questions.ts` - Include from start

## Testing Strategy

### Before Full Y5/Y6 Import
1. **Test with 220-question batch**
2. **Intentionally add duplicates to JSON**:
   - Duplicate external_id (same question twice)
   - Duplicate content (different IDs, same question)
   - Already-imported question (from Y3/Y4)
3. **Verify all three are caught**:
   - Batch validation catches within-file duplicates
   - Database check catches cross-file duplicates
   - Unique constraint prevents database corruption
4. **Check statistics**:
   - Removed count matches expected
   - Skipped count matches existing questions
   - Inserted count = Total - Removed - Skipped

### After Import
1. Run duplicate detection queries (find-duplicate-y3-questions.sql)
2. Verify zero duplicates found
3. Verify question counts match expected (22k total for Y5/Y6)

## References

- **Database Schema:** `docs/database/DATABASE_SCHEMA.md`
- **Migration 017:** `supabase/migrations/017_prepare_y3_questions.sql` (added external_id unique index)
- **Duplicate Detection Queries:** `scripts/find-duplicate-y3-questions.sql`
- **Duplicate Investigation:** `scripts/investigate-specific-duplicate.sql`
- **Batch Generation Schedule:** `planning/BATCH_GENERATION_SCHEDULE.md`

## Prevention for Future Generations

The **READY-TO-USE-CLAUDE-PROMPT.md** now includes explicit non-repetition requirements:

```markdown
🚨 CRITICAL: Non-Repetition Across Batches
- Generate UNIQUE questions only
- Vary question scenarios, contexts, and numbers
- Track question_id numbering sequentially
- Cross-batch uniqueness: Each question must be distinguishable
```

This should prevent duplicates at the **generation stage**, making import-time detection a safety net rather than primary defense.

---

**Last Updated:** 2026-01-26  
**Status:** Utilities created, ready for integration into import scripts

# Y3 Question Reimport - Clean Slate Process

## Overview
Complete process to clean existing Y3 data and reimport from high-quality source files.

**Source:** `Prompts/QuestionBank/Claude/ember-ascent-Y3-question-bank/`
**Total Questions:** ~10,000 (5,000 Maths + 5,000 English)

---

## 📋 Step-by-Step Process

### Step 1: Backup Current Data (Optional but Recommended)

**Run in Supabase SQL Editor:**
```sql
-- Export current Y3 questions as CSV
SELECT 
  id,
  external_id,
  subject,
  topic,
  question_text,
  correct_answer,
  difficulty,
  ember_score,
  created_at
FROM questions
WHERE year_group = 3
ORDER BY subject, topic, external_id;
```

**Save the results as:** `y3_backup_2026-01-26.csv`

---

### Step 2: Check Current Y3 Data Statistics

**Run:** `scripts/cleanup-y3-data.sql` (Section 1 only)

Expected output:
```
questions              | 10,000+ records
question_attempts      | X records
child_question_history | Y records
question_feedback      | Z records
```

---

### Step 3: Clean Up Existing Y3 Data

**⚠️ WARNING: This will DELETE all Y3 questions and related data**

**Run in Supabase SQL Editor:** `scripts/cleanup-y3-data.sql`

This will:
1. Delete question_feedback for Y3 questions
2. Delete child_question_history for Y3 questions
3. Delete question_attempts for Y3 questions
4. Delete error_reports for Y3 questions
5. Delete all Y3 questions
6. Verify cleanup (should return 0 records)

**Important Notes:**
- Child progress on Y3 questions will be lost
- If children have active sessions with Y3 questions, complete those first
- Consider wrapping in a transaction for safety:
  ```sql
  BEGIN;
    -- Run cleanup statements
    -- Check results
  COMMIT; -- or ROLLBACK if not satisfied
  ```

---

### Step 4: Verify Source Files

**Check directory structure:**
```
Prompts/QuestionBank/Claude/ember-ascent-Y3-question-bank/
├── generation_summary.json
├── maths-Y3/
│   ├── addition_subtraction.json (800 questions)
│   ├── division.json (600 questions)
│   ├── fractions.json (600 questions)
│   ├── geometry.json (400 questions)
│   ├── measurement.json (600 questions)
│   ├── multiplication.json (800 questions)
│   ├── number_place_value.json (1,000 questions)
│   └── statistics.json (200 questions)
└── english-Y3/
    ├── grammar.json (1,200 questions)
    ├── reading_comprehension.json (1,200 questions)
    ├── spelling.json (1,200 questions)
    ├── verbal_reasoning.json (700 questions)
    └── vocabulary.json (700 questions)
```

**Verify files exist:**
```powershell
Get-ChildItem "Prompts\QuestionBank\Claude\ember-ascent-Y3-question-bank\maths-Y3\*.json" | Measure-Object
Get-ChildItem "Prompts\QuestionBank\Claude\ember-ascent-Y3-question-bank\english-Y3\*.json" | Measure-Object
```

---

### Step 5: Run Clean Reimport

**Execute the reimport script:**
```powershell
npx tsx scripts/reimport-y3-clean.ts
```

**What happens:**
1. ✅ Reads all JSON files from source directory
2. 🔍 Detects duplicate external_ids within each file
3. 🔍 Detects duplicate content (same question text + options)
4. 🧹 Removes duplicates (keeps first occurrence)
5. 🔍 Checks database for already-imported questions
6. ⏭️  Skips questions that already exist
7. ✅ Inserts only new, unique questions
8. 📊 Reports detailed statistics

**Expected output:**
```
🚀 Y3 Question Clean Reimport
================================

📁 Source Directory: C:\Users\dell\emberAscent\Prompts\QuestionBank\Claude\ember-ascent-Y3-question-bank
✅ Connected to Supabase

📚 Found 13 JSON files to import
   - Maths: 8 files
   - English: 5 files

📂 Processing: addition_subtraction.json
   Found 800 questions
   ⚠️  2 duplicate external_ids found
      - MATH-ADD-sub-F-Y3-00123 (×2)
   🧹 Removed 2 duplicates from batch
   Batch 1/16... ✅ 50
   Batch 2/16... ✅ 50
   ...
   Batch 16/16... ✅ 48

   📊 Results:
      ✅ Inserted: 798
      🧹 Removed: 2

📂 Processing: multiplication.json
   Found 800 questions
   Batch 1/16... ✅ 50
   ...

==================================================
📊 FINAL SUMMARY
==================================================
✅ Total Inserted:     9,975
⏭️  Total Skipped:      0
🧹 Total Removed:      25
❌ Total Errors:       0
📦 Total Processed:    10,000
📈 Success Rate:       100.0%
==================================================

✅ Import complete!

📝 Next steps:
   1. Run duplicate detection: scripts/find-duplicate-y3-questions.sql
   2. Calculate ember scores: SELECT * FROM update_all_ember_scores();
   3. Verify question counts match expected (~10,000 questions)
```

---

### Step 6: Verify Import Quality

**Run duplicate detection queries:**
```sql
-- Should return 0 duplicates
SELECT * FROM find_duplicate_questions(3);

-- Summary statistics
SELECT * FROM get_duplicate_summary(3);
```

**Expected results:**
- **0** exact text duplicates
- **0** duplicate external_ids
- **0** duplicate content (same text + options + answer)

---

### Step 7: Calculate Ember Scores

**Run in Supabase SQL Editor:**
```sql
SELECT * FROM update_all_ember_scores();
```

This will:
- Calculate ember_score for all Y3 questions
- Update ember_score_breakdown JSONB column
- Return list of updated questions with old vs new scores

**Expected:** ~10 seconds for 10,000 questions

---

### Step 8: Verify Final Results

**Run verification queries:**
```sql
-- 1. Check total count
SELECT 
  year_group,
  COUNT(*) as total_questions,
  COUNT(DISTINCT external_id) as unique_external_ids,
  MIN(ember_score) as min_score,
  MAX(ember_score) as max_score,
  ROUND(AVG(ember_score), 2) as avg_score
FROM questions
WHERE year_group = 3
GROUP BY year_group;

-- Expected: 
-- year_group: 3
-- total_questions: ~9,975-10,000
-- unique_external_ids: same as total (no duplicates)
-- min_score: 60
-- max_score: 100
-- avg_score: 66-75

-- 2. Check by subject
SELECT 
  subject,
  COUNT(*) as question_count,
  ROUND(AVG(ember_score), 2) as avg_score
FROM questions
WHERE year_group = 3
GROUP BY subject
ORDER BY subject;

-- Expected:
-- mathematics: ~4,975-5,000 questions
-- english: ~4,975-5,000 questions

-- 3. Check by difficulty
SELECT 
  difficulty,
  COUNT(*) as question_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM questions
WHERE year_group = 3
GROUP BY difficulty
ORDER BY difficulty;

-- Expected distribution:
-- foundation: ~30-40%
-- standard: ~40-50%
-- challenge: ~20-30%
```

---

## 🎯 Success Criteria

- ✅ Total Y3 questions: 9,900-10,000
- ✅ Zero duplicate external_ids
- ✅ Zero duplicate content
- ✅ All ember_scores between 60-100
- ✅ Maths + English roughly equal (~5,000 each)
- ✅ Valid difficulty distribution
- ✅ All questions have exactly 5 options
- ✅ All questions are published (is_published = true)

---

## 🐛 Troubleshooting

### Issue: Import script fails with "directory not found"
**Solution:** Verify source directory path is correct
```powershell
Test-Path "Prompts\QuestionBank\Claude\ember-ascent-Y3-question-bank"
```

### Issue: JSON parse errors
**Solution:** Check JSON file format
```powershell
node -e "JSON.parse(require('fs').readFileSync('Prompts/QuestionBank/Claude/ember-ascent-Y3-question-bank/maths-Y3/addition_subtraction.json'))"
```

### Issue: Database constraint violations
**Solution:** Check for missing required fields
```sql
-- Find questions missing required fields
SELECT id, external_id, question_text
FROM questions
WHERE year_group = 3
  AND (
    question_text IS NULL 
    OR correct_answer IS NULL
    OR jsonb_array_length(options) != 5
  );
```

### Issue: High error rate during import
**Solution:** Run with smaller batch size
- Edit `reimport-y3-clean.ts`
- Change `batchSize = 50` to `batchSize = 25`
- Rerun import

---

## 📊 Files Created/Modified

| File | Purpose |
|------|---------|
| `scripts/cleanup-y3-data.sql` | Database cleanup script |
| `scripts/reimport-y3-clean.ts` | Clean reimport with duplicate detection |
| `scripts/duplicate-detection-utils.ts` | Reusable duplicate detection utilities |
| `docs/import/DUPLICATE_PREVENTION.md` | Duplicate prevention guide |
| `docs/import/REIMPORT_Y3_GUIDE.md` | This guide |

---

## 🚀 Timeline

| Step | Duration | Can Run Async? |
|------|----------|----------------|
| 1. Backup | 2 min | No |
| 2. Check Stats | 1 min | No |
| 3. Cleanup | 5 min | No |
| 4. Verify Files | 1 min | No |
| 5. Reimport | 15-20 min | No |
| 6. Verify Quality | 2 min | No |
| 7. Ember Scores | 10 sec | No |
| 8. Final Verification | 2 min | No |
| **Total** | **~30 minutes** | - |

---

**Last Updated:** 2026-01-26  
**Status:** Ready to execute  
**Risk Level:** Medium (deletes existing data, but source files are verified)

# Year 3 Import Preparation - Complete ✅

**Date:** 2026-01-22  
**Status:** Ready for Data Import

---

## 🎯 Objectives Completed

Prepared database and codebase to import 10,000 Year 3 questions from Claude-generated JSON files.

---

## ✅ Completed Work

### 1. Database Migrations

#### **Migration 016: Helper Function** ✅
- Created `exec_sql_to_json()` function for schema extraction
- Location: [supabase/migrations/016_add_helper_function.sql](../supabase/migrations/016_add_helper_function.sql)

#### **Migration 017: Y3 Preparation** ✅
- **Year Group Constraints:** Extended to support 3-6 (was 4-6)
  - `questions.year_group` → IN (3, 4, 5, 6)
  - `children.year_group` → IN (3, 4, 5, 6)
- **External ID Column:** Added `external_id VARCHAR(50)` with unique index
  - For deduplication during imports
  - Maps to Y3 question `id` field
- **System Profile:** Created import user
  - UUID: `a0000000-0000-0000-0000-000000000001`
  - Email: `system@edlascent.vault`
  - Name: `EDLAscent Vault - C`
- **Default Values:**
  - `exam_board` → 'generic'
  - `ember_score` → 66
  - `created_by` → system profile UUID
- **Ember Score Functions:**
  - `calculate_ember_score(question_id)` - Calculates score based on:
    - Curriculum alignment (0-25 pts)
    - Exam pattern (0-25 pts)
    - Community feedback (0-15 pts)
    - Technical metrics (0-10 pts)
  - `update_all_ember_scores()` - Batch update function
- Location: [supabase/migrations/017_prepare_y3_questions.sql](../supabase/migrations/017_prepare_y3_questions.sql)

### 2. Test Users ✅

Created 4 test users with 8 children across all tiers:

**Free Tier (2 users):**
- `test.sarah@emberascent.dev` - Sarah Thompson (Emma Y5, Oliver Y3)
- `test.rajesh@emberascent.dev` - Rajesh Patel (Aisha Y4)

**Ascent Tier (1 user):**
- `test.james@emberascent.dev` - James Wilson (Sophia Y6, Harry Y4)

**Summit Tier (1 user):**
- `test.priya@emberascent.dev` - Priya Sharma (Arjun Y5, Lily Y3, Noah Y6)

Password for all: `TestPassword123!`

Location: [scripts/generate-test-users.sql](../scripts/generate-test-users.sql)

### 3. TypeScript Type System ✅

Updated all type definitions to support Year 3:

- [types/index.ts](../types/index.ts)
  - `Child.year_group`: 3 | 4 | 5 | 6
  - `Question.year_group`: 3 | 4 | 5 | 6
- [types/database.ts](../types/database.ts)
  - Updated interface definitions for both tables
- [lib/validations/child.ts](../lib/validations/child.ts)
  - `yearGroupSchema`: z.number().int().min(3).max(6)

### 4. UI Components ✅

Updated user-facing components:

- [components/setup/ChildSetupForm.tsx](../components/setup/ChildSetupForm.tsx)
  - Added "Year 3 (Age 7-8)" option to dropdown

### 5. Import Script ✅

Created comprehensive import script:

- [scripts/import-y3-questions.ts](../scripts/import-y3-questions.ts)
  - **Data Transformations:**
    - Subject: "English" → "english"
    - Difficulty: "Foundation" → "foundation"  
    - Year: "Year 3" → 3
    - Options: `{a,b,c,d,e}` → `[{id:"A", text:"..."}, ...]`
    - Explanation: string → JSONB `{step_by_step, visual, worked_example}`
  - **Deduplication:** Uses `external_id` for upsert logic
  - **Batch Processing:** 50 questions per batch
  - **Progress Tracking:** Real-time feedback during import
  - **Error Handling:** Graceful failure with detailed logs

### 6. Documentation ✅

- [docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - Updated schema documentation
- [data/questions/y3/README.md](../data/questions/y3/README.md) - Y3 data format guide
- [scripts/get-schema-definitions.sql](../scripts/get-schema-definitions.sql) - Schema extraction queries
- [scripts/get-db-schema.ts](../scripts/get-db-schema.ts) - Schema doc generator

---

## 📋 Next Steps

### Step 1: Place Y3 JSON Files
Place your 13 JSON files (10,000 questions) in:
```
data/questions/y3/
├── english-vocabulary-1000.json
├── mathematics-arithmetic-1200.json
├── statistics.json (200 questions - use for testing)
└── ... (other files)
```

Expected JSON format:
```json
{
  "id": "ENG-VOC-syno-F-Y3-00001",
  "subject": "English",
  "topic": "Vocabulary",
  "subtopic": "Synonyms",
  "question_text": "Which word means the same as HAPPY?",
  "question_type": "synonym",
  "options": {
    "a": "sad",
    "b": "joyful",
    "c": "angry",
    "d": "tired"
  },
  "correct_answer": "b",
  "explanation": "HAPPY means feeling joy...",
  "difficulty": "Foundation",
  "year": "Year 3",
  "curriculum_reference": "KS2 English Y3",
  "exam_board": "Generic"
}
```

### Step 2: Test Import (Recommended)
Test with smallest file first:
```bash
# Move only statistics.json to y3/ folder
npx tsx scripts/import-y3-questions.ts

# Verify in Supabase SQL Editor:
SELECT COUNT(*), subject, difficulty 
FROM questions 
WHERE year_group = 3 
GROUP BY subject, difficulty;
```

### Step 3: Full Import
Once test succeeds, add all 13 files and re-run:
```bash
npx tsx scripts/import-y3-questions.ts
```

### Step 4: Calculate Ember Scores
After import completes, run in Supabase SQL Editor:
```sql
SELECT * FROM update_all_ember_scores();
```

### Step 5: Verify Data
```sql
-- Count by subject and difficulty
SELECT 
  subject, 
  difficulty, 
  COUNT(*) as count,
  AVG(ember_score) as avg_score
FROM questions
WHERE year_group = 3
GROUP BY subject, difficulty
ORDER BY subject, difficulty;

-- Check external_id uniqueness
SELECT 
  external_id, 
  COUNT(*) as count
FROM questions
WHERE year_group = 3
GROUP BY external_id
HAVING COUNT(*) > 1;

-- Sample questions
SELECT 
  external_id,
  subject,
  topic,
  difficulty,
  LEFT(question_text, 50) as preview
FROM questions
WHERE year_group = 3
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔧 Technical Details

### Database Changes
- Year 3 now supported in constraints
- `external_id` column for import tracking
- System profile for automated imports
- Ember score calculation functions

### Import Features
- **Idempotent:** Safe to re-run (upserts on external_id)
- **Batch Processing:** 50 questions at a time
- **Error Recovery:** Continues on batch failures
- **Progress Tracking:** Real-time console updates
- **Statistics:** Detailed import summary

### Security
- Uses service role key (bypasses RLS)
- System profile for created_by tracking
- All questions set to published=true
- Default ember_score=66 (verified import baseline)

---

## 📊 Expected Outcomes

After successful import:
- **~10,000 Year 3 questions** in database
- **Mixed subjects:** English, Mathematics, Verbal Reasoning
- **Three difficulty levels:** Foundation, Standard, Challenge
- **Unique tracking:** Via external_id column
- **Calculated scores:** Via ember_score functions

---

## 🐛 Troubleshooting

### Import Script Errors

**"Y3 questions directory not found"**
- Create directory: `data/questions/y3/`
- Add JSON files to directory

**"Missing SUPABASE_SERVICE_ROLE_KEY"**
- Get key from Supabase Dashboard → Settings → API
- Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key`

**"Duplicate key value violates unique constraint"**
- external_id already exists in database
- This is expected on re-runs (upsert will update existing)

**"Column 'year_group' check constraint failed"**
- Run migration 017 first
- Verify constraint: `SELECT * FROM information_schema.check_constraints WHERE constraint_name LIKE '%year_group%';`

### Database Issues

**System profile not found**
- Verify: `SELECT * FROM profiles WHERE email = 'system@edlascent.vault';`
- Should return UUID: `a0000000-0000-0000-0000-000000000001`

**Year 3 constraint not updated**
- Check: `SHOW CREATE TABLE questions;`
- Re-run migration 017 if needed

---

## 📁 File Summary

### Migrations
- `supabase/migrations/016_add_helper_function.sql`
- `supabase/migrations/017_prepare_y3_questions.sql`

### Scripts
- `scripts/import-y3-questions.ts` - Main import script
- `scripts/generate-test-users.sql` - Test user creation
- `scripts/get-db-schema.ts` - Schema documentation generator
- `scripts/get-schema-definitions.sql` - Schema extraction queries

### Types & Validation
- `types/index.ts` - Core type definitions
- `types/database.ts` - Database table types
- `lib/validations/child.ts` - Zod validation schemas

### UI Components
- `components/setup/ChildSetupForm.tsx` - Child profile setup

### Documentation
- `docs/DATABASE_SCHEMA.md` - Complete schema documentation
- `data/questions/y3/README.md` - Y3 data format guide
- `docs/Y3_IMPORT_PREPARATION.md` - This file

---

## ✅ Checklist

- [x] Database migrations run successfully
- [x] Test users created (4 users, 8 children)
- [x] TypeScript types updated
- [x] UI components updated
- [x] Import script created
- [x] Documentation complete
- [ ] Y3 JSON files placed in directory
- [ ] Test import executed (statistics.json)
- [ ] Full import executed (all 13 files)
- [ ] Ember scores calculated
- [ ] Data verification complete

---

**Status:** 🟢 Ready for data import  
**Next Action:** Place Y3 JSON files in `data/questions/y3/` directory

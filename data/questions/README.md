# Question Import Guide

This directory contains JSON files with questions for the Ember Ascent 11+ exam preparation platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install `tsx` which is needed to run the TypeScript import script.

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (if not already present) with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for importing questions as it bypasses Row Level Security (RLS) policies.

You can find these values in your Supabase project:
- Go to https://app.supabase.com
- Select your project
- Navigate to Settings → API
- Copy the URL, anon key, and service_role key

### 3. Run the Import

```bash
npm run import:questions
```

This will:
- Scan the `data/questions/` directory for JSON files
- Parse each file
- Transform questions to match the database schema
- Insert/update questions in batches
- Provide a summary of the import

## Question File Format

Each JSON file should contain an array of questions with this structure:

```json
[
  {
    "id": "unique-question-id",
    "subject": "mathematics",
    "topic": "Fractions",
    "subtopic": "Comparing Fractions",
    "questionText": "Which fraction is the largest?",
    "questionType": "fraction_comparison",
    "options": [
      {"id": "A", "text": "1/4"},
      {"id": "B", "text": "1/3"},
      {"id": "C", "text": "1/2"},
      {"id": "D", "text": "1/5"},
      {"id": "E", "text": "1/6"}
    ],
    "correctAnswer": "C",
    "explanations": {
      "stepByStep": "Detailed step-by-step explanation...",
      "visual": "Visual representation or analogy...",
      "workedExample": "Example showing similar problem..."
    },
    "difficulty": "standard",
    "yearGroup": 5,
    "curriculumReference": "KS2 Maths - Fractions",
    "examBoard": "gl"
  }
]
```

### Field Mapping

The import script transforms camelCase JSON fields to snake_case database columns:

| JSON Field | Database Column |
|------------|-----------------|
| `questionText` | `question_text` |
| `questionType` | `question_type` |
| `correctAnswer` | `correct_answer` |
| `explanations.stepByStep` | `explanations.step_by_step` |
| `explanations.workedExample` | `explanations.worked_example` |
| `yearGroup` | `year_group` |
| `curriculumReference` | `curriculum_reference` |
| `examBoard` | `exam_board` |

## Current Question Sets

### Mathematics
- **File**: `mathematics-fractions-comparing-50.json`
- **Count**: 50 questions
- **Topic**: Fractions - Comparing Fractions
- **Difficulty**: Standard
- **Year Group**: 5

### Verbal Reasoning
- **File**: `verbal-reasoning-synonyms-50.json`
- **Count**: 50 questions
- **Topic**: Synonyms
- **Difficulty**: Standard
- **Year Group**: 5

## Import Features

- ✅ **Batch Processing**: Inserts questions in batches of 50 to avoid timeouts
- ✅ **Upsert Strategy**: Updates existing questions with the same ID
- ✅ **Error Handling**: Continues processing if a batch fails
- ✅ **Progress Reporting**: Shows detailed progress for each file
- ✅ **Verification**: Counts total questions in database after import

## Troubleshooting

### "Missing environment variables" Error

Make sure you have created `.env.local` with all three required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### "Error inserting batch" Messages

This usually means:
1. Database schema doesn't match the question structure
2. Invalid enum values (subject, difficulty, exam_board)
3. RLS policies blocking insert (use service role key)

Check the error message for specific details.

### Questions Not Appearing in App

After import:
1. Verify import was successful (check final count)
2. Check `is_published` is true for questions
3. Verify RLS policies allow reading questions
4. Clear browser cache and reload

## Adding New Questions

1. Create a new JSON file in `data/questions/` following the format above
2. Ensure all IDs are unique across all question files
3. Use lowercase for enum values: `mathematics`, `verbal_reasoning`, `english`
4. Difficulty must be: `foundation`, `standard`, or `challenge`
5. Exam board must be: `gl`, `cem`, `iseb`, or `generic`
6. Run `npm run import:questions` to import

## Database Schema

Questions are stored in the `questions` table with these key fields:

- `id` (uuid, primary key)
- `subject` (enum: verbal_reasoning, english, mathematics)
- `topic` (text)
- `subtopic` (text, nullable)
- `question_type` (text, nullable)
- `question_text` (text)
- `options` (jsonb array)
- `correct_answer` (text)
- `explanations` (jsonb object)
- `difficulty` (enum: foundation, standard, challenge)
- `year_group` (integer: 4, 5, or 6)
- `curriculum_reference` (text, nullable)
- `exam_board` (enum: gl, cem, iseb, generic)
- `ember_score` (integer, 0-100)
- `is_published` (boolean)
- Timestamps: `created_at`, `updated_at`

## Future Enhancements

- [ ] Validate JSON structure before import
- [ ] Calculate Ember Score based on question quality
- [ ] Support for images and diagrams in questions
- [ ] Bulk delete/update operations
- [ ] Import progress bar with ETA
- [ ] Rollback failed imports

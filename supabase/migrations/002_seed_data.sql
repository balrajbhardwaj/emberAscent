-- Ember Ascent - Seed Data for Development/Testing
-- This file populates the database with sample data
-- WARNING: Only run in development/local environments!

-- =============================================================================
-- SAMPLE QUESTIONS
-- =============================================================================

-- Note: In production, profiles are created via Supabase Auth
-- This seed assumes you have test users already created

-- Sample Mathematics Questions (Foundation)
INSERT INTO questions (
    subject,
    topic,
    subtopic,
    question_type,
    question_text,
    options,
    correct_answer,
    explanations,
    difficulty,
    year_group,
    curriculum_reference,
    exam_board,
    ember_score,
    is_published
) VALUES
(
    'mathematics',
    'Number and Place Value',
    'Addition',
    'multiple_choice',
    'What is 127 + 48?',
    '[
        {"id": "a", "text": "165"},
        {"id": "b", "text": "175"},
        {"id": "c", "text": "185"},
        {"id": "d", "text": "195"},
        {"id": "e", "text": "205"}
    ]'::jsonb,
    'b',
    '{
        "step_by_step": "Step 1: Add the ones: 7 + 8 = 15. Write down 5, carry 1.\nStep 2: Add the tens: 2 + 4 + 1 (carried) = 7.\nStep 3: Bring down the hundreds: 1.\nAnswer: 175",
        "visual": "Think of it like stacking blocks:\n🔷🔷🔷🔷🔷🔷🔷 (7 ones)\n🔷🔷🔷🔷🔷🔷🔷🔷 (8 ones)\nMake a group of 10, leaving 5 ones.\nThen add 20 + 40 + 10 = 70, plus 100 = 175",
        "worked_example": "Similar problem: 136 + 57 = ?\n136\n+ 57\n----\n  13 (6+7, carry 1)\n  80 (30+50)\n 100\n----\n 193"
    }'::jsonb,
    'foundation',
    5,
    'NC_M5_NPV_3',
    'generic',
    85,
    true
),
(
    'mathematics',
    'Fractions',
    'Equivalent Fractions',
    'multiple_choice',
    'Which fraction is equivalent to 1/2?',
    '[
        {"id": "a", "text": "2/3"},
        {"id": "b", "text": "3/6"},
        {"id": "c", "text": "2/5"},
        {"id": "d", "text": "3/5"},
        {"id": "e", "text": "1/3"}
    ]'::jsonb,
    'b',
    '{
        "step_by_step": "Step 1: To find equivalent fractions, multiply both numerator and denominator by the same number.\nStep 2: 1/2 × 3/3 = 3/6\nStep 3: Check: 3/6 simplifies back to 1/2 (divide both by 3).",
        "visual": "Picture a pizza:\n🍕 Half a pizza = 1/2\n🍕 If you cut it into 6 slices, half is 3 slices = 3/6\nSame amount of pizza!",
        "worked_example": "Find another equivalent: 1/2 = ?/8\nMultiply top and bottom by 4: (1×4)/(2×4) = 4/8"
    }'::jsonb,
    'standard',
    5,
    'NC_M5_F_2',
    'gl',
    90,
    true
);

-- Sample Verbal Reasoning Questions
INSERT INTO questions (
    subject,
    topic,
    subtopic,
    question_type,
    question_text,
    options,
    correct_answer,
    explanations,
    difficulty,
    year_group,
    curriculum_reference,
    exam_board,
    ember_score,
    is_published
) VALUES
(
    'verbal_reasoning',
    'Vocabulary',
    'Synonyms',
    'multiple_choice',
    'Which word is closest in meaning to HAPPY?',
    '[
        {"id": "a", "text": "Sad"},
        {"id": "b", "text": "Angry"},
        {"id": "c", "text": "Joyful"},
        {"id": "d", "text": "Tired"},
        {"id": "e", "text": "Hungry"}
    ]'::jsonb,
    'c',
    '{
        "step_by_step": "Step 1: HAPPY means feeling pleased and content.\nStep 2: Look for a word with a similar meaning.\nStep 3: JOYFUL means full of joy and happiness.\nThey are synonyms (words with similar meanings).",
        "visual": "Think of a smiley face 😊\nHAPPY = feeling good\nJOYFUL = feeling very good\nBoth express positive emotions!",
        "worked_example": "Similar question: COLD → ?\nFREEZING is similar to COLD (both mean low temperature)\nHOT is opposite (antonym)"
    }'::jsonb,
    'foundation',
    4,
    'NC_E4_V_1',
    'gl',
    75,
    true
);

-- Sample English Questions
INSERT INTO questions (
    subject,
    topic,
    subtopic,
    question_type,
    question_text,
    options,
    correct_answer,
    explanations,
    difficulty,
    year_group,
    curriculum_reference,
    exam_board,
    ember_score,
    is_published
) VALUES
(
    'english',
    'Grammar',
    'Punctuation',
    'multiple_choice',
    'Which sentence is punctuated correctly?',
    '[
        {"id": "a", "text": "The dog barked loudly"},
        {"id": "b", "text": "The dog, barked loudly."},
        {"id": "c", "text": "The dog barked, loudly."},
        {"id": "d", "text": "The dog barked loudly."},
        {"id": "e", "text": "The, dog barked loudly."}
    ]'::jsonb,
    'd',
    '{
        "step_by_step": "Step 1: A sentence must end with punctuation (. ! ?)\nStep 2: Commas are used to separate parts of a sentence, not randomly.\nStep 3: This simple sentence needs no commas, just a full stop at the end.",
        "visual": "Capital letter → Words → Full stop\n[The dog barked loudly.]\n ↑                      ↑\nStart                End",
        "worked_example": "Simple sentence: The cat slept.\nSentence with list: I like apples, oranges, and bananas.\nComplex sentence: After school, I went home."
    }'::jsonb,
    'foundation',
    5,
    'NC_E5_G_2',
    'generic',
    80,
    true
);

-- =============================================================================
-- NOTES FOR CONTENT CREATORS
-- =============================================================================

-- When adding new questions:
-- 1. Always include 5 options (exam standard)
-- 2. Provide all 3 explanation styles
-- 3. Tag with curriculum reference (find on gov.uk NC)
-- 4. Set appropriate difficulty level
-- 5. ember_score should reflect actual quality (don't artificially inflate)
-- 6. Only set is_published = true for ember_score >= 60

-- To add more questions, use this template:
/*
INSERT INTO questions (
    subject, topic, subtopic, question_type,
    question_text, options, correct_answer, explanations,
    difficulty, year_group, curriculum_reference, exam_board,
    ember_score, is_published
) VALUES (
    'mathematics', -- or 'verbal_reasoning', 'english'
    'Topic Name',
    'Subtopic Name',
    'multiple_choice',
    'Your question text here?',
    '[
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"},
        {"id": "e", "text": "Option E"}
    ]'::jsonb,
    'b', -- correct option id
    '{
        "step_by_step": "Clear step-by-step explanation",
        "visual": "Visual/metaphorical explanation for visual learners",
        "worked_example": "Show a similar problem worked through"
    }'::jsonb,
    'foundation', -- or 'standard', 'challenge'
    5, -- year group: 4, 5, or 6
    'NC_M5_XXX_X', -- National Curriculum reference
    'gl', -- or 'cem', 'iseb', 'generic'
    75, -- ember_score (0-100, 60+ to publish)
    true -- is_published
);
*/

-- End of seed data

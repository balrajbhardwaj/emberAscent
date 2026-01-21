-- =============================================================================
-- CURRICULUM ALIGNMENT SYSTEM
-- =============================================================================
-- Stores UK National Curriculum objectives (KS2) and 11+ question taxonomy
-- for curriculum alignment validation and display.
--
-- Legal: National Curriculum content is Crown Copyright under OGL v3.0
-- =============================================================================

-- Curriculum Objectives Table
-- Stores parsed objectives from UK National Curriculum (KS2)
CREATE TABLE IF NOT EXISTS curriculum_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  running_number VARCHAR(20),                 -- Running number
  code VARCHAR(30) UNIQUE NOT NULL,           -- Internal code: Y5-MATH-F-03
  dfe_code VARCHAR(20),                       -- Official DfE code if exists: 5F-2
  
  -- Classification
  subject VARCHAR(50) NOT NULL,               -- Mathematics, English
  key_stage VARCHAR(10) NOT NULL DEFAULT 'KS2',
  year_group INTEGER NOT NULL CHECK (year_group BETWEEN 3 AND 6),
  strand VARCHAR(100) NOT NULL,               -- Fractions, Comprehension
  sub_strand VARCHAR(100),                    -- Comparing fractions
  
  -- Content
  objective_text TEXT NOT NULL,               -- Full curriculum statement
  keywords TEXT[],                            -- Searchable terms
  
  -- Metadata
  statutory BOOLEAN DEFAULT true,             -- Statutory vs non-statutory guidance
  source_document VARCHAR(255),               -- Which PDF it came from
  source_link VARCHAR(255),                   -- Link to PDF
  source_page INTEGER,                        -- Page number in source
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11+ Question Types Table (no curriculum - industry taxonomy)
CREATE TABLE IF NOT EXISTS question_type_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  code VARCHAR(30) UNIQUE NOT NULL,           -- VR-GL-SYN, NVR-GL-SEQ
  
  -- Classification
  category VARCHAR(50) NOT NULL,              -- Verbal Reasoning, Non-Verbal Reasoning
  exam_board VARCHAR(20) NOT NULL,            -- GL, CEM, Generic
  type_name VARCHAR(100) NOT NULL,            -- Synonyms, Sequences
  type_description TEXT,                      -- Detailed description
  
  -- Metadata
  difficulty_range VARCHAR(50),               -- Foundation, Standard, Challenge
  typical_age_range VARCHAR(20),              -- 9-10, 10-11
  keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: Questions to Curriculum Objectives (many-to-many)
CREATE TABLE IF NOT EXISTS question_curriculum_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES curriculum_objectives(id) ON DELETE CASCADE,
  
  -- Alignment metadata
  alignment_strength VARCHAR(20) DEFAULT 'primary',  -- primary, secondary, related
  alignment_confidence INTEGER CHECK (alignment_confidence BETWEEN 0 AND 100),
  
  -- Validation
  validated_by VARCHAR(50),                   -- ai, expert, community
  validated_at TIMESTAMPTZ,
  validator_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_id, objective_id)
);

-- Junction table: Questions to 11+ Types
CREATE TABLE IF NOT EXISTS question_type_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES question_type_taxonomy(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_id, type_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_curriculum_objectives_subject ON curriculum_objectives(subject);
CREATE INDEX IF NOT EXISTS idx_curriculum_objectives_year ON curriculum_objectives(year_group);
CREATE INDEX IF NOT EXISTS idx_curriculum_objectives_strand ON curriculum_objectives(strand);
CREATE INDEX IF NOT EXISTS idx_curriculum_objectives_code ON curriculum_objectives(code);
CREATE INDEX IF NOT EXISTS idx_curriculum_objectives_keywords ON curriculum_objectives USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_question_curriculum_question ON question_curriculum_alignment(question_id);
CREATE INDEX IF NOT EXISTS idx_question_curriculum_objective ON question_curriculum_alignment(objective_id);
CREATE INDEX IF NOT EXISTS idx_question_type_taxonomy_category ON question_type_taxonomy(category);
CREATE INDEX IF NOT EXISTS idx_question_type_taxonomy_exam ON question_type_taxonomy(exam_board);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE curriculum_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_type_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_curriculum_alignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_type_alignment ENABLE ROW LEVEL SECURITY;

-- Everyone can read curriculum objectives (public educational data)
CREATE POLICY "Curriculum objectives are viewable by everyone"
  ON curriculum_objectives FOR SELECT
  USING (true);

-- Everyone can read question types
CREATE POLICY "Question types are viewable by everyone"
  ON question_type_taxonomy FOR SELECT
  USING (true);

-- Everyone can read alignments
CREATE POLICY "Alignments are viewable by everyone"
  ON question_curriculum_alignment FOR SELECT
  USING (true);

CREATE POLICY "Type alignments are viewable by everyone"
  ON question_type_alignment FOR SELECT
  USING (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamp trigger for curriculum_objectives
CREATE TRIGGER update_curriculum_objectives_updated_at
  BEFORE UPDATE ON curriculum_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ADD CURRICULUM REFERENCE TO QUESTIONS TABLE
-- =============================================================================

-- Add primary_curriculum_code column to questions for quick display
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS primary_curriculum_code VARCHAR(30);

COMMENT ON COLUMN questions.primary_curriculum_code IS 
  'Primary curriculum objective code (e.g., Y5-MATH-F-03) or question type code (e.g., VR-GL-SYN)';

-- Index for curriculum code lookups
CREATE INDEX IF NOT EXISTS idx_questions_curriculum_code ON questions(primary_curriculum_code);

-- =============================================================================
-- SEED DATA: 11+ QUESTION TYPE TAXONOMY
-- =============================================================================

INSERT INTO question_type_taxonomy (code, category, exam_board, type_name, type_description, keywords) VALUES
-- Verbal Reasoning - GL Assessment
('VR-GL-SYN', 'Verbal Reasoning', 'GL', 'Synonyms', 'Find words with the same or similar meaning', ARRAY['synonym', 'same meaning', 'similar']),
('VR-GL-ANT', 'Verbal Reasoning', 'GL', 'Antonyms', 'Find words with opposite meanings', ARRAY['antonym', 'opposite', 'contrary']),
('VR-GL-ODD', 'Verbal Reasoning', 'GL', 'Odd One Out', 'Identify the word that does not belong in a group', ARRAY['odd', 'different', 'does not belong']),
('VR-GL-ANA', 'Verbal Reasoning', 'GL', 'Word Analogies', 'Complete word relationships (A is to B as C is to ?)', ARRAY['analogy', 'relationship', 'pair']),
('VR-GL-HID', 'Verbal Reasoning', 'GL', 'Hidden Words', 'Find words hidden within a sentence', ARRAY['hidden', 'concealed', 'find word']),
('VR-GL-COM', 'Verbal Reasoning', 'GL', 'Compound Words', 'Create compound words from given parts', ARRAY['compound', 'combine', 'join words']),
('VR-GL-LET', 'Verbal Reasoning', 'GL', 'Letter Series', 'Complete letter patterns and sequences', ARRAY['letters', 'sequence', 'pattern', 'alphabet']),
('VR-GL-COD', 'Verbal Reasoning', 'GL', 'Letter Codes', 'Decode words using letter substitution', ARRAY['code', 'cipher', 'substitute']),
('VR-GL-NUM', 'Verbal Reasoning', 'GL', 'Number Series', 'Complete number patterns and sequences', ARRAY['numbers', 'sequence', 'pattern']),
('VR-GL-LOG', 'Verbal Reasoning', 'GL', 'Logic Problems', 'Solve logical deduction puzzles', ARRAY['logic', 'deduction', 'reasoning']),
('VR-GL-CLO', 'Verbal Reasoning', 'GL', 'Cloze/Missing Words', 'Fill in missing words in sentences', ARRAY['cloze', 'missing', 'fill in', 'blank']),

-- Non-Verbal Reasoning - GL Assessment
('NVR-GL-SEQ', 'Non-Verbal Reasoning', 'GL', 'Figure Sequences', 'Complete visual pattern sequences', ARRAY['sequence', 'pattern', 'next']),
('NVR-GL-MAT', 'Non-Verbal Reasoning', 'GL', 'Matrices', 'Complete 3x3 visual grids', ARRAY['matrix', 'grid', '3x3']),
('NVR-GL-ODD', 'Non-Verbal Reasoning', 'GL', 'Odd One Out', 'Identify the figure that does not belong', ARRAY['odd', 'different', 'does not fit']),
('NVR-GL-ANA', 'Non-Verbal Reasoning', 'GL', 'Visual Analogies', 'Complete visual relationships', ARRAY['analogy', 'relationship', 'similar']),
('NVR-GL-COD', 'Non-Verbal Reasoning', 'GL', 'Codes', 'Decode visual symbols', ARRAY['code', 'symbol', 'decode']),
('NVR-GL-REF', 'Non-Verbal Reasoning', 'GL', 'Reflection/Rotation', 'Identify reflected or rotated figures', ARRAY['reflection', 'rotation', 'mirror', 'turn']),
('NVR-GL-FOL', 'Non-Verbal Reasoning', 'GL', 'Paper Folding', 'Predict paper folding outcomes', ARRAY['fold', 'paper', 'punch']),
('NVR-GL-CUB', 'Non-Verbal Reasoning', 'GL', 'Cube Nets', 'Match cube nets to 3D cubes', ARRAY['cube', 'net', '3D', 'fold']),
('NVR-GL-SPA', 'Non-Verbal Reasoning', 'GL', 'Spatial Reasoning', 'Manipulate shapes mentally', ARRAY['spatial', 'mental', 'visualize']),
('NVR-GL-CLS', 'Non-Verbal Reasoning', 'GL', 'Figure Classification', 'Group figures by common features', ARRAY['classify', 'group', 'similar']),

-- CEM variants
('VR-CEM-CLO', 'Verbal Reasoning', 'CEM', 'Cloze Passages', 'Fill in missing words in longer passages', ARRAY['cloze', 'passage', 'comprehension']),
('VR-CEM-SHU', 'Verbal Reasoning', 'CEM', 'Shuffled Sentences', 'Reorder words to form sentences', ARRAY['shuffle', 'reorder', 'sentence']),
('NVR-CEM-MIX', 'Non-Verbal Reasoning', 'CEM', 'Mixed NVR', 'Various NVR question types in mixed format', ARRAY['mixed', 'varied', 'CEM style'])
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- SEED DATA: MATHEMATICS CURRICULUM OBJECTIVES (KS2 - Years 3-6)
-- =============================================================================

-- Year 3 Mathematics
INSERT INTO curriculum_objectives (code, dfe_code, subject, year_group, strand, sub_strand, objective_text, keywords, source_document) VALUES
-- Number and Place Value
('Y3-MATH-NPV-01', '3N1', 'Mathematics', 3, 'Number and Place Value', 'Counting', 'Count from 0 in multiples of 4, 8, 50 and 100; find 10 or 100 more or less than a given number', ARRAY['counting', 'multiples', 'sequences', '4', '8', '50', '100'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-NPV-02', '3N2', 'Mathematics', 3, 'Number and Place Value', 'Place Value', 'Recognise the place value of each digit in a 3-digit number (100s, 10s, 1s)', ARRAY['place value', 'digits', 'hundreds', 'tens', 'ones'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-NPV-03', '3N3', 'Mathematics', 3, 'Number and Place Value', 'Comparing', 'Compare and order numbers up to 1,000', ARRAY['compare', 'order', 'greater', 'less', 'thousand'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-NPV-04', '3N4', 'Mathematics', 3, 'Number and Place Value', 'Reading/Writing', 'Identify, represent and estimate numbers using different representations', ARRAY['represent', 'estimate', 'number line', 'diagrams'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-NPV-05', '3N5', 'Mathematics', 3, 'Number and Place Value', 'Reading/Writing', 'Read and write numbers up to 1,000 in numerals and in words', ARRAY['read', 'write', 'numerals', 'words', 'thousand'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-NPV-06', '3N6', 'Mathematics', 3, 'Number and Place Value', 'Problem Solving', 'Solve number problems and practical problems involving these ideas', ARRAY['problem solving', 'practical', 'number'], 'National Curriculum Mathematics KS2'),

-- Addition and Subtraction Year 3
('Y3-MATH-AS-01', '3C1', 'Mathematics', 3, 'Addition and Subtraction', 'Mental Methods', 'Add and subtract numbers mentally, including: a 3-digit number and 1s, a 3-digit number and 10s, a 3-digit number and 100s', ARRAY['mental', 'addition', 'subtraction', '3-digit'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-AS-02', '3C2', 'Mathematics', 3, 'Addition and Subtraction', 'Written Methods', 'Add and subtract numbers with up to 3 digits, using formal written methods of columnar addition and subtraction', ARRAY['column', 'formal', 'written', 'addition', 'subtraction'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-AS-03', '3C3', 'Mathematics', 3, 'Addition and Subtraction', 'Estimation', 'Estimate the answer to a calculation and use inverse operations to check answers', ARRAY['estimate', 'inverse', 'check', 'verify'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-AS-04', '3C4', 'Mathematics', 3, 'Addition and Subtraction', 'Problem Solving', 'Solve problems, including missing number problems, using number facts, place value, and more complex addition and subtraction', ARRAY['problem', 'missing number', 'facts'], 'National Curriculum Mathematics KS2'),

-- Multiplication and Division Year 3
('Y3-MATH-MD-01', '3C5', 'Mathematics', 3, 'Multiplication and Division', 'Tables', 'Recall and use multiplication and division facts for the 3, 4 and 8 multiplication tables', ARRAY['times tables', 'multiplication', 'division', '3', '4', '8'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-MD-02', '3C6', 'Mathematics', 3, 'Multiplication and Division', 'Written Methods', 'Write and calculate mathematical statements for multiplication and division using the multiplication tables they know', ARRAY['calculate', 'statements', 'multiplication', 'division'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-MD-03', '3C7', 'Mathematics', 3, 'Multiplication and Division', 'Problem Solving', 'Solve problems, including missing number problems, involving multiplication and division', ARRAY['problem', 'missing number', 'multiplication', 'division'], 'National Curriculum Mathematics KS2'),

-- Fractions Year 3
('Y3-MATH-F-01', '3F1', 'Mathematics', 3, 'Fractions', 'Understanding', 'Count up and down in tenths; recognise that tenths arise from dividing an object into 10 equal parts', ARRAY['tenths', 'count', 'divide', 'equal parts'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-F-02', '3F2', 'Mathematics', 3, 'Fractions', 'Understanding', 'Recognise, find and write fractions of a discrete set of objects: unit fractions and non-unit fractions with small denominators', ARRAY['fractions', 'unit', 'non-unit', 'denominator'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-F-03', '3F3', 'Mathematics', 3, 'Fractions', 'Equivalence', 'Recognise and show, using diagrams, equivalent fractions with small denominators', ARRAY['equivalent', 'diagrams', 'fractions'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-F-04', '3F4', 'Mathematics', 3, 'Fractions', 'Operations', 'Add and subtract fractions with the same denominator within one whole', ARRAY['add', 'subtract', 'same denominator', 'fractions'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-F-05', '3F5', 'Mathematics', 3, 'Fractions', 'Comparing', 'Compare and order unit fractions, and fractions with the same denominators', ARRAY['compare', 'order', 'unit fractions'], 'National Curriculum Mathematics KS2'),

-- Year 4 Mathematics
-- Number and Place Value
('Y4-MATH-NPV-01', '4N1', 'Mathematics', 4, 'Number and Place Value', 'Counting', 'Count in multiples of 6, 7, 9, 25 and 1,000', ARRAY['counting', 'multiples', '6', '7', '9', '25', '1000'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-02', '4N2', 'Mathematics', 4, 'Number and Place Value', 'Place Value', 'Find 1,000 more or less than a given number', ARRAY['1000', 'more', 'less', 'thousand'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-03', '4N3', 'Mathematics', 4, 'Number and Place Value', 'Place Value', 'Recognise the place value of each digit in a 4-digit number (1000s, 100s, 10s, 1s)', ARRAY['place value', 'digits', 'thousands', '4-digit'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-04', '4N4', 'Mathematics', 4, 'Number and Place Value', 'Ordering', 'Order and compare numbers beyond 1,000', ARRAY['order', 'compare', 'greater', 'less'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-05', '4N5', 'Mathematics', 4, 'Number and Place Value', 'Negative Numbers', 'Count backwards through 0 to include negative numbers', ARRAY['negative', 'count backwards', 'zero', 'below zero'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-06', '4N6', 'Mathematics', 4, 'Number and Place Value', 'Roman Numerals', 'Read Roman numerals to 100 (I to C) and know that over time, the numeral system changed to include the concept of 0', ARRAY['roman numerals', 'I', 'V', 'X', 'L', 'C', 'zero'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-NPV-07', '4N7', 'Mathematics', 4, 'Number and Place Value', 'Rounding', 'Round any number to the nearest 10, 100 or 1,000', ARRAY['rounding', 'nearest', '10', '100', '1000'], 'National Curriculum Mathematics KS2'),

-- Addition and Subtraction Year 4
('Y4-MATH-AS-01', '4C1', 'Mathematics', 4, 'Addition and Subtraction', 'Written Methods', 'Add and subtract numbers with up to 4 digits using the formal written methods of columnar addition and subtraction', ARRAY['column', '4-digit', 'addition', 'subtraction', 'formal'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-AS-02', '4C2', 'Mathematics', 4, 'Addition and Subtraction', 'Estimation', 'Estimate and use inverse operations to check answers to a calculation', ARRAY['estimate', 'inverse', 'check'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-AS-03', '4C3', 'Mathematics', 4, 'Addition and Subtraction', 'Problem Solving', 'Solve addition and subtraction two-step problems in contexts, deciding which operations and methods to use', ARRAY['two-step', 'problem', 'context', 'methods'], 'National Curriculum Mathematics KS2'),

-- Multiplication and Division Year 4
('Y4-MATH-MD-01', '4C4', 'Mathematics', 4, 'Multiplication and Division', 'Tables', 'Recall multiplication and division facts for multiplication tables up to 12 × 12', ARRAY['times tables', '12', 'multiplication', 'division', 'facts'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-MD-02', '4C5', 'Mathematics', 4, 'Multiplication and Division', 'Mental Methods', 'Use place value, known and derived facts to multiply and divide mentally', ARRAY['mental', 'place value', 'derived facts'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-MD-03', '4C6', 'Mathematics', 4, 'Multiplication and Division', 'Written Methods', 'Multiply 2-digit and 3-digit numbers by a 1-digit number using formal written layout', ARRAY['multiply', '2-digit', '3-digit', 'formal', 'written'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-MD-04', '4C7', 'Mathematics', 4, 'Multiplication and Division', 'Problem Solving', 'Solve problems involving multiplying and adding, including using the distributive law', ARRAY['distributive', 'problem', 'multiply', 'add'], 'National Curriculum Mathematics KS2'),

-- Fractions Year 4
('Y4-MATH-F-01', '4F1', 'Mathematics', 4, 'Fractions', 'Equivalence', 'Recognise and show, using diagrams, families of common equivalent fractions', ARRAY['equivalent', 'families', 'diagrams', 'fractions'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-02', '4F2', 'Mathematics', 4, 'Fractions', 'Counting', 'Count up and down in hundredths; recognise that hundredths arise when dividing an object by 100', ARRAY['hundredths', 'count', '100', 'divide'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-03', '4F3', 'Mathematics', 4, 'Fractions', 'Operations', 'Add and subtract fractions with the same denominator', ARRAY['add', 'subtract', 'same denominator'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-04', '4F4', 'Mathematics', 4, 'Fractions', 'Decimals', 'Recognise and write decimal equivalents of any number of tenths or hundredths', ARRAY['decimal', 'tenths', 'hundredths', 'equivalents'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-05', '4F5', 'Mathematics', 4, 'Fractions', 'Decimals', 'Recognise and write decimal equivalents to 1/4, 1/2, 3/4', ARRAY['decimal', 'quarter', 'half', 'three quarters'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-06', '4F6', 'Mathematics', 4, 'Fractions', 'Decimals', 'Find the effect of dividing a 1- or 2-digit number by 10 and 100', ARRAY['divide', '10', '100', 'decimal'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-07', '4F7', 'Mathematics', 4, 'Fractions', 'Rounding', 'Round decimals with 1 decimal place to the nearest whole number', ARRAY['round', 'decimal', 'whole number'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-08', '4F8', 'Mathematics', 4, 'Fractions', 'Comparing', 'Compare numbers with the same number of decimal places up to 2 decimal places', ARRAY['compare', 'decimal places', 'order'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-F-09', '4F9', 'Mathematics', 4, 'Fractions', 'Problem Solving', 'Solve simple measure and money problems involving fractions and decimals to 2 decimal places', ARRAY['money', 'measure', 'fractions', 'decimals', 'problem'], 'National Curriculum Mathematics KS2'),

-- Year 5 Mathematics
-- Number and Place Value
('Y5-MATH-NPV-01', '5N1', 'Mathematics', 5, 'Number and Place Value', 'Reading/Writing', 'Read, write, order and compare numbers to at least 1,000,000 and determine the value of each digit', ARRAY['million', 'read', 'write', 'order', 'compare', 'digit'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-NPV-02', '5N2', 'Mathematics', 5, 'Number and Place Value', 'Counting', 'Count forwards or backwards in steps of powers of 10 for any given number up to 1,000,000', ARRAY['count', 'powers of 10', 'million', 'forwards', 'backwards'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-NPV-03', '5N3', 'Mathematics', 5, 'Number and Place Value', 'Negative Numbers', 'Interpret negative numbers in context, count forwards and backwards with positive and negative whole numbers', ARRAY['negative', 'context', 'count', 'temperature'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-NPV-04', '5N4', 'Mathematics', 5, 'Number and Place Value', 'Rounding', 'Round any number up to 1,000,000 to the nearest 10, 100, 1,000, 10,000 and 100,000', ARRAY['round', 'million', 'nearest'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-NPV-05', '5N5', 'Mathematics', 5, 'Number and Place Value', 'Problem Solving', 'Solve number problems and practical problems that involve all of the above', ARRAY['problem', 'practical'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-NPV-06', '5N6', 'Mathematics', 5, 'Number and Place Value', 'Roman Numerals', 'Read Roman numerals to 1,000 (M) and recognise years written in Roman numerals', ARRAY['roman numerals', 'M', 'years', '1000'], 'National Curriculum Mathematics KS2'),

-- Addition and Subtraction Year 5
('Y5-MATH-AS-01', '5C1', 'Mathematics', 5, 'Addition and Subtraction', 'Written Methods', 'Add and subtract whole numbers with more than 4 digits, including using formal written methods (columnar addition and subtraction)', ARRAY['column', '4-digit', 'formal', 'addition', 'subtraction'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-AS-02', '5C2', 'Mathematics', 5, 'Addition and Subtraction', 'Mental Methods', 'Add and subtract numbers mentally with increasingly large numbers', ARRAY['mental', 'large numbers'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-AS-03', '5C3', 'Mathematics', 5, 'Addition and Subtraction', 'Estimation', 'Use rounding to check answers to calculations and determine, in the context of a problem, levels of accuracy', ARRAY['rounding', 'check', 'accuracy', 'estimation'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-AS-04', '5C4', 'Mathematics', 5, 'Addition and Subtraction', 'Problem Solving', 'Solve addition and subtraction multi-step problems in contexts, deciding which operations and methods to use and why', ARRAY['multi-step', 'problem', 'context', 'methods'], 'National Curriculum Mathematics KS2'),

-- Multiplication and Division Year 5
('Y5-MATH-MD-01', '5C5', 'Mathematics', 5, 'Multiplication and Division', 'Factors', 'Identify multiples and factors, including finding all factor pairs of a number, and common factors of 2 numbers', ARRAY['multiples', 'factors', 'factor pairs', 'common factors'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-02', '5C6', 'Mathematics', 5, 'Multiplication and Division', 'Prime Numbers', 'Know and use the vocabulary of prime numbers, prime factors and composite (non-prime) numbers', ARRAY['prime', 'prime factors', 'composite', 'non-prime'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-03', '5C7', 'Mathematics', 5, 'Multiplication and Division', 'Square/Cube', 'Establish whether a number up to 100 is prime and recall prime numbers up to 19', ARRAY['prime', '100', 'recall', '19'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-04', '5C8', 'Mathematics', 5, 'Multiplication and Division', 'Written Methods', 'Multiply numbers up to 4 digits by a 1- or 2-digit number using a formal written method', ARRAY['multiply', '4-digit', '2-digit', 'formal', 'long multiplication'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-05', '5C9', 'Mathematics', 5, 'Multiplication and Division', 'Written Methods', 'Multiply and divide numbers mentally, drawing upon known facts', ARRAY['mental', 'multiply', 'divide', 'known facts'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-06', '5C10', 'Mathematics', 5, 'Multiplication and Division', 'Written Methods', 'Divide numbers up to 4 digits by a 1-digit number using the formal written method of short division', ARRAY['divide', '4-digit', 'short division', 'formal'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-07', '5C11', 'Mathematics', 5, 'Multiplication and Division', 'Remainders', 'Multiply and divide by 10, 100 and 1,000', ARRAY['multiply', 'divide', '10', '100', '1000'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-08', '5C12', 'Mathematics', 5, 'Multiplication and Division', 'Square/Cube', 'Recognise and use square numbers and cube numbers, and the notation for squared (²) and cubed (³)', ARRAY['square', 'cube', 'squared', 'cubed', 'notation'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-09', '5C13', 'Mathematics', 5, 'Multiplication and Division', 'Problem Solving', 'Solve problems involving multiplication and division, including using their knowledge of factors and multiples, squares and cubes', ARRAY['problem', 'factors', 'multiples', 'squares', 'cubes'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-MD-10', '5C14', 'Mathematics', 5, 'Multiplication and Division', 'Problem Solving', 'Solve problems involving addition, subtraction, multiplication and division and a combination of these', ARRAY['problem', 'combination', 'operations'], 'National Curriculum Mathematics KS2'),

-- Fractions Year 5
('Y5-MATH-F-01', '5F1', 'Mathematics', 5, 'Fractions', 'Comparing', 'Compare and order fractions whose denominators are all multiples of the same number', ARRAY['compare', 'order', 'denominators', 'multiples'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-02', '5F2', 'Mathematics', 5, 'Fractions', 'Equivalence', 'Identify, name and write equivalent fractions of a given fraction, represented visually, including tenths and hundredths', ARRAY['equivalent', 'visual', 'tenths', 'hundredths'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-03', '5F3', 'Mathematics', 5, 'Fractions', 'Mixed Numbers', 'Recognise mixed numbers and improper fractions and convert from one form to the other', ARRAY['mixed numbers', 'improper', 'convert'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-04', '5F4', 'Mathematics', 5, 'Fractions', 'Operations', 'Add and subtract fractions with the same denominator, and denominators that are multiples of the same number', ARRAY['add', 'subtract', 'denominator', 'multiples'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-05', '5F5', 'Mathematics', 5, 'Fractions', 'Operations', 'Multiply proper fractions and mixed numbers by whole numbers, supported by materials and diagrams', ARRAY['multiply', 'proper fractions', 'mixed numbers', 'whole numbers'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-06', '5F6', 'Mathematics', 5, 'Fractions', 'Decimals', 'Read and write decimal numbers as fractions', ARRAY['decimal', 'fractions', 'convert'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-07', '5F7', 'Mathematics', 5, 'Fractions', 'Decimals', 'Recognise and use thousandths and relate them to tenths, hundredths and decimal equivalents', ARRAY['thousandths', 'tenths', 'hundredths', 'decimal'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-08', '5F8', 'Mathematics', 5, 'Fractions', 'Rounding', 'Round decimals with 2 decimal places to the nearest whole number and to 1 decimal place', ARRAY['round', 'decimal places', 'whole number'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-09', '5F9', 'Mathematics', 5, 'Fractions', 'Decimals', 'Read, write, order and compare numbers with up to 3 decimal places', ARRAY['read', 'write', 'order', 'compare', '3 decimal places'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-10', '5F10', 'Mathematics', 5, 'Fractions', 'Problem Solving', 'Solve problems involving number up to 3 decimal places', ARRAY['problem', 'decimal', '3 decimal places'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-11', '5F11', 'Mathematics', 5, 'Fractions', 'Percentages', 'Recognise the per cent symbol (%) and understand that per cent relates to "number of parts per 100"', ARRAY['percent', 'percentage', '100', 'symbol'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-12', '5F12', 'Mathematics', 5, 'Fractions', 'Percentages', 'Write percentages as a fraction with denominator 100, and as a decimal', ARRAY['percentage', 'fraction', 'decimal', 'convert'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-F-13', '5F13', 'Mathematics', 5, 'Fractions', 'Problem Solving', 'Solve problems which require knowing percentage and decimal equivalents of 1/2, 1/4, 1/5, 2/5, 4/5', ARRAY['percentage', 'decimal', 'equivalents', 'problem'], 'National Curriculum Mathematics KS2'),

-- Year 6 Mathematics
-- Number and Place Value
('Y6-MATH-NPV-01', '6N1', 'Mathematics', 6, 'Number and Place Value', 'Reading/Writing', 'Read, write, order and compare numbers up to 10,000,000 and determine the value of each digit', ARRAY['10 million', 'read', 'write', 'order', 'compare'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-NPV-02', '6N2', 'Mathematics', 6, 'Number and Place Value', 'Rounding', 'Round any whole number to a required degree of accuracy', ARRAY['round', 'accuracy', 'whole number'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-NPV-03', '6N3', 'Mathematics', 6, 'Number and Place Value', 'Negative Numbers', 'Use negative numbers in context, and calculate intervals across 0', ARRAY['negative', 'context', 'intervals', 'zero'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-NPV-04', '6N4', 'Mathematics', 6, 'Number and Place Value', 'Problem Solving', 'Solve number and practical problems that involve all of the above', ARRAY['problem', 'practical'], 'National Curriculum Mathematics KS2'),

-- Addition, Subtraction, Multiplication and Division Year 6
('Y6-MATH-ASMD-01', '6C1', 'Mathematics', 6, 'Four Operations', 'Written Methods', 'Multiply multi-digit numbers up to 4 digits by a 2-digit whole number using the formal written method of long multiplication', ARRAY['long multiplication', '4-digit', '2-digit', 'formal'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-02', '6C2', 'Mathematics', 6, 'Four Operations', 'Written Methods', 'Divide numbers up to 4 digits by a 2-digit whole number using the formal written method of long division', ARRAY['long division', '4-digit', '2-digit', 'formal'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-03', '6C3', 'Mathematics', 6, 'Four Operations', 'Written Methods', 'Divide numbers up to 4 digits by a 2-digit number using the formal written method of short division where appropriate', ARRAY['short division', '4-digit', '2-digit'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-04', '6C4', 'Mathematics', 6, 'Four Operations', 'Mental Methods', 'Perform mental calculations, including with mixed operations and large numbers', ARRAY['mental', 'mixed operations', 'large numbers'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-05', '6C5', 'Mathematics', 6, 'Four Operations', 'Remainders', 'Interpret remainders as whole number remainders, fractions, or by rounding, as appropriate for the context', ARRAY['remainders', 'fractions', 'rounding', 'context'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-06', '6C6', 'Mathematics', 6, 'Four Operations', 'Factors', 'Identify common factors, common multiples and prime numbers', ARRAY['factors', 'multiples', 'prime', 'common'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-07', '6C7', 'Mathematics', 6, 'Four Operations', 'Order of Operations', 'Use their knowledge of the order of operations to carry out calculations involving the 4 operations', ARRAY['BODMAS', 'BIDMAS', 'order of operations', 'brackets'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-08', '6C8', 'Mathematics', 6, 'Four Operations', 'Problem Solving', 'Solve addition and subtraction multi-step problems in contexts, deciding which operations and methods to use and why', ARRAY['multi-step', 'problem', 'context'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-09', '6C9', 'Mathematics', 6, 'Four Operations', 'Problem Solving', 'Solve problems involving addition, subtraction, multiplication and division', ARRAY['problem', 'four operations'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-ASMD-10', '6C10', 'Mathematics', 6, 'Four Operations', 'Estimation', 'Use estimation to check answers to calculations and determine, in the context of a problem, an appropriate degree of accuracy', ARRAY['estimation', 'check', 'accuracy'], 'National Curriculum Mathematics KS2'),

-- Fractions Year 6
('Y6-MATH-F-01', '6F1', 'Mathematics', 6, 'Fractions', 'Simplifying', 'Use common factors to simplify fractions; use common multiples to express fractions in the same denomination', ARRAY['simplify', 'common factors', 'common multiples', 'denominator'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-02', '6F2', 'Mathematics', 6, 'Fractions', 'Comparing', 'Compare and order fractions, including fractions >1', ARRAY['compare', 'order', 'improper', 'greater than 1'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-03', '6F3', 'Mathematics', 6, 'Fractions', 'Operations', 'Add and subtract fractions with different denominators and mixed numbers, using the concept of equivalent fractions', ARRAY['add', 'subtract', 'different denominators', 'mixed numbers', 'equivalent'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-04', '6F4', 'Mathematics', 6, 'Fractions', 'Operations', 'Multiply simple pairs of proper fractions, writing the answer in its simplest form', ARRAY['multiply', 'proper fractions', 'simplest form'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-05', '6F5', 'Mathematics', 6, 'Fractions', 'Operations', 'Divide proper fractions by whole numbers', ARRAY['divide', 'proper fractions', 'whole numbers'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-06', '6F6', 'Mathematics', 6, 'Fractions', 'Decimals', 'Associate a fraction with division and calculate decimal fraction equivalents', ARRAY['division', 'decimal', 'equivalents'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-07', '6F7', 'Mathematics', 6, 'Fractions', 'Decimals', 'Identify the value of each digit in numbers given to 3 decimal places and multiply and divide numbers by 10, 100 and 1,000', ARRAY['decimal places', 'multiply', 'divide', '10', '100', '1000'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-08', '6F8', 'Mathematics', 6, 'Fractions', 'Decimals', 'Multiply 1-digit numbers with up to 2 decimal places by whole numbers', ARRAY['multiply', 'decimal places', 'whole numbers'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-09', '6F9', 'Mathematics', 6, 'Fractions', 'Decimals', 'Use written division methods in cases where the answer has up to 2 decimal places', ARRAY['division', 'decimal places', 'written method'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-10', '6F10', 'Mathematics', 6, 'Fractions', 'Problem Solving', 'Solve problems which require answers to be rounded to specified degrees of accuracy', ARRAY['problem', 'rounding', 'accuracy'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-11', '6F11', 'Mathematics', 6, 'Fractions', 'Percentages', 'Recall and use equivalences between simple fractions, decimals and percentages', ARRAY['equivalences', 'fractions', 'decimals', 'percentages'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-F-12', '6F12', 'Mathematics', 6, 'Fractions', 'Percentages', 'Solve problems involving the calculation of percentages and the use of percentages for comparison', ARRAY['percentage', 'calculate', 'comparison', 'problem'], 'National Curriculum Mathematics KS2'),

-- Ratio and Proportion Year 6
('Y6-MATH-RP-01', '6R1', 'Mathematics', 6, 'Ratio and Proportion', 'Understanding', 'Solve problems involving the relative sizes of 2 quantities where missing values can be found by using integer multiplication and division facts', ARRAY['ratio', 'relative size', 'multiplication', 'division'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-RP-02', '6R2', 'Mathematics', 6, 'Ratio and Proportion', 'Understanding', 'Solve problems involving the calculation of percentages and the use of percentages for comparison', ARRAY['percentage', 'comparison', 'problem'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-RP-03', '6R3', 'Mathematics', 6, 'Ratio and Proportion', 'Scale', 'Solve problems involving similar shapes where the scale factor is known or can be found', ARRAY['scale factor', 'similar shapes', 'enlargement'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-RP-04', '6R4', 'Mathematics', 6, 'Ratio and Proportion', 'Unequal Sharing', 'Solve problems involving unequal sharing and grouping using knowledge of fractions and multiples', ARRAY['unequal sharing', 'grouping', 'fractions', 'multiples'], 'National Curriculum Mathematics KS2'),

-- Algebra Year 6
('Y6-MATH-A-01', '6A1', 'Mathematics', 6, 'Algebra', 'Expressions', 'Use simple formulae', ARRAY['formulae', 'formula', 'substitute'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-A-02', '6A2', 'Mathematics', 6, 'Algebra', 'Expressions', 'Generate and describe linear number sequences', ARRAY['linear', 'sequence', 'generate', 'describe'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-A-03', '6A3', 'Mathematics', 6, 'Algebra', 'Equations', 'Express missing number problems algebraically', ARRAY['algebraic', 'missing number', 'equation'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-A-04', '6A4', 'Mathematics', 6, 'Algebra', 'Equations', 'Find pairs of numbers that satisfy an equation with 2 unknowns', ARRAY['equation', 'unknowns', 'pairs', 'satisfy'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-A-05', '6A5', 'Mathematics', 6, 'Algebra', 'Equations', 'Enumerate possibilities of combinations of 2 variables', ARRAY['combinations', 'variables', 'enumerate', 'possibilities'], 'National Curriculum Mathematics KS2'),

-- Measurement (common across years)
('Y3-MATH-M-01', '3M1', 'Mathematics', 3, 'Measurement', 'Length/Mass/Capacity', 'Measure, compare, add and subtract: lengths (m/cm/mm); mass (kg/g); volume/capacity (l/ml)', ARRAY['measure', 'length', 'mass', 'capacity', 'volume'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-M-02', '3M2', 'Mathematics', 3, 'Measurement', 'Money', 'Add and subtract amounts of money to give change, using both £ and p in practical contexts', ARRAY['money', 'change', 'pounds', 'pence'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-M-03', '3M3', 'Mathematics', 3, 'Measurement', 'Time', 'Tell and write the time from an analogue clock, including using Roman numerals', ARRAY['time', 'analogue', 'clock', 'roman numerals'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-M-04', '3M4', 'Mathematics', 3, 'Measurement', 'Perimeter', 'Measure the perimeter of simple 2-D shapes', ARRAY['perimeter', '2D', 'shapes', 'measure'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-M-01', '4M1', 'Mathematics', 4, 'Measurement', 'Converting', 'Convert between different units of measure', ARRAY['convert', 'units', 'measure'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-M-02', '4M2', 'Mathematics', 4, 'Measurement', 'Area', 'Find the area of rectilinear shapes by counting squares', ARRAY['area', 'squares', 'rectilinear'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-M-01', '5M1', 'Mathematics', 5, 'Measurement', 'Converting', 'Convert between different units of metric measure', ARRAY['convert', 'metric', 'units'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-M-02', '5M2', 'Mathematics', 5, 'Measurement', 'Perimeter/Area', 'Calculate and compare the area of rectangles and estimate the area of irregular shapes', ARRAY['area', 'rectangles', 'irregular', 'estimate'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-M-03', '5M3', 'Mathematics', 5, 'Measurement', 'Volume', 'Estimate volume and capacity', ARRAY['volume', 'capacity', 'estimate'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-M-01', '6M1', 'Mathematics', 6, 'Measurement', 'Converting', 'Solve problems involving the calculation and conversion of units of measure', ARRAY['convert', 'units', 'problem'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-M-02', '6M2', 'Mathematics', 6, 'Measurement', 'Perimeter/Area', 'Recognise that shapes with the same areas can have different perimeters and vice versa', ARRAY['area', 'perimeter', 'same', 'different'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-M-03', '6M3', 'Mathematics', 6, 'Measurement', 'Area', 'Calculate the area of parallelograms and triangles', ARRAY['area', 'parallelogram', 'triangle', 'calculate'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-M-04', '6M4', 'Mathematics', 6, 'Measurement', 'Volume', 'Calculate, estimate and compare volume of cubes and cuboids', ARRAY['volume', 'cube', 'cuboid', 'calculate'], 'National Curriculum Mathematics KS2'),

-- Geometry - Properties of Shapes
('Y3-MATH-G-01', '3G1', 'Mathematics', 3, 'Geometry', 'Properties', 'Draw 2-D shapes and make 3-D shapes using modelling materials', ARRAY['2D', '3D', 'shapes', 'draw', 'make'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-G-02', '3G2', 'Mathematics', 3, 'Geometry', 'Properties', 'Recognise 3-D shapes in different orientations and describe them', ARRAY['3D', 'orientation', 'describe'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-G-03', '3G3', 'Mathematics', 3, 'Geometry', 'Angles', 'Recognise angles as a property of shape or a description of a turn', ARRAY['angles', 'turn', 'property'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-G-04', '3G4', 'Mathematics', 3, 'Geometry', 'Lines', 'Identify horizontal and vertical lines and pairs of perpendicular and parallel lines', ARRAY['horizontal', 'vertical', 'perpendicular', 'parallel'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-G-01', '4G1', 'Mathematics', 4, 'Geometry', 'Angles', 'Compare and classify geometric shapes, including quadrilaterals and triangles, based on their properties', ARRAY['classify', 'quadrilaterals', 'triangles', 'properties'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-G-02', '4G2', 'Mathematics', 4, 'Geometry', 'Angles', 'Identify acute and obtuse angles and compare and order angles', ARRAY['acute', 'obtuse', 'angles', 'compare', 'order'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-G-03', '4G3', 'Mathematics', 4, 'Geometry', 'Symmetry', 'Identify lines of symmetry in 2-D shapes presented in different orientations', ARRAY['symmetry', '2D', 'orientation', 'lines'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-G-01', '5G1', 'Mathematics', 5, 'Geometry', 'Properties', 'Identify 3-D shapes, including cubes and other cuboids, from 2-D representations', ARRAY['3D', '2D', 'representation', 'cubes', 'cuboids'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-G-02', '5G2', 'Mathematics', 5, 'Geometry', 'Angles', 'Know angles are measured in degrees: estimate and compare acute, obtuse and reflex angles', ARRAY['degrees', 'acute', 'obtuse', 'reflex', 'estimate'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-G-03', '5G3', 'Mathematics', 5, 'Geometry', 'Angles', 'Draw given angles, and measure them in degrees', ARRAY['draw', 'measure', 'degrees', 'protractor'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-G-04', '5G4', 'Mathematics', 5, 'Geometry', 'Angles', 'Identify angles at a point and one whole turn, angles at a point on a straight line and vertically opposite angles', ARRAY['angles at point', 'straight line', 'vertically opposite', '360', '180'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-01', '6G1', 'Mathematics', 6, 'Geometry', 'Properties', 'Draw 2-D shapes using given dimensions and angles', ARRAY['2D', 'dimensions', 'angles', 'draw'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-02', '6G2', 'Mathematics', 6, 'Geometry', 'Properties', 'Recognise, describe and build simple 3-D shapes, including making nets', ARRAY['3D', 'nets', 'build', 'describe'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-03', '6G3', 'Mathematics', 6, 'Geometry', 'Properties', 'Compare and classify geometric shapes based on their properties and sizes', ARRAY['classify', 'properties', 'sizes', 'compare'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-04', '6G4', 'Mathematics', 6, 'Geometry', 'Angles', 'Find unknown angles in any triangles, quadrilaterals, and regular polygons', ARRAY['unknown angles', 'triangles', 'quadrilaterals', 'polygons'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-05', '6G5', 'Mathematics', 6, 'Geometry', 'Properties', 'Illustrate and name parts of circles, including radius, diameter and circumference', ARRAY['circle', 'radius', 'diameter', 'circumference'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-G-06', '6G6', 'Mathematics', 6, 'Geometry', 'Angles', 'Recognise angles where they meet at a point, are on a straight line, or are vertically opposite', ARRAY['angles', 'point', 'straight line', 'vertically opposite'], 'National Curriculum Mathematics KS2'),

-- Geometry - Position and Direction
('Y3-MATH-PD-01', '3P1', 'Mathematics', 3, 'Position and Direction', 'Movement', 'Describe positions on a 2-D grid as coordinates in the first quadrant', ARRAY['coordinates', 'grid', 'first quadrant', 'position'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-PD-01', '4P1', 'Mathematics', 4, 'Position and Direction', 'Coordinates', 'Describe positions on a 2-D grid as coordinates in the first quadrant', ARRAY['coordinates', '2D', 'grid', 'first quadrant'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-PD-02', '4P2', 'Mathematics', 4, 'Position and Direction', 'Movement', 'Describe movements between positions as translations of a given unit to the left/right and up/down', ARRAY['translation', 'movement', 'left', 'right', 'up', 'down'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-PD-03', '4P3', 'Mathematics', 4, 'Position and Direction', 'Plotting', 'Plot specified points and draw sides to complete a given polygon', ARRAY['plot', 'points', 'polygon', 'complete'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-PD-01', '5P1', 'Mathematics', 5, 'Position and Direction', 'Coordinates', 'Identify, describe and represent the position of a shape following a reflection or translation', ARRAY['reflection', 'translation', 'position', 'describe'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-PD-01', '6P1', 'Mathematics', 6, 'Position and Direction', 'Coordinates', 'Describe positions on the full coordinate grid (all 4 quadrants)', ARRAY['coordinates', '4 quadrants', 'negative', 'position'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-PD-02', '6P2', 'Mathematics', 6, 'Position and Direction', 'Movement', 'Draw and translate simple shapes on the coordinate plane, and reflect them in the axes', ARRAY['translate', 'reflect', 'axes', 'coordinate plane'], 'National Curriculum Mathematics KS2'),

-- Statistics
('Y3-MATH-S-01', '3S1', 'Mathematics', 3, 'Statistics', 'Interpreting', 'Interpret and present data using bar charts, pictograms and tables', ARRAY['bar chart', 'pictogram', 'table', 'interpret', 'present'], 'National Curriculum Mathematics KS2'),
('Y3-MATH-S-02', '3S2', 'Mathematics', 3, 'Statistics', 'Problem Solving', 'Solve one-step and two-step questions using information presented in scaled bar charts and pictograms', ARRAY['bar chart', 'pictogram', 'problem', 'one-step', 'two-step'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-S-01', '4S1', 'Mathematics', 4, 'Statistics', 'Interpreting', 'Interpret and present discrete and continuous data using appropriate graphical methods', ARRAY['discrete', 'continuous', 'graphs', 'interpret'], 'National Curriculum Mathematics KS2'),
('Y4-MATH-S-02', '4S2', 'Mathematics', 4, 'Statistics', 'Problem Solving', 'Solve comparison, sum and difference problems using information presented in bar charts, pictograms, tables', ARRAY['comparison', 'sum', 'difference', 'bar chart', 'problem'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-S-01', '5S1', 'Mathematics', 5, 'Statistics', 'Problem Solving', 'Solve comparison, sum and difference problems using information presented in a line graph', ARRAY['line graph', 'comparison', 'sum', 'difference', 'problem'], 'National Curriculum Mathematics KS2'),
('Y5-MATH-S-02', '5S2', 'Mathematics', 5, 'Statistics', 'Tables', 'Complete, read and interpret information in tables, including timetables', ARRAY['tables', 'timetables', 'interpret', 'read', 'complete'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-S-01', '6S1', 'Mathematics', 6, 'Statistics', 'Interpreting', 'Interpret and construct pie charts and line graphs and use these to solve problems', ARRAY['pie chart', 'line graph', 'construct', 'interpret', 'problem'], 'National Curriculum Mathematics KS2'),
('Y6-MATH-S-02', '6S2', 'Mathematics', 6, 'Statistics', 'Mean', 'Calculate and interpret the mean as an average', ARRAY['mean', 'average', 'calculate', 'interpret'], 'National Curriculum Mathematics KS2')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- HELPER FUNCTION: Get curriculum alignment for a question
-- =============================================================================

CREATE OR REPLACE FUNCTION get_question_curriculum_alignment(p_question_id UUID)
RETURNS TABLE (
  objective_code VARCHAR(30),
  objective_text TEXT,
  strand VARCHAR(100),
  year_group INTEGER,
  alignment_strength VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    co.code,
    co.objective_text,
    co.strand,
    co.year_group,
    qca.alignment_strength
  FROM question_curriculum_alignment qca
  JOIN curriculum_objectives co ON co.id = qca.objective_id
  WHERE qca.question_id = p_question_id
  ORDER BY 
    CASE qca.alignment_strength 
      WHEN 'primary' THEN 1 
      WHEN 'secondary' THEN 2 
      ELSE 3 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

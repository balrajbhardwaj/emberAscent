/**
 * Batch Configuration for Y5/Y6 Question Generation
 * 
 * Defines all 99 batches with their parameters for automated generation.
 * Each batch generates 110 questions (single year group per batch).
 * 
 * @module scripts/question-generation/batch-config
 */

export interface BatchConfig {
  batchNumber: number
  subject: 'Mathematics' | 'English' | 'Verbal Reasoning'
  subjectCode: 'MATH' | 'ENG' | 'VR'
  topic: string
  topicCode: string
  subtopic: string
  subtopicCode: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  difficultyCode: 'E' | 'M' | 'D'
  yearGroup: 5 | 6
  questionsPerBatch: number
  startingId: string
  filePath: string
}

/**
 * Generate file path based on batch parameters
 */
function generateFilePath(
  subject: string,
  topic: string,
  subtopic: string,
  difficulty: string,
  year: number
): string {
  const subjectFolder = subject.toLowerCase().replace(' ', '-')
  const difficultyFolder = difficulty.toLowerCase()
  const fileName = `${subjectFolder}-${topic.toLowerCase()}-${subtopic.toLowerCase()}-${difficultyFolder}-y${year}.json`
  return `data/questions/y${year}/${subjectFolder}/${difficultyFolder}/${fileName}`
}

/**
 * Generate starting question ID
 */
function generateStartingId(
  subjectCode: string,
  topicCode: string,
  subtopicCode: string,
  difficultyCode: string,
  year: number
): string {
  return `${subjectCode}-${topicCode}-${subtopicCode}-${difficultyCode}-Y${year}-00001`
}

/**
 * All 99 batch configurations
 */
export const BATCH_CONFIGS: BatchConfig[] = [
  // ============================================
  // WEEK 1-2: Mathematics - Operations (12 batches)
  // ============================================
  
  // Addition (Batches 1-6)
  {
    batchNumber: 1,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-operations-addition-easy-y5.json'
  },
  {
    batchNumber: 2,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-operations-addition-easy-y6.json'
  },
  {
    batchNumber: 3,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-operations-addition-medium-y5.json'
  },
  {
    batchNumber: 4,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-operations-addition-medium-y6.json'
  },
  {
    batchNumber: 5,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-D-Y5-00001',
    filePath: 'data/questions/y5/mathematics/difficult/math-operations-addition-difficult-y5.json'
  },
  {
    batchNumber: 6,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Addition',
    subtopicCode: 'add',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-add-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-operations-addition-difficult-y6.json'
  },
  
  // Subtraction (Batches 7-8)
  {
    batchNumber: 7,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Subtraction',
    subtopicCode: 'sub',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-sub-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-operations-subtraction-easy-y5.json'
  },
  {
    batchNumber: 8,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Subtraction',
    subtopicCode: 'sub',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-sub-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-operations-subtraction-easy-y6.json'
  },
  
  // Multiplication (Batches 9-10)
  {
    batchNumber: 9,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Multiplication',
    subtopicCode: 'mult',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-mult-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-operations-multiplication-medium-y5.json'
  },
  {
    batchNumber: 10,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Multiplication',
    subtopicCode: 'mult',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-mult-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-operations-multiplication-medium-y6.json'
  },
  
  // Division (Batches 11-12)
  {
    batchNumber: 11,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Division',
    subtopicCode: 'div',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-div-D-Y5-00001',
    filePath: 'data/questions/y5/mathematics/difficult/math-operations-division-difficult-y5.json'
  },
  {
    batchNumber: 12,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Operations',
    topicCode: 'OPS',
    subtopic: 'Division',
    subtopicCode: 'div',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-OPS-div-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-operations-division-difficult-y6.json'
  },

  // ============================================
  // WEEK 3-4: Mathematics - Fractions & Decimals (9 batches)
  // ============================================
  
  // Basic Fractions (Batches 13-14)
  {
    batchNumber: 13,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Basic Fractions',
    subtopicCode: 'basic',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-basic-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-fractions-basic-easy-y5.json'
  },
  {
    batchNumber: 14,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Basic Fractions',
    subtopicCode: 'basic',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-basic-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-fractions-basic-easy-y6.json'
  },
  
  // Comparing Fractions (Batches 15-16)
  {
    batchNumber: 15,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Comparing Fractions',
    subtopicCode: 'comp',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-comp-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-fractions-comparing-medium-y5.json'
  },
  {
    batchNumber: 16,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Comparing Fractions',
    subtopicCode: 'comp',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-comp-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-fractions-comparing-medium-y6.json'
  },
  
  // Fraction Operations (Batches 17-18)
  {
    batchNumber: 17,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Operations',
    subtopicCode: 'ops',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-ops-D-Y5-00001',
    filePath: 'data/questions/y5/mathematics/difficult/math-fractions-operations-difficult-y5.json'
  },
  {
    batchNumber: 18,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Fractions',
    topicCode: 'FRAC',
    subtopic: 'Operations',
    subtopicCode: 'ops',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-FRAC-ops-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-fractions-operations-difficult-y6.json'
  },
  
  // Decimals (Batches 19-20)
  {
    batchNumber: 19,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Decimals',
    topicCode: 'DEC',
    subtopic: 'Place Value',
    subtopicCode: 'place',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-DEC-place-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-decimals-place-easy-y5.json'
  },
  {
    batchNumber: 20,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Decimals',
    topicCode: 'DEC',
    subtopic: 'Operations',
    subtopicCode: 'ops',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-DEC-ops-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-decimals-operations-medium-y5.json'
  },
  
  // Percentages (Batch 21)
  {
    batchNumber: 21,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Percentages',
    topicCode: 'PERC',
    subtopic: 'Basic',
    subtopicCode: 'basic',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-PERC-basic-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-percentages-basic-difficult-y6.json'
  },

  // ============================================
  // WEEK 5-6: Mathematics - Geometry (9 batches: 22-30)
  // ============================================
  
  // Shapes (Batches 22-24)
  {
    batchNumber: 22,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Shapes',
    subtopicCode: 'shapes',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-shapes-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-geometry-shapes-easy-y5.json'
  },
  {
    batchNumber: 23,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Shapes',
    subtopicCode: 'shapes',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-shapes-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-geometry-shapes-easy-y6.json'
  },
  
  // Angles (Batches 24-25)
  {
    batchNumber: 24,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Angles',
    subtopicCode: 'angles',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-angles-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-geometry-angles-medium-y5.json'
  },
  {
    batchNumber: 25,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Angles',
    subtopicCode: 'angles',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-angles-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-geometry-angles-medium-y6.json'
  },
  
  // Area (Batches 26-27)
  {
    batchNumber: 26,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Area',
    subtopicCode: 'area',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-area-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-geometry-area-medium-y5.json'
  },
  {
    batchNumber: 27,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Area',
    subtopicCode: 'area',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-area-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-geometry-area-medium-y6.json'
  },
  
  // Perimeter (Batches 28-29)
  {
    batchNumber: 28,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Perimeter',
    subtopicCode: 'perim',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-perim-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-geometry-perimeter-easy-y5.json'
  },
  {
    batchNumber: 29,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Perimeter',
    subtopicCode: 'perim',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-perim-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-geometry-perimeter-easy-y6.json'
  },
  
  // Volume (Batch 30)
  {
    batchNumber: 30,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Geometry',
    topicCode: 'GEOM',
    subtopic: 'Volume',
    subtopicCode: 'vol',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-GEOM-vol-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-geometry-volume-difficult-y6.json'
  },

  // ============================================
  // WEEK 7-8: Mathematics - Algebra, Statistics (15 batches: 31-45)
  // ============================================
  
  // Algebra - Patterns (Batches 31-32)
  {
    batchNumber: 31,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Algebra',
    topicCode: 'ALG',
    subtopic: 'Patterns',
    subtopicCode: 'patt',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-ALG-patt-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-algebra-patterns-easy-y5.json'
  },
  {
    batchNumber: 32,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Algebra',
    topicCode: 'ALG',
    subtopic: 'Patterns',
    subtopicCode: 'patt',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-ALG-patt-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-algebra-patterns-easy-y6.json'
  },
  
  // Algebra - Equations (Batches 33-34)
  {
    batchNumber: 33,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Algebra',
    topicCode: 'ALG',
    subtopic: 'Equations',
    subtopicCode: 'eq',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-ALG-eq-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-algebra-equations-medium-y5.json'
  },
  {
    batchNumber: 34,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Algebra',
    topicCode: 'ALG',
    subtopic: 'Equations',
    subtopicCode: 'eq',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-ALG-eq-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-algebra-equations-medium-y6.json'
  },
  
  // Ratio (Batches 35-36)
  {
    batchNumber: 35,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Ratio',
    topicCode: 'RAT',
    subtopic: 'Basic Ratio',
    subtopicCode: 'basic',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-RAT-basic-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-ratio-basic-medium-y5.json'
  },
  {
    batchNumber: 36,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Ratio',
    topicCode: 'RAT',
    subtopic: 'Basic Ratio',
    subtopicCode: 'basic',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-RAT-basic-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-ratio-basic-medium-y6.json'
  },
  
  // Statistics - Data (Batches 37-38)
  {
    batchNumber: 37,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Data Handling',
    subtopicCode: 'data',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-data-E-Y5-00001',
    filePath: 'data/questions/y5/mathematics/easy/math-statistics-data-easy-y5.json'
  },
  {
    batchNumber: 38,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Data Handling',
    subtopicCode: 'data',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-data-E-Y6-00001',
    filePath: 'data/questions/y6/mathematics/easy/math-statistics-data-easy-y6.json'
  },
  
  // Statistics - Graphs (Batches 39-40)
  {
    batchNumber: 39,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Graphs',
    subtopicCode: 'graphs',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-graphs-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-statistics-graphs-medium-y5.json'
  },
  {
    batchNumber: 40,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Graphs',
    subtopicCode: 'graphs',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-graphs-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-statistics-graphs-medium-y6.json'
  },
  
  // Statistics - Mean/Probability (Batches 41-42)
  {
    batchNumber: 41,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Mean Average',
    subtopicCode: 'mean',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-mean-D-Y5-00001',
    filePath: 'data/questions/y5/mathematics/difficult/math-statistics-mean-difficult-y5.json'
  },
  {
    batchNumber: 42,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Statistics',
    topicCode: 'STAT',
    subtopic: 'Mean Average',
    subtopicCode: 'mean',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-STAT-mean-D-Y6-00001',
    filePath: 'data/questions/y6/mathematics/difficult/math-statistics-mean-difficult-y6.json'
  },
  
  // Probability (Batches 43-44)
  {
    batchNumber: 43,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Probability',
    topicCode: 'PROB',
    subtopic: 'Basic Probability',
    subtopicCode: 'basic',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'MATH-PROB-basic-M-Y5-00001',
    filePath: 'data/questions/y5/mathematics/medium/math-probability-basic-medium-y5.json'
  },
  {
    batchNumber: 44,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Probability',
    topicCode: 'PROB',
    subtopic: 'Basic Probability',
    subtopicCode: 'basic',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-PROB-basic-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-probability-basic-medium-y6.json'
  },
  
  // Measurement - Time (Batch 45)
  {
    batchNumber: 45,
    subject: 'Mathematics',
    subjectCode: 'MATH',
    topic: 'Measurement',
    topicCode: 'MEAS',
    subtopic: 'Time',
    subtopicCode: 'time',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'MATH-MEAS-time-M-Y6-00001',
    filePath: 'data/questions/y6/mathematics/medium/math-measurement-time-medium-y6.json'
  },

  // ============================================
  // WEEK 9-10: English - Comprehension & Grammar (15 batches: 46-60)
  // ============================================
  
  // Comprehension - Fiction (Batches 46-47)
  {
    batchNumber: 46,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Fiction',
    subtopicCode: 'fict',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-fict-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-comprehension-fiction-easy-y5.json'
  },
  {
    batchNumber: 47,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Fiction',
    subtopicCode: 'fict',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-fict-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-comprehension-fiction-easy-y6.json'
  },
  
  // Comprehension - Non-fiction (Batches 48-49)
  {
    batchNumber: 48,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Non-fiction',
    subtopicCode: 'nonfict',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-nonfict-M-Y5-00001',
    filePath: 'data/questions/y5/english/medium/eng-comprehension-nonfiction-medium-y5.json'
  },
  {
    batchNumber: 49,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Non-fiction',
    subtopicCode: 'nonfict',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-nonfict-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-comprehension-nonfiction-medium-y6.json'
  },
  
  // Comprehension - Inference (Batches 50-51)
  {
    batchNumber: 50,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Inference',
    subtopicCode: 'infer',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-infer-D-Y5-00001',
    filePath: 'data/questions/y5/english/difficult/eng-comprehension-inference-difficult-y5.json'
  },
  {
    batchNumber: 51,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Comprehension',
    topicCode: 'COMP',
    subtopic: 'Inference',
    subtopicCode: 'infer',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-COMP-infer-D-Y6-00001',
    filePath: 'data/questions/y6/english/difficult/eng-comprehension-inference-difficult-y6.json'
  },
  
  // Grammar - Sentence Types (Batches 52-53)
  {
    batchNumber: 52,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Sentence Types',
    subtopicCode: 'sent',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-sent-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-grammar-sentence-easy-y5.json'
  },
  {
    batchNumber: 53,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Sentence Types',
    subtopicCode: 'sent',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-sent-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-grammar-sentence-easy-y6.json'
  },
  
  // Grammar - Tenses (Batches 54-55)
  {
    batchNumber: 54,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Tenses',
    subtopicCode: 'tense',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-tense-M-Y5-00001',
    filePath: 'data/questions/y5/english/medium/eng-grammar-tenses-medium-y5.json'
  },
  {
    batchNumber: 55,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Tenses',
    subtopicCode: 'tense',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-tense-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-grammar-tenses-medium-y6.json'
  },
  
  // Grammar - Clauses (Batches 56-57)
  {
    batchNumber: 56,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Clauses',
    subtopicCode: 'clause',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-clause-D-Y5-00001',
    filePath: 'data/questions/y5/english/difficult/eng-grammar-clauses-difficult-y5.json'
  },
  {
    batchNumber: 57,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Grammar',
    topicCode: 'GRAM',
    subtopic: 'Clauses',
    subtopicCode: 'clause',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-GRAM-clause-D-Y6-00001',
    filePath: 'data/questions/y6/english/difficult/eng-grammar-clauses-difficult-y6.json'
  },
  
  // Punctuation - Basic (Batches 58-59)
  {
    batchNumber: 58,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Punctuation',
    topicCode: 'PUNC',
    subtopic: 'Basic',
    subtopicCode: 'basic',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-PUNC-basic-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-punctuation-basic-easy-y5.json'
  },
  {
    batchNumber: 59,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Punctuation',
    topicCode: 'PUNC',
    subtopic: 'Basic',
    subtopicCode: 'basic',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-PUNC-basic-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-punctuation-basic-easy-y6.json'
  },
  
  // Punctuation - Advanced (Batch 60)
  {
    batchNumber: 60,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Punctuation',
    topicCode: 'PUNC',
    subtopic: 'Advanced',
    subtopicCode: 'adv',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-PUNC-adv-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-punctuation-advanced-medium-y6.json'
  },

  // ============================================
  // WEEK 11: English - Vocabulary, Spelling, Writing (15 batches: 61-75)
  // ============================================
  
  // Vocabulary - Synonyms (Batches 61-62)
  {
    batchNumber: 61,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Synonyms',
    subtopicCode: 'syn',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-syn-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-vocabulary-synonyms-easy-y5.json'
  },
  {
    batchNumber: 62,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Synonyms',
    subtopicCode: 'syn',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-syn-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-vocabulary-synonyms-easy-y6.json'
  },
  
  // Vocabulary - Antonyms (Batches 63-64)
  {
    batchNumber: 63,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Antonyms',
    subtopicCode: 'ant',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-ant-M-Y5-00001',
    filePath: 'data/questions/y5/english/medium/eng-vocabulary-antonyms-medium-y5.json'
  },
  {
    batchNumber: 64,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Antonyms',
    subtopicCode: 'ant',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-ant-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-vocabulary-antonyms-medium-y6.json'
  },
  
  // Vocabulary - Homonyms (Batches 65-66)
  {
    batchNumber: 65,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Homonyms',
    subtopicCode: 'hom',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-hom-D-Y5-00001',
    filePath: 'data/questions/y5/english/difficult/eng-vocabulary-homonyms-difficult-y5.json'
  },
  {
    batchNumber: 66,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Vocabulary',
    topicCode: 'VOC',
    subtopic: 'Homonyms',
    subtopicCode: 'hom',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-VOC-hom-D-Y6-00001',
    filePath: 'data/questions/y6/english/difficult/eng-vocabulary-homonyms-difficult-y6.json'
  },
  
  // Spelling - Patterns (Batches 67-68)
  {
    batchNumber: 67,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Spelling',
    topicCode: 'SPELL',
    subtopic: 'Patterns',
    subtopicCode: 'patt',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-SPELL-patt-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-spelling-patterns-easy-y5.json'
  },
  {
    batchNumber: 68,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Spelling',
    topicCode: 'SPELL',
    subtopic: 'Patterns',
    subtopicCode: 'patt',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-SPELL-patt-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-spelling-patterns-easy-y6.json'
  },
  
  // Spelling - Rules (Batches 69-70)
  {
    batchNumber: 69,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Spelling',
    topicCode: 'SPELL',
    subtopic: 'Rules',
    subtopicCode: 'rules',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-SPELL-rules-M-Y5-00001',
    filePath: 'data/questions/y5/english/medium/eng-spelling-rules-medium-y5.json'
  },
  {
    batchNumber: 70,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Spelling',
    topicCode: 'SPELL',
    subtopic: 'Rules',
    subtopicCode: 'rules',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-SPELL-rules-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-spelling-rules-medium-y6.json'
  },
  
  // Writing - Sentence Structure (Batches 71-72)
  {
    batchNumber: 71,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Writing',
    topicCode: 'WRIT',
    subtopic: 'Sentence Structure',
    subtopicCode: 'struct',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-WRIT-struct-E-Y5-00001',
    filePath: 'data/questions/y5/english/easy/eng-writing-structure-easy-y5.json'
  },
  {
    batchNumber: 72,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Writing',
    topicCode: 'WRIT',
    subtopic: 'Sentence Structure',
    subtopicCode: 'struct',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-WRIT-struct-E-Y6-00001',
    filePath: 'data/questions/y6/english/easy/eng-writing-structure-easy-y6.json'
  },
  
  // Writing - Paragraphs (Batches 73-74)
  {
    batchNumber: 73,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Writing',
    topicCode: 'WRIT',
    subtopic: 'Paragraphs',
    subtopicCode: 'para',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-WRIT-para-M-Y5-00001',
    filePath: 'data/questions/y5/english/medium/eng-writing-paragraphs-medium-y5.json'
  },
  {
    batchNumber: 74,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Writing',
    topicCode: 'WRIT',
    subtopic: 'Paragraphs',
    subtopicCode: 'para',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'ENG-WRIT-para-M-Y6-00001',
    filePath: 'data/questions/y6/english/medium/eng-writing-paragraphs-medium-y6.json'
  },
  
  // Writing - Style (Batch 75)
  {
    batchNumber: 75,
    subject: 'English',
    subjectCode: 'ENG',
    topic: 'Writing',
    topicCode: 'WRIT',
    subtopic: 'Style',
    subtopicCode: 'style',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'ENG-WRIT-style-D-Y5-00001',
    filePath: 'data/questions/y5/english/difficult/eng-writing-style-difficult-y5.json'
  },

  // ============================================
  // WEEK 12-13: Verbal Reasoning (24 batches: 76-99)
  // ============================================
  
  // Analogies - Word (Batches 76-77)
  {
    batchNumber: 76,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Analogies',
    topicCode: 'ANAL',
    subtopic: 'Word Analogies',
    subtopicCode: 'word',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-ANAL-word-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-analogies-word-easy-y5.json'
  },
  {
    batchNumber: 77,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Analogies',
    topicCode: 'ANAL',
    subtopic: 'Word Analogies',
    subtopicCode: 'word',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-ANAL-word-E-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/easy/vr-analogies-word-easy-y6.json'
  },
  
  // Analogies - Letter Patterns (Batches 78-79)
  {
    batchNumber: 78,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Analogies',
    topicCode: 'ANAL',
    subtopic: 'Letter Patterns',
    subtopicCode: 'lett',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-ANAL-lett-M-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/medium/vr-analogies-letter-medium-y5.json'
  },
  {
    batchNumber: 79,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Analogies',
    topicCode: 'ANAL',
    subtopic: 'Complex',
    subtopicCode: 'comp',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-ANAL-comp-D-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/difficult/vr-analogies-complex-difficult-y6.json'
  },
  
  // Word Relations (Batches 80-81)
  {
    batchNumber: 80,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Word Relations',
    topicCode: 'WREL',
    subtopic: 'Synonyms/Antonyms',
    subtopicCode: 'syn',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-WREL-syn-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-wordrel-synonyms-easy-y5.json'
  },
  {
    batchNumber: 81,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Word Relations',
    topicCode: 'WREL',
    subtopic: 'Categories',
    subtopicCode: 'cat',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-WREL-cat-M-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/medium/vr-wordrel-categories-medium-y5.json'
  },
  
  // Coding (Batches 82-83)
  {
    batchNumber: 82,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Coding',
    topicCode: 'CODE',
    subtopic: 'Letter Codes',
    subtopicCode: 'lett',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-CODE-lett-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-coding-letter-easy-y5.json'
  },
  {
    batchNumber: 83,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Coding',
    topicCode: 'CODE',
    subtopic: 'Number Codes',
    subtopicCode: 'num',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-CODE-num-M-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/medium/vr-coding-number-medium-y6.json'
  },
  
  // Hidden Words (Batches 84-85)
  {
    batchNumber: 84,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Hidden Words',
    topicCode: 'HIDD',
    subtopic: 'Find Hidden Word',
    subtopicCode: 'find',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-HIDD-find-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-hidden-find-easy-y5.json'
  },
  {
    batchNumber: 85,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Hidden Words',
    topicCode: 'HIDD',
    subtopic: 'Find Hidden Word',
    subtopicCode: 'find',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-HIDD-find-E-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/easy/vr-hidden-find-easy-y6.json'
  },
  
  // Compound Words (Batches 86-87)
  {
    batchNumber: 86,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Compound Words',
    topicCode: 'COMPW',
    subtopic: 'Make Compound',
    subtopicCode: 'make',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-COMPW-make-M-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/medium/vr-compound-make-medium-y5.json'
  },
  {
    batchNumber: 87,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Compound Words',
    topicCode: 'COMPW',
    subtopic: 'Make Compound',
    subtopicCode: 'make',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-COMPW-make-M-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/medium/vr-compound-make-medium-y6.json'
  },
  
  // Logic - Syllogisms (Batches 88-89)
  {
    batchNumber: 88,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Logic',
    topicCode: 'LOG',
    subtopic: 'Syllogisms',
    subtopicCode: 'syll',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-LOG-syll-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-logic-syllogisms-easy-y5.json'
  },
  {
    batchNumber: 89,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Logic',
    topicCode: 'LOG',
    subtopic: 'Truth Tables',
    subtopicCode: 'truth',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-LOG-truth-M-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/medium/vr-logic-truth-medium-y6.json'
  },
  
  // Logic - Deduction (Batch 90)
  {
    batchNumber: 90,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Logic',
    topicCode: 'LOG',
    subtopic: 'Deduction',
    subtopicCode: 'deduc',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-LOG-deduc-D-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/difficult/vr-logic-deduction-difficult-y6.json'
  },
  
  // Patterns - Number Sequences (Batches 91-92)
  {
    batchNumber: 91,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Patterns',
    topicCode: 'PATT',
    subtopic: 'Number Sequences',
    subtopicCode: 'numseq',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-PATT-numseq-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-patterns-numseq-easy-y5.json'
  },
  {
    batchNumber: 92,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Patterns',
    topicCode: 'PATT',
    subtopic: 'Letter Sequences',
    subtopicCode: 'lettseq',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-PATT-lettseq-M-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/medium/vr-patterns-lettseq-medium-y5.json'
  },
  
  // Patterns - Mixed (Batch 93)
  {
    batchNumber: 93,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Patterns',
    topicCode: 'PATT',
    subtopic: 'Mixed Sequences',
    subtopicCode: 'mixed',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-PATT-mixed-D-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/difficult/vr-patterns-mixed-difficult-y6.json'
  },
  
  // Odd One Out (Batches 94-95)
  {
    batchNumber: 94,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Odd One Out',
    topicCode: 'ODD',
    subtopic: 'Words',
    subtopicCode: 'words',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-ODD-words-E-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/easy/vr-oddoneout-words-easy-y5.json'
  },
  {
    batchNumber: 95,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Odd One Out',
    topicCode: 'ODD',
    subtopic: 'Words',
    subtopicCode: 'words',
    difficulty: 'Easy',
    difficultyCode: 'E',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-ODD-words-E-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/easy/vr-oddoneout-words-easy-y6.json'
  },
  
  // Letter Move (Batches 96-97)
  {
    batchNumber: 96,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Letter Move',
    topicCode: 'LETT',
    subtopic: 'Move Letters',
    subtopicCode: 'move',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-LETT-move-M-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/medium/vr-lettermove-move-medium-y5.json'
  },
  {
    batchNumber: 97,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Letter Move',
    topicCode: 'LETT',
    subtopic: 'Move Letters',
    subtopicCode: 'move',
    difficulty: 'Medium',
    difficultyCode: 'M',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-LETT-move-M-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/medium/vr-lettermove-move-medium-y6.json'
  },
  
  // Number/Letter Codes (Batches 98-99)
  {
    batchNumber: 98,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Number Codes',
    topicCode: 'NCODE',
    subtopic: 'Decode Numbers',
    subtopicCode: 'decode',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 5,
    questionsPerBatch: 110,
    startingId: 'VR-NCODE-decode-D-Y5-00001',
    filePath: 'data/questions/y5/verbal-reasoning/difficult/vr-ncode-decode-difficult-y5.json'
  },
  {
    batchNumber: 99,
    subject: 'Verbal Reasoning',
    subjectCode: 'VR',
    topic: 'Number Codes',
    topicCode: 'NCODE',
    subtopic: 'Decode Numbers',
    subtopicCode: 'decode',
    difficulty: 'Difficult',
    difficultyCode: 'D',
    yearGroup: 6,
    questionsPerBatch: 110,
    startingId: 'VR-NCODE-decode-D-Y6-00001',
    filePath: 'data/questions/y6/verbal-reasoning/difficult/vr-ncode-decode-difficult-y6.json'
  },
]

/**
 * Get batch by number
 */
export function getBatch(batchNumber: number): BatchConfig | undefined {
  return BATCH_CONFIGS.find(b => b.batchNumber === batchNumber)
}

/**
 * Get all batches for a subject
 */
export function getBatchesBySubject(subject: string): BatchConfig[] {
  return BATCH_CONFIGS.filter(b => b.subject === subject)
}

/**
 * Get total questions count
 */
export function getTotalQuestions(): number {
  return BATCH_CONFIGS.reduce((sum, b) => sum + b.questionsPerBatch, 0)
}

// Summary stats
export const BATCH_STATS = {
  totalBatches: BATCH_CONFIGS.length,
  totalQuestions: getTotalQuestions(),
  subjects: {
    Mathematics: getBatchesBySubject('Mathematics').length,
    English: getBatchesBySubject('English').length,
    'Verbal Reasoning': getBatchesBySubject('Verbal Reasoning').length,
  }
}

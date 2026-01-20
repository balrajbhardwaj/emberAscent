/**
 * Topic Taxonomy and Content Structure
 * 
 * Defines the complete topic hierarchy for all subjects in the 11+ curriculum.
 * Used for session creation, topic selection, and progress tracking.
 * 
 * Structure:
 * - Subject > Topic > Subtopic (optional)
 * - Each topic has metadata (difficulty, question count estimates)
 * 
 * @module lib/content/topics
 */

export interface Subtopic {
  id: string
  name: string
  description: string
  difficulty: "foundation" | "standard" | "challenge"
  estimatedQuestions: number
}

export interface Topic {
  id: string
  name: string
  description: string
  subtopics?: Subtopic[]
  estimatedQuestions: number
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  topics: Topic[]
}

/**
 * Complete topic taxonomy for 11+ exam preparation
 */
export const TOPIC_TAXONOMY: Subject[] = [
  {
    id: "verbal-reasoning",
    name: "Verbal Reasoning",
    color: "purple",
    icon: "🧠",
    topics: [
      {
        id: "synonyms",
        name: "Synonyms",
        description: "Words with similar meanings",
        estimatedQuestions: 150,
      },
      {
        id: "antonyms",
        name: "Antonyms",
        description: "Words with opposite meanings",
        estimatedQuestions: 150,
      },
      {
        id: "analogies",
        name: "Analogies",
        description: "Word relationships and patterns",
        estimatedQuestions: 120,
      },
      {
        id: "code-breaking",
        name: "Code Breaking",
        description: "Letter and number patterns",
        estimatedQuestions: 100,
      },
      {
        id: "odd-one-out",
        name: "Odd One Out",
        description: "Identify the word that doesn't fit",
        estimatedQuestions: 100,
      },
      {
        id: "word-sequences",
        name: "Word Sequences",
        description: "Complete the word series",
        estimatedQuestions: 80,
      },
      {
        id: "compound-words",
        name: "Compound Words",
        description: "Combining words to make new words",
        estimatedQuestions: 80,
      },
      {
        id: "hidden-words",
        name: "Hidden Words",
        description: "Find words hidden within sentences",
        estimatedQuestions: 70,
      },
    ],
  },
  {
    id: "english",
    name: "English",
    color: "blue",
    icon: "📚",
    topics: [
      {
        id: "comprehension",
        name: "Comprehension",
        description: "Reading and understanding passages",
        estimatedQuestions: 200,
        subtopics: [
          {
            id: "comp-fiction",
            name: "Fiction",
            description: "Stories and narratives",
            difficulty: "standard",
            estimatedQuestions: 100,
          },
          {
            id: "comp-non-fiction",
            name: "Non-Fiction",
            description: "Factual texts and articles",
            difficulty: "standard",
            estimatedQuestions: 100,
          },
        ],
      },
      {
        id: "grammar",
        name: "Grammar",
        description: "Sentence structure and punctuation",
        estimatedQuestions: 180,
        subtopics: [
          {
            id: "grammar-punctuation",
            name: "Punctuation",
            description: "Commas, apostrophes, and more",
            difficulty: "foundation",
            estimatedQuestions: 60,
          },
          {
            id: "grammar-sentence-structure",
            name: "Sentence Structure",
            description: "Clauses, phrases, and syntax",
            difficulty: "standard",
            estimatedQuestions: 60,
          },
          {
            id: "grammar-parts-of-speech",
            name: "Parts of Speech",
            description: "Nouns, verbs, adjectives, etc.",
            difficulty: "foundation",
            estimatedQuestions: 60,
          },
        ],
      },
      {
        id: "vocabulary",
        name: "Vocabulary",
        description: "Word meanings and usage",
        estimatedQuestions: 150,
      },
      {
        id: "cloze-passages",
        name: "Cloze Passages",
        description: "Fill in the missing words",
        estimatedQuestions: 120,
      },
      {
        id: "spelling",
        name: "Spelling",
        description: "Correct spelling and patterns",
        estimatedQuestions: 100,
      },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    color: "green",
    icon: "🔢",
    topics: [
      {
        id: "arithmetic",
        name: "Arithmetic",
        description: "Basic calculations and operations",
        estimatedQuestions: 200,
        subtopics: [
          {
            id: "arithmetic-addition-subtraction",
            name: "Addition & Subtraction",
            description: "Mental and written methods",
            difficulty: "foundation",
            estimatedQuestions: 70,
          },
          {
            id: "arithmetic-multiplication-division",
            name: "Multiplication & Division",
            description: "Tables and methods",
            difficulty: "foundation",
            estimatedQuestions: 70,
          },
          {
            id: "arithmetic-order-of-operations",
            name: "Order of Operations",
            description: "BIDMAS/BODMAS rules",
            difficulty: "standard",
            estimatedQuestions: 60,
          },
        ],
      },
      {
        id: "word-problems",
        name: "Word Problems",
        description: "Real-world mathematical scenarios",
        estimatedQuestions: 180,
      },
      {
        id: "fractions-decimals",
        name: "Fractions & Decimals",
        description: "Working with parts and decimal numbers",
        estimatedQuestions: 150,
        subtopics: [
          {
            id: "fractions",
            name: "Fractions",
            description: "Simplifying, comparing, and operations",
            difficulty: "standard",
            estimatedQuestions: 80,
          },
          {
            id: "decimals",
            name: "Decimals",
            description: "Decimal operations and conversions",
            difficulty: "standard",
            estimatedQuestions: 70,
          },
        ],
      },
      {
        id: "geometry",
        name: "Geometry",
        description: "Shapes, angles, and measurements",
        estimatedQuestions: 140,
        subtopics: [
          {
            id: "geometry-2d-shapes",
            name: "2D Shapes",
            description: "Polygons, circles, and perimeter",
            difficulty: "foundation",
            estimatedQuestions: 50,
          },
          {
            id: "geometry-3d-shapes",
            name: "3D Shapes",
            description: "Cubes, cuboids, and volume",
            difficulty: "standard",
            estimatedQuestions: 40,
          },
          {
            id: "geometry-angles",
            name: "Angles",
            description: "Types of angles and calculations",
            difficulty: "standard",
            estimatedQuestions: 50,
          },
        ],
      },
      {
        id: "data-statistics",
        name: "Data & Statistics",
        description: "Charts, graphs, and averages",
        estimatedQuestions: 120,
      },
      {
        id: "algebra-basics",
        name: "Algebra Basics",
        description: "Simple equations and sequences",
        estimatedQuestions: 100,
      },
    ],
  },
]

/**
 * Get subject by ID
 * 
 * @param subjectId - Subject identifier
 * @returns Subject object or undefined
 */
export function getSubject(subjectId: string): Subject | undefined {
  return TOPIC_TAXONOMY.find((s) => s.id === subjectId)
}

/**
 * Get topic by subject and topic ID
 * 
 * @param subjectId - Subject identifier
 * @param topicId - Topic identifier
 * @returns Topic object or undefined
 */
export function getTopic(subjectId: string, topicId: string): Topic | undefined {
  const subject = getSubject(subjectId)
  return subject?.topics.find((t) => t.id === topicId)
}

/**
 * Get all topics across all subjects (flat list)
 * 
 * @returns Array of all topics with subject context
 */
export function getAllTopics(): Array<Topic & { subjectId: string; subjectName: string }> {
  return TOPIC_TAXONOMY.flatMap((subject) =>
    subject.topics.map((topic) => ({
      ...topic,
      subjectId: subject.id,
      subjectName: subject.name,
    }))
  )
}

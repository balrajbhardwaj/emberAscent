/**
 * Prompt Template Factory
 * 
 * Generates consistent, high-quality prompts for explanation generation
 * based on question type, subject, and difficulty level.
 * 
 * Templates are optimized for:
 * - Visual clarity with colored emojis
 * - Age-appropriate language (Year 3-6, ages 7-11)
 * - Consistent formatting across similar questions
 * 
 * @module lib/claude/prompt-templates
 */

import type { QuestionContext } from './explanation-generator'

/**
 * Visual element library organized by topic
 */
const VISUAL_ELEMENTS = {
  arithmetic: {
    tens: '🟦',
    ones: '🔴',
    hundreds: '🟨',
    thousands: '🟩',
    crossed: '❌',
    empty: '⬜',
    checkmark: '✓',
    arrow: '→'
  },
  fractions: {
    pizza: '🍕',
    cake: '🍰',
    pie: '🎂',
    filled: '🟪',
    empty: '⬜',
    whole: '🟫'
  },
  measurement: {
    ruler: '📏',
    scale: '⚖️',
    clock: '⏰',
    calendar: '📅',
    thermometer: '🌡️'
  },
  money: {
    pound: '💷',
    coin: '🪙',
    piggy: '🐷'
  },
  geometry: {
    square: '⬛',
    triangle: '🔺',
    circle: '⭕',
    rectangle: '▬',
    line: '━'
  }
} as const

/**
 * ASCII art components for structured diagrams
 */
const ASCII_COMPONENTS = {
  box: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    cross: '┼',
    teeDown: '┬',
    teeUp: '┴',
    teeRight: '├',
    teeLeft: '┤'
  },
  arrows: {
    right: '→',
    left: '←',
    up: '↑',
    down: '↓'
  },
  markers: {
    check: '✓',
    cross: '✗',
    star: '★',
    bullet: '•'
  }
} as const

/**
 * Color emoji palette for worked examples
 */
const COLOR_MARKERS = {
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
  purple: '🟣',
  orange: '🟠'
} as const

/**
 * Determine the most appropriate visual style based on question context
 */
function getVisualStyle(context: QuestionContext): 'blocks' | 'grid' | 'numberLine' | 'pictorial' {
  const { subject, topic } = context
  const topicLower = topic.toLowerCase()

  // Arithmetic-specific rules
  if (subject === 'Mathematics') {
    if (topicLower.includes('addition') || topicLower.includes('subtraction')) {
      if (context.difficulty === 'Foundation') return 'blocks'
      return 'numberLine'
    }
    if (topicLower.includes('multiplication') || topicLower.includes('division')) {
      return 'grid'
    }
    if (topicLower.includes('fraction')) {
      return 'pictorial'
    }
  }

  return 'blocks' // default
}

/**
 * Generate visual illustration instructions based on question type
 */
function generateVisualInstructions(context: QuestionContext): string {
  const style = getVisualStyle(context)
  const { topic } = context
  const topicLower = topic.toLowerCase()

  const baseInstructions = [
    'Create a VISUAL DIAGRAM using colored emoji blocks and ASCII art.',
    'Must be a visual representation, NOT a text description.',
    ''
  ]

  // Style-specific instructions
  const styleGuides: Record<string, string[]> = {
    blocks: [
      `Use colored blocks:`,
      `  🟦 = Tens (groups of 10)`,
      `  🔴 = Ones (single units)`,
      `  🟨 = Hundreds (if needed)`,
      `  ❌ = Crossed out / subtracted`,
      `  ⬜ = Empty space`,
      '',
      'Layout example:',
      '  🟦🟦🟦🟦 🔴🔴🔴 (4 tens + 3 ones = 43)',
      '  Space blocks in groups of 4-5 for easy counting',
      '',
      'Show the operation visually (crossing out, grouping, etc.)'
    ],
    grid: [
      'Use grid/array representation with colored squares:',
      '  🟩 = Items to count/group',
      '  Use spaces to show groups clearly',
      '',
      'Example for division:',
      '  Group 1: 🟩🟩🟩🟩 ✓',
      '  Group 2: 🟩🟩🟩🟩 ✓',
      '  Group 3: 🟩🟩🟩🟩 ✓',
      '',
      'Label each group and add checkmarks'
    ],
    numberLine: [
      'Create a number line using ASCII:',
      '  Use arrows (→ ←) to show jumps',
      '  Mark key positions with numbers',
      '',
      'Example:',
      '  0━━━━━10━━━━━20━━━━→30',
      '       +10    +10    +10',
      '',
      'Show the operation as movements on the line'
    ],
    pictorial: [
      'Use pictorial representation:',
      `  ${topicLower.includes('fraction') ? '🍕 = Pizza slices for fractions' : '🟪 = Shaded portions'}`,
      '  Create ASCII grids with box characters:',
      '    ┌─┬─┐',
      '    │ │ │',
      '    ├─┼─┤',
      '    │ │ │',
      '    └─┴─┘',
      '',
      'Shade/fill portions to show the concept'
    ]
  }

  return [...baseInstructions, ...styleGuides[style]].join('\n')
}

/**
 * Generate color-coded example instructions
 */
function generateExampleInstructions(_context: QuestionContext): string {
  return `Create a SIMILAR PROBLEM with COLOR-CODED MAPPING:

Format:
1. Problem: Present a similar problem with color markers
   Use: 🔵 Blue, 🟢 Green, 🟡 Yellow to mark corresponding parts

2. Solution: Show step-by-step with colors linking back
   Example:
   Problem: 🔵 56 - 🟢 32
   
   Step 1: Start with 🔵 56
   Step 2: Subtract 🟢 32
   Step 3: 5 tens - 3 tens = 2 tens
   Step 4: 6 ones - 2 ones = 4 ones
   Answer: 24

Colors help students map the method to their own question.
Keep numbers different but method identical.`
}

/**
 * Build complete explanation prompt with topic-specific templates
 */
export function buildExplanationPrompt(context: QuestionContext): string {
  const visualInstructions = generateVisualInstructions(context)
  const exampleInstructions = generateExampleInstructions(context)

  const parts = [
    `Generate three types of explanations for this ${context.subject} question:`,
    ``,
    `**Subject:** ${context.subject}`,
    `**Topic:** ${context.topic}`,
    `**Difficulty:** ${context.difficulty}`,
    `**Year Group:** Year ${context.yearGroup}`,
    ``,
    `**Question:**`,
    context.questionText,
    ``,
    `**Correct Answer:** ${context.correctAnswer}`,
  ]

  if (context.existingStepByStep) {
    parts.push(
      ``,
      `**Existing Step-by-Step (use for reference):**`,
      context.existingStepByStep
    )
  }

  parts.push(
    ``,
    `---`,
    ``,
    `## Output Requirements:`,
    ``,
    `### 1. Step-by-Step Explanation:`,
    `- Format as numbered steps: "Step 1:", "Step 2:", etc.`,
    `- Each step on a new line`,
    `- Show all calculations clearly`,
    `- Use simple language for Year ${context.yearGroup} students`,
    ``,
    `### 2. Visual Illustration:`,
    visualInstructions,
    ``,
    `### 3. Worked Example:`,
    exampleInstructions,
    ``,
    `---`,
    ``,
    `Return ONLY a valid JSON object (no markdown code blocks):`,
    `{`,
    `  "stepByStep": "Step 1: ...\\nStep 2: ...\\nStep 3: ...",`,
    `  "visualIllustration": "visual diagram here",`,
    `  "workedExample": "Problem: ...\\nSolution: ...\\nAnswer: ..."`,
    `}`
  )

  return parts.join('\n')
}

/**
 * Export visual elements for reference
 */
export { VISUAL_ELEMENTS, ASCII_COMPONENTS, COLOR_MARKERS }

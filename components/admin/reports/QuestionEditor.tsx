'use client'

/**
 * Question Editor Component
 *
 * Inline editor for fixing reported question issues:
 * - Edit question text
 * - Edit answer options
 * - Change correct answer
 * - Update explanation
 */

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface QuestionEditorProps {
  question: {
    id: string
    subject: string
    topic: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e?: string
    correct_answer: string
    explanation?: string
    difficulty: string
    ember_score: number
  }
  onUpdate: (updates: any) => void
}

export default function QuestionEditor({
  question,
  onUpdate,
}: QuestionEditorProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [optionA, setOptionA] = useState(question.option_a)
  const [optionB, setOptionB] = useState(question.option_b)
  const [optionC, setOptionC] = useState(question.option_c)
  const [optionD, setOptionD] = useState(question.option_d)
  const [optionE, setOptionE] = useState(question.option_e || '')
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer)
  const [explanation, setExplanation] = useState(question.explanation || '')

  // Track changes and notify parent
  useEffect(() => {
    const updates: any = {}
    
    if (questionText !== question.question_text) {
      updates.question_text = questionText
    }
    if (optionA !== question.option_a) {
      updates.option_a = optionA
    }
    if (optionB !== question.option_b) {
      updates.option_b = optionB
    }
    if (optionC !== question.option_c) {
      updates.option_c = optionC
    }
    if (optionD !== question.option_d) {
      updates.option_d = optionD
    }
    if (optionE !== (question.option_e || '')) {
      updates.option_e = optionE
    }
    if (correctAnswer !== question.correct_answer) {
      updates.correct_answer = correctAnswer
    }
    if (explanation !== (question.explanation || '')) {
      updates.explanation = explanation
    }

    onUpdate(updates)
  }, [
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    optionE,
    correctAnswer,
    explanation,
    question,
    onUpdate,
  ])

  return (
    <div className="space-y-6">
      {/* Question Metadata */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{question.subject}</Badge>
        <Badge variant="outline">{question.topic}</Badge>
        <Badge variant="secondary">{question.difficulty}</Badge>
        <Badge>Ember Score: {question.ember_score}</Badge>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Textarea
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          className="font-medium"
        />
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        <Label>Answer Options</Label>
        
        <div className="space-y-2">
          <Label htmlFor="option-a" className="text-sm text-gray-500">
            Option A
          </Label>
          <Input
            id="option-a"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-b" className="text-sm text-gray-500">
            Option B
          </Label>
          <Input
            id="option-b"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-c" className="text-sm text-gray-500">
            Option C
          </Label>
          <Input
            id="option-c"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-d" className="text-sm text-gray-500">
            Option D
          </Label>
          <Input
            id="option-d"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-e" className="text-sm text-gray-500">
            Option E (Optional)
          </Label>
          <Input
            id="option-e"
            value={optionE}
            onChange={(e) => setOptionE(e.target.value)}
            placeholder="Leave blank if not used"
          />
        </div>
      </div>

      {/* Correct Answer */}
      <div className="space-y-2">
        <Label htmlFor="correct-answer">Correct Answer</Label>
        <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
          <SelectTrigger id="correct-answer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            {optionE && <SelectItem value="E">E</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          placeholder="Explain why this is the correct answer..."
        />
      </div>

      {/* Change Indicator */}
      {Object.keys(
        [
          questionText !== question.question_text,
          optionA !== question.option_a,
          optionB !== question.option_b,
          optionC !== question.option_c,
          optionD !== question.option_d,
          optionE !== (question.option_e || ''),
          correctAnswer !== question.correct_answer,
          explanation !== (question.explanation || ''),
        ].filter(Boolean)
      ).length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
          ⚠️ You have unsaved changes. Click "Mark as Resolved" to save them.
        </div>
      )}
    </div>
  )
}

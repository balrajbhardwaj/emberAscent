'use client'

/**
 * Review Question Component
 *
 * Displays question as student would see it, with:
 * - Question text
 * - Answer options (correct answer highlighted)
 * - Explanations
 * - Metadata
 * - Optional inline editing
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

interface ReviewQuestionProps {
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
    year_group?: number
    curriculum_reference?: string
  }
  editMode: boolean
  onEdit: (edits: Record<string, unknown>) => void
}

export default function ReviewQuestion({ question, editMode, onEdit }: ReviewQuestionProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [optionA, setOptionA] = useState(question.option_a)
  const [optionB, setOptionB] = useState(question.option_b)
  const [optionC, setOptionC] = useState(question.option_c)
  const [optionD, setOptionD] = useState(question.option_d)
  const [optionE, setOptionE] = useState(question.option_e || '')
  const [explanation, setExplanation] = useState(question.explanation || '')

  // Track edits
  useEffect(() => {
    const edits: Record<string, unknown> = {}
    
    if (questionText !== question.question_text) {
      edits.question_text = questionText
    }
    if (optionA !== question.option_a) {
      edits.option_a = optionA
    }
    if (optionB !== question.option_b) {
      edits.option_b = optionB
    }
    if (optionC !== question.option_c) {
      edits.option_c = optionC
    }
    if (optionD !== question.option_d) {
      edits.option_d = optionD
    }
    if (optionE !== (question.option_e || '')) {
      edits.option_e = optionE
    }
    if (explanation !== (question.explanation || '')) {
      edits.explanation = explanation
    }

    onEdit(edits)
  }, [questionText, optionA, optionB, optionC, optionD, optionE, explanation, question, onEdit])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{question.subject}</Badge>
            <Badge variant="outline">{question.topic}</Badge>
            <Badge variant="secondary">{question.difficulty}</Badge>
            <Badge>Ember: {question.ember_score}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div>
          {editMode ? (
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>
          ) : (
            <p className="text-lg font-medium">{question.question_text}</p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {[
            { value: optionA, setter: setOptionA, letter: 'A' },
            { value: optionB, setter: setOptionB, letter: 'B' },
            { value: optionC, setter: setOptionC, letter: 'C' },
            { value: optionD, setter: setOptionD, letter: 'D' },
            ...(question.option_e ? [{ value: optionE, setter: setOptionE, letter: 'E' }] : []),
          ].map(({ value, setter, letter }) => {
            const isCorrect = letter === question.correct_answer

            return (
              <div
                key={letter}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : letter}
                  </div>
                  {editMode ? (
                    <Input
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <p className="flex-1">{value}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        {(question.explanation || editMode) && (
          <div>
            <h4 className="font-semibold mb-2">Explanation</h4>
            {editMode ? (
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                placeholder="Add or edit explanation..."
              />
            ) : (
              <p className="text-sm text-gray-700">{question.explanation}</p>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t text-sm text-gray-500">
          <div className="grid grid-cols-2 gap-2">
            {question.year_group && (
              <div>
                <span className="font-medium">Year Group:</span> {question.year_group}
              </div>
            )}
            {question.curriculum_reference && (
              <div>
                <span className="font-medium">Curriculum:</span> {question.curriculum_reference}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

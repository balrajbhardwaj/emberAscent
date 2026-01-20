/**
 * Example Question Component with Report Button
 * 
 * Demonstrates how to integrate the ReportButton into practice questions.
 * This shows how the reporting system would be used in practice.
 * 
 * @module components/practice/ExampleQuestionWithReport
 */
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportButton } from "./ReportButton"

interface ExampleQuestionProps {
  questionId: string
  questionText: string
  options: Array<{
    id: string
    text: string
    is_correct: boolean
  }>
  onAnswerSelect?: (optionId: string) => void
  selectedAnswerId?: string
}

/**
 * Example Question Component with Report Button
 * 
 * Shows how to integrate the ReportButton into existing question components.
 * 
 * @param questionId - ID of the question
 * @param questionText - Text of the question
 * @param options - Array of answer options
 * @param onAnswerSelect - Callback when an answer is selected
 * @param selectedAnswerId - Currently selected answer ID
 */
export function ExampleQuestionWithReport({
  questionId,
  questionText,
  options,
  onAnswerSelect,
  selectedAnswerId,
}: ExampleQuestionProps) {
  return (
    <Card className="p-6">
      {/* Question Header with Report Button */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex-1">
          Question
        </h3>
        {/* Report Button - positioned subtly in the corner */}
        <ReportButton 
          questionId={questionId}
          questionText={questionText}
          className="ml-4"
        />
      </div>
      
      {/* Question Text */}
      <p className="text-slate-800 mb-6 leading-relaxed">
        {questionText}
      </p>
      
      {/* Answer Options */}
      <div className="space-y-3">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selectedAnswerId === option.id ? "default" : "outline"}
            className="w-full text-left justify-start p-4 h-auto"
            onClick={() => onAnswerSelect?.(option.id)}
          >
            <span className="font-medium mr-3">
              {String.fromCharCode(65 + options.indexOf(option))}. 
            </span>
            {option.text}
          </Button>
        ))}
      </div>
      
      {/* Integration Note */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Integration Example:</strong> The "Report Issue" button appears 
          subtly in the top-right corner. Users can report problems without 
          disrupting their practice flow.
        </p>
      </div>
    </Card>
  )
}
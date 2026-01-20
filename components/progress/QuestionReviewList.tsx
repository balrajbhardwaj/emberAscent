/**
 * Question Review List Component
 * 
 * Expandable list of questions from a practice session.
 * Shows answers, explanations, and correctness for review.
 * 
 * @module components/progress/QuestionReviewList
 */
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface QuestionOption {
  id: string
  text: string
  is_correct: boolean
}

interface QuestionExplanations {
  stepByStep: string
  visual: string | null
  example: string | null
}

interface QuestionReview {
  id: string
  questionText: string
  subject: string
  topic: string | null
  difficulty: string
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeTaken: number
  explanations: QuestionExplanations
  options: QuestionOption[]
}

interface QuestionReviewListProps {
  questions: QuestionReview[]
}

/**
 * Format time in seconds to readable format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

/**
 * Single question review item
 */
function QuestionReviewItem({ question, index }: { question: QuestionReview; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const difficultyColors: Record<string, string> = {
    foundation: "bg-green-50 text-green-700 border-green-200",
    standard: "bg-blue-50 text-blue-700 border-blue-200",
    challenge: "bg-orange-50 text-orange-700 border-orange-200",
  }
  
  return (
    <Card
      className={`overflow-hidden transition-all ${
        question.isCorrect
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-red-500"
      }`}
    >
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Question Number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm">
            {index + 1}
          </div>
          
          {/* Question Content */}
          <div className="flex-1 min-w-0">
            {/* Question Text */}
            <p className="text-slate-900 font-medium mb-2 line-clamp-2">
              {question.questionText}
            </p>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Badge variant="outline" className={difficultyColors[question.difficulty] || "bg-slate-50 text-slate-700 border-slate-200"}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline">{question.subject}</Badge>
              {question.topic && (
                <Badge variant="outline" className="text-xs">
                  {question.topic}
                </Badge>
              )}
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                <span>{formatTime(question.timeTaken)}</span>
              </div>
            </div>
            
            {/* Answer Summary */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-600">Your answer:</span>
                <span className={question.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {question.yourAnswer}
                </span>
              </div>
              {!question.isCorrect && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Correct:</span>
                  <span className="text-green-600 font-medium">
                    {question.correctAnswer}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Icon */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {question.isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>
      
      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          {/* Full Question */}
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">Question:</h4>
            <p className="text-slate-700">{question.questionText}</p>
          </div>
          
          {/* Options */}
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">Options:</h4>
            <div className="space-y-2">
              {question.options.map((option) => {
                const isYourAnswer = option.text === question.yourAnswer
                const isCorrectAnswer = option.is_correct
                
                return (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border-2 ${
                      isCorrectAnswer
                        ? "border-green-500 bg-green-50"
                        : isYourAnswer && !isCorrectAnswer
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrectAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      {isYourAnswer && !isCorrectAnswer && (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`${
                          isCorrectAnswer ? "text-green-900 font-medium" :
                          isYourAnswer ? "text-red-900 font-medium" :
                          "text-slate-700"
                        }`}>
                          {option.text}
                        </p>
                        {isYourAnswer && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Your answer
                          </Badge>
                        )}
                        {isCorrectAnswer && (
                          <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-700">
                            Correct answer
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Explanations */}
          {(question.explanations.stepByStep ||
            question.explanations.visual ||
            question.explanations.example) && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Explanation:</h4>
              <Tabs defaultValue="step-by-step" className="w-full">
                <TabsList className={`grid w-full ${
                  [
                    question.explanations.stepByStep,
                    question.explanations.visual,
                    question.explanations.example
                  ].filter(Boolean).length === 1 
                    ? 'grid-cols-1' 
                    : [
                        question.explanations.stepByStep,
                        question.explanations.visual,
                        question.explanations.example
                      ].filter(Boolean).length === 2 
                      ? 'grid-cols-2' 
                      : 'grid-cols-3'
                }`}>
                  <TabsTrigger value="step-by-step">Step-by-Step</TabsTrigger>
                  {question.explanations.visual && (
                    <TabsTrigger value="visual">Visual</TabsTrigger>
                  )}
                  {question.explanations.example && (
                    <TabsTrigger value="example">Example</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="step-by-step" className="mt-3">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {question.explanations.stepByStep}
                    </p>
                  </div>
                </TabsContent>
                
                {question.explanations.visual && (
                  <TabsContent value="visual" className="mt-3">
                    <div className="p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {question.explanations.visual}
                      </p>
                    </div>
                  </TabsContent>
                )}
                
                {question.explanations.example && (
                  <TabsContent value="example" className="mt-3">
                    <div className="p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {question.explanations.example}
                      </p>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/**
 * Question Review List
 * 
 * Displays all questions from a session with expand/collapse.
 * 
 * @param questions - Array of question review items
 */
export function QuestionReviewList({ questions }: QuestionReviewListProps) {
  const [filter, setFilter] = useState<"all" | "incorrect">("all")
  
  const filteredQuestions =
    filter === "incorrect"
      ? questions.filter((q) => !q.isCorrect)
      : questions
  
  const incorrectCount = questions.filter((q) => !q.isCorrect).length
  
  return (
    <div>
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Question Review
        </h3>
        {incorrectCount > 0 && (
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({questions.length})
            </Button>
            <Button
              variant={filter === "incorrect" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("incorrect")}
            >
              Incorrect ({incorrectCount})
            </Button>
          </div>
        )}
      </div>
      
      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">
              {filter === "incorrect"
                ? "🎉 Perfect! All questions answered correctly!"
                : "No questions to review."}
            </p>
          </Card>
        ) : (
          filteredQuestions.map((question, index) => (
            <QuestionReviewItem
              key={question.id}
              question={question}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}

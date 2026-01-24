'use client'

/**
 * Mock Test Interface Component
 *
 * Main interface for taking a mock test with timer, navigator, and question display
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Flag, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMockTest } from '@/hooks/useMockTest'
import MockTimer from '@/components/practice/mock/MockTimer'
import QuestionNavigator from '@/components/practice/mock/QuestionNavigator'
import { submitMockTestSession } from './actions'

interface MockTestInterfaceProps {
  session: {
    id: string
    child_id: string
    time_limit_seconds: number
    started_at: string
    flagged_questions: string[]
    responses: Array<{
      id: string
      question_id: string
      display_order: number
      answer_given: string | null
      flagged_for_review: boolean
      visited_at: string | null
      question: {
        id: string
        subject: string
        topic: string
        question_text: string
        option_a: string
        option_b: string
        option_c: string
        option_d: string
        option_e: string | null
        correct_answer: string
        explanation: string | null
        difficulty: string
        ember_score: number
      }
    }>
  }
}

export default function MockTestInterface({ session }: MockTestInterfaceProps) {
  const router = useRouter()
  const [showNavigator, setShowNavigator] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  const handleSubmitTest = async (timeTaken: number) => {
    const result = await submitMockTestSession(session.id, session.child_id, timeTaken)

    if (result.success) {
      toast.success('Test submitted successfully!')
      router.push(`/practice/mock/${session.id}/results`)
    } else {
      toast.error('Failed to submit test')
    }
  }

  const mockTest = useMockTest(session, handleSubmitTest)

  const currentResponse = session.responses[mockTest.currentQuestionIndex]
  const currentQuestion = currentResponse?.question

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  const totalQuestions = session.responses.length
  const answeredCount = mockTest.getAnsweredCount()
  const flaggedCount = mockTest.getFlaggedCount()
  const progress = (answeredCount / totalQuestions) * 100

  const handlePrevious = () => {
    if (mockTest.currentQuestionIndex > 0) {
      mockTest.setCurrentQuestionIndex(mockTest.currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (mockTest.currentQuestionIndex < totalQuestions - 1) {
      mockTest.setCurrentQuestionIndex(mockTest.currentQuestionIndex + 1)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    mockTest.handleAnswer(currentQuestion.id, answer)
  }

  const handleFlagToggle = () => {
    mockTest.handleFlag(currentQuestion.id)
  }

  const handleShowSubmitDialog = () => {
    setShowSubmitDialog(true)
  }

  const handleConfirmSubmit = () => {
    setShowSubmitDialog(false)
    mockTest.handleSubmit()
  }

  const options = [
    { letter: 'A', text: currentQuestion.option_a },
    { letter: 'B', text: currentQuestion.option_b },
    { letter: 'C', text: currentQuestion.option_c },
    { letter: 'D', text: currentQuestion.option_d },
    ...(currentQuestion.option_e ? [{ letter: 'E', text: currentQuestion.option_e }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MockTimer timeRemaining={mockTest.timeRemaining} />
              <div className="text-sm text-gray-600">
                Question {mockTest.currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                Navigator
              </Button>
              <Button
                variant={currentResponse.flagged_for_review ? 'default' : 'outline'}
                size="sm"
                onClick={handleFlagToggle}
              >
                <Flag className="h-4 w-4 mr-1" />
                {currentResponse.flagged_for_review ? 'Flagged' : 'Flag'}
              </Button>
              <Button variant="default" size="sm" onClick={handleShowSubmitDialog}>
                Submit Test
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>
                {answeredCount} answered · {flaggedCount} flagged
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card>
              <CardContent className="pt-6">
                {/* Question Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{currentQuestion.subject}</Badge>
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  {currentResponse.flagged_for_review && (
                    <Badge variant="default">
                      <Flag className="h-3 w-3 mr-1" />
                      Flagged
                    </Badge>
                  )}
                </div>

                {/* Question Text */}
                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentQuestion.question_text}
                  </h3>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {options.map((option) => {
                    const isSelected = currentResponse.answer_given === option.letter

                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswerSelect(option.letter)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {option.letter}
                          </div>
                          <div className="flex-1 pt-1">{option.text}</div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={mockTest.currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {answeredCount} of {totalQuestions} answered
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={mockTest.currentQuestionIndex === totalQuestions - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Navigator Sidebar */}
          {showNavigator && (
            <div className="lg:col-span-1">
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentIndex={mockTest.currentQuestionIndex}
                onNavigate={mockTest.setCurrentQuestionIndex}
                getQuestionState={mockTest.getQuestionState}
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Mock Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit? You won&apos;t be able to change your answers after
              submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total questions:</span>
              <span className="font-semibold">{totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Answered:</span>
              <span className="font-semibold text-green-600">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Unanswered:</span>
              <span className="font-semibold text-amber-600">
                {totalQuestions - answeredCount}
              </span>
            </div>
            {flaggedCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Flagged for review:</span>
                <span className="font-semibold text-blue-600">{flaggedCount}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Keep Working
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={mockTest.isSubmitting}>
              {mockTest.isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

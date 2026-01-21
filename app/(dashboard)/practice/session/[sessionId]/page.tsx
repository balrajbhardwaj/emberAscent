/**
 * Practice Session Page
 * 
 * Active practice session where users answer questions.
 * Handles question flow, timing, and progress tracking.
 * 
 * @module app/(dashboard)/practice/session/[sessionId]/page
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import { EmberScore } from "@/components/practice/EmberScore"
import { CurriculumBadge } from "@/components/curriculum/CurriculumReference"

interface QuestionOption {
  id: string
  text: string
}

interface Question {
  id: string
  question_text: string
  subject: string
  topic: string | null
  difficulty: string
  options: QuestionOption[]
  correct_answer: string
  explanations: {
    step_by_step: string
    visual: string
    worked_example: string
  } | null
  ember_score: number
  year_group: number | null
  curriculum_reference: string | null
  is_published: boolean
  created_at: string
  created_by: string | null
}

interface PracticeSession {
  id: string
  child_id: string
  session_type: string
  subject: string | null
  topic: string | null
  total_questions: number
  started_at: string
  completed_at: string | null
  correct_answers: number
  created_at: string
}

export default function PracticeSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string

  const [session, setSession] = useState<PracticeSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    loadSession()
  }, [sessionId])

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto-submit
          handleFinishSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  async function loadSession() {
    try {
      const supabase = createClient()
      
      // Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        console.error('Session not found:', sessionError)
        router.push('/practice')
        return
      }

      setSession(sessionData as any)
      
      // Note: Timer and question list would need to be stored in a separate table
      // or as metadata. For now, load random questions based on subject
      
      // Load questions based on session parameters
      let query = supabase
        .from('questions')
        .select('*')
        .eq('is_published', true)
        .limit((sessionData as any).total_questions)
      
      if ((sessionData as any).subject && (sessionData as any).subject !== 'mixed') {
        query = query.ilike('subject', `%${(sessionData as any).subject}%`)
      }

      const { data: questionsData, error: questionsError } = await query

      if (questionsError) {
        console.error('Error loading questions:', questionsError)
        return
      }

      // Shuffle and limit questions
      const shuffled = (questionsData || []).sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, (sessionData as any).total_questions) as Question[])
    } catch (error) {
      console.error('Failed to load session:', error)
      router.push('/practice')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAnswerSelect(answerId: string) {
    if (hasSubmitted) return
    setSelectedAnswer(answerId)
  }

  function handleSubmitAnswer() {
    if (!selectedAnswer || hasSubmitted) return

    const currentQuestion = questions[currentQuestionIndex]
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }))
    setHasSubmitted(true)
    setShowExplanation(true)
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
      setHasSubmitted(false)
      setShowExplanation(false)
    } else {
      handleFinishSession()
    }
  }

  async function handleFinishSession() {
    if (!session) return

    try {
      const supabase = createClient()
      
      // Calculate results
      const correctAnswers = questions.filter(q => 
        answers[q.id] === q.correct_answer
      ).length

      // Update session
      await (supabase
        .from('practice_sessions') as any)
        .update({
          correct_answers: correctAnswers,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Create question attempts
      const attempts = questions.map(question => ({
        session_id: sessionId,
        question_id: question.id,
        child_id: (session as any).child_id,
        selected_answer: answers[question.id] || '',
        is_correct: answers[question.id] === (question as any).correct_answer,
        time_taken_seconds: 30 // TODO: Track actual time spent per question
      }))

      await (supabase
        .from('question_attempts') as any)
        .insert(attempts)

      // Navigate to results
      router.push(`/practice/session/${sessionId}/results`)
      
    } catch (error) {
      console.error('Error finishing session:', error)
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading practice session...</p>
        </div>
      </div>
    )
  }

  if (!session || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Session not found or no questions available.</p>
        <Button onClick={() => router.push('/practice')}>
          Return to Practice
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Practice
          </h1>
          <p className="text-slate-600 capitalize">{session.subject}</p>
        </div>
        
        {timeRemaining !== null && (
          <div className="flex items-center space-x-2 text-lg font-mono">
            <Clock className="h-5 w-5 text-slate-600" />
            <span className={timeRemaining < 300 ? 'text-red-600' : 'text-slate-900'}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-slate-900 font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {currentQuestion.subject}
              </Badge>
              {currentQuestion.curriculum_reference && (
                <CurriculumBadge 
                  code={currentQuestion.curriculum_reference}
                  showTooltip
                />
              )}
            </div>
            <EmberScore 
              score={currentQuestion.ember_score} 
              breakdown={{
                curriculumAlignment: currentQuestion.curriculum_reference ? 100 : 0,
                expertVerified: false,
                communityRating: 0,
                generatedBy: "AI Generated",
                reviewedBy: "",
                curriculumReference: currentQuestion.curriculum_reference || "",
              }}
            />
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option.id === currentQuestion.correct_answer
              const isSelected = selectedAnswer === option.id

              let optionClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              let circleClass = 'border-slate-300 text-slate-600'

              if (hasSubmitted) {
                if (isCorrect) {
                  optionClass = 'border-green-500 bg-green-50'
                  circleClass = 'border-green-500 bg-green-500 text-white'
                } else if (isSelected && !isCorrect) {
                  optionClass = 'border-red-500 bg-red-50'
                  circleClass = 'border-red-500 bg-red-500 text-white'
                }
              } else if (isSelected) {
                optionClass = 'border-blue-500 bg-blue-50'
                circleClass = 'border-blue-500 bg-blue-500 text-white'
              }

              return (
                <button
                  key={option.id}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${optionClass} ${hasSubmitted ? 'cursor-default' : ''}`}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={hasSubmitted}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-medium ${circleClass}`}>
                      {hasSubmitted && isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : hasSubmitted && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        option.id
                      )}
                    </span>
                    <span className="text-slate-900">{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result feedback + Next Button (MOVED UP - appears immediately after options) */}
          {hasSubmitted && (
            <div className={`mt-4 p-4 rounded-lg flex items-center justify-between ${
              selectedAnswer === currentQuestion.correct_answer
                ? 'bg-green-100 border border-green-200'
                : 'bg-red-100 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {selectedAnswer === currentQuestion.correct_answer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-700" />
                    <span className="font-semibold text-green-800">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-700" />
                    <span className="font-semibold text-red-800">
                      Incorrect. The correct answer is {currentQuestion.correct_answer}.
                    </span>
                  </>
                )}
              </div>
              <Button
                onClick={handleNextQuestion}
                size="lg"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}
              </Button>
            </div>
          )}

          {/* Submit Answer button (only before submission) */}
          {!hasSubmitted && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                size="lg"
              >
                Submit Answer
              </Button>
            </div>
          )}

          {/* Explanation Panel (NOW BELOW the result - optional viewing) */}
          {hasSubmitted && currentQuestion.explanations && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-900">Explanation</h4>

                  {currentQuestion.explanations.step_by_step && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Step by Step:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.step_by_step}</p>
                    </div>
                  )}

                  {currentQuestion.explanations.worked_example && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Worked Example:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.worked_example}</p>
                    </div>
                  )}

                  {currentQuestion.explanations.visual && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Visual Aid:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.visual}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
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
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface Question {
  id: string
  text: string
  options: Array<{ id: string; text: string }>
  correct_answer: string
  explanation: any
}

interface PracticeSession {
  id: string
  child_id: string
  session_type: string
  subject: string
  total_questions: number
  time_limit_seconds?: number
  status: string
  questions: string[]
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

      setSession(sessionData)
      
      // Set timer if applicable
      if (sessionData.time_limit_seconds) {
        setTimeRemaining(sessionData.time_limit_seconds)
      }

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', sessionData.questions)

      if (questionsError) {
        console.error('Error loading questions:', questionsError)
        return
      }

      // Ensure questions are in the same order as session.questions
      const orderedQuestions = sessionData.questions.map(id => 
        questionsData?.find(q => q.id === id)
      ).filter(Boolean) as Question[]

      setQuestions(orderedQuestions)
    } catch (error) {
      console.error('Failed to load session:', error)
      router.push('/practice')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAnswerSelect(answerId: string) {
    setSelectedAnswer(answerId)
  }

  function handleNextQuestion() {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }))

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
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
      await supabase
        .from('practice_sessions')
        .update({
          status: 'completed',
          correct_answers: correctAnswers,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Create question attempts
      const attempts = questions.map(question => ({
        session_id: sessionId,
        question_id: question.id,
        child_id: session.child_id,
        selected_answer: answers[question.id] || '',
        is_correct: answers[question.id] === question.correct_answer,
        time_spent_seconds: 30 // TODO: Track actual time spent per question
      }))

      await supabase
        .from('question_attempts')
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
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => handleAnswerSelect(option.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-medium ${
                    selectedAnswer === option.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-300 text-slate-600'
                  }`}>
                    {option.id}
                  </span>
                  <span className="text-slate-900">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              size="lg"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
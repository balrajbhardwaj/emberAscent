/**
 * Practice Session Results Page
 * 
 * Displays results and performance analysis after completing a practice session.
 * 
 * @module app/(dashboard)/practice/session/[sessionId]/results/page
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Target, Clock, Trophy } from "lucide-react"

interface SessionResults {
  id: string
  session_type: string
  subject: string
  total_questions: number
  correct_answers: number
  time_limit_seconds?: number
  completed_at: string
}

interface QuestionResult {
  question_id: string
  question_text: string
  selected_answer: string
  correct_answer: string
  is_correct: boolean
  explanation: any
  options: Array<{ id: string; text: string }>
}

export default function SessionResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string

  const [results, setResults] = useState<SessionResults | null>(null)
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    loadResults()
  }, [sessionId])

  async function loadResults() {
    try {
      const supabase = createClient()
      
      // Load session results
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

      setResults(sessionData)

      // Load question attempts with question details
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('question_attempts')
        .select(`
          *,
          questions:question_id (
            text,
            options,
            correct_answer,
            explanation
          )
        `)
        .eq('session_id', sessionId)

      if (attemptsError) {
        console.error('Error loading attempts:', attemptsError)
        return
      }

      const formattedResults = attemptsData?.map(attempt => ({
        question_id: attempt.question_id,
        question_text: (attempt.questions as any)?.text || '',
        selected_answer: attempt.selected_answer,
        correct_answer: (attempt.questions as any)?.correct_answer || '',
        is_correct: attempt.is_correct,
        explanation: (attempt.questions as any)?.explanation,
        options: (attempt.questions as any)?.options || []
      })) || []

      setQuestionResults(formattedResults)
    } catch (error) {
      console.error('Failed to load results:', error)
      router.push('/practice')
    } finally {
      setIsLoading(false)
    }
  }

  function getPerformanceMessage(percentage: number): string {
    if (percentage >= 80) return "Excellent work! 🌟"
    if (percentage >= 60) return "Good job! Keep it up! 👍"
    if (percentage >= 40) return "Making progress! 📈"
    return "Keep practicing! You'll improve! 💪"
  }

  function getPerformanceColor(percentage: number): string {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Results not found.</p>
        <Button onClick={() => router.push('/practice')}>
          Return to Practice
        </Button>
      </div>
    )
  }

  const percentage = Math.round((results.correct_answers / results.total_questions) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Trophy className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Session Complete!</h1>
        <p className="text-slate-600">
          {results.session_type.charAt(0).toUpperCase() + results.session_type.slice(1)} Practice • {results.subject}
        </p>
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">
            <span className={getPerformanceColor(percentage)}>{percentage}%</span>
          </CardTitle>
          <p className="text-lg text-slate-600">
            {results.correct_answers} out of {results.total_questions} correct
          </p>
          <p className={`text-lg font-medium ${getPerformanceColor(percentage)}`}>
            {getPerformanceMessage(percentage)}
          </p>
        </CardHeader>
        
        <CardContent>
          <Progress value={percentage} className="h-3 mb-4" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                <span className="font-medium text-green-600">Correct</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{results.correct_answers}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-1">
                <XCircle className="h-5 w-5 text-red-600 mr-1" />
                <span className="font-medium text-red-600">Incorrect</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {results.total_questions - results.correct_answers}
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-1">
                <Target className="h-5 w-5 text-blue-600 mr-1" />
                <span className="font-medium text-blue-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{results.total_questions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Question Review
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {questionResults.map((result, index) => (
            <div 
              key={result.question_id}
              className={`p-4 rounded-lg border ${
                result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-slate-900">
                  Question {index + 1}
                </span>
                {result.is_correct ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              
              <p className="text-slate-700 mb-3">{result.question_text}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-600">Your answer: </span>
                  <span className={result.is_correct ? 'text-green-600' : 'text-red-600'}>
                    {result.options.find(opt => opt.id === result.selected_answer)?.text || result.selected_answer}
                  </span>
                </div>
                
                {!result.is_correct && (
                  <div>
                    <span className="font-medium text-slate-600">Correct answer: </span>
                    <span className="text-green-600">
                      {result.options.find(opt => opt.id === result.correct_answer)?.text || result.correct_answer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => router.push('/practice')} variant="outline">
          Back to Practice
        </Button>
        <Button onClick={() => router.push('/progress')}>
          View Progress
        </Button>
        <Button onClick={() => window.location.reload()}>
          Practice Again
        </Button>
      </div>
    </div>
  )
}
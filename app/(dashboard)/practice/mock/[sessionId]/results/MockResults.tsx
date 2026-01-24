'use client'

/**
 * Mock Results Component
 *
 * Displays comprehensive mock test results with analysis
 */

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowRight,
} from 'lucide-react'
import { MockAnalysis, Recommendation } from '@/lib/practice/mockAnalyzer'

interface MockResultsProps {
  sessionId: string
  analysis: MockAnalysis
  recommendations: Recommendation[]
  comparison: {
    previousBestScore: number
    improvement: number
    averageForLevel: number
    totalMocks: number
  } | null
}

export default function MockResults({
  sessionId: _sessionId,
  analysis,
  recommendations,
  comparison,
}: MockResultsProps) {
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false)

  const { overview, bySubject, byDifficulty, byTopic, questions, timeAnalysis } = analysis
  const incorrectQuestions = questions.filter((q) => !q.isCorrect)

  const getGradeMessage = (percentage: number) => {
    if (percentage >= 90) return { text: 'Outstanding!', color: 'text-green-600', icon: Trophy }
    if (percentage >= 80) return { text: 'Excellent!', color: 'text-blue-600', icon: Trophy }
    if (percentage >= 70) return { text: 'Good Work!', color: 'text-blue-600', icon: Target }
    if (percentage >= 60) return { text: 'Pass', color: 'text-amber-600', icon: Target }
    return { text: 'Keep Practicing', color: 'text-gray-600', icon: BookOpen }
  }

  const grade = getGradeMessage(overview.percentage)
  const GradeIcon = grade.icon

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-8 pb-8 text-center">
          <GradeIcon className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h1 className={`text-4xl font-bold mb-2 ${grade.color}`}>{grade.text}</h1>
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {overview.correctAnswers}/{overview.totalQuestions}
          </div>
          <p className="text-xl text-gray-600">
            {Math.round(overview.percentage)}% Correct
          </p>

          {/* Comparison */}
          {comparison && comparison.totalMocks > 1 && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Previous Best:</span>
                <span className="font-semibold">
                  {Math.round(comparison.previousBestScore)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                {comparison.improvement > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      +{Math.round(comparison.improvement)}%
                    </span>
                  </>
                ) : comparison.improvement < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-semibold">
                      {Math.round(comparison.improvement)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600">No change</span>
                )}
              </div>
            </div>
          )}

          {/* Time */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Completed in {formatTime(overview.timeTaken)} of {formatTime(overview.timeLimit)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white rounded-lg"
              >
                <Badge
                  variant={
                    rec.priority === 'high'
                      ? 'destructive'
                      : rec.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                  className="mt-0.5"
                >
                  {rec.priority}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  {rec.topics && rec.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Subject */}
        <Card>
          <CardHeader>
            <CardTitle>By Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bySubject.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{subject.subject}</span>
                  <span className="text-sm text-gray-600">
                    {subject.correct}/{subject.total} ({Math.round(subject.percentage)}%)
                  </span>
                </div>
                <Progress value={subject.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>By Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byDifficulty.map((diff) => (
              <div key={diff.difficulty}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{diff.difficulty}</span>
                  <span className="text-sm text-gray-600">
                    {diff.correct}/{diff.total} ({Math.round(diff.percentage)}%)
                  </span>
                </div>
                <Progress value={diff.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-gray-600">Avg per Question</div>
              <div className="text-2xl font-bold">
                {Math.round(timeAnalysis.avgTimePerQuestion)}s
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fastest</div>
              <div className="text-2xl font-bold text-green-600">
                {timeAnalysis.fastestQuestion}s
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Slowest</div>
              <div className="text-2xl font-bold text-amber-600">
                {timeAnalysis.slowestQuestion}s
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-2xl font-bold">{formatTime(overview.timeTaken)}</div>
            </div>
          </div>

          {/* Time by Subject */}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm">Average Time by Subject</h4>
            {Object.entries(timeAnalysis.timeBySubject).map(([subject, time]) => (
              <div key={subject} className="flex items-center justify-between text-sm">
                <span>{subject}</span>
                <span className="font-medium">{Math.round(time)}s</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weakest Topics */}
      {byTopic.slice(0, 5).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Needing Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byTopic.slice(0, 5).map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{topic.topic}</div>
                    <div className="text-sm text-gray-500">{topic.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {topic.correct}/{topic.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(topic.percentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question-by-Question Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Review</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIncorrectOnly(!showIncorrectOnly)}
            >
              {showIncorrectOnly ? 'Show All' : 'Show Incorrect Only'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {(showIncorrectOnly ? incorrectQuestions : questions).map((q, idx) => (
              <AccordionItem key={q.questionId} value={`question-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left w-full">
                    {q.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{q.subject}</Badge>
                        <Badge variant="secondary">{q.difficulty}</Badge>
                        {q.flagged && (
                          <Badge variant="default">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {q.questionText}
                      </p>
                    </div>
                    {q.timeTaken && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {q.timeTaken}s
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-8 space-y-3 pt-2">
                    <div>
                      <div className="text-sm font-medium mb-1">Question:</div>
                      <p className="text-sm text-gray-700">{q.questionText}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium mb-1">Your Answer:</div>
                        <Badge
                          variant={q.isCorrect ? 'default' : 'destructive'}
                          className="text-sm"
                        >
                          {q.yourAnswer || 'Not answered'}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Correct Answer:</div>
                        <Badge variant="outline" className="text-sm bg-green-50">
                          {q.correctAnswer}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Topic:</span> {q.topic}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" variant="outline" asChild>
          <Link href="/practice">Practice More</Link>
        </Button>
        <Button size="lg" asChild>
          <Link href="/practice/mock">
            Take Another Mock
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

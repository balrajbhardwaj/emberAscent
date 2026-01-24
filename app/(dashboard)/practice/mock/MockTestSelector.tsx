'use client'

/**
 * Mock Test Selector Component
 *
 * Client-side component for mock test selection and configuration
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, BookOpen, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { createMockTestSession } from './actions'

interface MockTestTemplate {
  id: string
  name: string
  description: string | null
  style: string
  total_questions: number
  time_limit_minutes: number
  difficulty_distribution: Record<string, number>
  subject_distribution: Record<string, number>
}

interface PreviousMock {
  id: string
  started_at: string
  completed_at: string | null
  correct_answers: number
  total_questions: number
  mock_test_config: {
    template_name?: string
  }
}

interface MockTestSelectorProps {
  childId: string
  childName: string
  yearGroup: string
  templates: MockTestTemplate[]
  previousMocks: PreviousMock[]
}

export default function MockTestSelector({
  childId,
  templates,
  previousMocks,
}: Omit<MockTestSelectorProps, 'childName' | 'yearGroup'> & {
  childName?: string
  yearGroup?: string
}) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const handleStartTest = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a test')
      return
    }

    setIsStarting(true)
    const result = await createMockTestSession(selectedTemplate, childId)
    setIsStarting(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to create test')
      return
    }

    router.push(`/practice/mock/${result.sessionId}`)
  }

  const bestScore = previousMocks.length > 0
    ? Math.max(...previousMocks.map((m) => (m.correct_answers / m.total_questions) * 100))
    : null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mock Test Mode</h1>
        <p className="text-gray-500">
          Practice under real exam conditions to see how you&apos;ll perform
        </p>
      </div>

      {/* Previous Performance */}
      {previousMocks.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Your Progress</h3>
                </div>
                <p className="text-sm text-blue-700">
                  You&apos;ve completed {previousMocks.length} mock test{previousMocks.length !== 1 ? 's' : ''}
                  {bestScore && ` · Best score: ${Math.round(bestScore)}%`}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/pricing?feature=session-history">View History</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose a Test</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id
            const subjects = Object.entries(template.subject_distribution)
              .filter(([, count]) => count > 0)
              .map(([subject]) => subject)

            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline">{template.style}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{template.total_questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{template.time_limit_minutes} minutes</span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1">
                    {subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  {/* Difficulty Distribution */}
                  <div className="text-xs text-gray-600">
                    Difficulty:{' '}
                    {Object.entries(template.difficulty_distribution)
                      .map(([diff, pct]) => `${Math.round(pct * 100)}% ${diff}`)
                      .join(', ')}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tips Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base text-amber-900">Mock Test Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Find a quiet place where you won&apos;t be interrupted</li>
            <li>Have pencil and paper ready for working out</li>
            <li>You cannot pause once the test starts</li>
            <li>You can flag questions to review later</li>
            <li>All questions are shown at once - you can navigate freely</li>
            <li>You&apos;ll see detailed results and explanations after submitting</li>
          </ul>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleStartTest}
          disabled={!selectedTemplate || isStarting}
          className="px-8"
        >
          {isStarting ? 'Starting Test...' : 'Start Mock Test'}
        </Button>
      </div>
    </div>
  )
}

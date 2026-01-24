'use client'

/**
 * Question Navigator Component
 *
 * Grid navigator for jumping between questions in mock test
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, Check, Eye } from 'lucide-react'

interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  onNavigate: (index: number) => void
  getQuestionState: (index: number) => 'not-visited' | 'visited' | 'answered' | 'flagged'
}

export default function QuestionNavigator({
  totalQuestions,
  currentIndex,
  onNavigate,
  getQuestionState,
}: QuestionNavigatorProps) {
  const getButtonStyle = (index: number) => {
    const state = getQuestionState(index)
    const isCurrent = index === currentIndex

    if (isCurrent) {
      return 'ring-2 ring-blue-500 ring-offset-2'
    }

    switch (state) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'flagged':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'visited':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'not-visited':
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200'
    }
  }

  const getIcon = (index: number) => {
    const state = getQuestionState(index)
    switch (state) {
      case 'answered':
        return <Check className="h-3 w-3" />
      case 'flagged':
        return <Flag className="h-3 w-3" />
      case 'visited':
        return <Eye className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Question Navigator</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border-2 border-green-300"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-100 border-2 border-amber-300"></div>
            <span>Flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-50 border-2 border-blue-200"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-50 border-2 border-gray-200"></div>
            <span>Not visited</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className={`h-10 ${getButtonStyle(i)}`}
              onClick={() => onNavigate(i)}
            >
              <span className="flex items-center justify-center gap-1">
                {i + 1}
                {getIcon(i)}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

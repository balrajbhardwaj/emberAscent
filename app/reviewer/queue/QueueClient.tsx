'use client'

/**
 * Queue Client Component
 *
 * Displays list of assigned review questions
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, ChevronRight, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Assignment {
  id: string
  status: string
  assigned_at: string
  due_at: string
  question: {
    id: string
    subject: string
    topic: string
    difficulty: string
    year_group: string
    question_text: string
    ember_score: number
  }
}

interface QueueClientProps {
  assignments: Assignment[]
}

const SUBJECTS = ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning']
const DIFFICULTIES = ['Foundation', 'Standard', 'Challenge']

export default function QueueClient({ assignments }: QueueClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const statusFilter = ['assigned', 'in_progress']

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    )
  }

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    )
  }

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // Status filter
      if (!statusFilter.includes(assignment.status)) {
        return false
      }

      // Subject filter
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(assignment.question.subject)) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(assignment.question.difficulty)) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          assignment.question.question_text.toLowerCase().includes(searchLower) ||
          assignment.question.topic.toLowerCase().includes(searchLower) ||
          assignment.question.subject.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [assignments, searchTerm, selectedSubjects, selectedDifficulties, statusFilter])

  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Queue</h1>
          <p className="text-gray-500">
            {filteredAssignments.length} question{filteredAssignments.length !== 1 ? 's' : ''} to review
          </p>
        </div>
        {inProgressCount > 0 && (
          <Button asChild>
            <Link href="/reviewer/review">Continue Reviewing</Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <Label>Subject</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUBJECTS.map(subject => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subject-${subject}`}
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={() => toggleSubject(subject)}
                  />
                  <label
                    htmlFor={`subject-${subject}`}
                    className="text-sm cursor-pointer"
                  >
                    {subject}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <Label>Difficulty</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DIFFICULTIES.map(difficulty => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${difficulty}`}
                    checked={selectedDifficulties.includes(difficulty)}
                    onCheckedChange={() => toggleDifficulty(difficulty)}
                  />
                  <label
                    htmlFor={`difficulty-${difficulty}`}
                    className="text-sm cursor-pointer"
                  >
                    {difficulty}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500">No questions match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Status and Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={assignment.status === 'in_progress' ? 'default' : 'secondary'}>
                        {assignment.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                      </Badge>
                      <Badge variant="outline">{assignment.question.subject}</Badge>
                      <Badge variant="outline">{assignment.question.difficulty}</Badge>
                      <Badge variant="outline">Year {assignment.question.year_group}</Badge>
                      <span className="text-sm text-gray-500">
                        Ember Score: {assignment.question.ember_score}
                      </span>
                    </div>

                    {/* Question Text Preview */}
                    <p className="text-sm font-medium line-clamp-2">
                      {assignment.question.question_text}
                    </p>

                    {/* Topic and Timing */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{assignment.question.topic}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Assigned {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button asChild size="sm">
                    <Link href={`/reviewer/review/${assignment.id}`}>
                      {assignment.status === 'in_progress' ? 'Continue' : 'Review'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * Completed Reviews Client Component
 *
 * Displays history of completed reviews
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Edit3, XCircle, Clock, Search, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Submission {
  id: string
  outcome: string
  feedback: string | null
  edits_made: any
  time_spent_seconds: number
  created_at: string
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

interface CompletedClientProps {
  submissions: Submission[]
}

const SUBJECTS = ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning']
const OUTCOMES = ['approved', 'needs_edit', 'rejected']

export default function CompletedClient({ submissions }: CompletedClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    )
  }

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes(prev =>
      prev.includes(outcome) ? prev.filter(o => o !== outcome) : [...prev, outcome]
    )
  }

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Subject filter
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(submission.question.subject)) {
        return false
      }

      // Outcome filter
      if (selectedOutcomes.length > 0 && !selectedOutcomes.includes(submission.outcome)) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          submission.question.question_text.toLowerCase().includes(searchLower) ||
          submission.question.topic.toLowerCase().includes(searchLower) ||
          submission.question.subject.toLowerCase().includes(searchLower) ||
          (submission.feedback && submission.feedback.toLowerCase().includes(searchLower))
        )
      }

      return true
    })
  }, [submissions, searchTerm, selectedSubjects, selectedOutcomes])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />
      case 'needs_edit':
        return <Edit3 className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'needs_edit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const stats = useMemo(() => {
    const total = submissions.length
    const approved = submissions.filter(s => s.outcome === 'approved').length
    const needsEdit = submissions.filter(s => s.outcome === 'needs_edit').length
    const rejected = submissions.filter(s => s.outcome === 'rejected').length
    const totalTime = submissions.reduce((sum, s) => sum + s.time_spent_seconds, 0)
    const avgTime = total > 0 ? Math.round(totalTime / total) : 0

    return { total, approved, needsEdit, rejected, avgTime }
  }, [submissions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Completed Reviews</h1>
        <p className="text-gray-500">
          {filteredSubmissions.length} review{filteredSubmissions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.needsEdit}</div>
            <p className="text-sm text-gray-500">Needs Edit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
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
                placeholder="Search reviews..."
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

          {/* Outcome Filter */}
          <div>
            <Label>Outcome</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {OUTCOMES.map(outcome => (
                <div key={outcome} className="flex items-center space-x-2">
                  <Checkbox
                    id={`outcome-${outcome}`}
                    checked={selectedOutcomes.includes(outcome)}
                    onCheckedChange={() => toggleOutcome(outcome)}
                  />
                  <label
                    htmlFor={`outcome-${outcome}`}
                    className="text-sm cursor-pointer capitalize"
                  >
                    {outcome.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500">No reviews match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Outcome and Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getOutcomeColor(submission.outcome)}>
                        {getOutcomeIcon(submission.outcome)}
                        <span className="ml-1 capitalize">{submission.outcome.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline">{submission.question.subject}</Badge>
                      <Badge variant="outline">{submission.question.difficulty}</Badge>
                      <Badge variant="outline">Year {submission.question.year_group}</Badge>
                      {submission.edits_made && Object.keys(submission.edits_made).length > 0 && (
                        <Badge variant="secondary">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edited
                        </Badge>
                      )}
                    </div>

                    {/* Question Text Preview */}
                    <p className="text-sm font-medium line-clamp-2">
                      {submission.question.question_text}
                    </p>

                    {/* Topic and Timing */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{submission.question.topic}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(submission.time_spent_seconds)}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Feedback Preview */}
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 line-clamp-1 italic">
                        &ldquo;{submission.feedback}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Review Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Outcome */}
                        <div>
                          <Label>Outcome</Label>
                          <Badge className={`${getOutcomeColor(submission.outcome)} mt-1`}>
                            {getOutcomeIcon(submission.outcome)}
                            <span className="ml-1 capitalize">{submission.outcome.replace('_', ' ')}</span>
                          </Badge>
                        </div>

                        {/* Question */}
                        <div>
                          <Label>Question</Label>
                          <div className="mt-1 text-sm bg-gray-50 p-3 rounded">
                            {submission.question.question_text}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Subject</Label>
                            <p className="text-sm mt-1">{submission.question.subject}</p>
                          </div>
                          <div>
                            <Label>Topic</Label>
                            <p className="text-sm mt-1">{submission.question.topic}</p>
                          </div>
                          <div>
                            <Label>Difficulty</Label>
                            <p className="text-sm mt-1">{submission.question.difficulty}</p>
                          </div>
                          <div>
                            <Label>Year Group</Label>
                            <p className="text-sm mt-1">Year {submission.question.year_group}</p>
                          </div>
                        </div>

                        {/* Time Spent */}
                        <div>
                          <Label>Time Spent</Label>
                          <p className="text-sm mt-1">{formatTime(submission.time_spent_seconds)}</p>
                        </div>

                        {/* Feedback */}
                        {submission.feedback && (
                          <div>
                            <Label>Feedback</Label>
                            <p className="text-sm mt-1 bg-gray-50 p-3 rounded">
                              {submission.feedback}
                            </p>
                          </div>
                        )}

                        {/* Edits Made */}
                        {submission.edits_made && Object.keys(submission.edits_made).length > 0 && (
                          <div>
                            <Label>Edits Made</Label>
                            <div className="mt-1 text-sm bg-gray-50 p-3 rounded space-y-1">
                              {Object.entries(submission.edits_made).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>{' '}
                                  <span className="text-gray-600">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

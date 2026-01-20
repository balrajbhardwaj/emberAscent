/**
 * Topic Browser Component
 * 
 * Expandable tree view for topic and subtopic selection.
 * Shows progress, question counts, and allows multi-select.
 * 
 * @module components/practice/TopicBrowser
 */
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronRight, Search, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Topic } from "@/lib/content/topics"

interface TopicBrowserProps {
  subjectName: string
  topics: Topic[]
  topicMastery: Record<string, { mastery: number; questionsAnswered: number }>
  selectedTopics: string[]
  onTopicsChange: (topicIds: string[]) => void
  showWeakAreasOnly: boolean
  onToggleWeakAreas: (enabled: boolean) => void
}

/**
 * Topic Browser
 * 
 * Interactive tree for selecting topics and subtopics.
 * Includes search, select all, and weak areas filter.
 * 
 * @param subjectName - Name of the selected subject
 * @param topics - Array of topics with subtopics
 * @param topicMastery - Mastery data for each topic
 * @param selectedTopics - Currently selected topic IDs
 * @param onTopicsChange - Handler when selection changes
 * @param showWeakAreasOnly - Whether to filter weak areas
 * @param onToggleWeakAreas - Handler for weak areas toggle
 */
export function TopicBrowser({
  subjectName,
  topics,
  topicMastery,
  selectedTopics,
  onTopicsChange,
  showWeakAreasOnly,
  onToggleWeakAreas,
}: TopicBrowserProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Filter topics based on search and weak areas
  const filteredTopics = topics.filter((topic) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = topic.name.toLowerCase().includes(query)
      const matchesDescription = topic.description.toLowerCase().includes(query)
      const matchesSubtopic = topic.subtopics?.some(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query)
      )
      if (!matchesName && !matchesDescription && !matchesSubtopic) {
        return false
      }
    }

    // Weak areas filter (mastery < 70%)
    if (showWeakAreasOnly) {
      const mastery = topicMastery[topic.id]?.mastery || 0
      if (mastery >= 70) {
        return false
      }
    }

    return true
  })

  // Toggle topic expansion
  const toggleExpand = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    const newSelection = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId]
    onTopicsChange(newSelection)
  }

  // Select all filtered topics
  const selectAll = () => {
    const allTopicIds = filteredTopics.map((t) => t.id)
    onTopicsChange([...new Set([...selectedTopics, ...allTopicIds])])
  }

  // Deselect all
  const deselectAll = () => {
    onTopicsChange([])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Choose Topics from {subjectName}
        </h2>
        <p className="text-sm text-slate-600">
          Select specific topics or practice all
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Weak Areas Toggle */}
        <Button
          variant={showWeakAreasOnly ? "default" : "outline"}
          onClick={() => onToggleWeakAreas(!showWeakAreasOnly)}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Weak Areas Only
        </Button>

        {/* Select All / Deselect All */}
        {selectedTopics.length > 0 ? (
          <Button variant="outline" onClick={deselectAll}>
            Deselect All
          </Button>
        ) : (
          <Button variant="outline" onClick={selectAll}>
            Select All
          </Button>
        )}
      </div>

      {/* Selection Summary */}
      {selectedTopics.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Badge variant="secondary">
            {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""} selected
          </Badge>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-2">
        {filteredTopics.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-600">
              {searchQuery
                ? "No topics found matching your search"
                : "No weak areas found - great job! 🎉"}
            </p>
          </Card>
        ) : (
          filteredTopics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              mastery={topicMastery[topic.id]?.mastery || 0}
              questionsAnswered={topicMastery[topic.id]?.questionsAnswered || 0}
              isSelected={selectedTopics.includes(topic.id)}
              isExpanded={expandedTopics.has(topic.id)}
              onToggle={() => toggleTopic(topic.id)}
              onExpand={() => toggleExpand(topic.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TopicItemProps {
  topic: Topic
  mastery: number
  questionsAnswered: number
  isSelected: boolean
  isExpanded: boolean
  onToggle: () => void
  onExpand: () => void
}

function TopicItem({
  topic,
  mastery,
  questionsAnswered,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
}: TopicItemProps) {
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0

  return (
    <Card
      className={cn(
        "transition-colors",
        isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50"
      )}
    >
      <div className="p-4">
        {/* Main Topic Row */}
        <div className="flex items-start gap-3">
          {/* Expand Button (if has subtopics) */}
          {hasSubtopics ? (
            <button
              onClick={onExpand}
              className="mt-1 p-1 hover:bg-slate-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="mt-1"
          />

          {/* Topic Content */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-medium text-slate-900">{topic.name}</h3>
              <p className="text-sm text-slate-600">{topic.description}</p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">
                ~{topic.estimatedQuestions} questions
              </span>

              {questionsAnswered > 0 && (
                <>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Mastery:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mastery} className="h-2 w-16" />
                      <span
                        className={cn(
                          "font-medium",
                          mastery >= 70
                            ? "text-green-600"
                            : mastery >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {mastery}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subtopics (if expanded) */}
        {hasSubtopics && isExpanded && (
          <div className="mt-3 ml-9 pl-4 border-l-2 border-slate-200 space-y-2">
            {topic.subtopics!.map((subtopic) => (
              <div key={subtopic.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-700">
                      {subtopic.name}
                    </span>
                    <span className="text-slate-500 ml-2">
                      (~{subtopic.estimatedQuestions})
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {subtopic.difficulty}
                  </Badge>
                </div>
                <p className="text-slate-600 mt-0.5">{subtopic.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

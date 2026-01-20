/**
 * Subject Browser Component
 *
 * Client component wrapper that renders SubjectCards with navigation.
 * Handles the onClick events that cannot be passed from server components.
 *
 * @module components/practice/SubjectBrowser
 */
"use client"

import { useRouter } from "next/navigation"
import { SubjectCard } from "./SubjectCard"

interface Subject {
  name: string
  icon: string
  progress: number
  topicsMastered: number
  totalTopics: number
  color: string
}

interface SubjectBrowserProps {
  subjects: Subject[]
  childId: string
}

/**
 * Subject Browser
 *
 * Renders subject cards with navigation to topic selection.
 *
 * @param subjects - Array of subject data to display
 * @param childId - The selected child's ID for routing
 */
export function SubjectBrowser({ subjects, childId }: SubjectBrowserProps) {
  const router = useRouter()

  const handleSubjectClick = (subjectName: string) => {
    // Convert subject name to URL-friendly slug
    const slug = subjectName.toLowerCase().replace(/\s+/g, "-")
    router.push(`/practice/session/start?childId=${childId}&subject=${slug}`)
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium text-slate-700">
        Browse by Subject
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.name}
            subject={subject.name}
            icon={subject.icon}
            progress={subject.progress}
            topicsMastered={subject.topicsMastered}
            totalTopics={subject.totalTopics}
            color={subject.color}
            onClick={() => handleSubjectClick(subject.name)}
          />
        ))}
      </div>
    </div>
  )
}

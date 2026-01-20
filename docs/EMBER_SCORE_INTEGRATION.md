# Ember Score System Integration Guide

## Overview
This guide shows how to integrate the Ember Score transparency system into practice sessions, question displays, and other parts of the application.

## Components

### EmberScoreBadge
**Purpose**: Compact badge for displaying scores on question cards

**Usage**:
```tsx
import { EmberScoreBadge } from "@/components/ember-score/EmberScoreBadge"

<EmberScoreBadge
  score={85}
  tier="confident"
  size="md"
  showTooltip
  onClick={() => setShowDetail(true)}
/>
```

**Props**:
- `score`: number (0-100)
- `tier`: "verified" | "confident" | "draft"
- `size`: "sm" | "md" | "lg" (optional, default: "md")
- `showTooltip`: boolean (optional, default: true)
- `onClick`: () => void (optional, opens detail modal)

**Where to use**:
- Question cards in practice sessions
- Search results
- Question browser
- Topic selection screens

---

### EmberScoreDetail
**Purpose**: Full detailed modal showing score breakdown and provenance

**Usage**:
```tsx
import { EmberScoreDetail } from "@/components/ember-score/EmberScoreDetail"

const [showDetail, setShowDetail] = useState(false)

<EmberScoreDetail
  isOpen={showDetail}
  onClose={() => setShowDetail(false)}
  score={85}
  breakdown={{
    curriculumAlignment: 35,
    expertVerification: 40,
    communityFeedback: 10,
  }}
  tier="confident"
  question={{
    id: "q123",
    curriculumReference: "NC.Y5.N.1",
    reviewStatus: "reviewed",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-20"),
    createdBy: "Claude AI",
    reviewedBy: "Emily Carter, Year 5 Teacher",
  }}
/>
```

**When to show**:
- User clicks on EmberScoreBadge
- "Learn more" link in practice interface
- Admin review interface

---

### EmberScoreInfo
**Purpose**: Educational modal explaining what Ember Score is

**Usage**:
```tsx
import { EmberScoreInfo } from "@/components/ember-score/EmberScoreInfo"

const [showInfo, setShowInfo] = useState(false)

<EmberScoreInfo
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
/>
```

**When to show**:
- First-time users (show once after first practice session)
- Help/About section
- Link from EmberScoreDetail modal
- Settings page

---

### useEmberScore Hook
**Purpose**: Fetch and interact with Ember Scores

**Usage**:
```tsx
import { useEmberScore } from "@/hooks/useEmberScore"

function QuestionCard({ questionId }) {
  const { score, isLoading, error, refresh, submitFeedback } = useEmberScore({
    questionId,
    autoRefresh: false,
  })

  if (isLoading) return <Skeleton className="h-8 w-24" />
  if (error) return <div>Error loading score</div>

  return (
    <div>
      <EmberScoreBadge
        score={score?.score}
        tier={score?.tier}
        onClick={() => setShowDetail(true)}
      />
      
      <button onClick={() => submitFeedback("helpful")}>
        👍 Helpful
      </button>
      
      <button onClick={() => submitFeedback("error", "Answer explanation unclear")}>
        Report issue
      </button>
    </div>
  )
}
```

**Options**:
- `questionId`: string (required)
- `autoRefresh`: boolean (optional, default: false)
- `refreshInterval`: number (optional, default: 30000ms)

**Returns**:
- `score`: EmberScoreResult | null
- `isLoading`: boolean
- `error`: Error | null
- `refresh`: () => Promise<void>
- `submitFeedback`: (type, details?) => Promise<void>

---

## Integration Examples

### Example 1: Practice Session Question
```tsx
// components/practice/SessionQuestion.tsx

import { EmberScoreBadge } from "@/components/ember-score/EmberScoreBadge"
import { EmberScoreDetail } from "@/components/ember-score/EmberScoreDetail"
import { useEmberScore } from "@/hooks/useEmberScore"
import { useState } from "react"

export function SessionQuestion({ question }) {
  const [showDetail, setShowDetail] = useState(false)
  const { score, isLoading } = useEmberScore({
    questionId: question.id,
  })

  return (
    <div className="space-y-4">
      {/* Question header with score badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Question {question.number}</h2>
        {!isLoading && score && (
          <EmberScoreBadge
            score={score.score}
            tier={score.tier}
            onClick={() => setShowDetail(true)}
          />
        )}
      </div>

      {/* Question content */}
      <div>{question.text}</div>

      {/* Detail modal */}
      {score && (
        <EmberScoreDetail
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          score={score.score}
          breakdown={score.breakdown}
          tier={score.tier}
          question={{
            id: question.id,
            curriculumReference: question.curriculum_reference,
            reviewStatus: question.review_status,
            createdAt: new Date(question.created_at),
            updatedAt: new Date(question.updated_at),
          }}
        />
      )}
    </div>
  )
}
```

### Example 2: Question Browser with Filtering
```tsx
// app/(dashboard)/practice/browse/page.tsx

import { EmberScoreBadge } from "@/components/ember-score/EmberScoreBadge"

export default async function BrowsePage() {
  const supabase = createClient()
  
  // Fetch questions with minimum Ember Score
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .gte("ember_score", 75) // Only show Confident or Verified
    .order("ember_score", { ascending: false })

  return (
    <div className="grid gap-4">
      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{q.text}</CardTitle>
              <EmberScoreBadge
                score={q.ember_score}
                tier={q.ember_score >= 90 ? "verified" : "confident"}
                size="sm"
              />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
```

### Example 3: First-Time User Education
```tsx
// components/practice/WelcomeCard.tsx

import { EmberScoreInfo } from "@/components/ember-score/EmberScoreInfo"
import { useState, useEffect } from "react"

export function WelcomeCard() {
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    // Check if user has seen Ember Score info before
    const hasSeenInfo = localStorage.getItem("hasSeenEmberScoreInfo")
    if (!hasSeenInfo) {
      setShowInfo(true)
      localStorage.setItem("hasSeenEmberScoreInfo", "true")
    }
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Ember Ascent!</CardTitle>
          <CardDescription>
            All our questions are rated with an Ember Score for transparency.{" "}
            <button
              onClick={() => setShowInfo(true)}
              className="text-primary underline"
            >
              Learn more
            </button>
          </CardDescription>
        </CardHeader>
      </Card>

      <EmberScoreInfo isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
```

### Example 4: Admin Review Interface
```tsx
// app/(dashboard)/admin/review/page.tsx

import { useEmberScore } from "@/hooks/useEmberScore"
import { EmberScoreBadge } from "@/components/ember-score/EmberScoreBadge"
import { Button } from "@/components/ui/button"

export function ReviewQuestion({ questionId }) {
  const { score, refresh, submitFeedback } = useEmberScore({ questionId })

  const handleMarkReviewed = async () => {
    // Update review_status in database
    await updateReviewStatus(questionId, "reviewed")
    
    // Refresh score (will recalculate with new review status)
    await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <EmberScoreBadge score={score?.score} tier={score?.tier} />
        <div className="text-sm text-muted-foreground">
          Current score: {score?.score}/100
        </div>
      </div>

      <Button onClick={handleMarkReviewed}>
        Mark as Expert Reviewed
      </Button>

      <div className="text-xs text-muted-foreground">
        Marking as reviewed will increase the score by up to 30 points
      </div>
    </div>
  )
}
```

---

## Database Queries

### Fetch Questions with Scores
```typescript
// Get all questions with minimum score
const { data } = await supabase
  .from("questions")
  .select("*")
  .gte("ember_score", 60) // Only published questions
  .eq("is_published", true)

// Get score breakdown
const { data } = await supabase
  .from("questions")
  .select("id, ember_score, ember_score_breakdown, review_status")
  .eq("id", questionId)
  .single()
```

### Trigger Score Recalculation
```sql
-- Manually trigger recalculation (usually done by trigger)
SELECT recalculate_ember_score('question_id_here');

-- Refresh materialized view (run daily via cron)
REFRESH MATERIALIZED VIEW question_stats;
```

---

## Testing Checklist

- [ ] EmberScoreBadge displays correct flame count for each tier
- [ ] Tooltip shows on hover
- [ ] Click opens EmberScoreDetail modal
- [ ] EmberScoreDetail shows correct breakdown percentages
- [ ] Progress bars animate correctly
- [ ] Collapsible sections work
- [ ] EmberScoreInfo opens from "Learn more" link
- [ ] Educational content is clear and parent-friendly
- [ ] useEmberScore hook fetches scores correctly
- [ ] submitFeedback updates database and refreshes score
- [ ] Auto-refresh works when enabled
- [ ] Loading states show skeletons
- [ ] Error states display helpful messages
- [ ] Scores below 60 don't appear in practice sessions
- [ ] Score updates after error report submission

---

## Performance Considerations

- **Use server components** where possible to avoid client-side fetching
- **Cache scores** in React Query or SWR for better performance
- **Lazy load** EmberScoreDetail modal (it's heavy)
- **Batch requests** when fetching scores for multiple questions
- **Refresh materialized view** daily, not on every request

---

## Next Steps (Day 9+)

- Add provenance timeline (who created, when reviewed, attribution)
- Implement feedback collection UI (Day 9)
- Add admin dashboard for score management (Day 12)
- Create email notifications for score changes (Day 14)

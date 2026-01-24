# Admin Study Plan Oversight - Requirements Document

## Overview
Administrative interface for viewing, monitoring, and overriding automatically generated study plans for all children on the platform.

**Status**: Not Implemented  
**Priority**: Medium  
**Estimated Effort**: 8-12 hours  
**Dependencies**: Study plan generator (implemented), Admin auth (implemented)

---

## Current State

### What Exists
1. **Study Plan Generator** (`lib/analytics/studyPlanGenerator.ts`)
   - Auto-generates weekly plans based on child performance
   - Identifies weak areas and creates targeted activities
   - API endpoint: `/api/analytics/study-plan`

2. **Parent-Facing UI** 
   - `components/analytics/StudyPlan.tsx` - Weekly calendar view
   - `components/analytics/StudyRecommendations.tsx` - AI recommendations
   - Available at `/analytics` and `/analytics2` pages

3. **Practice Session Creation**
   - Recommendations link to `/practice?subject={subject}`
   - BUT: No direct "create session from recommendation" functionality exists
   - Users must manually select subject after clicking recommendation

### What's Missing
- **Admin interface** to view all children's plans
- **Admin ability** to manually adjust or override recommendations  
- **Direct session creation** from recommendation action buttons
- **Plan effectiveness metrics** for admin monitoring
- **Audit trail** for admin modifications

---

## Key Finding: Practice from Recommendations Gap

### Current Implementation
**Recommendations generate `actionUrl` links** (StudyRecommendations.tsx:42, 97):
```typescript
{
  id: 'rec_maths',
  title: 'Improve Mathematics',
  actionUrl: '/practice?subject=mathematics'  // Generic link only
}
```

**These links navigate to practice page but don't:**
- ❌ Auto-create a practice session
- ❌ Pre-fill the specific topics from recommendation
- ❌ Set the recommended question count
- ❌ Apply the difficulty level suggested

### What Should Happen
**User clicks "Start" on recommendation** → **Direct to active practice session** with:
- ✅ Specific topics pre-selected (not just subject)
- ✅ Question count from recommendation.estimatedMinutes
- ✅ Difficulty level appropriate for current accuracy
- ✅ "Focus mode" automatically enabled

---

## Requirements

### 1. Admin Study Plans Dashboard
**Route**: `/admin/study-plans`

#### Features
- **List View**
  - All children with active plans (last 7 days)
  - Search by child name, parent email, year group
  - Filter by plan status (active, stale, needs review)
  - Sort by last generated date, child engagement

- **Plan Summary Cards** (per child)
  - Child name, year group, parent email
  - Plan generation date
  - Weak areas identified (top 3)
  - Activities completed vs. total
  - Weekly progress bar
  - "View Details" button

- **Quick Stats**
  - Total active plans
  - Average completion rate
  - Most common weak areas across platform
  - Plans needing admin attention

#### Wireframe Layout
```
┌─────────────────────────────────────────────────────────┐
│  Admin Study Plans                        [+ New Plan]  │
├─────────────────────────────────────────────────────────┤
│  [Search children...]  [Filter: All ▼]  [Sort: Recent ▼]│
├─────────────────────────────────────────────────────────┤
│  Stats: 156 active | 73% avg completion | 23 need review│
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │ Emma Smith • Year 5 • parent@example.com           ││
│  │ Plan: Jan 20-26 | 5/12 activities done (42%)       ││
│  │ Weak: Fractions, Synonyms, Inference               ││
│  │ [View Details] [Override] [Regenerate]             ││
│  └─────────────────────────────────────────────────────┘│
│  ...more cards...                                       │
└─────────────────────────────────────────────────────────┘
```

### 2. Admin Plan Detail Page
**Route**: `/admin/study-plans/[childId]`

#### Features
- **Child Performance Overview**
  - Recent accuracy trends
  - Subject breakdown
  - Topic heatmap
  - Streak and engagement metrics

- **Current Plan Display**
  - Weekly calendar view (same as parent sees)
  - Activity completion status
  - Time spent vs. recommended
  - Focus areas with priority indicators

- **Admin Actions**
  - Add manual activity
  - Remove/modify planned activity
  - Adjust priorities
  - Add admin notes
  - Force plan regeneration

- **Historical Plans**
  - Previous weeks' plans
  - Completion rates over time
  - Topic coverage progression

#### Wireframe Layout
```
┌─────────────────────────────────────────────────────────┐
│  Emma Smith - Study Plan (Week of Jan 20)              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Accuracy: 67%   │  │ Streak: 5 days  │              │
│  │ ↓ -3% vs last   │  │ ↑ +2 vs last    │              │
│  └─────────────────┘  └─────────────────┘              │
├─────────────────────────────────────────────────────────┤
│  Current Plan (Generated: Jan 19, 2026 14:23)          │
│  [Regenerate Plan] [Add Activity] [Export PDF]         │
│                                                         │
│  Monday (✓ Done)                                        │
│  • Fractions practice (10Q, 15min) ✓                   │
│  • Inference reading (5Q, 8min) ✓                      │
│                                                         │
│  Tuesday (In Progress)                                  │
│  • Synonyms review (8Q, 10min) ⏳                       │
│  [+ Add Activity]                                       │
│                                                         │
│  Focus Areas:                                           │
│  🔴 Fractions (48% → Target 85%) - 20 questions        │
│  🟡 Synonyms (64% → Target 85%) - 15 questions         │
│  🟡 Inference (67% → Target 85%) - 12 questions        │
│                                                         │
│  Admin Notes:                                           │
│  [Add note...]                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Practice Session from Recommendation
**✅ IMPLEMENTED - January 24, 2026**

#### Previous Behavior (Fixed)
1. User sees recommendation in analytics
2. Clicks "Start" button
3. Navigates to `/practice?subject=mathematics`
4. Lands on practice page homepage
5. ~~Must manually select mode, subject, topics~~ ❌

#### Current Behavior (Implemented)
1. User sees recommendation in analytics
2. Clicks "Start" button  
3. **Directly creates and navigates to active session** ✅
4. Session pre-configured with:
   - Subject, topics, difficulty from recommendation
   - Question count calculated from `estimatedMinutes`
   - "Focus mode" enabled automatically

#### Implementation Details

**A. Update Recommendation Data Structure**  
File: `components/analytics/StudyRecommendations.tsx`

```typescript
interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  subject: string
  topics: string[]  // Already exists
  estimatedMinutes: number  // Already exists
  
  // NEW FIELDS:
  difficulty?: 'foundation' | 'standard' | 'challenge'
  questionCount?: number
  sessionConfig: {
    mode: 'focus'
    subject: string
    topics: string[]
    difficulty: string
    questionCount: number
  }
}
```

**B. Create Session Creation API**  
File: `/app/api/practice/session/from-recommendation/route.ts`

```typescript
POST /api/practice/session/from-recommendation
Body: {
  childId: string
  recommendation: {
    subject: string
    topics: string[]
    difficulty: string
    questionCount: number
  }
}

Response: {
  sessionId: string
  redirect: `/practice/session/${sessionId}`
}
```

**C. Update Recommendation Action Button**  
File: `components/analytics/StudyRecommendations.tsx:300`

```typescript
// BEFORE:
<Button size="sm" variant="outline" asChild>
  <a href={recommendation.actionUrl}>Start</a>
</Button>

// AFTER:
<Button 
  size="sm" 
  variant="outline"
  onClick={() => handleStartFromRecommendation(recommendation)}
  disabled={isCreatingSession}
>
  {isCreatingSession ? 'Creating...' : 'Start'}
</Button>
```

**D. Session Creation Handler**

```typescript
async function handleStartFromRecommendation(rec: Recommendation) {
  setIsCreatingSession(true)
  
  const response = await fetch('/api/practice/session/from-recommendation', {
    method: 'POST',
    body: JSON.stringify({
      childId: analytics.childId,
      recommendation: rec.sessionConfig
    })
  })
  
  const { sessionId } = await response.json()
  router.push(`/practice/session/${sessionId}`)
}
```

---

## Database Schema Changes

### New Table: `admin_plan_overrides`
```sql
CREATE TABLE admin_plan_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) NOT NULL,
  plan_week_start DATE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  override_type TEXT NOT NULL, -- 'add_activity', 'remove_activity', 'adjust_priority'
  original_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit trail
  CONSTRAINT admin_plan_overrides_type_check 
    CHECK (override_type IN ('add_activity', 'remove_activity', 'adjust_priority', 'regenerate'))
);

CREATE INDEX idx_admin_overrides_child ON admin_plan_overrides(child_id);
CREATE INDEX idx_admin_overrides_week ON admin_plan_overrides(plan_week_start);
CREATE INDEX idx_admin_overrides_admin ON admin_plan_overrides(admin_id);
```

### New Table: `admin_plan_notes`
```sql
CREATE TABLE admin_plan_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  note TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_notes_child ON admin_plan_notes(child_id);
```

---

## API Endpoints

### Admin Study Plans

#### `GET /api/admin/study-plans`
Lists all children with active study plans

**Query Params:**
- `search` - Child name or parent email
- `status` - Filter by status (active/stale/flagged)
- `yearGroup` - Filter by year group
- `page`, `limit` - Pagination

**Response:**
```json
{
  "plans": [
    {
      "childId": "uuid",
      "childName": "Emma Smith",
      "parentEmail": "parent@example.com",
      "yearGroup": 5,
      "weekStart": "2026-01-20",
      "generatedAt": "2026-01-19T14:23:00Z",
      "activitiesTotal": 12,
      "activitiesCompleted": 5,
      "completionRate": 42,
      "weakAreas": ["Fractions", "Synonyms", "Inference"],
      "needsAttention": false
    }
  ],
  "stats": {
    "totalPlans": 156,
    "avgCompletionRate": 73,
    "needsReview": 23
  }
}
```

#### `GET /api/admin/study-plans/[childId]`
Get detailed plan for specific child

**Response:**
```json
{
  "child": { /* child details */ },
  "currentPlan": { /* full plan structure */ },
  "performance": { /* analytics summary */ },
  "overrides": [ /* admin override history */ ],
  "notes": [ /* admin notes */ ]
}
```

#### `POST /api/admin/study-plans/[childId]/override`
Add manual activity or modify plan

**Body:**
```json
{
  "type": "add_activity",
  "activity": {
    "subject": "mathematics",
    "topic": "Fractions",
    "questionCount": 10,
    "difficulty": "standard"
  },
  "reason": "Child struggling with this in recent sessions"
}
```

#### `POST /api/admin/study-plans/[childId]/regenerate`
Force regenerate plan with custom options

#### `POST /api/admin/study-plans/[childId]/notes`
Add admin note

---

## User Stories

### Admin Stories
1. **As an admin**, I want to see all children's study plans in one place, so I can monitor platform-wide learning effectiveness
2. **As an admin**, I want to identify children whose plans aren't being completed, so I can flag them for parent outreach
3. **As an admin**, I want to manually add practice activities to a child's plan, so I can address specific learning gaps I notice
4. **As an admin**, I want to see which topics are commonly flagged as weak, so I can identify content quality issues
5. **As an admin**, I want to regenerate a plan with custom parameters, so I can test different recommendation strategies

### Parent/Child Stories  
6. **As a parent**, I want to click "Start" on a recommendation and immediately begin practicing, without extra configuration steps
7. **As a child**, I want my practice session to automatically focus on topics I'm weak in, without me having to remember what to practice
8. **As a parent**, I want to see if an admin has added notes or adjustments to my child's plan, so I know they're being monitored

---

## Success Metrics

### Admin Dashboard
- Time to identify "at-risk" children (target: < 30 seconds)
- Plans reviewed per admin per day (target: 20+)
- Override actions taken per week (track for effectiveness)

### Practice from Recommendations
- **Recommendation click-through rate** (target: >40%)
- **Session start rate after clicking recommendation** (target: >90%)
  - Current: Unknown (probably < 50% due to extra steps)
- **Time from recommendation click to practice start** (target: < 10 seconds)
  - Current: 30-60 seconds (includes manual selection)
- **Topic match accuracy** (sessions practice recommended topics) (target: >95%)

---

## Implementation Phases

### Phase 1: Practice from Recommendations (CRITICAL) 🚨
**Priority: HIGH | Effort: 3-4 hours**

1. Update recommendation data structure with `sessionConfig`
2. Create `/api/practice/session/from-recommendation` endpoint
3. Update recommendation buttons to create sessions directly
4. Test flow: Click recommendation → Active session with correct topics

**Files to modify:**
- `components/analytics/StudyRecommendations.tsx` (add handler)
- `app/api/practice/session/from-recommendation/route.ts` (new)
- `lib/practice/sessionCreator.ts` (new helper)

### Phase 2: Admin View (Read-Only)
**Priority: MEDIUM | Effort: 4-5 hours**

1. Create `/app/admin/study-plans/page.tsx` list view
2. Create API endpoint for listing plans
3. Add search, filter, sort functionality
4. Create detail page for individual child plans

### Phase 3: Admin Actions
**Priority: MEDIUM | Effort: 4-5 hours**

1. Add database tables for overrides and notes
2. Create override API endpoints
3. Build admin action UI (add/remove activities)
4. Add audit trail display

### Phase 4: Analytics & Monitoring
**Priority: LOW | Effort: 2-3 hours**

1. Plan effectiveness metrics
2. Parent engagement tracking
3. Topic difficulty calibration data
4. Admin activity reports

---

## Testing Checklist

### Practice from Recommendations
- [ ] Click recommendation → Lands in active session
- [ ] Session has correct subject
- [ ] Session has correct topics (all from recommendation)
- [ ] Session has correct difficulty level
- [ ] Question count matches recommendation estimate
- [ ] Session mode is "focus" not "quick"
- [ ] Works for all subjects (Maths, English, Verbal, Non-Verbal)
- [ ] Works for multi-topic recommendations
- [ ] Error handling if no questions available
- [ ] Loading states during session creation

### Admin Dashboard
- [ ] Lists all children with plans
- [ ] Search by child name works
- [ ] Filter by status works
- [ ] Sort by completion rate works
- [ ] Stats calculations are correct
- [ ] Plan details load correctly
- [ ] Override actions save correctly
- [ ] Notes display chronologically
- [ ] Only accessible to admin users

---

## Security Considerations

1. **Admin-only access**: Check `is_admin` flag in middleware
2. **Parent privacy**: Don't expose parent emails to non-admins
3. **Audit trail**: Log all admin modifications with timestamps
4. **RLS policies**: Admin overrides only visible to admins
5. **Rate limiting**: Prevent abuse of regenerate endpoint

---

## Future Enhancements

1. **AI-powered plan quality scoring** - Auto-flag ineffective plans
2. **Parent notifications** - Email when admin adjusts plan
3. **Bulk operations** - Apply changes to multiple children
4. **Plan templates** - Save common intervention patterns
5. **Effectiveness A/B testing** - Compare auto-generated vs admin-modified plans
6. **Mobile admin app** - Quick review on phones
7. **Recommendation ML model** - Learn from which plans work best

---

## Related Documentation

- `lib/analytics/studyPlanGenerator.ts` - Plan generation logic
- `docs/DATABASE_SCHEMA.md` - Database structure
- `components/analytics/StudyRecommendations.tsx` - Current UI
- `architecture-guidelines.md` - Security patterns
- `SECURITY_AUDIT_REPORT.md` - Compliance requirements

---

## Questions for Product Owner

1. Should admin overrides be visible to parents, or internal only?
2. What's the escalation path if admin identifies serious learning issues?
3. Should we notify parents when their child's plan isn't being followed?
4. How much historical data should admin see? (4 weeks? 12 weeks?)
5. Should there be different admin permission levels? (viewer vs editor)

---

**Document Version**: 1.0  
**Last Updated**: January 24, 2026  
**Author**: AI Assistant  
**Status**: Requirements Gathering Complete - Awaiting Approval

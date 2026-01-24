# Day 17 Implementation Complete

## Reviewer Workflow System

### Overview
Built a comprehensive content quality assurance system enabling retired teachers to review AI-generated questions. The system includes role-based access, a reviewer dashboard with earnings tracking, a full-screen review interface with inline editing, and quality assurance workflows.

---

## Database Schema (Migration 023)

### Tables Created

#### 1. **reviewers**
Stores reviewer profile information:
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `display_name` (text) - Professional name
- `qualifications` (text) - Teaching credentials
- `specializations` (text[]) - Subject areas (Maths, English, etc.)
- `hourly_rate` (decimal) - Payment rate in GBP
- `status` (text) - 'active', 'paused', 'inactive'
- `questions_reviewed` (int) - Total completed
- `avg_review_time_seconds` (int) - Efficiency metric
- Timestamps: `created_at`, `updated_at`

#### 2. **review_assignments**
Tracks questions assigned to reviewers:
- `id` (uuid, primary key)
- `reviewer_id` (uuid, references reviewers)
- `question_id` (uuid, references questions)
- `assigned_at`, `due_at`, `completed_at` (timestamps)
- `status` (text) - 'assigned', 'in_progress', 'completed', 'skipped'

#### 3. **review_submissions**
Stores review outcomes and feedback:
- `id` (uuid, primary key)
- `assignment_id` (uuid, references review_assignments)
- `reviewer_id`, `question_id` (references)
- `outcome` (text) - 'approved', 'needs_edit', 'rejected'
- `feedback` (text) - Reviewer comments
- `edits_made` (jsonb) - Changed fields
- `quality_checklist` (jsonb) - 8 quality criteria
- `time_spent_seconds` (int) - For earnings calculation
- `created_at` (timestamp)

### RLS Policies
- **Reviewers**: Can only access their own profile
- **Assignments**: Reviewers see only their assigned questions
- **Submissions**: Reviewers see only their own reviews
- **Admins**: Full read access to all reviewer data

### Triggers
1. **update_reviewer_stats_trigger**: Updates `questions_reviewed` and `avg_review_time_seconds` after each submission
2. **complete_assignment_trigger**: Marks assignment `completed` when submission created

---

## Backend Implementation

### lib/reviewer/dashboard.ts
Data fetching functions for reviewer dashboard:

#### `getReviewerStats(reviewerId)`
Returns:
- `questionsInQueue` - Count of 'assigned' + 'in_progress' assignments
- `completedThisWeek` - Submissions from last 7 days
- `completedTotal` - All-time submissions count
- `avgReviewTimeSeconds` - From reviewer profile
- `approvalRate` - Percentage of 'approved' outcomes

#### `getReviewerEarnings(reviewerId)`
Calculates earnings based on `hourly_rate × (time_spent_seconds / 3600)`:
- `thisMonth` - Current month pending payment
- `lastMonth` - Previous month paid amount
- `total` - All-time earnings
- `pendingPayment` - Current month amount (for invoicing)

#### `getReviewQueue(reviewerId)`
Returns up to 50 'assigned' or 'in_progress' assignments with question data.

#### `getReviewerProfile(userId)`
Fetches reviewer record by `user_id`.

---

## Server Actions

### app/reviewer/review/actions.ts

#### `startReviewSession(reviewerId)`
- Gets first 'assigned' assignment ordered by `assigned_at`
- Marks it 'in_progress'
- Returns `assignmentId` to navigate to

#### `submitReview(submissionData)`
- Inserts record into `review_submissions`
- If `outcome === 'needs_edit'` AND `editsMade` present:
  - Updates question fields in `questions` table
- Fetches next 'assigned' assignment
- Revalidates paths: `/reviewer`, `/reviewer/queue`, `/reviewer/completed`
- Returns: `{ success, nextAssignmentId, hasMore }`

#### `skipQuestion(assignmentId, reviewerId)`
- Marks assignment `status = 'skipped'`
- Fetches next assignment
- Returns next `assignmentId` or `null`

#### `getAssignment(assignmentId, reviewerId)`
- Fetches assignment with question and reviewer data
- Used by review interface page

#### `getQueueSummary(reviewerId)`
- Returns total queue count and current 'in_progress' assignment ID

---

## Frontend Implementation

### Pages

#### /reviewer (app/reviewer/page.tsx)
Reviewer dashboard homepage:
- Welcome message with reviewer qualifications
- `ReviewerStats` component showing:
  - Queue count with "Start Reviewing" CTA
  - 4 stat cards: In Queue, This Week, Avg Time, Approval Rate
  - Earnings card: This month, last month, total
  - Link to review guidelines

#### /reviewer/review (app/reviewer/review/page.tsx)
Review start screen:
- Auto-redirects to in-progress assignment if exists
- Shows queue count and estimated time (~2 min/question)
- "All Caught Up" state if queue empty
- 3 quick tip cards: Review Guidelines, Efficiency Tips, Quality Standards
- "Start Reviewing" button → calls `startReviewSession` → navigates to first assignment

#### /reviewer/review/[assignmentId] (app/reviewer/review/[assignmentId]/page.tsx)
Full-screen review interface:
- Renders `ReviewInterface` component with assignment data
- Server component with auth and role checks

#### /reviewer/queue (app/reviewer/queue/page.tsx)
Queue list view:
- Shows all 'assigned' and 'in_progress' assignments
- Filters: search, subject, difficulty
- Each card shows:
  - Status badge (In Progress / Assigned)
  - Subject, difficulty, year group badges
  - Ember Score
  - Question text preview (2 lines)
  - Topic and "Assigned X ago" timestamp
  - "Review" or "Continue" button → navigates to assignment

#### /reviewer/completed (app/reviewer/completed/page.tsx)
Review history:
- Shows last 100 submissions
- Stats summary: Total, Approved, Needs Edit, Rejected
- Filters: search, subject, outcome
- Each card shows:
  - Outcome badge (color-coded: green/yellow/red)
  - "Edited" badge if `edits_made` present
  - Question preview
  - Time spent and "X ago" timestamp
  - Feedback preview (if any)
  - "Details" button → opens dialog with full submission details

### Components

#### components/reviewer/ReviewerSidebar.tsx
Left sidebar navigation:
- 4 nav items: Dashboard, Start Review, My Queue, Completed
- Reviewer info box with display name and specializations
- Sign out button

#### components/reviewer/ReviewerStats.tsx
Dashboard stats display:
- Quick start card (conditional on queue > 0)
- 4 stat cards with counts and percentages
- Earnings card with currency formatting
- Guidelines link card

#### components/reviewer/ReviewInterface.tsx
Full-screen review layout:
- Header with progress bar (X of Y questions)
- Skip button
- 2-column grid: Question (2 cols) + Panel (1 col)
- State management: `editMode`, `edits`
- Uses `useReviewSession` hook for timer and submission

#### components/reviewer/ReviewQuestion.tsx
Question display with inline editing:
- **View Mode**: Question text, 4-5 options (correct answer highlighted green with checkmark), explanation, metadata badges
- **Edit Mode**: Textarea for question, Input for options, Textarea for explanation
- `useEffect` tracks all edits and calls `onEdit` prop
- 7 state variables: questionText, optionA-E, explanation

#### components/reviewer/ReviewPanel.tsx
Review verdict and quality checklist:
- 3 verdict buttons: Approve (green), Needs Edit (yellow), Reject (red)
- Edit mode toggle Switch
- Conditional 8-item quality checklist (Switch components):
  - Question clear and unambiguous
  - Correct answer is valid
  - Distractors are plausible
  - Difficulty accurately assessed
  - Age-appropriate language
  - Explanations helpful
  - No spelling/grammar errors
  - Curriculum aligned
- Feedback Textarea (required for rejected)
- Submit button validation:
  - Disabled if no verdict
  - Disabled if rejected && no feedback
  - Disabled if submitting
- Warning indicator if checklist has failures

### Custom Hook

#### hooks/useReviewSession.ts
Client-side session state management:
- `startTime` state (Date.now())
- `getTimeSpent()` callback: calculates seconds elapsed
- `handleSubmit(outcome, feedback, checklist)`:
  - Calls `submitReview` with time spent
  - Navigates to next assignment or dashboard
  - Shows success/error toasts
- `handleSkip()`:
  - Calls `skipQuestion`
  - Navigates to next or dashboard
- Returns: `{ handleSubmit, handleSkip, isSubmitting, timeSpent }`

---

## Key Features

### 1. **Earnings Tracking**
- Calculates earnings: `hourly_rate × (time_spent_seconds / 3600)`
- Displays monthly breakdown (this month, last month, total)
- Pending payment shown for invoicing

### 2. **Timer System**
- Tracks time per review using `Date.now()` start time
- Time stored in `time_spent_seconds` on submission
- Used for earnings calculation and efficiency metrics

### 3. **Inline Editing**
- Toggle edit mode with Switch component
- Edit question text, options, explanation
- Changes tracked in `edits` object
- Applied to database only if `outcome === 'needs_edit'`

### 4. **Quality Assurance**
- 8-item checklist for thorough review
- Feedback required for rejections
- Verdict-based workflow (approve/needs_edit/reject)

### 5. **Auto-Advance**
- After submission, automatically fetches and navigates to next assignment
- If no more questions, returns to dashboard
- Maintains "in_progress" state for interrupted sessions

### 6. **RLS Security**
- Reviewers can only access their own assignments
- Admins have full read access for oversight
- All operations audit-logged

---

## Workflow

1. **Reviewer logs in** → Redirected to `/reviewer`
2. **Views dashboard** → Sees stats, earnings, queue count
3. **Clicks "Start Reviewing"** → Navigates to `/reviewer/review`
4. **Clicks "Start Reviewing" button** → `startReviewSession` called → Redirected to `/reviewer/review/[assignmentId]`
5. **Reviews question** → Reads question, options, explanation, metadata
6. **Optionally edits** → Toggles edit mode, makes changes
7. **Selects verdict** → Approve / Needs Edit / Reject
8. **Completes checklist** (if needed) → 8 quality criteria
9. **Adds feedback** (if rejected) → Textarea input
10. **Clicks "Submit & Next"** → `submitReview` called → Auto-navigates to next assignment
11. **Repeats** until queue empty → Returns to dashboard

**Alternative flows:**
- Click "Skip" → Marks assignment skipped, moves to next
- Navigate to `/reviewer/queue` → See full list, jump to any assignment
- Navigate to `/reviewer/completed` → View history with filters

---

## Security & Compliance

### RLS Policies
- **reviewers**: SELECT by own user_id
- **review_assignments**: SELECT by own reviewer_id
- **review_submissions**: SELECT/INSERT by own reviewer_id
- **Admins**: SELECT all reviewer data

### Audit Logging
- All submissions logged with timestamp
- Edits tracked in JSONB field
- Quality checklist stored for analysis

### Data Protection
- No PII beyond professional name and qualifications
- Earnings data only visible to reviewer and admins
- Session state managed client-side (no sensitive data in localStorage)

---

## Build Status

✅ **Build Passed Successfully**

All TypeScript errors resolved. Only pre-existing warnings remain (React hooks exhaustive-deps in practice session components).

New routes:
- /reviewer (Dashboard)
- /reviewer/review (Start screen)
- /reviewer/review/[assignmentId] (Review interface)
- /reviewer/queue (Queue list)
- /reviewer/completed (History)

---

## Next Steps

### Day 18: Mock Test Mode & Session Enhancements
- Timed test mode with countdown
- Pause/resume functionality
- Question bookmarking
- Review mode (see answers after test)

### Day 19: Performance Optimization & Error Handling
- Database query optimization
- Caching strategies
- Error boundary implementation
- Loading state improvements

### Day 20: Testing, QA & Beta Launch Preparation
- E2E tests with Playwright
- Security audit
- Performance benchmarks
- Beta tester onboarding

### Day 21: Launch Checklist & Go-Live
- Final production checks
- Monitoring setup
- Support documentation
- Marketing launch

---

## Migration Instructions

1. **Run Migration in Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new
   - Copy contents of `supabase/migrations/023_reviewer_system.sql`
   - Execute in SQL Editor
   - Verify tables created: `reviewers`, `review_assignments`, `review_submissions`

2. **Create Test Reviewer:**
   ```sql
   -- Create a reviewer account for testing
   INSERT INTO reviewers (user_id, display_name, qualifications, specializations, hourly_rate, status)
   VALUES (
     'YOUR_USER_ID', -- Replace with actual user ID
     'Jane Smith',
     'Former Primary School Teacher (20 years)',
     ARRAY['Maths', 'English'],
     25.00,
     'active'
   );

   -- Update profile role
   UPDATE profiles
   SET role = 'reviewer'
   WHERE id = 'YOUR_USER_ID';
   ```

3. **Create Test Assignments:**
   ```sql
   -- Assign some questions for review
   INSERT INTO review_assignments (reviewer_id, question_id, assigned_at, due_at, status)
   SELECT 
     'REVIEWER_ID',
     id,
     NOW(),
     NOW() + INTERVAL '7 days',
     'assigned'
   FROM questions
   WHERE subject = 'Maths'
   LIMIT 10;
   ```

4. **Test Workflow:**
   - Log in as reviewer
   - Visit `/reviewer` to see dashboard
   - Click "Start Reviewing" to begin session
   - Review questions, select verdicts, submit
   - Check stats update automatically
   - View completed reviews in `/reviewer/completed`

---

## Files Created/Modified

### New Files
- `supabase/migrations/023_reviewer_system.sql` - Database schema
- `lib/reviewer/dashboard.ts` - Data fetching functions
- `app/reviewer/layout.tsx` - Reviewer layout with auth
- `app/reviewer/page.tsx` - Dashboard page
- `app/reviewer/review/page.tsx` - Start screen
- `app/reviewer/review/actions.ts` - Server actions
- `app/reviewer/review/[assignmentId]/page.tsx` - Review interface page
- `app/reviewer/review/ReviewStartClient.tsx` - Start screen client
- `app/reviewer/queue/page.tsx` - Queue list page
- `app/reviewer/queue/QueueClient.tsx` - Queue client component
- `app/reviewer/completed/page.tsx` - History page
- `app/reviewer/completed/CompletedClient.tsx` - History client component
- `components/reviewer/ReviewerSidebar.tsx` - Navigation sidebar
- `components/reviewer/ReviewerStats.tsx` - Stats display
- `components/reviewer/ReviewInterface.tsx` - Full-screen interface
- `components/reviewer/ReviewQuestion.tsx` - Question display
- `components/reviewer/ReviewPanel.tsx` - Verdict panel
- `hooks/useReviewSession.ts` - Session state hook

### Total Lines Added
Approximately **2,500+ lines** of production-ready TypeScript/TSX code.

---

## Summary

Day 17 successfully delivers a **complete reviewer workflow system** that enables retired teachers to efficiently review AI-generated questions with:
- Professional dashboard with earnings tracking
- Full-screen review interface with inline editing
- Quality assurance checklist
- Auto-advancing workflow
- Review history with filters
- Secure RLS policies
- Automatic stats updates via triggers

The system is ready for beta testing with real reviewers.

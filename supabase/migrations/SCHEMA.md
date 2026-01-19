# Ember Ascent - Database Schema Quick Reference

## Entity Relationship Diagram

```
auth.users (Supabase)
    ↓
profiles (1:1 with auth.users)
    ↓
children (1:many)
    ↓
practice_sessions (1:many)
    ↓
question_attempts (1:many) → questions (many:1)
    
profiles → error_reports (1:many) → questions (many:1)
```

## Table Overview

### profiles
**Purpose**: Parent/guardian accounts (extends Supabase auth.users)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK to auth.users(id) |
| email | text | Unique, not null |
| full_name | text | Optional display name |
| subscription_tier | text | 'free', 'ascent', 'summit' |
| subscription_status | text | 'active', 'cancelled', 'past_due', 'trialing' |
| stripe_customer_id | text | Unique Stripe ID |
| created_at, updated_at | timestamptz | Auto-managed |

**RLS**: Users can only view/update their own profile

---

### children
**Purpose**: Learner profiles (no direct login)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| parent_id | uuid | FK to profiles(id) CASCADE |
| name | text | Not null, min 2 chars |
| year_group | int | 4, 5, or 6 (ages 8-11) |
| target_school | text | Optional |
| avatar_url | text | Optional profile image |
| is_active | boolean | Soft delete flag |
| created_at, updated_at | timestamptz | Auto-managed |

**RLS**: Parents can only access their own children
**Indexes**: parent_id (active only), year_group

---

### questions
**Purpose**: Question bank (AI-generated + expert-reviewed)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| subject | text | 'verbal_reasoning', 'english', 'mathematics' |
| topic | text | e.g., 'Algebra', 'Synonyms' |
| subtopic | text | Optional granular classification |
| question_type | text | e.g., 'multiple_choice', 'synonym' |
| question_text | text | The question |
| options | jsonb | Array of 5 options: [{id: 'a', text: '...'}] |
| correct_answer | text | Option id |
| explanations | jsonb | {step_by_step, visual, worked_example} |
| difficulty | text | 'foundation', 'standard', 'challenge' |
| year_group | int | 4, 5, or 6 |
| curriculum_reference | text | UK NC objective code |
| exam_board | text | 'gl', 'cem', 'iseb', 'generic' |
| ember_score | int | 0-100 (must be 60+ to publish) |
| is_published | boolean | Only published shown to users |
| created_at, updated_at | timestamptz | Auto-managed |

**RLS**: All authenticated users can read published questions (ember_score >= 60)
**Indexes**: subject+difficulty+year_group, topic, ember_score

---

### practice_sessions
**Purpose**: Track practice sessions (groups of question attempts)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| child_id | uuid | FK to children(id) CASCADE |
| session_type | text | 'quick', 'focus', 'mock' |
| subject | text | Optional filter |
| topic | text | Optional filter |
| started_at | timestamptz | Session start time |
| completed_at | timestamptz | NULL = in progress |
| total_questions | int | Number of questions |
| correct_answers | int | Number correct |
| created_at | timestamptz | Auto-managed |

**RLS**: Parents can access their children's sessions
**Indexes**: child_id+created_at, active sessions, subject+type

---

### question_attempts
**Purpose**: Individual question responses (learning progress)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| session_id | uuid | FK to practice_sessions(id) CASCADE |
| child_id | uuid | FK to children(id) CASCADE |
| question_id | uuid | FK to questions(id) CASCADE |
| selected_answer | text | Option id chosen |
| is_correct | boolean | Correct or not |
| time_taken_seconds | int | Response time |
| explanation_viewed | text | Which explanation style viewed |
| flagged_for_review | boolean | Child flagged for later |
| created_at | timestamptz | Auto-managed |

**RLS**: Parents can access their children's attempts
**Indexes**: child_id, session_id, question_id, analytics (child+question+correct)

---

### error_reports
**Purpose**: Community feedback on question quality

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| question_id | uuid | FK to questions(id) CASCADE |
| reported_by | uuid | FK to profiles(id) CASCADE |
| report_type | text | 'incorrect_answer', 'unclear', 'typo', 'inappropriate', 'other' |
| description | text | Min 10 chars |
| status | text | 'pending', 'reviewed', 'fixed', 'dismissed' |
| reviewed_by | uuid | Admin who reviewed |
| admin_notes | text | Optional admin comments |
| created_at, updated_at | timestamptz | Auto-managed |

**RLS**: Users can view own reports; authenticated users can create
**Indexes**: question_id, status, pending reports

---

## Common Queries

### Get child's progress
```sql
SELECT * FROM child_progress_summary WHERE parent_id = auth.uid();
```

### Get published questions for practice
```sql
SELECT * FROM questions 
WHERE is_published = true 
  AND ember_score >= 60 
  AND subject = 'mathematics'
  AND difficulty = 'standard'
  AND year_group = 5
ORDER BY RANDOM()
LIMIT 10;
```

### Get child's recent sessions
```sql
SELECT * FROM practice_sessions 
WHERE child_id = $1 
ORDER BY created_at DESC 
LIMIT 10;
```

### Get weak topics for a child
```sql
SELECT 
    q.topic,
    COUNT(*) as attempts,
    COUNT(*) FILTER (WHERE qa.is_correct) as correct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE qa.is_correct) / COUNT(*), 1) as accuracy
FROM question_attempts qa
JOIN questions q ON q.id = qa.question_id
WHERE qa.child_id = $1
GROUP BY q.topic
HAVING COUNT(*) >= 5
ORDER BY accuracy ASC
LIMIT 5;
```

## Session Types

| Type | Duration | Questions | Use Case |
|------|----------|-----------|----------|
| quick | 5-10 min | 10 random | Daily practice, mixed topics |
| focus | 15-30 min | Unlimited | Topic mastery, weak areas |
| mock | 50+ min | 50+ | Exam simulation, timed |

## Ember Score Breakdown

| Component | Weight | Criteria |
|-----------|--------|----------|
| Curriculum Alignment | 25% | Tagged with NC objective |
| Exam Pattern Fidelity | 25% | Matches exam board format |
| Expert Verification | 25% | Reviewed + verified by expert |
| Community Validation | 15% | Based on error reports |
| Technical Accuracy | 10% | Computed answer verification |

**Minimum to publish: 60/100**

## Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | £0 | Unlimited questions, basic progress |
| Ascent | £9.99/mo | Analytics dashboard, detailed insights |
| Summit | £19.99/mo | AI tutor, personalized plans (future) |

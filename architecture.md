# Ember Ascent: Architecture Principles

## Overview

Ember Ascent is a freemium AI-powered 11+ exam preparation platform for UK children (ages 9-11). This document establishes architectural ground rules for all development work.

**Core Philosophy**: Quality over cost. Transparency over opacity. Simplicity over complexity.

---

## Tech Stack (Non-Negotiable)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14+ (App Router) | SSR, SEO, React ecosystem |
| Styling | Tailwind CSS | Utility-first, consistent design |
| Backend | Supabase (PostgreSQL + Auth + Storage) | All-in-one, generous free tier |
| Hosting | Vercel | Zero-config deployment, edge functions |
| Payments | Stripe | Industry standard, subscription support |
| Email | Resend or Postmark | Transactional emails, parent reports |
| Analytics | PostHog (self-hosted) or Plausible | Privacy-friendly, GDPR compliant |
| Error Tracking | Sentry | Production error monitoring |
| AI/LLM | Claude API (Anthropic) | Quality-first content generation |

**Do NOT introduce**: Firebase, MongoDB, AWS services, or alternative frameworks without explicit approval.

---

## Project Structure

```
ember-ascent/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── (dashboard)/        # Parent dashboard routes
│   │   ├── (practice)/         # Learning/practice routes
│   │   ├── (admin)/            # Admin panel routes
│   │   ├── api/                # API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Primitive UI components
│   │   ├── features/           # Feature-specific components
│   │   └── layouts/            # Layout components
│   ├── lib/
│   │   ├── supabase/           # Supabase client & helpers
│   │   ├── stripe/             # Stripe integration
│   │   ├── claude/             # Claude API integration
│   │   └── utils/              # Shared utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── config/                 # App configuration
├── supabase/
│   ├── migrations/             # Database migrations
│   └── seed/                   # Seed data
├── scripts/                    # CLI scripts (content generation)
├── docs/                       # Documentation
└── tests/                      # Test files
```

---

## Database Schema Principles

### Core Tables

```sql
-- Parents (account holders)
parents (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz,
  subscription_tier text DEFAULT 'free', -- 'free' | 'ascent' | 'summit'
  stripe_customer_id text
)

-- Children (learners)
children (
  id uuid PRIMARY KEY,
  parent_id uuid REFERENCES parents(id),
  name text NOT NULL,
  year_group int, -- 5 or 6
  target_exam_format text, -- 'gl' | 'cem' | 'iseb'
  created_at timestamptz
)

-- Questions (content)
questions (
  id uuid PRIMARY KEY,
  subject text NOT NULL, -- 'verbal_reasoning' | 'english' | 'maths'
  topic text NOT NULL,
  subtopic text,
  difficulty text NOT NULL, -- 'foundation' | 'standard' | 'challenge'
  question_text text NOT NULL,
  options jsonb NOT NULL, -- ["A", "B", "C", "D", "E"]
  correct_answer text NOT NULL,
  explanations jsonb NOT NULL, -- {step_by_step, visual_analogy, worked_example}
  ember_score int NOT NULL, -- 0-100
  curriculum_reference text,
  exam_format text, -- 'gl' | 'cem' | 'iseb'
  year_group int,
  review_status text DEFAULT 'draft', -- 'draft' | 'reviewed' | 'verified'
  reviewer_id text,
  reviewed_at timestamptz,
  created_at timestamptz
)

-- Practice sessions
sessions (
  id uuid PRIMARY KEY,
  child_id uuid REFERENCES children(id),
  mode text NOT NULL, -- 'quick' | 'focus' | 'mock'
  subject text,
  started_at timestamptz,
  completed_at timestamptz,
  questions_attempted int,
  questions_correct int
)

-- Individual question attempts
attempts (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES sessions(id),
  child_id uuid REFERENCES children(id),
  question_id uuid REFERENCES questions(id),
  selected_answer text,
  is_correct boolean,
  time_taken_seconds int,
  explanation_viewed text, -- which style they viewed
  created_at timestamptz
)
```

### Schema Rules

1. **Always use UUIDs** for primary keys (Supabase default)
2. **Always include timestamps** (`created_at`, `updated_at`)
3. **Use JSONB sparingly** - only for truly flexible data (explanations, options)
4. **Normalise where practical** - don't embed data that needs querying
5. **Index foreign keys** and frequently queried columns
6. **Row Level Security (RLS)** on ALL tables - no exceptions

---

## API Design Principles

### Route Structure

```
/api/
├── auth/                 # Auth endpoints (handled by Supabase mostly)
├── children/             # Child profile CRUD
├── questions/            # Question retrieval (no mutations from client)
├── sessions/             # Practice session management
├── attempts/             # Record question attempts
├── progress/             # Progress & analytics data
├── subscriptions/        # Stripe webhook & subscription status
└── admin/                # Admin-only endpoints
```

### API Rules

1. **Use Next.js Route Handlers** (not Pages API routes)
2. **Validate all inputs** with Zod schemas
3. **Return consistent response shapes**:
   ```typescript
   type ApiResponse<T> = 
     | { success: true; data: T }
     | { success: false; error: string; code?: string }
   ```
4. **Never expose internal errors** to clients
5. **Rate limit** sensitive endpoints (auth, submissions)
6. **Authenticate every request** except public endpoints

---

## Authentication & Authorisation

### Auth Flow

```
Parent registers → Email verification → Creates child profiles → Practice begins
```

### Rules

1. **Supabase Auth only** - no custom auth implementation
2. **Email/password** as primary method (parents, not children)
3. **Children don't have accounts** - they use parent's session
4. **RLS enforces data access** at database level
5. **Subscription tier** checked on premium feature access

### RLS Pattern

```sql
-- Parents can only see their own data
CREATE POLICY "Parents see own data" ON parents
  FOR SELECT USING (auth.uid() = id);

-- Parents can only see their children
CREATE POLICY "Parents see own children" ON children
  FOR SELECT USING (parent_id = auth.uid());

-- Children's attempts scoped to parent's children
CREATE POLICY "Parents see children attempts" ON attempts
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
```

---

## Content Pipeline (Questions)

### Generation Flow

```
Claude API → JSON validation → Automated checks → Database (draft)
    ↓
Expert review queue → Human verification → Ember Score calculation
    ↓
Published (ember_score >= 60)
```

### Question JSON Schema

```typescript
interface Question {
  id: string;
  subject: 'verbal_reasoning' | 'english' | 'maths';
  topic: string;
  subtopic?: string;
  difficulty: 'foundation' | 'standard' | 'challenge';
  question_text: string;
  options: string[]; // Always 5 options for consistency
  correct_answer: string; // Must be in options
  explanations: {
    step_by_step: string;
    visual_analogy: string;
    worked_example: string;
  };
  curriculum_reference?: string; // KS2 NC objective
  exam_format: 'gl' | 'cem' | 'iseb';
  year_group: 5 | 6;
  ember_score: number; // 0-100, calculated
  review_status: 'draft' | 'reviewed' | 'verified';
}
```

### Ember Score Calculation

```typescript
function calculateEmberScore(question: Question): number {
  let score = 0;
  
  // Curriculum alignment (25%)
  if (question.curriculum_reference) score += 25;
  
  // Exam pattern fidelity (25%)
  if (question.exam_format) score += 25;
  
  // Expert verification (25%)
  if (question.review_status === 'verified') score += 25;
  else if (question.review_status === 'reviewed') score += 15;
  
  // Community validation (15%) - based on error reports
  score += calculateCommunityScore(question.id); // 0-15
  
  // Technical accuracy (10%) - for maths, computed verification
  if (question.subject === 'maths') {
    score += verifyMathsAnswer(question) ? 10 : 0;
  } else {
    score += 10; // Default for non-maths
  }
  
  return Math.min(100, score);
}
```

---

## Adaptive Learning Engine

### Difficulty Adjustment Algorithm

```typescript
// Simple moving window approach - NO ML/RL in Phase 1
function getNextDifficulty(
  recentAttempts: Attempt[], // Last 10 attempts in topic
  currentDifficulty: Difficulty
): Difficulty {
  const correctRate = recentAttempts.filter(a => a.is_correct).length / recentAttempts.length;
  
  if (correctRate >= 0.8 && currentDifficulty !== 'challenge') {
    return increaseDifficulty(currentDifficulty);
  }
  if (correctRate <= 0.4 && currentDifficulty !== 'foundation') {
    return decreaseDifficulty(currentDifficulty);
  }
  return currentDifficulty;
}
```

### Rules

1. **No reinforcement learning** in Phase 1 - simple rules only
2. **No local ML models** - complexity not justified yet
3. **Adapt per topic** - not global difficulty
4. **10-question sliding window** for adjustment decisions
5. **Never serve questions below 60 Ember Score**

---

## Frontend Principles

### Component Design

1. **Server Components by default** - use `'use client'` only when needed
2. **Colocation** - keep related files together
3. **Composition over inheritance** - prefer composable components
4. **Accessibility first** - WCAG 2.1 AA compliance minimum

### State Management

1. **Server state**: React Query (TanStack Query) for data fetching
2. **Client state**: React useState/useReducer - no Redux
3. **Form state**: React Hook Form + Zod validation
4. **URL state**: Next.js searchParams for filterable views

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Largest Contentful Paint | <2.5s |
| Time to Interactive | <3s |
| Core Web Vitals | All "Good" |

---

## Security Requirements

### Non-Negotiable

1. **HTTPS everywhere** (Vercel default)
2. **Environment variables** for all secrets
3. **Input validation** on all user inputs (Zod)
4. **SQL injection prevention** (Supabase parameterised queries)
5. **XSS prevention** (React's default escaping + CSP headers)
6. **CSRF protection** (Supabase Auth handles)
7. **Rate limiting** on auth and submission endpoints

### Child Safety (ICO Children's Code)

1. **Parental consent** required for account creation
2. **No direct messaging** between users
3. **No public profiles** or leaderboards with identifiable info
4. **Minimal data collection** - only what's needed
5. **Clear privacy policy** in plain language

---

## Testing Strategy

### Required Coverage

| Type | Tool | Minimum Coverage |
|------|------|------------------|
| Unit | Vitest | 70% for utils/lib |
| Component | React Testing Library | Critical paths |
| E2E | Playwright | Happy paths only |
| API | Vitest + supertest | All endpoints |

### Test File Naming

```
component.tsx       → component.test.tsx
utils.ts            → utils.test.ts
route.ts            → route.test.ts
```

---

## Deployment & Environments

### Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local dev | localhost:3000 |
| Preview | PR previews | *.vercel.app |
| Staging | Pre-production | staging.emberascent.co.uk |
| Production | Live | emberascent.co.uk |

### Deployment Rules

1. **All changes via PR** - no direct pushes to main
2. **Preview deployments** for every PR
3. **Staging deployment** on merge to main
4. **Production deployment** manual trigger only
5. **Database migrations** run in CI before deployment

---

## Explicit Non-Goals (Phase 1)

**Do NOT implement these in Phase 1:**

| Feature | Reason |
|---------|--------|
| AI Tutor chat | Expensive, Phase 2 Summit tier |
| Non-verbal reasoning | Requires human illustration |
| Mobile apps | Responsive web sufficient |
| School dashboard | Different product |
| Real-time collaboration | Not needed |
| Gamification beyond streaks | Keep simple |
| Social features | Child safety complexity |
| CEM/ISEB formats | GL first (60% market) |
| ML-based personalisation | Need data first |
| Offline mode | Web-first |

---

## Code Style & Conventions

### TypeScript

- **Strict mode** enabled
- **No `any` types** - use `unknown` if truly unknown
- **Prefer interfaces** over types for objects
- **Explicit return types** on exported functions

### Naming

- **Components**: PascalCase (`QuestionCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useProgress.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Database columns**: snake_case
- **API routes**: kebab-case

### File Organisation

```typescript
// 1. External imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (absolute)
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 3. Types
interface Props {
  questionId: string;
}

// 4. Component
export function QuestionCard({ questionId }: Props) {
  // ...
}
```

---

## Documentation Requirements

Every feature must include:

1. **README** in feature directory explaining purpose
2. **JSDoc comments** on exported functions
3. **Type definitions** for all interfaces
4. **API documentation** for new endpoints

---

## Questions? Decisions?

When facing architectural decisions not covered here:

1. **Prefer simplicity** - can we solve this without new dependencies?
2. **Prefer proven** - is there a well-established pattern?
3. **Prefer reversible** - can we change this later if wrong?
4. **Document the decision** - add to this file or ADR

---

*Last updated: January 2026*
*Version: 1.0.0*

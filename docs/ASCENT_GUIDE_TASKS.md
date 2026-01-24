# Ascent Guide - Implementation Tasks

## Overview
Implementation checklist for the Ascent Guide premium feature.

**Target:** 4-5 days total development
**Reference:** [ASCENT_GUIDE_FEATURE.md](./ASCENT_GUIDE_FEATURE.md)

---

## Phase 1: Foundation (Day 1-2)

### 1.1 Type Definitions
- [ ] Create `lib/narrative/types.ts`
  - `NarrativeHeadline` interface
  - `ConversationStarter` interface
  - `DailyGuide` interface
  - `GuideMetrics` interface (input data shape)
  - `GuideTier` type ('free' | 'compass')

### 1.2 Static Template Library
- [ ] Create `lib/narrative/templates.ts`
  - Readiness templates (excellent/good/developing/needs-attention)
  - Rush factor templates (high/normal)
  - Fatigue templates (detected/not-detected)
  - Streak templates (active/milestone/broken)
  - Compound templates (rush+topic, fatigue+topic)
  - Conversation starter library (~20 templates)

### 1.3 Template Interpolator
- [ ] Create `lib/narrative/interpolator.ts`
  - `interpolateTemplate(template, data)` function
  - Handle variable substitution `{name}`, `{topic}`, `{accuracy}`
  - Handle conditional blocks
  - Handle pluralization

### 1.4 Pattern Triggers
- [ ] Create `lib/narrative/triggers.ts`
  - `getApplicableTemplates(metrics)` function
  - Rush detection threshold (>20% answers <5s)
  - Fatigue detection logic
  - Streak milestone detection (5, 10, 30 days)
  - Topic stagnation detection

---

## Phase 2: Feature Gating (Day 2)

### 2.1 Gating Logic
- [ ] Create `lib/narrative/featureGating.ts`
  - `getGuideForTier(guide, tier)` function
  - Truncate narrative for free tier (show hook only)
  - Hide conversation starters for free tier
  - Hide rationale for free tier

### 2.2 Teaser Generation
- [ ] Create `truncateWithHook(text)` function
  - Find natural break points ("but", "however", "although")
  - Add "..." suffix
  - Ensure minimum hook length (30 chars)

### 2.3 Subscription Check Integration
- [ ] Create `lib/narrative/subscription.ts`
  - `getUserTier(parentId)` - check subscription status
  - Integration with existing `useSubscription` hook

---

## Phase 3: UI Components (Day 2-3)

### 3.1 AscentGuide Component
- [ ] Create `components/analytics/AscentGuide.tsx`
  - Props: `guide: DailyGuide`, `tier: GuideTier`
  - Display headline, narrative, focus area, conversation starter
  - Compass icon branding
  - Date display

### 3.2 GuideTeaser Component  
- [ ] Create `components/analytics/GuideTeaser.tsx`
  - Blurred/locked visual
  - Teaser text (truncated hook)
  - "Unlock with Ascent Compass" CTA button
  - Lock icon

### 3.3 Integration with Analytics Page
- [ ] Add AscentGuide section to `app/(dashboard)/analytics2/page.tsx`
  - Position at top of dashboard (most valuable real estate)
  - Conditional render based on subscription tier
  - Loading skeleton state

---

## Phase 4: LLM Generation (Day 3-4)

### 4.1 Prompt Templates
- [ ] Create `lib/narrative/prompts.ts`
  - `DAILY_GUIDE_PROMPT` template
  - Growth mindset instructions
  - Output JSON schema
  - Safety guardrails (no medical advice, no alarmism)

### 4.2 Generator Function
- [ ] Create `lib/narrative/generator.ts`
  - `generateDailyGuide(metrics)` function
  - Call Claude API (Sonnet 3.5)
  - Parse JSON response
  - Handle API errors gracefully
  - Fallback to static template on failure

### 4.3 Database Schema
- [ ] Create migration `supabase/migrations/YYYYMMDD_daily_guides.sql`
  - `daily_guides` table
  - Indexes on (child_id, guide_date)
  - RLS policies for parent access

### 4.4 Batch Processing Script
- [ ] Create `scripts/generate-daily-guides.ts`
  - Query all Compass subscriber children
  - Fetch daily metrics for each
  - Generate guides in batches
  - Save to database
  - Error handling and logging
  - Estimated runtime: ~10 minutes for 500 children

---

## Phase 5: Integration & Polish (Day 4-5)

### 5.1 API Route
- [ ] Create `app/api/guide/daily/route.ts`
  - GET: Fetch today's guide for authenticated user's children
  - Check subscription status
  - Return full or teaser based on tier

### 5.2 Home Page Update
- [ ] Update `app/home/page.tsx`
  - Add Ascent Guide as featured premium benefit
  - Add visual mockup in pricing section
  - Emphasize "daily coaching narrative"

### 5.3 Testing
- [ ] Unit tests for template interpolation
- [ ] Unit tests for feature gating
- [ ] Integration test for guide generation
- [ ] E2E test for guide display

### 5.4 Documentation
- [ ] Update README with Ascent Guide feature
- [ ] Add JSDoc to all public functions
- [ ] Document batch job scheduling requirements

---

## Completion Checklist

- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] All Phase 3 tasks complete
- [ ] All Phase 4 tasks complete
- [ ] All Phase 5 tasks complete
- [ ] Build passes (`npm run build`)
- [ ] Feature gating works correctly
- [ ] Free tier sees teaser only
- [ ] Compass tier sees full guide
- [ ] Home page updated with feature
- [ ] Committed and pushed

---

## Files to Create

```
lib/narrative/
  types.ts
  templates.ts
  interpolator.ts
  triggers.ts
  featureGating.ts
  prompts.ts
  generator.ts
  index.ts

components/analytics/
  AscentGuide.tsx
  GuideTeaser.tsx

app/api/guide/daily/
  route.ts

scripts/
  generate-daily-guides.ts

supabase/migrations/
  YYYYMMDD_daily_guides.sql
```

---

## Dependencies

- Existing: `@anthropic-ai/sdk` (already installed for explanations)
- Existing: Supabase client
- Existing: `useSubscription` hook

No new dependencies required.

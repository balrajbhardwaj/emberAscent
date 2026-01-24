# Ascent Guide - Feature Specification

## Executive Summary

**Ascent Guide** is the premium narrative intelligence layer for Ascent Compass subscribers. It transforms raw analytics data into personalised, actionable coaching guidance for parents — synthesising behavioural patterns, learning metrics, and pedagogical best practices into daily digestible insights.

---

## The Problem We're Solving

### Parent Pain Points

| Pain Point | Impact |
|------------|--------|
| **Time Poverty** | Parents have 5-10 minutes to review progress. They can't interpret 6 charts. |
| **Expertise Gap** | "Is 72% good? Should I worry about the 25% rush rate?" — Parents lack educational context. |
| **Conversation Anxiety** | Parents want to help but fear demotivating their child with criticism. |
| **Data Overwhelm** | Multiple metrics (accuracy, speed, fatigue, topics) without synthesis. |

### The Insight

> **Free tier shows WHAT happened. Paid tier explains WHY it matters and WHAT TO DO.**

Parents don't pay for more data. They pay for **interpretation**, **prioritisation**, and **guidance**.

---

## Feature Overview

### What is Ascent Guide?

A daily-generated, LLM-powered narrative that:
1. **Synthesises** the day's learning metrics into 2-3 sentences
2. **Links behaviour to outcomes** (e.g., "Rushing affected Geometry accuracy")
3. **Recommends specific focus areas** with clear rationale
4. **Provides conversation starters** for parent-child discussions

### Example Output

```
┌─────────────────────────────────────────────────────────────────┐
│  🧭 Today's Ascent Guide                           January 24  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Emma is progressing well this week, but we noticed she       │
│   answered 28% of Maths questions in under 5 seconds. Slowing  │
│   down on Fractions could improve her accuracy by ~15%."       │
│                                                                 │
│  📍 Recommended Focus: Fractions (Year 5)                      │
│     Why: 12 attempts, 42% accuracy, rushing detected           │
│                                                                 │
│  💬 Conversation Starter:                                      │
│     "I saw you flew through the quiz yesterday — which         │
│      question made you think the hardest?"                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Strategic Rationale

### Why This Feature?

1. **High Perceived Value, Low Marginal Cost**
   - Generation cost: ~£0.003 per child per day
   - Revenue per subscriber: £14.99/month
   - Margin contribution: >99%

2. **Clear Differentiation from Free Tier**
   - Free: Raw data, basic charts
   - Compass: Interpreted insights, actionable guidance

3. **Solves Real Parent Problems**
   - Saves 10+ minutes of interpretation daily
   - Reduces parental anxiety with context
   - Improves parent-child study conversations

4. **Aligns with Brand Promise**
   - "Be the coach your child needs. We'll be your assistant."
   - Guide transforms data into coaching advice

### Why Hybrid Approach (Static + LLM)?

| Approach | Use Case | Cost |
|----------|----------|------|
| **Static Templates** | Headlines, section labels, basic prompts | £0 |
| **Daily LLM Generation** | Full narrative synthesis, conversation starters | ~£45/month (500 users) |

**Decision:** Use static templates for Free tier + Compass scaffolding. LLM only for premium narrative synthesis (batch-generated at EOD).

### Why Batch Generation (Not Real-time)?

1. **Zero Latency** — Pre-computed, instant page load
2. **Cost Control** — Fixed daily cost, not per-pageview
3. **Quality Control** — Can review/filter before serving
4. **Reliability** — No API dependency on page load

---

## Feature Gating Strategy

### Tier Comparison

| Feature | Ascent Free | Ascent Compass |
|---------|-------------|----------------|
| Raw metrics (accuracy, topics) | ✅ | ✅ |
| Basic charts (7-day) | ✅ | ✅ Extended (30-day) |
| **Static Headlines** | ✅ Generic | ✅ Personalised |
| **Behavioural Metrics** | ❌ Hidden | ✅ Rush Factor, Fatigue |
| **Daily Ascent Guide** | 🔒 Teaser | ✅ Full narrative |
| **Conversation Starters** | 1 generic | ✅ Contextual library |
| **"Why" Explanations** | ❌ | ✅ Behaviour → Outcome |
| **Recommended Focus** | Topic list only | ✅ Prioritised + rationale |
| **Weekly Email Digest** | ❌ | ✅ |

### Free Tier Teaser UI

Show the hook, blur the rest:

```
┌─────────────────────────────────────────────────────┐
│  🧭 Today's Ascent Guide                    🔒      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  "Emma is progressing well, but..."                │
│                                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                     │
│  [Unlock with Ascent Compass →]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Psychology:** Parents see the opening hook and want to know the full story.

---

## Pedagogical Guidelines

All generated content must adhere to these child-sensitive principles:

### 1. Growth Mindset (Carol Dweck)

| ✅ Do | ❌ Don't |
|-------|---------|
| Praise effort, strategy, persistence | Praise innate ability ("smart") |
| "You worked hard on Algebra" | "You're naturally good at Maths" |
| "Let's try a different approach" | "This is your weakness" |

### 2. The "Yet" Principle

| ✅ Do | ❌ Don't |
|-------|---------|
| "Haven't mastered Geometry **yet**" | "Geometry is a weakness" |
| "Area for focus" | "Problem area" |
| "Tricky topic" | "Failed topic" |

### 3. Behaviour vs Identity

| ✅ Do | ❌ Don't |
|-------|---------|
| "We detected rushing in this session" | "You are a rusher" |
| "Accuracy dropped when tired" | "You're careless" |

### 4. The Sandwich Method

Structure feedback as: **Positive → Constructive → Action**

> "Great consistency this week! We noticed accuracy dropped when sessions ran long. Try 15-minute focused bursts tomorrow."

### 5. Safety Guardrails

- **Never** suggest medical conditions (ADHD, Dyslexia) even if data suggests attention issues
- **Never** be alarmist or use anxiety-inducing language
- **Always** maintain encouraging, calm, supportive tone
- **Never** compare child to other children or "averages"

---

## Technical Architecture

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Daily Metrics  │────▶│  EOD Batch Job   │────▶│  daily_guides   │
│  (calculated)   │     │  (11:00 PM)      │     │  (DB table)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │  Claude API  │         │  Dashboard   │
                        │  (Sonnet)    │         │  (instant)   │
                        └──────────────┘         └──────────────┘
```

### Database Schema

```sql
CREATE TABLE daily_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  guide_date DATE NOT NULL,
  
  -- Narrative content
  headline TEXT NOT NULL,
  narrative TEXT NOT NULL,
  conversation_starter TEXT,
  
  -- Recommended focus
  focus_topic TEXT,
  focus_rationale TEXT,
  
  -- Metadata
  metrics_snapshot JSONB,  -- Store input metrics for debugging
  generation_model TEXT,   -- e.g., "claude-3-5-sonnet"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(child_id, guide_date)
);

CREATE INDEX idx_daily_guides_child_date ON daily_guides(child_id, guide_date DESC);
```

### File Structure

```
lib/
  narrative/
    types.ts              # Type definitions
    templates.ts          # Static template library
    interpolator.ts       # Template + data → text
    triggers.ts           # Pattern matching for conversation starters
    featureGating.ts      # Free vs Compass content
    generator.ts          # LLM generation logic
    prompts.ts            # Claude prompt templates
    
scripts/
  generate-daily-guides.ts  # EOD batch job

components/
  analytics/
    AscentGuide.tsx       # Guide display component
    GuideTeaser.tsx       # Free tier locked teaser
```

---

## Cost Projections

### Monthly Cost at Scale

| Subscribers | Generations/Day | Tokens/Gen | Monthly Cost |
|-------------|-----------------|------------|--------------|
| 100 | 100 | ~1,000 | £9 |
| 500 | 500 | ~1,000 | £45 |
| 1,000 | 1,000 | ~1,000 | £90 |
| 5,000 | 5,000 | ~1,000 | £450 |

### Revenue vs Cost

| Subscribers | Monthly Revenue | Monthly Cost | Margin |
|-------------|-----------------|--------------|--------|
| 500 | £7,495 | £45 | 99.4% |
| 1,000 | £14,990 | £90 | 99.4% |
| 5,000 | £74,950 | £450 | 99.4% |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Free → Compass conversion from Guide teaser | >5% |
| Daily Guide engagement (views) | >70% of Compass users |
| Parent satisfaction (NPS) | >50 |
| Churn reduction vs control | >15% |

---

## Implementation Phases

### Phase 1: Foundation (2-3 days)
- [ ] Create type definitions
- [ ] Build static template library
- [ ] Implement template interpolator
- [ ] Create feature gating logic

### Phase 2: UI Components (1-2 days)
- [ ] Build AscentGuide component
- [ ] Build GuideTeaser component (locked state)
- [ ] Integrate into analytics2 page

### Phase 3: LLM Generation (1-2 days)
- [ ] Create prompt templates
- [ ] Build generator function
- [ ] Create batch script
- [ ] Add database migration

### Phase 4: Integration (1 day)
- [ ] Wire up subscription checks
- [ ] Add to analytics dashboard
- [ ] Update home page marketing

---

## Appendix: Sample Prompt Template

```typescript
const GUIDE_PROMPT = `You are an empathetic educational coach helping a parent understand their child's learning progress. Generate a brief, supportive daily guide.

## Child Data
- Name: {child_name}
- Year Group: {year_group}
- Today's Accuracy: {accuracy}%
- Rush Factor: {rush_percent}% of questions answered <5 seconds
- Session Duration: {duration} minutes
- Weakest Topic: {weakest_topic} ({topic_accuracy}% accuracy)
- Streak: {streak_days} days

## Guidelines
1. Use growth mindset language (praise effort, not ability)
2. Frame challenges as "not yet mastered" rather than "weaknesses"  
3. Connect behaviour (rushing/fatigue) to outcomes when relevant
4. Keep tone encouraging and calm — never alarmist
5. Provide ONE specific actionable recommendation

## Output Format
Return JSON:
{
  "headline": "One sentence summary (max 15 words)",
  "narrative": "2-3 sentences explaining what matters today (max 60 words)",
  "conversationStarter": "A question the parent can ask the child",
  "focusTopic": "The single most important topic to focus on",
  "focusRationale": "Why this topic, in one sentence"
}`;
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-24 | Ascent Team | Initial specification |

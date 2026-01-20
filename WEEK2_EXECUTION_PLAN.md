# Ember Ascent - Week 2 Execution Plan

**Status:** Ready to Execute  
**Timeline:** Days 8-14 (Est. 7-10 days)  
**Current Progress:** Day 4 Complete (Practice Interface + Quick Byte)

---

## Overview

Week 2 transforms Ember Ascent from a basic practice platform into a premium, trust-focused learning system with adaptive difficulty, analytics, and monetization.

**Key Deliverables:**
- Ember Score transparency system
- Adaptive difficulty engine
- Analytics dashboard (paid tier)
- Stripe payment integration
- Email system with weekly reports

---

## Prerequisites Check

✅ **Completed (Week 1):**
- Authentication system
- Database schema (6 tables + RLS)
- Onboarding flow
- Practice landing page
- Quick Byte feature
- Basic progress tracking

🔲 **Before Starting Week 2:**
- [ ] Supabase project stable
- [ ] Test data available (100+ questions)
- [ ] Stripe account created (test mode)
- [ ] Resend account setup
- [ ] Domain configured for emails

---

## Day 8: Ember Score System

**Goal:** Build transparent quality scoring for all questions

### Morning Session (3-4 hours)
**Task 8.1: Ember Score Calculation Service**
```
Priority: High
Complexity: Medium
Dependencies: None

Steps:
1. Create /lib/scoring/emberScore.ts
2. Implement calculation algorithm:
   - Curriculum alignment (40%)
   - Expert verification (40%)
   - Community feedback (20%)
3. Create scoring tiers (verified/confident/draft)
4. Write unit tests for edge cases

Files to create:
- /lib/scoring/emberScore.ts
- /lib/scoring/__tests__/emberScore.test.ts
- /types/scoring.ts

Success criteria:
- calculateEmberScore() works correctly
- Tier thresholds applied properly
- Tests pass for all scenarios
```

### Afternoon Session (3-4 hours)
**Task 8.2: Database Schema for Ember Score**
```
Priority: High
Complexity: Medium
Dependencies: 8.1

Steps:
1. Create migration 005_ember_score_tracking.sql
2. Add columns to questions table:
   - ember_score, ember_score_breakdown, ember_score_updated_at
   - review_status, reviewed_by, reviewed_at
3. Create question_feedback table
4. Create question_stats materialized view
5. Create recalculate_ember_score() function
6. Create trigger for auto-recalculation
7. Apply migration and test

Files to create:
- /supabase/migrations/005_ember_score_tracking.sql

Success criteria:
- Migration applies cleanly
- Stats view aggregates correctly
- Trigger fires on feedback changes
- Score recalculates automatically
```

### Evening Session (2-3 hours)
**Task 8.3: Ember Score UI Components**
```
Priority: High
Complexity: Medium
Dependencies: 8.1, 8.2

Steps:
1. Create EmberScoreBadge component (compact display)
2. Create EmberScoreDetail modal (expanded view)
3. Create EmberScoreInfo educational modal
4. Add badge to QuestionCard component
5. Create useEmberScore hook
6. Test UI interactions

Files to create:
- /components/ember-score/EmberScoreBadge.tsx
- /components/ember-score/EmberScoreDetail.tsx
- /components/ember-score/EmberScoreInfo.tsx
- /hooks/useEmberScore.ts

Success criteria:
- Badge displays correct tier colors
- Modal shows score breakdown
- Animations smooth
- Mobile responsive
```

**Day 8 Deliverables:**
- ✅ Ember Score calculation engine
- ✅ Database tracking system
- ✅ UI components for display
- ✅ Question quality transparency

---

## Day 9: Transparency & Trust Features

**Goal:** Build provenance tracking and attribution systems

### Morning Session (3-4 hours)
**Task 9.1: Question Provenance System**
```
Priority: High
Complexity: Medium
Dependencies: Day 8

Steps:
1. Create migration 006_question_provenance.sql
2. Create question_provenance table (audit log)
3. Create tracking functions in /lib/provenance/tracker.ts
4. Create ProvenanceTimeline component
5. Integrate timeline into EmberScoreDetail
6. Test logging for all event types

Files to create:
- /supabase/migrations/006_question_provenance.sql
- /lib/provenance/tracker.ts
- /components/ember-score/ProvenanceTimeline.tsx

Success criteria:
- All question changes logged
- Timeline displays chronologically
- Event data captured accurately
```

### Afternoon Session (3-4 hours)
**Task 9.2: Content Attribution & Legal Compliance**
```
Priority: High (Legal requirement)
Complexity: Low
Dependencies: None

Steps:
1. Create AttributionFooter component (OGL v3.0 notice)
2. Create QuestionAttribution component
3. Create /app/(marketing)/attribution/page.tsx
4. Create /app/(marketing)/transparency/page.tsx
5. Add footer to all pages
6. Review legal compliance

Files to create:
- /components/common/AttributionFooter.tsx
- /components/practice/QuestionAttribution.tsx
- /app/(marketing)/attribution/page.tsx
- /app/(marketing)/transparency/page.tsx

Success criteria:
- OGL attribution visible on all pages
- Attribution page comprehensive
- Transparency report accurate
```

### Evening Session (2 hours)
**Task 9.3: Feedback Collection System**
```
Priority: Medium
Complexity: Low
Dependencies: Day 8

Steps:
1. Create QuestionFeedback component (thumbs up/down)
2. Create SessionFeedback component
3. Create NpsSurvey modal
4. Create migration 007_feedback_tables.sql
5. Implement feedback submission logic
6. Test feedback flow

Files to create:
- /components/feedback/QuestionFeedback.tsx
- /components/feedback/SessionFeedback.tsx
- /components/feedback/NpsSurvey.tsx
- /supabase/migrations/007_feedback_tables.sql
- /lib/feedback/collector.ts

Success criteria:
- Feedback captures without interrupting practice
- NPS survey shows at appropriate times
- Data stored correctly
```

**Day 9 Deliverables:**
- ✅ Complete provenance tracking
- ✅ Legal attribution compliance
- ✅ Feedback collection system
- ✅ Trust-building infrastructure

---

## Day 10: Adaptive Difficulty Engine

**Goal:** Implement intelligent difficulty adjustment

### Morning Session (4 hours)
**Task 10.1: Adaptive Algorithm Core**
```
Priority: High
Complexity: High
Dependencies: None

Steps:
1. Create /lib/adaptive/difficultyEngine.ts
2. Implement rolling performance tracking
3. Implement difficulty adjustment logic:
   - >75% accuracy: increase
   - <45% accuracy: decrease
   - 45-75%: maintain
4. Add cooldown mechanism
5. Write comprehensive tests

Files to create:
- /lib/adaptive/difficultyEngine.ts
- /lib/adaptive/__tests__/difficultyEngine.test.ts
- /types/adaptive.ts

Success criteria:
- Algorithm adjusts correctly based on performance
- Cooldown prevents thrashing
- Edge cases handled (new user, topic switch)
```

### Afternoon Session (3-4 hours)
**Task 10.2: Question Selection Service**
```
Priority: High
Complexity: High
Dependencies: 10.1

Steps:
1. Create /lib/adaptive/questionSelector.ts
2. Implement weighted selection criteria:
   - Difficulty match (40%)
   - Topic coverage (25%)
   - Recency avoidance (20%)
   - Weak area focus (15%)
3. Optimize database queries
4. Test selection distribution

Files to create:
- /lib/adaptive/questionSelector.ts
- /lib/adaptive/__tests__/questionSelector.test.ts

Success criteria:
- Questions selected intelligently
- No immediate repeats
- Balanced topic coverage
- Performance acceptable (<500ms)
```

### Evening Session (2-3 hours)
**Task 10.3: Database & API Integration**
```
Priority: High
Complexity: Medium
Dependencies: 10.1, 10.2

Steps:
1. Create migration 008_adaptive_tracking.sql
2. Create child_topic_performance table
3. Create child_question_history table
4. Create API route: /api/adaptive/next-question
5. Create useAdaptiveSession hook
6. Update practice session flow
7. Test end-to-end

Files to create:
- /supabase/migrations/008_adaptive_tracking.sql
- /app/api/adaptive/next-question/route.ts
- /app/api/adaptive/performance/route.ts
- /hooks/useAdaptiveSession.ts

Success criteria:
- Performance tracked per topic
- Next question selected adaptively
- Practice session uses adaptive mode
```

**Day 10 Deliverables:**
- ✅ Adaptive difficulty algorithm
- ✅ Intelligent question selection
- ✅ Performance tracking infrastructure
- ✅ Adaptive practice sessions working

---

## Day 11: Analytics Dashboard - Part 1

**Goal:** Build data layer and core analytics features

### Morning Session (3-4 hours)
**Task 11.1: Analytics Data Aggregation**
```
Priority: High
Complexity: High
Dependencies: Adaptive system

Steps:
1. Create migration 009_analytics_views.sql
2. Create materialized views:
   - child_daily_stats
   - child_topic_mastery
   - child_weekly_summary
3. Create /lib/analytics/aggregator.ts
4. Implement analytics calculation functions
5. Test data accuracy

Files to create:
- /supabase/migrations/009_analytics_views.sql
- /lib/analytics/aggregator.ts
- /types/analytics.ts

Success criteria:
- Materialized views aggregate correctly
- Analytics functions fast (<1s)
- Data accurate against raw data
```

### Afternoon Session (4 hours)
**Task 11.2: Weakness Heatmap Component**
```
Priority: High (Flagship feature)
Complexity: High
Dependencies: 11.1

Steps:
1. Create WeaknessHeatmap component
2. Implement color-coded grid visualization
3. Create HeatmapCell component
4. Create HeatmapLegend component
5. Add hover tooltips and interactions
6. Make responsive (mobile collapsible)
7. Polish animations

Files to create:
- /components/analytics/WeaknessHeatmap.tsx
- /components/analytics/HeatmapCell.tsx
- /components/analytics/HeatmapLegend.tsx
- /hooks/useWeaknessData.ts

Success criteria:
- Heatmap visually impressive
- Colors accurately reflect mastery
- Interactive and responsive
- Print-friendly version available
```

### Evening Session (2-3 hours)
**Task 11.3: Readiness Score Component**
```
Priority: High
Complexity: Medium
Dependencies: 11.1

Steps:
1. Create ReadinessScore component
2. Create ScoreGauge circular gauge (SVG)
3. Create TrendSparkline component
4. Implement score calculation logic
5. Add subject breakdown mini-gauges
6. Add disclaimers and explanations

Files to create:
- /components/analytics/ReadinessScore.tsx
- /components/analytics/ScoreGauge.tsx
- /components/analytics/TrendSparkline.tsx

Success criteria:
- Gauge animates smoothly
- Score calculated correctly
- Disclaimers clear and reassuring
- Trend indicators accurate
```

**Day 11 Deliverables:**
- ✅ Analytics data aggregation layer
- ✅ Weakness heatmap visualization
- ✅ Readiness score display
- ✅ Core analytics infrastructure

---

## Day 12: Analytics Dashboard - Part 2

**Goal:** Complete analytics dashboard and study plans

### Morning Session (3-4 hours)
**Task 12.1: Analytics Dashboard Page**
```
Priority: High
Complexity: High
Dependencies: Day 11

Steps:
1. Create /app/(dashboard)/analytics/page.tsx
2. Layout key metrics row
3. Integrate weakness heatmap
4. Add growth over time charts
5. Add detailed performance tables
6. Create loading and error states
7. Implement date range filtering

Files to create:
- /app/(dashboard)/analytics/page.tsx
- /components/analytics/AnalyticsDashboard.tsx
- /components/analytics/KeyMetricsRow.tsx
- /components/analytics/GrowthChart.tsx
- /components/analytics/PerformanceTables.tsx

Success criteria:
- Dashboard comprehensive but not overwhelming
- All sections load data correctly
- Responsive on all devices
- Performance acceptable
```

### Afternoon Session (3-4 hours)
**Task 12.2: Personalized Study Plans**
```
Priority: High
Complexity: High
Dependencies: 12.1

Steps:
1. Create /lib/analytics/studyPlanGenerator.ts
2. Implement weekly plan generation algorithm
3. Create StudyPlan component (calendar view)
4. Create daily recommendation logic
5. Add plan adjustment capability
6. Store plans in database

Files to create:
- /lib/analytics/studyPlanGenerator.ts
- /components/analytics/StudyPlan.tsx
- /components/analytics/StudyRecommendations.tsx

Success criteria:
- Plans generated intelligently
- Recommendations actionable
- Calendar view clear
- Plans persist correctly
```

### Evening Session (2 hours)
**Task 12.3: Free Tier Analytics Preview**
```
Priority: High (Conversion driver)
Complexity: Low
Dependencies: 12.1

Steps:
1. Create AnalyticsPreview component
2. Add blur overlay with upgrade prompt
3. Create FeatureComparison table
4. Add sample metrics teaser
5. Implement analytics page gating
6. A/B test copy variants

Files to create:
- /components/analytics/AnalyticsPreview.tsx
- /components/analytics/UpgradePrompt.tsx
- /components/analytics/FeatureComparison.tsx

Success criteria:
- Preview enticing but not annoying
- Upgrade CTA clear
- Value proposition strong
- Free users see preview, paid see full
```

**Day 12 Deliverables:**
- ✅ Complete analytics dashboard
- ✅ Personalized study plans
- ✅ Free tier upgrade preview
- ✅ Full analytics feature set

---

## Day 13: Stripe Payment Integration

**Goal:** Implement subscription payments

### Morning Session (3 hours)
**Task 13.1: Stripe Setup**
```
Priority: Critical
Complexity: Medium
Dependencies: None

Steps:
1. Create Stripe account (test mode)
2. Create products and prices in dashboard:
   - Ascent Monthly: £12.99/mo
   - Ascent Annual: £129/yr
   - Summit Monthly: £24.99/mo
   - Summit Annual: £249/yr
3. Create /lib/stripe/config.ts
4. Create /lib/stripe/client.ts
5. Create migration 010_subscriptions.sql
6. Add subscription columns to profiles

Files to create:
- /lib/stripe/config.ts
- /lib/stripe/client.ts
- /supabase/migrations/010_subscriptions.sql
- /types/subscription.ts

Success criteria:
- Stripe connection working
- Products configured correctly
- Database schema ready
```

### Afternoon Session (4 hours)
**Task 13.2: Checkout & Webhook Handlers**
```
Priority: Critical
Complexity: High
Dependencies: 13.1

Steps:
1. Create /app/api/stripe/checkout/route.ts
2. Create /app/api/stripe/portal/route.ts
3. Create /app/api/stripe/webhook/route.ts
4. Implement webhook handlers:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
5. Test webhook delivery (Stripe CLI)
6. Handle all edge cases

Files to create:
- /app/api/stripe/checkout/route.ts
- /app/api/stripe/portal/route.ts
- /app/api/stripe/webhook/route.ts
- /lib/stripe/webhookHandlers.ts

Success criteria:
- Checkout completes successfully
- Webhooks verified and processed
- Subscription status updates correctly
- Error handling robust
```

### Evening Session (2-3 hours)
**Task 13.3: Pricing Page & Upgrade Flow**
```
Priority: High
Complexity: Medium
Dependencies: 13.2

Steps:
1. Create /app/(marketing)/pricing/page.tsx
2. Create PricingCard component
3. Create PricingToggle (monthly/annual)
4. Create /app/(dashboard)/settings/subscription/page.tsx
5. Create UpgradeBanner component
6. Create useSubscription hook
7. Test complete upgrade flow

Files to create:
- /app/(marketing)/pricing/page.tsx
- /components/pricing/PricingCard.tsx
- /components/pricing/PricingToggle.tsx
- /app/(dashboard)/settings/subscription/page.tsx
- /components/dashboard/UpgradeBanner.tsx
- /hooks/useSubscription.ts

Success criteria:
- Pricing page conversion-optimized
- Checkout flow smooth (minimal clicks)
- Subscription management working
- Trial period applies correctly
```

**Day 13 Deliverables:**
- ✅ Stripe payment integration
- ✅ Subscription management
- ✅ Pricing page
- ✅ Complete payment flow

---

## Day 14: Email System & Reports

**Goal:** Implement email infrastructure and weekly reports

### Morning Session (3 hours)
**Task 14.1: Email Infrastructure**
```
Priority: High
Complexity: Medium
Dependencies: None

Steps:
1. Setup Resend account
2. Configure domain (SPF, DKIM)
3. Create /lib/email/client.ts
4. Setup React Email templates:
   - WelcomeEmail
   - PasswordResetEmail
   - SubscriptionWelcomeEmail
   - SubscriptionCancelledEmail
   - PaymentFailedEmail
   - WeeklyReportEmail
5. Create email components (Header, Footer, Button)
6. Test email rendering

Files to create:
- /lib/email/client.ts
- /lib/email/sender.ts
- /emails/components/*.tsx
- /emails/templates/*.tsx

Success criteria:
- Emails send successfully
- Templates render correctly
- Mobile responsive
- Plain text fallbacks work
```

### Afternoon Session (4 hours)
**Task 14.2: Weekly Progress Reports**
```
Priority: High (Flagship email)
Complexity: High
Dependencies: 14.1, Analytics system

Steps:
1. Create WeeklyReportEmail template
2. Create /lib/email/reports/weeklyReportGenerator.ts
3. Generate report data from analytics
4. Create beautiful email layout:
   - Summary card
   - Readiness score update
   - Subject breakdown
   - Focus areas
   - Weekly highlights
   - Practice plan
5. Create /lib/email/scheduler.ts
6. Create /app/api/cron/weekly-reports/route.ts
7. Setup cron job (Vercel Cron)
8. Test report generation and delivery

Files to create:
- /emails/templates/WeeklyReportEmail.tsx
- /lib/email/reports/weeklyReportGenerator.ts
- /lib/email/scheduler.ts
- /app/api/cron/weekly-reports/route.ts

Success criteria:
- Report contains accurate data
- Email scannable and informative
- Cron job runs reliably
- Delivery rate high
```

### Evening Session (2 hours)
**Task 14.3: Email Preferences**
```
Priority: Medium
Complexity: Low
Dependencies: 14.1

Steps:
1. Create migration 011_email_preferences.sql
2. Create /app/(dashboard)/settings/notifications/page.tsx
3. Create NotificationSettings component
4. Create /app/(marketing)/unsubscribe/page.tsx
5. Implement preference management API
6. Test unsubscribe flow (legal compliance)

Files to create:
- /supabase/migrations/011_email_preferences.sql
- /app/(dashboard)/settings/notifications/page.tsx
- /components/settings/NotificationSettings.tsx
- /app/(marketing)/unsubscribe/page.tsx
- /lib/email/unsubscribe.ts

Success criteria:
- Preferences saved correctly
- Unsubscribe works immediately
- Re-subscribe available
- Legal compliance verified
```

**Day 14 Deliverables:**
- ✅ Email infrastructure
- ✅ Weekly progress reports
- ✅ Email preferences
- ✅ Complete email system

---

## Week 2 Testing Checklist

### Ember Score System
- [ ] Score calculates correctly for all combinations
- [ ] Tiers assigned properly (verified/confident/draft)
- [ ] UI displays scores accurately
- [ ] Score recalculates after feedback
- [ ] Provenance timeline shows full history

### Adaptive Difficulty
- [ ] Difficulty increases when performing well
- [ ] Difficulty decreases when struggling
- [ ] Cooldown prevents rapid changes
- [ ] New users start at appropriate level
- [ ] Topic switches handled correctly
- [ ] Question selection avoids recent repeats

### Analytics Dashboard
- [ ] All metrics calculate correctly
- [ ] Heatmap displays accurate mastery levels
- [ ] Readiness score updates based on performance
- [ ] Study plans generated intelligently
- [ ] Date range filtering works
- [ ] Performance acceptable with large datasets

### Payments
- [ ] Checkout completes successfully (test mode)
- [ ] Webhooks received and processed
- [ ] Subscription status updates correctly
- [ ] Trial period applied
- [ ] Customer portal accessible
- [ ] Cancellation handled properly
- [ ] Payment failures trigger alerts

### Emails
- [ ] All email templates render correctly
- [ ] Emails send successfully
- [ ] Weekly reports contain accurate data
- [ ] Unsubscribe works immediately
- [ ] Preferences respected
- [ ] Cron job runs reliably

### Integration Tests
- [ ] Free user sees upgrade prompts
- [ ] Paid user accesses analytics
- [ ] Adaptive system improves with practice
- [ ] Emails trigger at correct times
- [ ] Subscription changes reflected immediately

---

## Deployment Considerations

### Environment Variables Needed
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ASCENT_MONTHLY_PRICE_ID=price_...
STRIPE_ASCENT_ANNUAL_PRICE_ID=price_...
STRIPE_SUMMIT_MONTHLY_PRICE_ID=price_...
STRIPE_SUMMIT_ANNUAL_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=hello@emberdatalabs.co.uk

# Cron
CRON_SECRET=... (generate random string)
```

### Vercel Cron Jobs to Configure
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 7 * * 1"
    }
  ]
}
```

### Database Migrations Order
1. 005_ember_score_tracking.sql
2. 006_question_provenance.sql
3. 007_feedback_tables.sql
4. 008_adaptive_tracking.sql
5. 009_analytics_views.sql
6. 010_subscriptions.sql
7. 011_email_preferences.sql

### Performance Monitoring
- [ ] Monitor API response times
- [ ] Check materialized view refresh performance
- [ ] Monitor Stripe webhook processing
- [ ] Track email delivery rates
- [ ] Monitor analytics query performance

---

## Risk Assessment

### High Risk Items
1. **Stripe Webhooks** - Must be 100% reliable
   - Mitigation: Extensive testing, idempotency, retry logic
   
2. **Analytics Calculations** - Must be accurate
   - Mitigation: Unit tests, data validation, cross-checks
   
3. **Email Deliverability** - Must reach inbox
   - Mitigation: Proper SPF/DKIM, warm up sender, monitor bounce rate

### Medium Risk Items
1. **Adaptive Algorithm** - Must actually improve learning
   - Mitigation: A/B testing, user feedback, iteration
   
2. **Performance at Scale** - Queries must stay fast
   - Mitigation: Indexes, materialized views, caching, monitoring

### Low Risk Items
1. **UI Polish** - Can be iterated
2. **Email Template Tweaks** - Can be improved over time

---

## Success Metrics

### Technical Metrics
- All tests passing (target: 100%)
- Build time <30s
- Analytics load time <2s
- Question selection time <500ms
- Email delivery rate >95%

### Business Metrics
- Free to paid conversion rate
- Analytics engagement (% of paid users viewing)
- Weekly report open rate (target: >40%)
- Checkout abandonment rate (target: <30%)

### User Experience Metrics
- Adaptive algorithm improves accuracy by session 5
- Readiness score reflects actual exam performance
- Study plan completion rate (target: >60%)

---

## Post-Week 2 Priorities

### Immediate (Days 15-16)
1. Bug fixes from testing
2. Performance optimization
3. User acceptance testing
4. Documentation updates

### Next Week (Week 3)
1. Admin panel for content management
2. Question import/export tools
3. Reviewer workflow
4. Mock test refinements
5. Beta launch preparation

---

## Notes & Decisions

### Architecture Decisions
- Materialized views for analytics (performance vs freshness tradeoff)
- Server-side Stripe integration (security)
- React Email for templates (maintainability)
- Adaptive per-topic difficulty (granularity)

### Open Questions
- [ ] Benchmarking cohort data privacy approach?
- [ ] AI-generated study recommendations model?
- [ ] Frequency of analytics view refresh?
- [ ] Trial period duration (7 vs 14 days)?

### Dependencies
- Stripe account approval (can take 1-2 days)
- Domain email configuration
- Content for transparency pages
- Test question bank (100+ questions minimum)

---

## Daily Standup Template

**What I completed yesterday:**
- 

**What I'm working on today:**
- 

**Blockers:**
- 

**Questions/Decisions needed:**
- 

---

## Commit Message Convention

```
feat: add ember score calculation service
fix: correct adaptive difficulty threshold
chore: setup stripe webhook handlers
docs: update analytics documentation
test: add unit tests for question selector
```

---

**Let's build Week 2! 🚀**

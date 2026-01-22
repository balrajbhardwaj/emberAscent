# Ember Ascent: Production Architecture Guidelines
## Agent Instruction Set for Secure, Compliant Implementation

**Version**: 1.1  
**Classification**: MANDATORY - All code must comply  
**Regulatory Context**: UK GDPR, ICO Children's Code, PCI DSS (via Stripe)

---

## 1. CRITICAL CONTEXT

This application handles:
- **Children's personal data** (ages 9-11) - highest protection tier
- **Financial transactions** - PCI DSS compliance required
- **Educational performance data** - sensitive by nature

**Default stance**: When in doubt, over-protect. Security > convenience.

---

## 2. COMPUTATION ARCHITECTURE (STRICT)

### 2.1 The Golden Rule

```
DATABASE    →    API    →    REACT
Compute         Fetch        Display
Aggregate       Validate     Render
Transform       Authorise    Format (display only)

NEVER: Computation in React components
NEVER: Business logic in API routes (only orchestration)
NEVER: Raw data to client for aggregation
```

### 2.2 Why This Matters

| Risk | If Computed Client-Side |
|------|------------------------|
| **Ember Score manipulation** | User modifies JS to inflate their child's score |
| **Subscription bypass** | User changes `tier: 'free'` to `tier: 'summit'` in memory |
| **Analytics tampering** | Readiness scores, percentiles become meaningless |
| **Inconsistent data** | Two users see different calculations for same data |
| **Performance** | Shipping 10,000 question attempts to calculate an average |

### 2.3 Layer Responsibilities

```typescript
// ❌ WRONG: Computation in React
function Dashboard({ sessions }) {
  // NEVER do this - user can manipulate in DevTools
  const accuracy = sessions.filter(s => s.correct).length / sessions.length;
  const emberScore = calculateEmberScore(sessions);
  const percentile = computePercentile(accuracy, allUsers);
  
  return <div>Accuracy: {accuracy}</div>;
}

// ✅ CORRECT: React only displays
function Dashboard({ stats }) {
  // stats = { accuracy: 0.73, emberScore: 87, percentile: 82 }
  // Pre-computed by database, validated by API
  return <div>Accuracy: {stats.accuracy}</div>;
}
```

### 2.4 Database Layer (PostgreSQL/Supabase)

**All computation happens here via:**

```sql
-- Views for computed metrics
CREATE VIEW child_performance_stats AS
SELECT 
  child_profile_id,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE is_correct) as correct_count,
  ROUND(COUNT(*) FILTER (WHERE is_correct)::decimal / NULLIF(COUNT(*), 0), 3) as accuracy,
  AVG(time_taken_ms) as avg_time_ms,
  PERCENT_RANK() OVER (ORDER BY accuracy) as percentile_rank
FROM learning_sessions
GROUP BY child_profile_id;

-- Functions for complex calculations
CREATE OR REPLACE FUNCTION calculate_ember_score(question_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER;
BEGIN
  SELECT 
    (curriculum_alignment * 0.25 +
     exam_pattern_fidelity * 0.25 +
     expert_verification * 0.25 +
     community_validation * 0.15 +
     technical_accuracy * 0.10) * 100
  INTO score
  FROM question_quality_metrics
  WHERE id = question_id;
  
  RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Materialised views for expensive calculations
CREATE MATERIALIZED VIEW readiness_scores AS
SELECT 
  child_profile_id,
  calculate_readiness(child_profile_id) as readiness_score,
  NOW() as calculated_at
FROM child_profiles;

-- Refresh nightly or on-demand
REFRESH MATERIALIZED VIEW readiness_scores;
```

### 2.5 API Layer (Next.js Route Handlers)

**API routes ONLY:**
- Authenticate requests
- Authorise data access (RLS handles most)
- Call database views/functions
- Validate response shape
- Return pre-computed data

```typescript
// /api/dashboard/stats/route.ts

export async function GET(request: Request) {
  const supabase = createServerClient(/* ... */);
  
  // 1. Authenticate
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 });
  
  // 2. Fetch PRE-COMPUTED data from database view
  const { data: stats } = await supabase
    .from('child_performance_stats')  // VIEW, not raw table
    .select('accuracy, percentile_rank, total_attempts')
    .eq('child_profile_id', childId)
    .single();
  
  // 3. Return computed data - NO TRANSFORMATION
  return Response.json(stats);
}
```

### 2.6 React Layer (Display Only)

```typescript
// ✅ CORRECT: Display-only component
'use client';

export function PerformanceDashboard({ childId }: { childId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', childId],
    queryFn: () => fetch(`/api/dashboard/stats?childId=${childId}`).then(r => r.json())
  });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <Stat label="Accuracy" value={formatPercent(data.accuracy)} />
      <Stat label="Percentile" value={`Top ${100 - data.percentile}%`} />
    </div>
  );
}

// Allowed: Display formatting only
function formatPercent(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}
```

### 2.7 Permitted vs Forbidden Client-Side Operations

| ✅ Allowed | ❌ Forbidden |
|-----------|-------------|
| `toLocaleString()` for numbers | Summing, averaging data |
| `toLocaleDateString()` for dates | Calculating percentiles |
| String formatting/truncation | Computing scores or metrics |
| Sorting fetched list for UI | Aggregating across records |
| Show/hide UI filtering | Business rule calculations |
| Currency symbol formatting | Subscription tier logic |

### 2.8 Subscription Tier Checks (Server-Side Only)

```typescript
// ❌ WRONG: Client-side tier check
function PremiumFeature({ user }) {
  if (user.tier === 'summit') {  // Easily bypassed
    return <AITutor />;
  }
  return <UpgradePrompt />;
}

// ✅ CORRECT: Server-verified
// API: /api/features/ai-tutor
export async function GET(request: Request) {
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('parent_id', user.id)
    .single();
  
  if (sub?.tier !== 'summit' || sub?.status !== 'active') {
    return Response.json({ error: 'Upgrade required' }, { status: 403 });
  }
  
  return Response.json({ enabled: true });
}
```

---

## 3. DATA PROTECTION PRINCIPLES

### 3.1 Data Minimisation (MUST)

```
COLLECT ONLY:
✓ Parent: email, password hash, name (optional)
✓ Child: first name only, year group, target exam type
✓ Learning: question attempts, answers, timestamps

NEVER COLLECT:
✗ Child's full name or surname
✗ Date of birth (use year group instead)
✗ School name (use region/exam board only)
✗ Home address
✗ Photos or biometric data
```

### 3.2 Data Architecture Pattern

```typescript
interface ChildProfile {
  id: string;                    // UUID, never sequential
  parent_id: string;             // FK to parent account
  display_name: string;          // First name only, max 20 chars
  year_group: 'year4' | 'year5' | 'year6';
  target_exam: 'gl' | 'cem' | 'iseb';
  created_at: timestamp;
  // NO: surname, dob, school, address
}
```

### 3.3 Encryption Requirements

| Data State | Requirement |
|------------|-------------|
| At rest | AES-256 (Supabase default) |
| In transit | TLS 1.3, HTTPS only |
| Passwords | bcrypt/argon2 (Supabase Auth) |

---

## 4. AUTHENTICATION & AUTHORISATION

### 4.1 Account Model (STRICT)

```
Parent Account (authenticated)
    └── Child Profile 1 (no login)
    └── Child Profile 2 (no login)
    └── Child Profile 3 (no login, max 5)

RULE: Children NEVER have credentials.
```

### 4.2 Row-Level Security (CRITICAL)

```sql
-- MANDATORY on ALL user data tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Parents access own children only
CREATE POLICY "parent_access_children"
ON child_profiles FOR ALL
USING (parent_id = auth.uid());

-- Learning data via parent ownership chain
CREATE POLICY "parent_access_learning"
ON learning_sessions FOR ALL
USING (
  child_profile_id IN (
    SELECT id FROM child_profiles WHERE parent_id = auth.uid()
  )
);
```

### 4.3 API Route Protection Pattern

```typescript
export async function GET(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // ANON only!
    { cookies }
  );
  
  // 1. Verify session FIRST
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 });
  }
  
  // 2. RLS automatically scopes data
  const { data } = await supabase.from('child_profiles').select('*');
  
  // 3. Never expose internal errors
  return Response.json(data);
}
```

---

## 5. PAYMENT SECURITY (STRIPE)

### 5.1 Cardinal Rules

```
NEVER:
✗ Store card numbers, CVV, or payment details
✗ Pass payment data through your servers
✗ Store Stripe secret key in client code
✗ Trust client-side price calculations

ALWAYS:
✓ Use Stripe Checkout or Elements
✓ Verify webhook signatures
✓ Use idempotency keys
```

### 5.2 Webhook Security Pattern

```typescript
// /api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  // 1. ALWAYS verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // 2. Check idempotency
  const alreadyProcessed = await checkEventProcessed(event.id);
  if (alreadyProcessed) return Response.json({ received: true });
  
  // 3. Process event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleSubscriptionCreated(event.data.object);
      break;
  }
  
  // 4. Mark processed
  await markEventProcessed(event.id);
  return Response.json({ received: true });
}
```

---

## 6. INPUT VALIDATION

### 6.1 Zod Schema Pattern

```typescript
import { z } from 'zod';

const childProfileSchema = z.object({
  display_name: z.string()
    .min(1).max(20)
    .regex(/^[a-zA-Z\s'-]+$/, 'Letters only'),
  year_group: z.enum(['year4', 'year5', 'year6']),
  target_exam: z.enum(['gl', 'cem', 'iseb'])
});

// Apply in API routes
export async function POST(request: Request) {
  const body = await request.json();
  const result = childProfileSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  // Safe to use result.data
}
```

### 6.2 XSS Prevention

```typescript
// DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// SAFE - sanitise first
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'li']
});
```

---

## 7. ERROR HANDLING & LOGGING

### 7.1 Error Response Pattern

```typescript
// NEVER expose internal details
// NEVER include PII in logs

// ❌ WRONG
console.log('User email:', user.email);
return Response.json({ error: dbError.message });

// ✅ CORRECT
console.error('[DB_ERROR]', { code: error.code, table: 'sessions' });
return Response.json({ error: 'Unable to save. Please try again.' });
```

### 7.2 Logging Rules

```typescript
// ALLOWED
console.log('[AUTH] Login', { userId: user.id, success: true });

// FORBIDDEN
console.log('Email:', user.email);
console.log('Child:', child.display_name);
console.log('Error:', JSON.stringify(error)); // May contain PII
```

---

## 8. ENVIRONMENT VARIABLES

### 8.1 Classification

```bash
# PUBLIC (safe in client)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# SECRET (server-side ONLY)
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # NEVER in client
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLAUDE_API_KEY=sk-ant-...
```

---

## 9. ICO CHILDREN'S CODE

### 9.1 Compliance Checklist

| Standard | Implementation |
|----------|----------------|
| Best interests | No dark patterns, no addictive mechanics |
| Data minimisation | First name only, no DOB/school |
| Transparency | Child-friendly privacy notice |
| Parental controls | Parents manage all settings |
| Profiling off by default | Analytics require opt-in |
| No nudge techniques | No guilt-based or FOMO nudges |

### 9.2 Child-Friendly Language

```typescript
// ❌ WRONG
"Error 500: Database timeout"

// ✅ CORRECT
"Oops! Something went wrong. Let's try again! 🔄"
```

---

## 10. QUICK REFERENCE

| ✅ DO | ❌ DON'T |
|-------|----------|
| Compute in database | Compute in React |
| Use RLS on every table | Trust client-side auth |
| Validate all inputs with Zod | Pass raw input to queries |
| Use Stripe Checkout | Handle card details |
| Log error codes only | Log PII or full errors |
| Use env vars for secrets | Commit .env files |
| Verify webhook signatures | Trust webhook payloads |
| Collect minimal child data | Ask for DOB/surname/school |
| Check tiers server-side | Check tiers in React |

---

## 11. ENFORCEMENT CHECKLIST

Before merging any PR:

```
[ ] No Array.reduce/filter for computing totals in React
[ ] No percentage/score calculations in React
[ ] No tier/subscription checks in React
[ ] All aggregations use database views
[ ] API routes only fetch and return
[ ] RLS enabled on all user tables
[ ] No service role key in client code
[ ] All inputs validated with Zod
[ ] No PII in console statements
[ ] Webhook signatures verified
```

---

*This document is the source of truth for Ember Ascent development. No exceptions.*

# Ember Ascent Security & Compliance Audit Report
**Date**: January 22, 2026  
**Auditor**: AI Security Analysis System  
**Codebase Version**: 0.1.0  
**Regulatory Framework**: UK GDPR, ICO Children's Code, PCI DSS (via Stripe), OWASP Top 10

---

## EXECUTIVE SUMMARY

**Total Issues Found**: 11  
- **CRITICAL**: 2  
- **HIGH**: 4  
- **MEDIUM**: 3  
- **LOW**: 2  

**Overall Compliance Status**: **CONDITIONAL PASS**

The Ember Ascent platform demonstrates str -ong foundational security with comprehensive RLS policies, proper authentication patterns, and good data minimization practices. However, **critical issues must be resolved before production launch**, particularly around error message exposure, rate limiting, and security headers.

### Top 3 Priorities (Address Immediately)

1. **CRITICAL**: Implement rate limiting across all API endpoints to prevent abuse
2. **CRITICAL**: Add security headers (CSP, HSTS, etc.) to middleware
3. **HIGH**: Remove internal error details from API responses

---

## CRITICAL FINDINGS (Must fix before launch)

### 1. Missing Rate Limiting Infrastructure
**Severity**: CRITICAL  
**Location**: `middleware.ts` (line 1-20)  
**Issue**: No rate limiting implemented on any API endpoints  
**Risk**: 
- Brute force attacks on authentication endpoints
- API abuse and resource exhaustion
- DDoS vulnerability
- Unauthorized data scraping

**Recommendation**: 
Implement rate limiting using Upstash Redis or similar:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
})

const rateLimits: Record<string, { requests: number; window: string }> = {
  '/api/auth/login': { requests: 5, window: '1 m' },
  '/api/auth/signup': { requests: 3, window: '1 h' },
  '/api/questions': { requests: 200, window: '1 m' },
  '/api/adaptive': { requests: 100, window: '1 m' },
  '/api/analytics': { requests: 50, window: '1 m' },
}

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const path = request.nextUrl.pathname
  
  // Apply rate limiting for API routes
  if (path.startsWith('/api/')) {
    const limit = rateLimits[path] || { requests: 100, window: '1 m' }
    const identifier = `${ip}:${path}`
    
    const { success, remaining, reset } = await ratelimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(limit.requests),
            'X-RateLimit-Remaining': String(remaining),
          }
        }
      )
    }
  }
  
  return await updateSession(request)
}
```

**Dependencies to add**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

### 2. Missing Security Headers
**Severity**: CRITICAL  
**Location**: `middleware.ts`, `next.config.js`  
**Issue**: No Content Security Policy, HSTS, or other security headers configured  
**Risk**:
- XSS attacks possible
- Clickjacking vulnerability
- MIME-sniffing attacks
- No HTTPS enforcement
- Missing browser security protections

**Recommendation**:
Add comprehensive security headers:

```typescript
// middleware.ts - Add after rate limiting check
export async function middleware(request: NextRequest) {
  // ... rate limiting code ...
  
  const response = await updateSession(request)
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com",
      "font-src 'self' data:",
    ].join('; ')
  )
  
  // HSTS - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}
```

---

## HIGH PRIORITY FINDINGS (Fix within 1 week)

### 3. Internal Error Details Exposed in API Responses
**Severity**: HIGH  
**Location**: Multiple API routes
- `app/api/adaptive/next-question/route.ts` (line 53, 127)
- `app/api/analytics/learning-health/route.ts` (line 118)

**Issue**: Error messages and stack traces exposed to client  
**Risk**:
- Information disclosure about internal system architecture
- Database schema leakage
- Potential exploit vector discovery
- Violates ICO transparency requirements (confusing error messages)

**Current Code**:
```typescript
// BAD - Exposes internal error details
return NextResponse.json(
  { error: 'Failed to fetch performance data', details: trackerError.message },
  { status: 500 }
)
```

**Recommendation**:
Create standardized error handler:

```typescript
// lib/errors/apiErrors.ts
export class AppError extends Error {
  constructor(
    public userMessage: string,
    public internalCode: string,
    public statusCode: number = 500
  ) {
    super(userMessage)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    console.error(`[${error.internalCode}]`)
    return NextResponse.json(
      { error: error.userMessage },
      { status: error.statusCode }
    )
  }
  
  // Unknown error - never expose details
  console.error('[UNKNOWN_ERROR]', error instanceof Error ? error.message : String(error))
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}

// Usage in routes
try {
  // ... code ...
} catch (error) {
  return handleApiError(error)
}
```

---

### 4. PII in Script Console Logs
**Severity**: HIGH  
**Location**: Multiple script files
- `scripts/check-subscription.ts` (lines 28-30) - Logs user emails
- `scripts/upgrade-to-ascent.ts` (lines 39-41, 58-60) - Logs user emails
- `scripts/add-children.ts` (line 21) - Logs child names

**Issue**: Personally Identifiable Information logged to console  
**Risk**:
- PII exposure in terminal history
- Potential log aggregation systems capturing PII
- Violates UK GDPR data protection principles
- ICO Children's Code violation

**Recommendation**:
Remove all PII from logs:

```typescript
// BAD
console.log(`  Email: ${profile.email}`)
console.log(`  Tier: ${profile.subscription_tier}`)

// GOOD
console.log(`Profile updated:`, {
  id: profile.id.substring(0, 8) + '...',
  tier: profile.subscription_tier,
  status: profile.subscription_status
})
```

Apply to all script files. Scripts should use user IDs only, never emails or names.

---

### 5. Missing Input Validation Schema
**Severity**: HIGH  
**Location**: Multiple API routes without Zod validation
- `app/api/adaptive/next-question/route.ts`
- Most analytics API routes

**Issue**: Direct use of query parameters without schema validation  
**Risk**:
- SQL injection if parameters used in raw queries
- Type confusion attacks
- Unexpected behavior from malformed input
- No protection against oversized inputs

**Recommendation**:
Implement Zod validation for all API routes:

```typescript
// lib/validations/api.ts
import { z } from 'zod'

export const childIdSchema = z.object({
  childId: z.string().uuid('Invalid child ID format'),
})

export const adaptiveRequestSchema = z.object({
  childId: z.string().uuid(),
  topicId: z.string().min(1).max(50),
  sessionId: z.string().uuid().optional(),
})

export const analyticsRequestSchema = z.object({
  childId: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(365).default(30),
})

// Usage in routes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const validation = adaptiveRequestSchema.safeParse({
    childId: searchParams.get('childId'),
    topicId: searchParams.get('topicId'),
    sessionId: searchParams.get('sessionId'),
  })
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request parameters', details: validation.error.flatten() },
      { status: 400 }
    )
  }
  
  const { childId, topicId, sessionId } = validation.data
  // ... rest of logic ...
}
```

---

### 6. No Webhook Signature Verification (Stripe)
**Severity**: HIGH  
**Location**: Stripe webhooks not yet implemented  
**Issue**: When Stripe webhooks are implemented, must include signature verification  
**Risk**:
- Forged webhook events
- Unauthorized subscription changes
- Financial fraud
- Account manipulation

**Recommendation**:
When implementing Stripe webhooks, MUST include:

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  // CRITICAL: Verify signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[STRIPE_WEBHOOK] Signature verification failed')
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  // Check for duplicate events (idempotency)
  const isProcessed = await checkEventProcessed(event.id)
  if (isProcessed) {
    return Response.json({ received: true })
  }
  
  // Process event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    // ... other events
  }
  
  await markEventProcessed(event.id)
  return Response.json({ received: true })
}
```

---

## MEDIUM PRIORITY FINDINGS (Fix within 1 month)

### 7. Console.log Statements in Production Code
**Severity**: MEDIUM  
**Location**: `lib/analytics/studyPlanGenerator.ts` (line 426)

**Issue**: Debug console.log in production code path  
**Risk**:
- Performance impact (console.log is slow)
- Potential PII logging if child data included
- Unprofessional in production

**Current Code**:
```typescript
console.log('Plan adjustment for child:', childId, sessionResult)
```

**Recommendation**:
Remove or convert to proper logging:

```typescript
// Remove entirely, OR use proper logger:
if (process.env.NODE_ENV === 'development') {
  console.log('[StudyPlan] Adjustment', { childId: childId.substring(0, 8) + '...' })
}
```

---

### 8. Missing CORS Configuration Documentation
**Severity**: MEDIUM  
**Location**: `next.config.js`, API routes  
**Issue**: No explicit CORS configuration visible  
**Risk**:
- Potential for overly permissive CORS in future
- No documented policy for allowed origins

**Recommendation**:
Document CORS policy and add explicit configuration:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

---

### 9. No Centralized Logging Strategy
**Severity**: MEDIUM  
**Location**: Application-wide  
**Issue**: Inconsistent logging, no centralized error tracking configured  
**Risk**:
- Difficult to debug production issues
- No alerting on critical errors
- Potential PII in logs if not standardized

**Recommendation**:
Implement Sentry with PII scrubbing:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  
  // CRITICAL: Scrub PII
  beforeSend(event) {
    if (event.user) {
      delete event.user.email
      delete event.user.username
      delete event.user.ip_address
    }
    
    if (event.request?.data) {
      event.request.data = '[REDACTED]'
    }
    
    return event
  },
  
  // Never send PII
  sendDefaultPii: false,
  
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
})
```

---

## LOW PRIORITY & INFORMATIONAL

### 10. Child Name Validation Could Be Stronger
**Severity**: LOW  
**Location**: `supabase/migrations/001_initial_schema.sql` (line 65)

**Issue**: Name field allows special characters and numbers  
**Risk**: Data quality issues, potential XSS if not escaped (currently safe due to React)

**Current Constraint**:
```sql
CONSTRAINT valid_name CHECK (LENGTH(TRIM(name)) >= 2)
```

**Recommendation**:
Add pattern validation:

```sql
ALTER TABLE children DROP CONSTRAINT valid_name;
ALTER TABLE children ADD CONSTRAINT valid_name 
  CHECK (LENGTH(TRIM(name)) >= 2 AND name ~ '^[A-Za-z]');
```

---

### 11. Target School Field May Violate Data Minimization
**Severity**: LOW  
**Location**: `supabase/migrations/001_initial_schema.sql` (line 59)

**Issue**: `target_school TEXT` field could collect more information than necessary  
**Risk**: 
- ICO Children's Code data minimization principle
- Potential re-identification risk

**Recommendation**:
Consider removing or replacing with less specific field:

```sql
-- Instead of specific school name
target_school TEXT

-- Use exam board/region only
exam_board TEXT CHECK (exam_board IN ('GL', 'CEM', 'ISEB', null))
target_region TEXT -- e.g., 'Southeast', 'Northwest'
```

---

## RECOMMENDED NEXT STEPS

### Immediate Actions (24-48 hours) - BLOCKING FOR LAUNCH

1. **Implement rate limiting** across all API endpoints
2. **Add security headers** to middleware
3. **Remove error.message** from all API error responses
4. **Clean up PII** from script console.log statements

### Short-term Improvements (1-2 weeks)

5. Implement **Zod validation** for all API route inputs
6. Set up **Sentry** with PII scrubbing for production monitoring
7. Add **Stripe webhook** signature verification (when implementing payments)
8. Document **CORS policy** and add explicit configuration
9. Create **standardized error handler** utility
10. Remove or properly gate **console.log** statements in lib files

### Long-term Hardening (Ongoing)

11. Implement **audit logging** for sensitive operations (subscription changes, data deletion)
12. Set up **automated security scanning** in CI/CD (npm audit, OWASP ZAP)
13. Regular **dependency updates** and vulnerability monitoring
14. Penetration testing before public launch
15. Regular **RLS policy audits** to ensure no gaps
16. Implement **session timeout** warnings for user experience
17. Add **CAPTCHA** to authentication endpoints if abuse detected

---

## COMPLIANCE CHECKLIST STATUS

### ✅ UK GDPR: **PASS**
- ✅ Data minimization implemented (first name only for children)
- ✅ RLS policies enforce data access control
- ✅ No unnecessary PII collection
- ✅ Parent-only authentication model
- ⚠️ **Action needed**: Implement right to erasure endpoint
- ⚠️ **Action needed**: Document data retention policy

### ⚠️ ICO Children's Code: **PARTIAL**
- ✅ Age-appropriate design (no dark patterns visible)
- ✅ Parental controls (parent-only accounts)
- ✅ Data minimization for children
- ⚠️ **Action needed**: Add explicit parental consent flow
- ⚠️ **Action needed**: Child-friendly error messages (currently generic)
- ⚠️ **Action needed**: Privacy notice review for age-appropriateness

### ✅ PCI DSS (via Stripe): **PASS** 
- ✅ No card data stored in database
- ✅ Stripe Elements/Checkout to be used (per architecture)
- ✅ Service role key properly secured (not in client)
- ⚠️ **Action needed**: Webhook signature verification when implemented

### ⚠️ OWASP Top 10: **PARTIAL**
- ✅ A01 (Broken Access Control): RLS policies comprehensive
- ⚠️ A02 (Cryptographic Failures): HTTPS must be enforced (HSTS header missing)
- ⚠️ A03 (Injection): Need Zod validation on API inputs
- ✅ A04 (Insecure Design): Architecture follows security best practices
- ⚠️ A05 (Security Misconfiguration): Missing security headers
- ✅ A06 (Vulnerable Components): Dependencies appear up to date
- ✅ A07 (Authentication Failures): Supabase Auth is robust
- ⚠️ A08 (Data Integrity Failures): Need webhook signature verification
- ⚠️ A09 (Security Logging): No centralized logging/monitoring
- ⚠️ A10 (SSRF): Not applicable (no outbound requests to user-controlled URLs)

---

## POSITIVE FINDINGS (Commendations)

The following security practices are **well implemented**:

1. ✅ **Comprehensive RLS policies** on all user data tables
2. ✅ **Proper authentication checks** in API routes (auth.getUser() before data access)
3. ✅ **Data minimization** - no collection of child surnames, DOB, etc.
4. ✅ **Parent-only authentication** model (children have no credentials)
5. ✅ **Service role key** properly secured (only in server-side scripts)
6. ✅ **Environment variables** properly configured (.env.local.example provided)
7. ✅ **.gitignore** includes .env files
8. ✅ **UUID primary keys** (not sequential integers)
9. ✅ **Foreign key constraints** with CASCADE deletes
10. ✅ **No dangerouslySetInnerHTML** found in codebase
11. ✅ **Supabase client properly configured** (anon key only in client code)
12. ✅ **Database indexes** on frequently queried columns

---

## CONCLUSION

Ember Ascent demonstrates **strong security fundamentals** with excellent data protection practices, comprehensive RLS policies, and proper authentication patterns. The platform is well-positioned for UK GDPR and ICO Children's Code compliance.

**However, the 2 CRITICAL issues (rate limiting and security headers) MUST be resolved before production launch.** These are blocking issues that expose the platform to abuse and attack.

The HIGH priority issues should be addressed within 1 week to ensure production readiness and full regulatory compliance.

**Estimated effort to resolve all critical/high issues**: 2-3 developer days

**Recommended launch readiness timeline**: 
- Critical fixes: 1-2 days
- High priority fixes: 3-5 days  
- Testing & validation: 2-3 days
- **Total: 1-2 weeks to production-ready state**

---

**Report Generated**: January 22, 2026  
**Next Review Recommended**: After critical fixes implemented, then quarterly thereafter

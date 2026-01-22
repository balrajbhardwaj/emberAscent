# Ember Ascent: Refactoring Tasks & Execution Plan

**Created**: January 22, 2026  
**Target**: Production-ready compliance with architecture guidelines  
**Estimated Duration**: 10-13 developer days  
**Reference Documents**: `architecture-guidelines.md`, `SECURITY_AUDIT_REPORT.md`, `commit_policy.md`

---

## 📊 Overview

| Priority | Tasks | Estimated Days | Status |
|----------|-------|----------------|--------|
| 🔴 Critical | 4 | 2-3 days | Not Started |
| 🟠 High | 3 | 3-5 days | Not Started |
| 🟡 Medium | 4 | 2-3 days | Not Started |
| 🟢 Low | 3 | 1-2 days | Not Started |

---

## 🔴 CRITICAL PRIORITY - Week 1 (Days 1-3)

### Day 1: Security Foundations

#### Task 1.1: Remove PII from Console Logs (2 hours)
**Priority**: CRITICAL  
**Issue**: UK GDPR/ICO Children's Code violation  
**Files**: `scripts/check-subscription.ts`, `scripts/upgrade-to-ascent.ts`, `scripts/validate-emma-analytics.ts`

**Agent Prompt**:
```
Review and remove ALL personally identifiable information from console.log statements in the following files:
- scripts/check-subscription.ts (lines 28-30: remove email logging)
- scripts/upgrade-to-ascent.ts (lines 39-41, 58-60: remove email logging)
- scripts/validate-emma-analytics.ts (line 44: remove child name logging)

Replace PII with truncated IDs only. Follow this pattern:
- BAD: console.log('Email:', user.email)
- GOOD: console.log('User ID:', user.id.substring(0, 8) + '...')

After fixing these files, run a codebase-wide search for console.log statements that may contain email, password, name, or child data patterns. Report findings.

Reference: architecture-guidelines.md section 7.2 and SECURITY_AUDIT_REPORT.md finding #4.
```

**Success Criteria**:
- [ ] No console.log statements contain email addresses
- [ ] No console.log statements contain child names
- [ ] All user references use truncated IDs only
- [ ] Codebase search returns no PII patterns in logs

---

#### Task 1.2: Create Standardized Error Handler (3 hours)
**Priority**: CRITICAL  
**Issue**: Internal error details exposed to clients  
**Files**: New file `lib/errors/apiErrors.ts`, update all API routes

**Agent Prompt**:
```
Create a standardized error handling system for API routes:

1. Create lib/errors/apiErrors.ts with:
   - AppError class with userMessage, internalCode, statusCode
   - AuthError class (extends AppError) - 401 status
   - NotFoundError class (extends AppError) - 404 status
   - ValidationError class (extends AppError) - 400 status
   - handleApiError() function that never exposes internal details

2. Update these API routes to use the new error handler:
   - app/api/analytics/dashboard/route.ts
   - app/api/adaptive/next-question/route.ts
   - app/api/analytics/learning-health/route.ts
   - app/api/analytics/benchmark/route.ts

3. Ensure all error responses follow this pattern:
   - Internal errors: Log error code + sanitized message, return generic user message
   - Known errors: Return user-friendly message with appropriate status code
   - NEVER return error.message or stack traces to client

Reference: SECURITY_AUDIT_REPORT.md finding #3, architecture-guidelines.md section 7.
```

**Success Criteria**:
- [ ] lib/errors/apiErrors.ts exists with complete error classes
- [ ] All API routes use handleApiError()
- [ ] No API responses contain error.message or internal details
- [ ] Error logs use internal codes only

---

### Day 2: Security Headers & Rate Limiting

#### Task 2.1: Add Security Headers to Middleware (2 hours)
**Priority**: CRITICAL  
**Issue**: Missing browser security protections  
**Files**: `middleware.ts`

**Agent Prompt**:
```
Add comprehensive security headers to middleware.ts:

1. After session update, add these headers to the response:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: camera=(), microphone=(), geolocation=()
   - Content-Security-Policy with these directives:
     * default-src 'self'
     * script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
     * style-src 'self' 'unsafe-inline'
     * img-src 'self' data: https:
     * connect-src 'self' https://*.supabase.co https://api.stripe.com
     * frame-src https://js.stripe.com
     * font-src 'self' data:

2. Add HSTS header for production only:
   - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   - Check process.env.NODE_ENV === 'production'

Reference: SECURITY_AUDIT_REPORT.md finding #2, architecture-guidelines.md section 8.
```

**Success Criteria**:
- [ ] All security headers present in middleware
- [ ] CSP allows necessary external resources (Stripe, Supabase)
- [ ] HSTS only enabled in production
- [ ] Headers applied to all responses

---

#### Task 2.2: Implement Rate Limiting (4 hours)
**Priority**: CRITICAL  
**Issue**: No protection against brute force or API abuse  
**Files**: `middleware.ts`, `package.json`

**Agent Prompt**:
```
Implement rate limiting using Upstash Redis:

1. Install dependencies:
   npm install @upstash/ratelimit @upstash/redis

2. Update middleware.ts to add rate limiting:
   - Import Ratelimit and Redis from @upstash packages
   - Configure rate limits per endpoint:
     * /api/auth/login: 5 requests per 1 minute
     * /api/auth/signup: 3 requests per 1 hour
     * /api/questions: 200 requests per 1 minute
     * /api/adaptive: 100 requests per 1 minute
     * /api/analytics: 50 requests per 1 minute
     * Default: 100 requests per 1 minute
   
   - Apply rate limiting BEFORE session update
   - Return 429 status with Retry-After header on limit exceeded
   - Include X-RateLimit-Limit and X-RateLimit-Remaining headers

3. Use IP address as identifier: request.ip ?? '127.0.0.1'

4. Create .env.example entry for:
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

Reference: SECURITY_AUDIT_REPORT.md finding #1.

Note: User will need to set up Upstash Redis account and provide credentials.
```

**Success Criteria**:
- [ ] Dependencies installed
- [ ] Rate limiting active on all API routes
- [ ] 429 responses include retry information
- [ ] .env.example updated with Upstash variables

---

### Day 3: Input Validation

#### Task 3.1: Add Zod Validation to API Routes (4 hours)
**Priority**: HIGH  
**Issue**: Direct use of query parameters without validation  
**Files**: New file `lib/validations/api.ts`, multiple API routes

**Agent Prompt**:
```
Implement Zod validation for all API routes:

1. Create lib/validations/api.ts with these schemas:
   - childIdSchema: z.object({ childId: z.string().uuid() })
   - analyticsRequestSchema: includes childId, range, days (1-365)
   - adaptiveRequestSchema: includes childId, topicId, sessionId (optional)
   - questionAttemptSchema: for submitting answers
   - sessionCreateSchema: for creating practice sessions

2. Update these API routes to validate inputs FIRST:
   - app/api/analytics/dashboard/route.ts
   - app/api/analytics/benchmark/route.ts
   - app/api/adaptive/next-question/route.ts
   - All routes in app/api/analytics/*

3. Validation pattern:
   ```typescript
   const validation = schema.safeParse(request.body or searchParams)
   if (!validation.success) {
     return NextResponse.json(
       { error: 'Invalid input', details: validation.error.flatten() },
       { status: 400 }
     )
   }
   const validatedData = validation.data
   ```

4. Install zod if not present: npm install zod

Reference: SECURITY_AUDIT_REPORT.md finding #5, architecture-guidelines.md section 6.1.
```

**Success Criteria**:
- [ ] lib/validations/api.ts exists with all schemas
- [ ] All API routes validate inputs before processing
- [ ] Invalid inputs return 400 with clear error messages
- [ ] Zod dependency installed

---

## 🟠 HIGH PRIORITY - Week 2 (Days 4-8)

### Day 4-5: Refactor Client-Side Calculations

#### Task 4.1: Move Analytics Calculations to Database (8 hours)
**Priority**: HIGH  
**Issue**: MAJOR architecture violation - calculations in React components  
**Files**: Multiple analytics components, new database functions

**Agent Prompt**:
```
This is a CRITICAL architecture violation. All calculations MUST be in the database layer.

PHASE 1 - Identify Violations (2 hours):
Scan these files and list ALL client-side calculations (reduce, filter for aggregation, mathematical operations):
- components/analytics/PerformanceTables.tsx (sortedData calculation)
- components/analytics/GrowthChart.tsx (stats calculation in useMemo)
- components/analytics/AnalyticsDashboard2.tsx (totalQuestions reduce, overallAccuracy)
- app/api/analytics/benchmark/route.ts (aggregation logic)
- lib/analytics/aggregator.ts (ALL functions)

PHASE 2 - Create Database Functions (3 hours):
For each calculation found, create a PostgreSQL function in a new migration file:
- supabase/migrations/016_move_client_calculations.sql

Functions should return pre-computed results that components simply display.

PHASE 3 - Update Components (3 hours):
Refactor components to:
1. Fetch pre-computed data from API (which calls DB functions)
2. ONLY format data for display (toLocaleString, date formatting)
3. Remove ALL reduce(), filter(), map() used for aggregation
4. Remove ALL mathematical operations (sum, average, percentage calculations)

Allowed in React: toLocaleString(), toLocaleDateString(), string truncation, UI sorting (for display order only)
Forbidden in React: sum, average, count, percentile, accuracy calculations

Reference: architecture-guidelines.md section 2 (THE GOLDEN RULE).
```

**Success Criteria**:
- [ ] All aggregations moved to database functions
- [ ] Components only display pre-computed data
- [ ] No Array.reduce/filter for calculations in React
- [ ] No mathematical operations in React
- [ ] Migration file creates all necessary DB functions

---

### Day 6: Subscription Tier Checks

#### Task 6.1: Move Tier Checks to Server Side (3 hours)
**Priority**: HIGH  
**Issue**: Client-side tier checks can be bypassed  
**Files**: `components/analytics/FeatureComparison.tsx`, create new API middleware

**Agent Prompt**:
```
Client-side subscription checks are a security vulnerability. Fix:

1. Remove ALL client-side tier checks from:
   - components/analytics/FeatureComparison.tsx (Button disabled prop)
   - Any component using user.tier or profile.subscription_tier for logic

2. Create server-side tier verification:
   - Add a helper function in lib/subscription/tierCheck.ts
   - Function should verify tier from database (via RLS-protected query)
   - Never trust client-provided tier information

3. Update API routes to verify tier BEFORE returning premium data:
   - app/api/analytics/benchmark/route.ts (requires Ascent+)
   - Any premium analytics endpoints

4. Pattern for components:
   - Components can display tier for UI purposes
   - But premium features must call API
   - API verifies tier server-side before returning data
   - Return 403 Forbidden if tier insufficient

Reference: architecture-guidelines.md section 2.8, SECURITY_AUDIT_REPORT.md.
```

**Success Criteria**:
- [ ] No tier-based logic in React components
- [ ] All premium API endpoints verify tier server-side
- [ ] Tier verification uses database query, not client data
- [ ] 403 responses for insufficient tier

---

### Day 7: Code Consolidation

#### Task 7.1: Consolidate Duplicate Components (2 hours)
**Priority**: MEDIUM  
**Issue**: Two analytics dashboard components exist  
**Files**: `components/analytics/AnalyticsDashboard.tsx`, `components/analytics/AnalyticsDashboard2.tsx`

**Agent Prompt**:
```
Two analytics dashboard components exist. Consolidate:

1. Compare AnalyticsDashboard.tsx vs AnalyticsDashboard2.tsx:
   - Which is more complete?
   - Which follows architecture guidelines better?
   - Which is actually being used?

2. Choose canonical version (likely AnalyticsDashboard2.tsx based on recent updates)

3. Delete the unused version

4. Search entire codebase for imports of deleted component

5. Update all imports to use canonical component

6. Verify no broken imports remain

Report which component you chose to keep and why.
```

**Success Criteria**:
- [ ] Only one AnalyticsDashboard component exists
- [ ] All imports updated
- [ ] No broken references
- [ ] Commit explains decision

---

#### Task 7.2: Remove Dead Code (2 hours)
**Priority**: MEDIUM  
**Issue**: Unused utility files and functions  
**Files**: `lib/analytics/aggregator.ts`, unused scripts

**Agent Prompt**:
```
Remove dead code and unused utilities:

1. Check if lib/analytics/aggregator.ts is used anywhere:
   - Search for imports of this file
   - If calculations moved to database (Task 4.1), this should be deleted
   - If still needed, document why it violates architecture guidelines

2. Review scripts/ directory:
   - Move development scripts to scripts/dev/
   - Move admin scripts to scripts/admin/
   - Delete scripts that are no longer relevant
   - Add README.md to each subdirectory explaining purpose

3. Search for unused imports:
   - Run ESLint with unused-imports rule
   - Remove unused imports across codebase

4. Check for old migration attempts that failed (e.g., duplicate migrations)

Report all files deleted and moved.
```

**Success Criteria**:
- [ ] lib/analytics/aggregator.ts deleted or justified
- [ ] Scripts organized into subdirectories
- [ ] No unused imports
- [ ] Old migrations cleaned up

---

### Day 8: Documentation

#### Task 8.1: Add JSDoc to All Exported Functions (4 hours)
**Priority**: MEDIUM  
**Issue**: Missing function documentation  
**Files**: All `app/api/**/*.ts`, `lib/**/*.ts`

**Agent Prompt**:
```
Add comprehensive JSDoc documentation following the standards in copilot-instructions.md:

1. Add JSDoc to all exported functions in:
   - app/api/**/*.ts (all route handlers)
   - lib/**/*.ts (all utility functions)
   - Database function files (*.sql with COMMENT ON FUNCTION)

2. JSDoc format:
   /**
    * Brief description of what function does
    * 
    * Detailed explanation if complex logic involved
    * 
    * @param paramName - Description of parameter
    * @returns Description of return value
    * @throws Description of errors (or "Never throws - returns error object")
    * 
    * @example
    * const result = await functionName(param)
    */

3. For API routes, document:
   - Authentication requirements
   - Required query params or body
   - Response format
   - Error cases

4. For database functions, add SQL comments:
   COMMENT ON FUNCTION function_name IS 'Description';

Reference: copilot-instructions.md Documentation Standards section.
```

**Success Criteria**:
- [ ] All exported functions have JSDoc
- [ ] All API routes documented
- [ ] Database functions have comments
- [ ] Documentation follows standard format

---

## 🟡 MEDIUM PRIORITY - Week 3 (Days 9-11)

### Day 9: Error Handling Standardization

#### Task 9.1: Audit and Fix Error Handling Patterns (3 hours)
**Priority**: MEDIUM  
**Issue**: Inconsistent error handling across codebase  
**Files**: All API routes, React components with try/catch

**Agent Prompt**:
```
Standardize error handling across the entire application:

1. Audit all API routes for error handling:
   - Ensure ALL routes have try/catch blocks
   - Ensure ALL routes use handleApiError() from Task 1.2
   - Check for inconsistent error response formats

2. Audit React components for error handling:
   - Check all useEffect hooks with async operations
   - Ensure error states are displayed to users
   - Verify loading states exist before async operations

3. Check for anti-patterns:
   - .catch(console.error) - should use proper error handling
   - Empty catch blocks
   - Swallowed errors
   - Error messages without context

4. Create consistent pattern:
   - API: try/catch with handleApiError
   - React: useState for error, display error message to user
   - Always log errors internally with codes

Report all files updated and patterns fixed.
```

**Success Criteria**:
- [ ] All API routes have try/catch
- [ ] All API routes use handleApiError
- [ ] React components display error states
- [ ] No empty catch blocks or swallowed errors

---

### Day 10: Type Safety

#### Task 10.1: Fix TypeScript Type Issues (3 hours)
**Priority**: MEDIUM  
**Issue**: Type casts and loose typing  
**Files**: Multiple files with `as any` casts

**Agent Prompt**:
```
Improve TypeScript type safety:

1. Find and fix all 'as any' type casts:
   - Search codebase for 'as any'
   - Replace with proper types
   - Create interfaces where needed

2. Notable fixes needed:
   - app/api/analytics/benchmark/route.ts: (child as any).year_group
   - profile type assertions in multiple files

3. Review optional chaining usage:
   - Excessive ?. may indicate missing null checks
   - Add proper type guards where needed

4. Check database query types:
   - Ensure Supabase queries have proper return types
   - Use generated types from supabase/types.ts

5. Enable stricter TypeScript settings if not already:
   - strict: true
   - strictNullChecks: true
   - noImplicitAny: true

Report all type issues fixed and any new interfaces created.
```

**Success Criteria**:
- [ ] No 'as any' casts remain
- [ ] All database queries properly typed
- [ ] Strict TypeScript settings enabled
- [ ] Type errors resolved

---

### Day 11: README Files

#### Task 11.1: Create Directory README Files (2 hours)
**Priority**: LOW  
**Issue**: Missing documentation for major directories  
**Files**: New README.md files in multiple directories

**Agent Prompt**:
```
Create README.md files for major directories as specified in copilot-instructions.md:

1. lib/supabase/README.md:
   - Explain client vs server Supabase clients
   - Document when to use each
   - Show examples of common patterns
   - Explain RLS and how it affects queries

2. types/README.md:
   - Overview of type system
   - Explanation of database types vs app types
   - Document naming conventions
   - Show how to regenerate types from Supabase

3. supabase/migrations/README.md:
   - Migration workflow
   - How to create new migrations
   - Numbering convention
   - Rollback procedures
   - Link to Supabase dashboard for execution

4. scripts/README.md:
   - Explain dev vs admin scripts
   - Document which scripts use service role key
   - Provide usage examples
   - Add warnings about production use

Each README should be concise but complete.
```

**Success Criteria**:
- [ ] All four README files created
- [ ] Each README has clear examples
- [ ] Documentation is developer-friendly
- [ ] Links to relevant resources included

---

## 🟢 LOW PRIORITY - Ongoing (Days 12+)

### Day 12: Loading States & UX Polish

#### Task 12.1: Audit Loading States (2 hours)
**Priority**: LOW  
**Issue**: Ensure all async operations have loading states  
**Files**: All React components with data fetching

**Agent Prompt**:
```
Ensure every async operation has proper loading states:

1. Audit all components using:
   - useEffect with async functions
   - fetch() calls
   - Supabase queries
   - Custom hooks returning isLoading

2. Verify each has:
   - Skeleton component during loading
   - Error state if fetch fails
   - Empty state if no data returned
   - Proper loading prop passed to child components

3. Use shadcn/ui Skeleton component for loading states

4. Check these areas specifically:
   - Analytics dashboard during data fetch
   - Practice session loading
   - Question loading in quiz
   - Profile/settings pages

Report components missing loading states.
```

**Success Criteria**:
- [ ] All async operations have loading states
- [ ] Skeleton components used consistently
- [ ] Error states displayed to users
- [ ] Empty states exist for no data

---

### Day 13: Final Cleanup

#### Task 13.1: Final Code Cleanup (3 hours)
**Priority**: LOW  
**Issue**: Various cleanup items  
**Files**: Multiple

**Agent Prompt**:
```
Final cleanup pass:

1. Remove all console.log statements from production code:
   - Keep only in development-specific files
   - Replace with proper logging service if needed
   - Check components and API routes

2. Clean up imports:
   - Remove unused imports
   - Organize import order (React, Next, third-party, local)
   - Use absolute imports consistently

3. Format code:
   - Run Prettier on entire codebase
   - Fix any linting errors
   - Ensure consistent code style

4. Update .gitignore if needed:
   - Ensure .env files excluded
   - Check for build artifacts
   - Verify logs directory ignored

5. Clean up migration numbering:
   - Ensure sequential numbering
   - No duplicate or conflicting migrations
   - Update migration README if needed

6. Dependencies:
   - Run npm audit
   - Update patch versions for security fixes
   - Remove unused dependencies

Report cleanup summary.
```

**Success Criteria**:
- [ ] No console.log in production code
- [ ] Imports organized and cleaned
- [ ] Code formatted consistently
- [ ] Dependencies audited and updated

---

## 📋 VERIFICATION CHECKLIST

Before considering refactoring complete, verify:

### Security
- [ ] No PII in console logs (grep for email, password, name patterns)
- [ ] All API routes use standardized error handler
- [ ] Security headers present in all responses
- [ ] Rate limiting active on all API routes
- [ ] All inputs validated with Zod schemas
- [ ] No secrets in code (grep for api_key, secret, password)

### Architecture
- [ ] No calculations in React components (grep for .reduce, .filter for aggregation)
- [ ] No tier checks in React components
- [ ] All aggregations use database functions
- [ ] API routes only fetch and return data
- [ ] No business logic in API routes

### Code Quality
- [ ] All exported functions have JSDoc
- [ ] No TypeScript 'as any' casts
- [ ] No dead code or unused files
- [ ] Consistent error handling patterns
- [ ] All async operations have loading states

### Documentation
- [ ] README files in all major directories
- [ ] Migration guide up to date
- [ ] Commit messages follow commit_policy.md
- [ ] Architecture violations documented or fixed

### Testing
- [ ] npm run build succeeds
- [ ] npm run lint passes
- [ ] TypeScript compilation succeeds (tsc --noEmit)
- [ ] All migrations run successfully
- [ ] Manual smoke test of key features

---

## 🚀 EXECUTION NOTES

### For AI Agent
- Each task includes specific file paths and line numbers
- Follow architecture-guidelines.md strictly
- Always reference security audit report for context
- Use commit_policy.md format for all commits
- Ask for clarification if instructions conflict

### For Developer
- Review agent's changes before committing
- Test locally after each task
- Run migrations in Supabase dashboard (never via CLI)
- Verify no regressions in functionality
- Tag stable builds before major refactors

### Commit Message Format
Use conventional commits as per commit_policy.md:
- `security(scope): description` for security fixes
- `refactor(scope): description` for code restructuring
- `fix(scope): description` for bug fixes
- `chore(scope): description` for cleanup

### Testing Strategy
After each day's tasks:
1. Run `npm run build`
2. Run `npm run lint`
3. Run `tsc --noEmit`
4. Manual test affected features
5. Commit with descriptive message

---

## 📞 SUPPORT REFERENCES

- **Architecture**: See `architecture-guidelines.md`
- **Security**: See `SECURITY_AUDIT_REPORT.md`
- **Commits**: See `commit_policy.md`
- **Coding**: See `.github/copilot-instructions.md`

---

**Last Updated**: January 22, 2026  
**Status**: Ready for execution  
**Next Review**: After Week 1 completion

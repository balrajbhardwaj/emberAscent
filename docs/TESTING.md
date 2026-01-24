# Ember Ascent Testing Guide

**Complete testing reference for E2E and component tests**

---

## 🚀 Quick Start

### Run Tests

```bash
# Run all passing tests (3 login tests)
npm test

# Run specific test suite
npx playwright test tests/e2e/auth/login/
npx playwright test tests/e2e/auth/signup/
npx playwright test tests/e2e/auth/setup/
npx playwright test tests/e2e/onboarding/

# Run specific test file
npx playwright test tests/e2e/auth/signup/signup-success.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug
npx playwright test --debug
```
# List all test cases without running them
npx playwright test --list

# List tests with full titles
npx playwright test --list --reporter=list

# List tests in a specific directory
npx playwright test tests/e2e/auth/ --list

# List tests matching a pattern
npx playwright test signup --list
### Test Database Setup

Tests run against **production database** with isolated test users:
- Pattern: `test.*@emberascent.dev`
- No separate test database needed
- See [Cleanup Section](#cleanup-test-data) for data management

---

## ✅ Available Test Cases

### 1. Authentication - Login (3 tests - **ALL PASSING** ✅)

**File**: [tests/e2e/auth/login/auth-login-success.spec.ts](../tests/e2e/auth/login/auth-login-success.spec.ts)

| Test ID | Test Case | Status | Duration |
|---------|-----------|--------|----------|
| E2E-AUTH-LOGIN-001a | Should successfully log in with valid credentials | ✅ PASS | ~28s |
| E2E-AUTH-LOGIN-001b | Should maintain session after page reload | ✅ PASS | ~30s |
| E2E-AUTH-LOGIN-001c | Should log out successfully | ✅ PASS | ~31s |

**Test User**: `test.sarah@emberascent.dev` / `Test123!`

**Coverage**:
- ✅ Login flow with valid credentials
- ✅ Session persistence across page reloads
- ✅ Logout functionality
- ✅ Redirect to dashboard/setup after login
- ✅ User authentication state verification

---

### 2. Authentication - Signup (9 tests - **READY TO RUN** 🎯)

**File**: [tests/e2e/auth/signup/signup-success.spec.ts](../tests/e2e/auth/signup/signup-success.spec.ts)

| Test ID | Test Case | Status | Priority |
|---------|-----------|--------|----------|
| E2E-AUTH-SIGNUP-001 | Complete signup with valid data | ✅ READY | P0 |
| E2E-AUTH-SIGNUP-002 | Redirect to setup after signup | ✅ READY | P0 |
| E2E-AUTH-SIGNUP-003 | Profile created in database | ✅ READY | P0 |

**File**: [tests/e2e/auth/signup/signup-validation.spec.ts](../tests/e2e/auth/signup/signup-validation.spec.ts)

| Test ID | Test Case | Status | Priority |
|---------|-----------|--------|----------|
| E2E-AUTH-SIGNUP-006 | Reject weak password | ✅ READY | P1 |
| E2E-AUTH-SIGNUP-007 | Reject mismatched passwords | ✅ READY | P1 |
| E2E-AUTH-SIGNUP-008 | Require terms agreement | ✅ READY | P1 |
| E2E-AUTH-SIGNUP-004 | Reject short full name | 🚧 SKIP | P2 |
| E2E-AUTH-SIGNUP-005 | Reject invalid email format | 🚧 SKIP | P2 |
| E2E-AUTH-SIGNUP-009 | Reject duplicate email | 🚧 SKIP | P2 |

**Coverage**:
- ✅ Complete signup flow (fullName, email, password, terms)
- ✅ Password validation (length, complexity)
- ✅ Password confirmation matching
- ✅ Terms & conditions checkbox
- ✅ Profile creation in database
- ✅ Redirect to setup page

---

### 3. Authentication - Child Setup (7 tests - **READY TO RUN** 🎯)

**File**: [tests/e2e/auth/setup/setup-success.spec.ts](../tests/e2e/auth/setup/setup-success.spec.ts)

| Test ID | Test Case | Status | Priority |
|---------|-----------|--------|----------|
| E2E-AUTH-SETUP-001 | Complete child setup with all fields | ✅ READY | P0 |
| E2E-AUTH-SETUP-002 | Complete setup with minimal data | ✅ READY | P0 |
| E2E-AUTH-SETUP-004 | Redirect to practice after setup | ✅ READY | P0 |
| E2E-AUTH-SETUP-003 | Select avatar from picker | 🚧 SKIP | P2 |
| E2E-AUTH-SETUP-005 | Child created in database | 🚧 SKIP | P2 |

**File**: [tests/e2e/auth/setup/setup-skip.spec.ts](../tests/e2e/auth/setup/setup-skip.spec.ts)

| Test ID | Test Case | Status | Priority |
|---------|-----------|--------|----------|
| E2E-AUTH-SETUP-010 | Skip setup and go to practice | ✅ READY | P1 |
| E2E-AUTH-SETUP-011 | Can add child later from settings | 🚧 SKIP | P2 |

**Coverage**:
- ✅ Child profile creation (name, year group, school, avatar)
- ✅ Minimal data setup (name + year group only)
- ✅ Skip setup option
- ✅ Redirect to practice dashboard
- ✅ Year group selection (3, 4, 5, 6)

---

### 4. Complete Onboarding Journey (3 tests - **READY TO RUN** 🎯)

**File**: [tests/e2e/onboarding/complete-onboarding.spec.ts](../tests/e2e/onboarding/complete-onboarding.spec.ts)

| Test ID | Test Case | Status | Priority |
|---------|-----------|--------|----------|
| E2E-ONBOARD-001 | Complete new user onboarding | ✅ READY | P1 |
| E2E-ONBOARD-002 | Returning user skips setup | ✅ READY | P1 |
| E2E-ONBOARD-003 | Unauthenticated redirect | ✅ READY | P1 |

**Coverage**:
- ✅ Full journey: Signup → Setup → Practice
- ✅ Existing user with child goes directly to practice
- ✅ Auth guard on setup page

---

### 5. Practice Module (1 test - **SKELETON ONLY**)

**File**: [tests/e2e/practice/quick-byte/quick-byte-session.spec.ts](../tests/e2e/practice/quick-byte/quick-byte-session.spec.ts)

| Test ID | Test Case | Status |
|---------|-----------|--------|
| E2E-PRACTICE-QB-001 | Should complete Quick Byte session | 🚧 SKELETON |

**Note**: Test exists but needs implementation

---

## 🧪 Test Implementation Status

### ✅ Implemented & Passing (3 tests)
- **Authentication - Login** (3/3 tests passing ~90s total)

### 🎯 Ready to Run (19 tests)
- **Authentication - Signup Success** (3 tests) - Full signup flow
- **Authentication - Signup Validation** (3 tests) - Password, terms validation
- **Authentication - Child Setup** (5 tests) - Child profile creation
- **Authentication - Setup Skip** (1 test) - Skip setup option
- **Complete Onboarding Journey** (3 tests) - End-to-end flow

### 🚧 Skeleton/Skipped (7 tests)
- Signup: Name/email validation, duplicate email (P2)
- Setup: Avatar selection, database verification (P2)
- Setup: Add child from settings (P2)

### ❌ Not Yet Created
- ❌ **Practice Module** (1 skeleton, 34 planned)
- ❌ **Analytics Module** (0 tests, 18 planned)
- ❌ **Progress Module** (0 tests, 9 planned)
- ❌ **Gamification Module** (0 tests, 8 planned)
- ❌ **Settings Module** (0 tests, 11 planned)
- ❌ **Admin Module** (0 tests, 12 planned)
- ❌ **Reviewer Module** (0 tests, 8 planned)
- ❌ **Marketing Module** (0 tests, 8 planned)

**Current Status**: 3 passing + 19 ready = **22 tests available**  
**Planned Total**: 145+ tests across 9 modules

---

## 🧩 Test Infrastructure

### Test Helpers

**Location**: `tests/helpers/`

**Auth Helpers** (`auth-helpers.ts`):
```typescript
class AuthHelper {
  login(email, password)      // Login and wait for redirect
  logout()                     // Click Sign Out button
  isAuthenticated()           // Check if user menu visible
  setupFirstChild(childData)  // Complete child setup
}
```

**Navigation Helpers** (`navigation-helpers.ts`):
- Navigate to common routes
- Wait for page loads
- Handle modals/dialogs

**Database Helpers** (`db-helpers.ts`):
- Seed test data
- Cleanup test users
- Query database state

### Test Fixtures

**Location**: `tests/fixtures/users.ts`

```typescript
TEST_USERS = {
  freeUser: {
    email: 'test.sarah@emberascent.dev',
    password: 'Test123!',
    profile: { name: 'Test Sarah' },
    children: [{ name: 'Emma', yearGroup: 5 }]
  },
  ascentUser: { /* ... */ }
}
```

---

## 📋 Test Database Strategy

### Approach: Production Database with Test Users

**Why this approach?**
- ✅ No complex auth schema setup for separate test DB
- ✅ Realistic testing environment
- ✅ Tests against actual production schema
- ✅ Easy to identify test data (`test.*@emberascent.dev`)

### Test Users

All test users follow the pattern: `test.<name>@emberascent.dev`

**Current test users in production:**
- `test.sarah@emberascent.dev` (free tier, has child profile)
- `test.emma@emberascent.dev` (for signup tests)
- `test.james@emberascent.dev` (for admin tests)

### Cleanup Test Data

#### Understanding CASCADE Deletes

Database uses **ON DELETE CASCADE**, so deleting test users automatically removes:

```
auth.users → profiles → children → [all child data]
```

**Automatically deleted:**
- profiles, children
- practice_sessions + session_responses
- question_attempts, child_question_history
- child_topic_performance, child_ember_scores
- adaptive_tracker, achievements
- All feedback records (question, session, parent)
- subscriptions, admin_log, impersonation_log

**NOT deleted (shared data):**
- questions, curriculum_objectives, question_type_taxonomy

#### Cleanup Commands

**1. Verify test data before deletion:**
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE 'test.%@emberascent.dev') as test_users,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE 'test.%@emberascent.dev') as test_profiles,
  (SELECT COUNT(*) FROM children WHERE parent_id IN 
    (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev')) as test_children,
  (SELECT COUNT(*) FROM practice_sessions WHERE child_id IN 
    (SELECT id FROM children WHERE parent_id IN 
      (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev'))) as test_sessions;
```

**2. Delete test users (CASCADE handles rest):**
```sql
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
```

**3. Verify deletion:**
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE 'test.%@emberascent.dev') as remaining_users,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE 'test.%@emberascent.dev') as remaining_profiles;
```

#### When to Run Cleanup

**Option A: After Each Test Run (Recommended)**
- Prevents data accumulation
- Clean slate for next test run
- Predictable test state

**Option B: Keep Test Users Permanently**
- Faster test execution (no signup)
- Persistent test accounts
- Data accumulates over time

Run cleanup in **Supabase Dashboard → SQL Editor** after testing.

---

## ⚙️ Configuration Files

### Playwright Config

**File**: `playwright.config.ts`

- **Browser**: Chromium only (Chrome/Edge)
- **Base URL**: `http://localhost:3000`
- **Timeout**: 30s per test
- **Retries**: 2 (on CI), 0 (local)
- **Workers**: 1 (serial execution for database tests)
- **Web Server**: Auto-starts `npm run dev`

### Environment Variables

**File**: `.env.local` (production credentials used)

```bash
# No NEXT_PUBLIC_TEST_* variables needed
# Tests use production Supabase with test users

NEXT_PUBLIC_SUPABASE_URL=https://cmujulpwvmfvpyypcfaa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**Key Learning**: `NEXT_PUBLIC_*` variables are baked at build time. Changing them requires:
1. Clear `.next/` cache: `Remove-Item -Path .next -Recurse -Force`
2. Restart dev server

---

## 🐛 Debugging Tests

### Browser Console Logs

Tests capture browser console output:
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', error => console.error('PAGE ERROR:', error));
```

### Run in Headed Mode

```bash
# See the browser as tests run
npx playwright test --headed

# Run with debugger
npx playwright test --debug
```

### Screenshot on Failure

Playwright automatically captures:
- Screenshot on failure
- Video recording
- Trace files

**Location**: `tests/reports/`

### Common Issues

**Issue**: Test can't find "Sign Out" button
- **Fix**: Check exact button text in UI
- **Helper**: `auth-helpers.ts` uses `text=Sign Out`

**Issue**: Environment variables not updating
- **Fix**: Clear `.next/` cache and rebuild
- **Cause**: `NEXT_PUBLIC_*` vars baked at build time

**Issue**: "Database error querying schema"
- **Fix**: Use production database, not separate test DB
- **Reason**: Test DB missing auth schema functions/triggers

---

## 📈 Next Steps

### Priority 1: Run Onboarding Tests ✨
```bash
# Test complete user onboarding flow
npx playwright test tests/e2e/onboarding/complete-onboarding.spec.ts

# Test signup flow
npx playwright test tests/e2e/auth/signup/signup-success.spec.ts

# Test child setup
npx playwright test tests/e2e/auth/setup/setup-success.spec.ts
```

### Priority 2: Expand Auth Tests
- [ ] Run and verify all signup tests
- [ ] Run and verify all setup tests  
- [ ] Fix any failing tests
- [ ] Add database verification tests

### Priority 3: Practice Module Tests
- [ ] Implement Quick Byte session flow
- [ ] Adaptive Practice flow
- [ ] Mock Test flow
- [ ] Question feedback submission

### Priority 4: Analytics Tests
- [ ] Dashboard data display
- [ ] Weakness heatmap
- [ ] Progress charts
- [ ] Readiness score calculation

---

## 📚 Additional Resources

### Detailed Documentation
- [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md) - Complete database setup guide (includes deprecated separate DB approach)
- [E2E_TESTING_STRATEGY.md](./E2E_TESTING_STRATEGY.md) - Comprehensive 1,700+ line strategy document
- [teslogin tests (all passing, ~28-31s each)
- ✅ 3 signup tests (ready to run)
- ✅ 3 signup validation tests (ready to run)
- ✅ 5 child setup tests (ready to run)
- ✅ 1 skip setup test (ready to run)
- ✅ 3 complete onboarding tests (ready to run)
- 🚧 1 practice skeleton test (not implemented)

**Total Available**: 22 tests (3 passing + 19 ready)

**Recommended First Run:**
```bash
# Test the complete onboarding journey
npx playwright test tests/e2e/onboarding/complete-onboarding.spec.ts --headed
```

**Expected for login tests:**
```
Running 3 tests using 1 worker

  ✓  [chromium] › auth/login/auth-login-success.spec.ts:28:3 › should successfully log in (28s)
  ✓  [chromium] › auth/login/auth-login-success.spec.ts:47:3 › should maintain session (30s)
  ✓  [chromium] › auth/login/auth-login-success.spec.ts:59:3 › should log out
**Command to run:**
```bash
npm test
```

**Expected output:**
```
Running 3 tests using 1 worker

  ✓  [chromium] › auth/login/auth-login-success.spec.ts:28:3 › Authentication - Login Success › should successfully log in with valid credentials (28s)
  ✓  [chromium] › auth/login/auth-login-success.spec.ts:47:3 › Authentication - Login Success › should maintain session after page reload (30s)
  ✓  [chromium] › auth/login/auth-login-success.spec.ts:59:3 › Authentication - Login Success › should log out successfully (31s)

  3 passed (1.5m)
```

**After testing**, run cleanup SQL in Supabase Dashboard to remove test data.

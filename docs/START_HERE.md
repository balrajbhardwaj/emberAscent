# 🚀 Ember Ascent - Developer Guide

**Welcome to Ember Ascent development!**

---

## 📚 Documentation Index

### Essential Guides
- [Testing Guide](./TESTING.md) - **START HERE** for testing (3 tests passing)
- [Quick Start](../QUICKSTART.md) - Get the app running locally
- [Architecture Guidelines](../architecture-guidelines.md) - Security & compliance rules
- [Database Schema](./DATABASE_SCHEMA.md) - Complete schema reference

### Development Resources
- [E2E Testing Strategy](./E2E_TESTING_STRATEGY.md) - Comprehensive testing strategy (1,700+ lines)
- [Test Database Setup](./TEST_DATABASE_SETUP.md) - Database setup details
- [Commit Policy](../commit_policy.md) - Version control standards
- [Security Audit Report](../SECURITY_AUDIT_REPORT.md) - Security issues & remediation

### Feature Documentation
- [Adaptive System](./ADAPTIVE_SYSTEM.md) - Adaptive learning algorithm
- [Ember Score Integration](./EMBER_SCORE_INTEGRATION.md) - Difficulty scoring
- [Error Reporting System](./ERROR_REPORTING_SYSTEM.md) - Error handling
- [Y3 Import Guide](./Y3_IMPORT_GUIDE.md) - Question import process

---

## ✅ Current Status

### Testing Infrastructure
- ✅ Playwright & Vitest installed
- ✅ 3 auth tests passing (login, session, logout)
- ✅ Test helpers created (auth, navigation, database)
- ✅ Production database with test users approach
- 🚧 145+ tests planned across 9 modules

### What You Can Do Now
```bash
# Run passing tests
npm test

# Expected: 3 auth tests pass in ~90 seconds
```

---

## 🎯 Quick Actions

### Run Tests
```bash
# All tests (3 passing)
npm test

# With UI
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed
```

### Clean Test Data
After running tests, clean up in Supabase Dashboard SQL Editor:
```sql
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📖 Key Documents

### For Testing
**Read**: [TESTING.md](./TESTING.md) - Complete guide with:
- Available test cases (3 auth tests)
- Test infrastructure overview
- Database cleanup strategy
- Debugging tips
- Next steps for test expansion

### For Features
**Read**: [architecture-guidelines.md](../architecture-guidelines.md) - Production requirements:
- Security rules (RLS, data protection)
- UK GDPR & ICO Children's Code compliance
- PCI DSS payment standards
- Error handling patterns

### For Commits
**Read**: [commit_policy.md](../commit_policy.md) - Standards:
- Commit message format
- Security commit requirements
- Scope guidelines

---

## 🚀 Next Steps

### Expand Testing (Priority)
1. Add signup flow tests
2. Add password reset tests
3. Implement Practice module tests
4. Add Analytics dashboard tests

### Feature Development
1. Review [PROGRESS.md](../PROGRESS.md) for current work
2. Check [pendingTasksTodo.md](../pendingTasksTodo.md) for pending tasks
3. Follow security guidelines from [architecture-guidelines.md](../architecture-guidelines.md)

---

## 📞 Need Help?

- **Testing issues**: See [TESTING.md](./TESTING.md) debugging section
- **Database setup**: See [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md)
- **Architecture questions**: See [architecture-guidelines.md](../architecture-guidelines.md)
- **Security concerns**: See [SECURITY_AUDIT_REPORT.md](../SECURITY_AUDIT_REPORT.md)

## ✅ What's Done

- Playwright & Vitest installed (105 packages)
- Chromium browser downloaded (172.8 MiB)
- Test structure created (9 modules, 145 planned tests)
- Example tests written (5 working examples)
- Comprehensive documentation (5 docs, 5,000+ lines)
- All files committed to git

## 📋 Your Immediate Action Items

### 1️⃣ Create Test Database (15 minutes)

**Why?** Tests need a separate database to avoid touching production data.

**How?**
1. Open: https://supabase.com/dashboard
2. Click "New Project"
3. Name it `ember-ascent-test`
4. Wait for creation (2-3 minutes)
5. Follow **full guide**: [docs/TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md)

**Quick checklist:**
- [ ] New Supabase project created
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Copy Service Role Key
- [ ] Apply database schema (export from production, import to test)
- [ ] Seed test users (SQL in setup guide)
- [ ] Import sample questions (100 per subject)

### 2️⃣ Configure Test Environment (5 minutes)

```bash
# In project root
cp .env.test.local.example .env.test.local
```

Edit `.env.test.local`:
```env
TEST_SUPABASE_URL=https://your-test-ref.supabase.co
TEST_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
TEST_SUPABASE_SERVICE_KEY=eyJhbGci...your-service-key
TEST_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** Never commit `.env.test.local` (already in `.gitignore`)

### 3️⃣ Run Your First Test (2 minutes)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run example test
npm run test:e2e -- tests/e2e/auth/login/auth-login-success.spec.ts
```

**Expected result:**
```
Running 3 tests using 1 worker

✓ should successfully log in with valid credentials (2.3s)
✓ should maintain session after page reload (1.8s)
✓ should log out successfully (1.5s)

3 passed (6s)
```

## 📖 Learn the Framework (30 minutes)

### Read in this order:

1. **[tests/README.md](../tests/README.md)** (5 min)
   - Quick overview
   - Directory structure
   - Test commands

2. **[docs/TESTING_QUICK_START.md](./TESTING_QUICK_START.md)** (10 min)
   - Quick reference guide
   - 7-week roadmap
   - CLI examples

3. **Example tests** (15 min)
   - Look at: `tests/e2e/auth/login/auth-login-success.spec.ts`
   - Look at: `tests/e2e/practice/quick-byte/quick-byte-session.spec.ts`
   - Look at: `tests/component/ember-score/EmberScoreBadge.test.tsx`
   - Understand the patterns

### Key concepts to grasp:

**Test Helpers** (make tests easy):
```typescript
const authHelper = new AuthHelper(page);
await authHelper.login(email, password);
```

**Test Fixtures** (pre-configured data):
```typescript
import { TEST_USERS } from './fixtures/users';
const user = TEST_USERS.freeUser;
```

**Test Structure** (consistent format):
```typescript
test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange - Setup
    // Act - Do the thing
    // Assert - Verify result
  });
});
```

## 🎯 Start Writing Tests (Week 1)

Follow the **7-week roadmap** in [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)

**Week 1 Focus: Authentication Module** (12 tests)

1. **Login Feature** (6 tests) - Some examples already exist!
   - ✅ Login success (example exists)
   - ✅ Login validation (example exists)
   - ⏸️ Password reset
   - ⏸️ Session persistence
   - ⏸️ Protected route redirect
   - ⏸️ Logout

2. **Signup Feature** (6 tests)
   - ⏸️ Signup success
   - ⏸️ Email validation
   - ⏸️ Password strength
   - ⏸️ Duplicate email handling
   - ⏸️ Email confirmation flow
   - ⏸️ Auto-redirect to setup

**Commands:**
```bash
# Run auth tests as you write them
npm run test:auth

# Debug a specific test
npm run test:debug -- tests/e2e/auth/signup/signup-success.spec.ts

# Watch mode (re-runs on save)
npm run test:unit -- --watch
```

## 📊 Track Your Progress

Open in browser: **`public/feature-status.html`**

This interactive dashboard shows:
- All 111 functionalities mapped
- Current test status
- Progress by module
- Filterable by status/phase

**Update it as you go:**
- ✅ Test implemented
- 🔄 Test in progress
- ⏸️ Deferred
- ❌ Test failed

## 🆘 Common Issues & Solutions

### "Test database connection failed"

**Solution:**
```bash
# Check .env.test.local exists
ls -la .env.test.local

# Verify variables set
cat .env.test.local | grep TEST_SUPABASE_URL
```

### "Invalid login credentials" in test

**Solution:** Test users need auth accounts created.
See [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md) Step 7.

### Tests hang or timeout

**Solution:** Make sure dev server is running:
```bash
npm run dev
```

### "Cannot find module '@/lib/...'"

**Solution:** Path aliases configured in vitest.config.ts. Should work automatically.

### Playwright browser not found

**Solution:**
```bash
npx playwright install chromium
```

## 🎓 Best Practices

1. **Write tests as you build features** (TDD approach)
2. **Use descriptive test names** ("should do X when Y happens")
3. **Keep tests independent** (don't rely on execution order)
4. **Use helpers** (avoid duplicating auth/navigation code)
5. **Test one thing per test** (easier to debug failures)
6. **Run tests before committing** (`npm test`)
7. **Update feature-status.html** (track progress visually)

## 📚 Documentation Reference

- **Strategy**: [E2E_TESTING_STRATEGY.md](./E2E_TESTING_STRATEGY.md) - 3,000+ lines, comprehensive
- **Quick Ref**: [TESTING_QUICK_START.md](./TESTING_QUICK_START.md) - CLI examples, roadmap
- **Database**: [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md) - Setup guide
- **Framework**: [tests/README.md](../tests/README.md) - Structure overview
- **Summary**: [TESTING_FRAMEWORK_COMPLETE.md](./TESTING_FRAMEWORK_COMPLETE.md) - What was built

## 🎯 Success Checklist

Before you start writing tests:

- [ ] Test database created in Supabase
- [ ] Schema applied to test database
- [ ] Test users seeded (3 accounts)
- [ ] Sample questions imported (300-400 total)
- [ ] `.env.test.local` configured with credentials
- [ ] `.env.test.local` NOT committed to git (verify: `git status`)
- [ ] Dev server running (`npm run dev`)
- [ ] First test passes (`npm run test:auth`)
- [ ] Read `tests/README.md` (5 min)
- [ ] Read example tests (15 min)
- [ ] Feature dashboard opened (`public/feature-status.html`)

**All checked?** You're ready to implement! 🚀

## 🎉 Your First Real Test

Try creating a signup test. Use the login examples as a template:

```typescript
// tests/e2e/auth/signup/signup-success.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth-helpers';

test.describe('Authentication - Signup Success', () => {
  test('should create account and redirect to setup', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    // Arrange
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Act
    await authHelper.signup(testEmail, 'TestPass123!', 'Test User');
    
    // Assert
    await expect(page).toHaveURL('/setup');
  });
});
```

Run it:
```bash
npm run test:e2e -- tests/e2e/auth/signup/signup-success.spec.ts
```

## 💪 You've Got This!

Framework is solid. Documentation is comprehensive. Examples are clear.

**Start small**: Week 1 authentication tests (12 tests)  
**Stay consistent**: 2-3 tests per day = Week 1 done in a week  
**Track progress**: Update feature-status.html regularly  
**Ask for help**: All docs have troubleshooting sections  

---

**Next Command:**
```bash
# After database setup
npm run dev
npm run test:auth
```

Good luck! 🚀

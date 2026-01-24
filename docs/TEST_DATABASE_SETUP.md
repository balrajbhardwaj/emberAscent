# Test Database Setup Guide

## Overview

Ember Ascent uses a **separate Supabase project** for testing to ensure production data integrity. This guide walks you through creating and configuring the test database.

## Prerequisites

- Supabase account (free tier works)
- Access to your production Ember Ascent project
- Node.js 20+ installed

## Step 1: Create Test Supabase Project

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Click "New Project"

2. **Configure Test Project**
   - **Name**: `ember-ascent-test`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Same as production (for consistency)
   - **Pricing Plan**: Free tier is sufficient

3. **Wait for Project Creation**
   - Takes 2-3 minutes
   - Note your project URL when ready

## Step 2: Get Test Project Credentials

1. **Navigate to Project Settings**
   - Click on your project name
   - Go to Settings → API

2. **Copy Credentials**
   You need three values:
   
   ```
   Project URL: https://[your-test-ref].supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **⚠️ Security Warning**
   - Service Role Key bypasses RLS - **NEVER** commit it to git
   - Only use in server-side code and tests

## Step 3: Configure Test Environment

1. **Create `.env.test.local`**
   ```bash
   # In project root
   cp .env.test.local.example .env.test.local
   ```

2. **Fill in Credentials**
   ```env
   # Test Database Credentials
   TEST_SUPABASE_URL=https://your-test-ref.supabase.co
   TEST_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   TEST_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Test App URL
   TEST_APP_URL=http://localhost:3000
   
   # Optional: Pre-created test users
   TEST_USER_EMAIL=test.sarah@emberascent.dev
   TEST_USER_PASSWORD=TestPassword123!
   ```

3. **Verify `.env.test.local` in `.gitignore`**
   ```bash
   # Check it's listed
   grep -i "env.test.local" .gitignore
   ```

## Step 4: Apply Database Schema

You need to replicate your production schema in the test database.

### Option A: Export/Import Schema (Recommended)

1. **Export from Production**
   - Go to production Supabase Dashboard
   - Navigate to Database → Schema
   - Click "Export Schema"
   - Download SQL file

2. **Import to Test**
   - Go to test Supabase Dashboard
   - Navigate to SQL Editor
   - Click "New Query"
   - Paste exported schema
   - Click "Run"

### Option B: Run Migration Files

1. **Collect All Migrations**
   ```bash
   # In project root
   ls -la supabase/migrations/
   ```

2. **Run Each Migration in Order**
   - Go to test Supabase Dashboard
   - SQL Editor → New Query
   - Copy migration file contents
   - Run each migration sequentially

## Step 5: Seed Test Data

### Create Test Users

Run this SQL in your test database SQL Editor:

```sql
-- Create test profiles (these will auto-create auth users via trigger)
INSERT INTO profiles (id, email, full_name, tier)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'test.sarah@emberascent.dev',
    'Sarah Thompson',
    'free'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'test.emma@emberascent.dev',
    'Emma Parker',
    'ascent'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'test.james@emberascent.dev',
    'James Wilson',
    'ascent'
  );

-- Create test children
INSERT INTO children (id, parent_id, name, year_group, avatar)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Oliver',
    5,
    '👦'
  ),
  (
    'c2222221-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Lucas',
    6,
    '👦'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Mia',
    5,
    '👧'
  );
```

### Seed Questions from Production

You have two options:

#### Option A: Sample Recent Questions (Recommended)

This approach copies a sample of questions from production:

```typescript
// Run this script (create it if needed)
import { createClient } from '@supabase/supabase-js';

const prodClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const testClient = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_SERVICE_KEY!
);

async function seedTestQuestions() {
  // Get recent questions from each subject
  const subjects = ['mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning'];
  
  for (const subject of subjects) {
    const { data } = await prodClient
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) {
      await testClient.from('questions').insert(data);
      console.log(`✅ Seeded ${data.length} ${subject} questions`);
    }
  }
}

seedTestQuestions();
```

#### Option B: Full Question Import

If you want all questions in test:

```bash
# Export from production
# In Supabase Dashboard → Table Editor → questions → Export to CSV

# Import to test
# In test Supabase Dashboard → Table Editor → questions → Import from CSV
```

## Step 6: Verify Test Database

1. **Run Verification Script**
   ```bash
   npm run test -- --grep "should connect to test database"
   ```

2. **Check Tables**
   - Go to test Supabase Dashboard
   - Table Editor
   - Verify tables exist:
     - ✅ profiles
     - ✅ children
     - ✅ questions
     - ✅ practice_sessions
     - ✅ session_responses

3. **Check RLS Policies**
   - Go to Authentication → Policies
   - Verify each table has RLS enabled
   - Verify policies match production

## Step 7: Test Authentication Setup

Test users need authentication credentials.

### Option A: Manual User Creation

1. **Go to Authentication → Users**
2. **Add User**
   - Email: `test.sarah@emberascent.dev`
   - Password: `TestPassword123!`
   - Auto Confirm: ✅
3. **Repeat for other test users**

### Option B: Automated Setup (via API)

```typescript
// Use Supabase admin client
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test.sarah@emberascent.dev',
  password: 'TestPassword123!',
  email_confirm: true,
  user_metadata: {
    full_name: 'Sarah Thompson',
  }
});
```

## Step 8: Run Your First Test

```bash
# Start dev server
npm run dev

# In another terminal, run test
npm run test:e2e -- tests/e2e/auth/login/auth-login-success.spec.ts

# Or run all tests
npm test
```

## Troubleshooting

### Error: "Test database connection failed"

**Cause**: Environment variables not loaded

**Fix**:
```bash
# Verify .env.test.local exists
ls -la .env.test.local

# Check contents (hide service key!)
cat .env.test.local | grep TEST_SUPABASE_URL
```

### Error: "relation 'profiles' does not exist"

**Cause**: Schema not applied

**Fix**: Re-run Step 4 (Apply Database Schema)

### Error: "Invalid login credentials"

**Cause**: Test user not created in auth

**Fix**: Run Step 7 (Test Authentication Setup)

### Tests hang or timeout

**Cause**: Dev server not running

**Fix**:
```bash
# Ensure dev server is running
npm run dev
```

## Maintenance

### Reset Test Database

When test data gets messy:

```sql
-- In test database SQL Editor
TRUNCATE practice_sessions CASCADE;
TRUNCATE session_responses CASCADE;
TRUNCATE children CASCADE;
TRUNCATE profiles CASCADE;

-- Re-run Step 5 seed scripts
```

### Update Schema Changes

When you add migrations to production:

1. Apply migration to production
2. Copy migration file
3. Run in test database SQL Editor
4. Verify with tests

### Sync Recent Questions

Keep test questions fresh:

```bash
# Run your seed script monthly
npm run seed:test-questions
```

## Best Practices

1. **Never Run Tests Against Production**
   - Always use TEST_* environment variables
   - Double-check URLs before running tests

2. **Keep Test Data Minimal**
   - 100 questions per subject (not 10,000)
   - 3-5 test user accounts max
   - Reduces test database costs

3. **Clean Up Regularly**
   - Use global teardown to clean test data
   - Reset database monthly

4. **Protect Test Credentials**
   - Never commit `.env.test.local`
   - Use different passwords than production
   - Rotate service keys periodically

## CI/CD Setup (Future)

When you're ready for GitHub Actions:

1. **Add Repository Secrets**
   - Settings → Secrets → Actions
   - Add: `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, `TEST_SUPABASE_SERVICE_KEY`

2. **Update Workflow**
   ```yaml
   env:
     TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
     TEST_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
     TEST_SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
   ```

3. **Run Tests in CI**
   ```yaml
   - name: Run E2E Tests
     run: npm run test:e2e
   ```

## Summary Checklist

- [ ] Test Supabase project created
- [ ] `.env.test.local` configured with credentials
- [ ] Database schema applied to test project
- [ ] Test users seeded (profiles + auth)
- [ ] Test children seeded
- [ ] Sample questions imported
- [ ] RLS policies verified
- [ ] First test runs successfully
- [ ] `.env.test.local` in `.gitignore`

**You're ready to test! 🚀**

Run `npm test` to start the full test suite.

# Test Database Setup Guide

## Overview

Ember Ascent uses **production database with dedicated test users** for E2E testing. This approach avoids the complexity of maintaining a separate test database with full auth schema replication.

## Prerequisites

- Supabase account (free tier works)
- Access to production Ember Ascent project
- Node.js 20+ installed

## Quick Start

For running tests, you only need:

1. **Test users exist in production** (already created)
2. **Run tests**: `npm test`

That's it! The test users (`test.sarah@emberascent.dev`, etc.) are isolated and won't interfere with real user data.

---

## Detailed Setup (For Reference)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Click "New Project"

2. **Configure Test Project**
   - **Name**: `ember-ascent-test`
   - **Database Password**: Generate a strong password (save it!)MEyxtf2*cV?qjmb
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

You need to replicate your production schema in the test database. Choose the method that works best for you.

### ⭐ Method 1: Use Supabase CLI `db pull` (RECOMMENDED)

This generates a schema file directly from your production database automatically.

**Prerequisites**: Install Supabase CLI (if not already installed)

Choose the installation method for your system:

**Windows (Scoop):**
```powershell
# Install Scoop first if you don't have it: https://scoop.sh
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
# Download and extract (replace with latest version)
curl -fsSL https://github.com/supabase/cli/releases/download/v1.x.x/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

**Any OS (via npx - no installation required):**
```bash
# Just prefix commands with 'npx supabase' instead of 'supabase'
npx supabase --help
```

**Steps:**

1. **Link to your PRODUCTION project first**
   ```bash
   supabase link --project-ref cmujulpwvmfvpyypcfaa
   ```
   - Your production ref: `cmujulpwvmfvpyypcfaa`
   - Enter your production database password when prompted

2. **Pull schema from production**
   ```bash
   supabase db pull
   ```
   - This connects to your production database
   - Generates a migration file in `supabase/migrations/`
   - File name: `<timestamp>_remote_schema.sql`
   - Prompts to update migration history (answer: No for test setup)

3. **Run generated schema in test database**
   - Open the newly created migration file from `supabase/migrations/`
   - Copy the entire contents
   - Go to your **TEST** Supabase Dashboard
   - Navigate to **SQL Editor** → **New Query**
   - Paste and click **"Run"**
   - Wait ~30 seconds for completion

**Benefits:**
- Always accurate - pulls latest production schema
- No manual maintenance needed
- Can re-run anytime to sync changes
- Single source of truth (production database)

**When to use this method:**
- Initial test database setup
- After applying new migrations to production
- When you need to ensure test matches production exactly

### Method 2: Use Pre-Generated Schema File

If CLI is not available or you prefer a simpler approach:

1. **Open the Schema File**
   - File location: `supabase/test-database-schema.sql`
   - This file was generated using `supabase db pull`

2. **Run in Test Database**
   - Go to **test** Supabase Dashboard
   - Navigate to **SQL Editor** (left sidebar)
   - Click **"New Query"**
   - Open `supabase/test-database-schema.sql` in your code editor
   - Copy **ENTIRE** file contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)
   - Click **"Run"** (or Ctrl+Enter)
   - Wait ~30 seconds for completion

**Note:** This file may become outdated as you add migrations to production. Use Method 1 to regenerate it.

### Verify Schema Applied Successfully

After using either method:
- Check for success message in SQL Editor output
- Go to **Table Editor** - you should see all tables:
  - profiles, children, questions, practice_sessions, session_responses
  - child_ember_scores, adaptive_tracker, achievements, etc.

## Step 5: Create Auth Users (MUST DO FIRST!)

⚠️ **IMPORTANT**: Create auth users BEFORE inserting profiles (profiles table has FK to auth.users)

### Use SQL to Create Users with Specific UUIDs

The Supabase UI doesn't allow setting custom User IDs, so we must use SQL.

**Run this in SQL Editor** (test Supabase Dashboard → SQL Editor → New Query):

```sql
-- Create test users with specific UUIDs
-- These UUIDs match the profiles we'll insert in Step 6

-- User 1: Sarah (Free tier)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'b1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.sarah@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
);

-- User 2: Emma (Ascent tier)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.emma@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
);

-- User 3: James (Ascent tier, multiple children)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'b3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.james@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
);

-- Also create identities for email login
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES 
(
  'b1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', 'b1111111-1111-1111-1111-111111111111', 'email', 'test.sarah@emberascent.dev'),
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  'b2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'test.emma@emberascent.dev'),
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  'b3333333-3333-3333-3333-333333333333',
  'b3333333-3333-3333-3333-333333333333',
  jsonb_build_object('sub', 'b3333333-3333-3333-3333-333333333333', 'email', 'test.james@emberascent.dev'),
  'email',
  NOW(),
  NOW(),
  NOW()
);
```

**Verify Users Created:**
- Go to **Authentication → Users** in Supabase Dashboard
- You should see 3 users with "Email confirmed" status
- Emails: test.sarah@, test.emma@, test.james@emberascent.dev

## Step 6: Seed Test Data

### Create Test Profiles & Children

Now that auth users exist, run this SQL in your test database SQL Editor:

```sql
-- Create test profiles (now that auth users exist)
INSERT INTO profiles (id, email, full_name, subscription_tier)
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

## Step 7: Verify Test Database

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

4. **Verify Auth Users Created**
   - Go to Authentication → Users
   - Should see 3 test users with confirmed status

## Step 8: Run Your First Test

```bash
# Start dev server (Terminal 1)
npm run dev

# In another terminal (Terminal 2), run a specific test
npm test -- tests/e2e/auth/login/auth-login-success.spec.ts

# Or run all E2E tests
npm run test:e2e

# Or run all tests (E2E + unit)
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
TRUNCATE profiles 5 (Create Auth Users

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

- [x] Test users exist in production database
- [x] Tests run successfully against production
- [x] Test users isolated with `test.*@emberascent.dev` emails
- [ ] Clean up test data after testing (see Cleanup section below)

**You're ready to test! 🚀**

Run `npm test` to start the test suite.

---

## Cleanup After Testing

### Understanding CASCADE Deletes

The database uses **ON DELETE CASCADE** foreign keys, so deleting test users automatically removes all related data:

**Cascade Chain:**
```
auth.users → profiles → children → [all child data]
```

**Automatically Deleted:**
- ✅ profiles
- ✅ children
- ✅ practice_sessions + session_responses
- ✅ question_attempts
- ✅ child_question_history
- ✅ child_topic_performance
- ✅ child_ember_scores
- ✅ adaptive_tracker
- ✅ achievements
- ✅ session_feedback
- ✅ question_feedback
- ✅ parent_feedback
- ✅ subscriptions
- ✅ admin_log
- ✅ impersonation_log

**NOT Deleted (shared data):**
- ❌ questions (shared across all users)
- ❌ curriculum_objectives
- ❌ question_type_taxonomy

### Cleanup Commands

#### 1. Verify Test Data Before Deletion
```sql
-- Count test users and their data
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE 'test.%@emberascent.dev') as test_users,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE 'test.%@emberascent.dev') as test_profiles,
  (SELECT COUNT(*) FROM children WHERE parent_id IN 
    (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev')) as test_children,
  (SELECT COUNT(*) FROM practice_sessions WHERE child_id IN 
    (SELECT id FROM children WHERE parent_id IN 
      (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev'))) as test_sessions;
```

#### 2. Delete Test Users (CASCADE handles rest)
```sql
-- Single command - CASCADE deletes all related data
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
```

#### 3. Verify Deletion
```sql
-- Should return all zeros
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE 'test.%@emberascent.dev') as remaining_users,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE 'test.%@emberascent.dev') as remaining_profiles,
  (SELECT COUNT(*) FROM children WHERE parent_id IN 
    (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev')) as remaining_children;
```

### When to Run Cleanup

**After Each Test Run (Recommended):**
- Prevents test data accumulation
- Keeps production database clean
- Reset to known state for next test run

**Command:**
```bash
# In Supabase Dashboard SQL Editor
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
```

**Or Keep Test Users (Alternative):**
- Keep test users permanently in production
- Tests will reuse existing accounts
- Faster test execution (no signup needed)
- Data accumulates over time (sessions, attempts)

**Trade-offs:**
- ✅ Faster: No signup overhead
- ✅ Persistent: Same users across runs
- ❌ Accumulation: Data grows over time
- ❌ State: Previous test data may affect new tests

### Automated Cleanup Script (Future)

For automated cleanup, create `scripts/cleanup-test-data.sql`:

```sql
-- Delete test users and all CASCADE data
DO $$
DECLARE
  deleted_users INT;
  deleted_profiles INT;
  deleted_children INT;
BEGIN
  -- Count before deletion
  SELECT COUNT(*) INTO deleted_users FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
  SELECT COUNT(*) INTO deleted_profiles FROM profiles WHERE email LIKE 'test.%@emberascent.dev';
  SELECT COUNT(*) INTO deleted_children FROM children WHERE parent_id IN 
    (SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev');
  
  -- Delete (CASCADE handles related data)
  DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
  
  -- Report results
  RAISE NOTICE 'Deleted % test users, % profiles, % children (plus all related data via CASCADE)', 
    deleted_users, deleted_profiles, deleted_children;
END $$;
```

---

## Key Learnings & Best Practices

### 1. NEXT_PUBLIC_* Variables Are Baked at Build Time
- Environment variables prefixed with `NEXT_PUBLIC_` are embedded in the JavaScript bundle during build/compilation
- Changing them requires clearing `.next/` cache and rebuilding
- For testing, either:
  - Use production database with test users (current approach)
  - Temporarily modify `.env.local` and rebuild

### 2. Supabase Auth Schema is Complex
- Separate test databases need full auth schema including:
  - Extensions (uuid-ossp, pgcrypto)
  - Auth schema with proper permissions
  - Triggers and functions
- Simpler to use production with isolated test users

### 3. Test User Isolation
- Use consistent email pattern: `test.*@emberascent.dev`
- Easy to identify and clean up
- Won't interfere with real users
- Can filter from analytics/reports

### 4. Playwright Configuration
- `webServer` in playwright.config.ts auto-starts dev server
- `reuseExistingServer` allows manual server control
- Console logs from browser visible with `BROWSER:` prefix

### 5. Test Helper Best Practices  
- Use exact UI text for selectors (`'text=Sign Out'` not `'text=Log Out'`)
- Add `data-testid` attributes to key UI elements
- Keep test helpers simple - avoid complex error handling that masks real issues

---

</details>

## Step 1: Create Test Supabase Project (DEPRECATED)
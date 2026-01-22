# Ember Ascent: Git Commit Policy & Version Control Guidelines

> **Version:** 1.0 | Phase 1 MVP  
> **Last Updated:** January 2026  
> **Compliance:** UK GDPR, ICO Children's Code, PCI DSS (via Stripe)

---

## 1. Overview

This commit policy establishes standards for version control on Ember Ascent, a children's educational platform handling sensitive data. Adherence is **mandatory** for all contributors.

### Why This Matters

| Concern | Rationale |
|---------|-----------|
| **Security** | Children's PII requires audit trails and rollback capability |
| **Compliance** | ICO Children's Code mandates data handling accountability |
| **Quality** | Consistent commits enable effective code review and debugging |
| **Collaboration** | Clear history helps onboard new contributors quickly |

---

## 2. Commit Message Format

All commits must follow the [Conventional Commits](https://conventionalcommits.org) specification with Ember Ascent-specific extensions.

### 2.1 Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Rules:**
- **Description:** Imperative mood, lowercase, no period (e.g., "add timer mode" not "Added timer mode.")
- **Line length:** Subject ≤72 characters, body wrapped at 100
- **Blank line** between subject and body

### 2.2 Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature for users | `feat(quiz): add timer mode` |
| `fix` | Bug fix for users | `fix(auth): resolve session expiry issue` |
| `security` | Security improvement (**CRITICAL**) | `security(rls): enforce parent_id check` |
| `perf` | Performance improvement | `perf(api): add query caching` |
| `refactor` | Code change (no feature/fix) | `refactor(db): normalise schema` |
| `docs` | Documentation only | `docs: update API reference` |
| `test` | Adding/updating tests | `test(ember): add score calculation tests` |
| `chore` | Maintenance tasks | `chore(deps): update next to 14.1` |
| `ci` | CI/CD changes | `ci: add security scanning workflow` |
| `style` | Formatting (no code change) | `style: fix indentation in utils` |
| `revert` | Revert previous commit | `revert: feat(quiz) timer mode` |

### 2.3 Scopes (Required for feat/fix/security)

| Scope | Area |
|-------|------|
| `auth` | Authentication, sessions, parent accounts |
| `child` | Child profiles, child data handling |
| `quiz` | Question delivery, practice sessions, adaptive engine |
| `content` | Question bank, explanations, Ember Score system |
| `analytics` | Progress tracking, dashboards, insights (Ascent tier) |
| `payment` | Stripe integration, subscriptions, billing |
| `rls` | Row-Level Security policies |
| `api` | API routes, endpoints, middleware |
| `ui` | User interface, components, styling |
| `db` | Database schema, migrations |

### 2.4 Breaking Changes

Add `!` after type/scope for breaking changes:

```
feat(api)!: change response format for /questions endpoint

BREAKING CHANGE: The questions endpoint now returns paginated results.
Clients must update to handle the new { data, meta } structure.
```

### 2.5 Security Commit Requirements

> ⚠️ **All security-related commits MUST:**

1. Use the `security` type (not `fix`)
2. Include affected data types in the body
3. Reference any CVE or security advisory if applicable
4. **Never include sensitive data** (keys, passwords, PII)

**Example:**

```
security(rls): enforce parent_id check on child_profiles

Adds RLS policy requiring auth.uid() = parent_id for all
operations on child_profiles table. Previously, the policy
only checked on SELECT operations.

Affected data: child first names, practice history, session data
Compliance: ICO Children's Code requirement - data minimisation
```

---

## 3. Branch Strategy

### 3.1 Protected Branches

| Branch | Purpose | Protection Rules |
|--------|---------|------------------|
| `main` | Production code | PR required, 1+ approval, all CI pass, no direct push |
| `staging` | Pre-production testing | PR required, all CI pass |
| `develop` | Integration branch | PR required |

### 3.2 Feature Branch Naming

```
<type>/<scope>-<short-description>
```

| Pattern | Example | Use Case |
|---------|---------|----------|
| `feat/<scope>-<desc>` | `feat/quiz-timer-mode` | New features |
| `fix/<scope>-<desc>` | `fix/auth-session-expiry` | Bug fixes |
| `security/<scope>-<desc>` | `security/rls-child-profiles` | Security improvements |
| `hotfix/<desc>` | `hotfix/payment-webhook-crash` | Critical production fixes |
| `release/<version>` | `release/v1.2.0` | Release preparation |
| `docs/<desc>` | `docs/api-reference` | Documentation updates |
| `refactor/<scope>-<desc>` | `refactor/db-normalise` | Code refactoring |

### 3.3 Branch Lifecycle

```
1. Create branch from `develop`
   git checkout develop && git pull
   git checkout -b feat/quiz-timer-mode

2. Make atomic commits following message format
   git commit -m "feat(quiz): add timer display component"
   git commit -m "feat(quiz): implement countdown logic"
   git commit -m "test(quiz): add timer unit tests"

3. Push and create Pull Request
   git push -u origin feat/quiz-timer-mode

4. Pass CI checks and code review

5. Squash merge into `develop`
   (Preserves clean linear history)

6. Delete feature branch
   git branch -d feat/quiz-timer-mode
```

### 3.4 Release Flow

```
develop → staging → main
    ↓         ↓        ↓
 Features   Testing  Production
```

---

## 4. Security-Specific Rules

> 🔴 **CRITICAL:** As a children's platform, security violations in commits can result in regulatory action under the ICO Children's Code.

### 4.1 Never Commit

| Prohibited Content | Mitigation |
|-------------------|------------|
| API keys, secrets, passwords | Use environment variables only |
| `.env` files with real values | Add to `.gitignore`, use `.env.example` |
| Supabase service role key | Server-side only, never in client code |
| Stripe secret key | Server-side only, use webhook secrets |
| Child PII in test data | Use synthetic/fake data only |
| Database dumps with real data | Anonymise before any export |
| Hardcoded user IDs or emails | Use dynamic references |
| JWT tokens or session data | Never log, never commit |

### 4.2 Required .gitignore Entries

```gitignore
# Environment files - NEVER commit these
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Sensitive directories
/secrets/
/credentials/
/keys/

# Database exports
*.sql
*.dump
*.backup
supabase/.temp/
supabase/.branches/

# IDE settings that may contain tokens
.idea/
.vscode/settings.json
.vscode/launch.json

# OS files
.DS_Store
Thumbs.db

# Log files (may contain PII)
*.log
logs/
npm-debug.log*

# Test coverage (may reference real data)
coverage/
.nyc_output/
```

### 4.3 .env.example Template

Always maintain an `.env.example` with placeholder values:

```bash
# .env.example - Copy to .env and fill in real values
# NEVER commit .env with real values

# Supabase (get from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Pre-Commit Checks

### 5.1 Automated Checks

| Check | Tool | Blocking |
|-------|------|----------|
| Commit message format | commitlint | ✅ Yes |
| Secret detection | gitleaks | ✅ Yes |
| TypeScript compilation | `tsc --noEmit` | ✅ Yes |
| Linting | ESLint | ✅ Yes |
| Formatting | Prettier | ✅ Yes |
| PII pattern scan | Custom regex | ✅ Yes |
| console.log detection | ESLint no-console | ⚠️ Warning |

### 5.2 Setup Instructions

**Install dependencies:**

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky install
```

**Configure commitlint** (`commitlint.config.js`):

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'security',  // Custom type for Ember Ascent
        'perf',
        'refactor',
        'docs',
        'test',
        'chore',
        'ci',
        'style',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'child',
        'quiz',
        'content',
        'analytics',
        'payment',
        'rls',
        'api',
        'ui',
        'db',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};
```

**Configure Husky hooks:**

`.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Secret detection - CRITICAL for children's platform
echo "🔍 Scanning for secrets..."
npx gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
  echo "❌ SECRET DETECTED! Remove before committing."
  exit 1
fi

# TypeScript check
echo "📝 Type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found."
  exit 1
fi

# Lint staged files
echo "🧹 Linting..."
npx lint-staged
```

`.husky/commit-msg`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit $1
```

**Configure lint-staged** (`package.json`):

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 5.3 PII Pattern Detection

Add to ESLint config (`.eslintrc.js`):

```javascript
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name="console"]',
        message: 'Remove console statements before committing. Use proper logging service.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Warn on potential PII in strings
        'no-restricted-syntax': [
          'warn',
          {
            selector: 'Literal[value=/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/]',
            message: 'Potential email address detected. Ensure no real PII.',
          },
        ],
      },
    },
  ],
};
```

---

## 6. Pull Request & Code Review

### 6.1 PR Title Format

Follow the same format as commit messages:

```
feat(quiz): add adaptive difficulty adjustment
fix(payment): handle webhook retry correctly
security(rls): add policy for progress_sessions table
```

### 6.2 PR Description Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Summary
<!-- Brief description of what this PR does -->

## Type of Change
- [ ] `feat`: New feature
- [ ] `fix`: Bug fix
- [ ] `security`: Security improvement
- [ ] `perf`: Performance improvement
- [ ] `refactor`: Code refactoring
- [ ] `docs`: Documentation
- [ ] `test`: Test changes
- [ ] `chore`: Maintenance

## Security Checklist
<!-- REQUIRED for all PRs touching user data -->
- [ ] No secrets or API keys in code
- [ ] No child PII in logs, errors, or test data
- [ ] RLS policies updated/verified if touching database
- [ ] Input validation added for new endpoints
- [ ] Error messages are generic (no internal details exposed)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on mobile viewport (375px)
- [ ] Tested with screen reader (if UI change)

## Database Changes
<!-- If applicable -->
- [ ] Migration is reversible
- [ ] Rollback tested locally
- [ ] RLS policies added for new tables
- [ ] Indexes added for query performance

## Screenshots
<!-- Required for UI changes -->

## Related Issues
<!-- Link any related issues: Fixes #123, Relates to #456 -->
```

### 6.3 Review Requirements by Type

| Change Type | Required Reviewers | Additional Checks |
|-------------|-------------------|-------------------|
| `security` changes | 2 reviewers (1 senior) | Security audit checklist |
| `payment` / Stripe changes | 2 reviewers | PCI DSS checklist |
| Database schema changes | 2 reviewers | Migration rollback plan |
| RLS policy changes | 2 reviewers | Data access verification |
| `feat` changes | 1 reviewer | Standard CI |
| `fix` changes | 1 reviewer | Standard CI |
| `docs` only | 1 reviewer | None |

### 6.4 Code Review Checklist

**Reviewer must verify:**

```markdown
## Security
- [ ] No hardcoded secrets or credentials
- [ ] No PII logged or exposed in errors
- [ ] Input validation present on all endpoints
- [ ] RLS policies correctly scoped (auth.uid() checks)
- [ ] Stripe operations use server-side only

## Quality
- [ ] Code follows TypeScript strict mode
- [ ] Functions are appropriately typed
- [ ] Error handling is comprehensive
- [ ] No obvious performance issues

## Testing
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests don't use real PII
```

---

## 7. Version Tagging

### 7.1 Semantic Versioning

Follow [SemVer](https://semver.org): `MAJOR.MINOR.PATCH`

| Component | When to Increment | Example |
|-----------|------------------|---------|
| **MAJOR** | Breaking API/database changes | 1.0.0 → 2.0.0 |
| **MINOR** | New features (backward compatible) | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, security patches | 1.0.0 → 1.0.1 |

### 7.2 Tag Naming Convention

```
v<MAJOR>.<MINOR>.<PATCH>[-<prerelease>]

Examples:
v1.0.0        # Initial Phase 1 release (Free tier)
v1.1.0        # Ascent tier analytics
v1.1.1        # Bug fix
v1.2.0        # Summit tier AI tutor
v1.2.0-beta   # Pre-release beta
v1.2.0-rc.1   # Release candidate
```

### 7.3 Creating a Release

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version
npm version 1.2.0 --no-git-tag-version

# 3. Update CHANGELOG.md
# Add release notes under new version heading

# 4. Commit version bump
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# 5. Create PR to main, get approval, merge

# 6. After merge, tag on main
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0: Ascent tier analytics

Features:
- Weakness heatmap
- Readiness score
- Weekly parent reports

Security:
- Enhanced RLS for analytics tables"

# 7. Push tag
git push origin v1.2.0

# 8. Merge main back to develop
git checkout develop
git merge main
git push origin develop
```

### 7.4 CHANGELOG Format

Maintain `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com):

```markdown
# Changelog

All notable changes to Ember Ascent will be documented here.

## [Unreleased]

### Added
- Feature in progress

## [1.2.0] - 2026-07-15

### Added
- Ascent tier: Weakness heatmap visualisation
- Ascent tier: Exam readiness score (0-100)
- Ascent tier: Weekly parent email reports
- Percentile benchmarking against anonymous cohort

### Changed
- Improved adaptive difficulty algorithm
- Updated progress dashboard UI

### Security
- Added RLS policies for analytics_snapshots table
- Enhanced session validation

### Fixed
- Session timeout not refreshing on activity
- Mobile layout issues on practice screen

## [1.1.0] - 2026-06-01

### Added
- Practice session timer mode
- Bookmark questions feature
- Review mistakes feature
```

---

## 8. CI/CD Pipeline Checks

### 8.1 Required Checks for Merge

| Check | Command | Required |
|-------|---------|----------|
| TypeScript compilation | `tsc --noEmit` | ✅ Yes |
| ESLint | `eslint . --ext .ts,.tsx` | ✅ Yes |
| Prettier format check | `prettier --check .` | ✅ Yes |
| Unit tests | `npm test` | ✅ Yes |
| Security audit | `npm audit --audit-level=high` | ✅ Yes |
| Secret scanning | `gitleaks detect` | ✅ Yes |
| Build verification | `npm run build` | ✅ Yes |

### 8.2 GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [develop, main, staging]
  pull_request:
    branches: [develop, main]

env:
  NODE_VERSION: '20'

jobs:
  security:
    name: Security Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Security Audit
        run: npm audit --audit-level=high

  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type Check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Format Check
        run: npx prettier --check .

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Tests
        run: npm test -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: always()

  build:
    name: Build Verification
    runs-on: ubuntu-latest
    needs: [security, quality, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### 8.3 Branch Protection Rules

Configure in GitHub Settings → Branches → Add rule:

**For `main`:**
- ✅ Require pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - Required checks: `security`, `quality`, `test`, `build`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches

**For `develop`:**
- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging

---

## 9. Emergency Procedures

### 9.1 Accidental Secret Commit

> 🚨 **IMMEDIATE ACTIONS REQUIRED:**

```bash
# 1. ROTATE THE SECRET IMMEDIATELY
# - Stripe: Dashboard → Developers → API keys → Roll keys
# - Supabase: Dashboard → Settings → API → Generate new keys
# - Update production environment variables

# 2. Remove from git history using BFG
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror git@github.com:your-org/ember-ascent.git

# Run BFG to remove the secret
java -jar bfg.jar --replace-text passwords.txt ember-ascent.git

# Clean up
cd ember-ascent.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (requires temporarily disabling branch protection)
git push --force

# 3. Document in incident log

# 4. If child data potentially exposed:
#    - Notify ICO within 72 hours
#    - Document affected data types
#    - Assess risk to data subjects
```

### 9.2 Hotfix Procedure

For critical production bugs or security vulnerabilities:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-description

# 2. Make minimal fix
# - Only fix the critical issue
# - No refactoring or feature work

# 3. Commit with appropriate type
git commit -m "security(auth): patch session hijacking vulnerability"
# OR
git commit -m "fix(payment): resolve webhook signature failure"

# 4. Create PR with [HOTFIX] prefix
# - Request expedited review (1 senior approval minimum)
# - Link to incident/issue

# 5. After approval, merge to main
# Deploy immediately to production

# 6. Cherry-pick to develop
git checkout develop
git cherry-pick <hotfix-commit-hash>
git push origin develop

# 7. Tag with patch version
git checkout main
git tag -a v1.0.1 -m "Hotfix: [description]"
git push origin v1.0.1
```

### 9.3 Rollback Procedure

```bash
# 1. Identify the last known good version
git log --oneline main

# 2. Revert to previous version
git checkout main
git revert HEAD  # Revert last commit
# OR
git revert <bad-commit-hash>  # Revert specific commit

# 3. Push revert
git push origin main

# 4. Redeploy (Vercel will auto-deploy from main)

# 5. Document incident
```

---

## 10. Quick Reference Checklist

### Before Every Commit

- [ ] Message follows `type(scope): description` format
- [ ] No secrets, API keys, or credentials in code
- [ ] No child PII in test data, logs, or error messages
- [ ] Pre-commit hooks pass (lint, type-check, secrets scan)
- [ ] Changes are atomic (one logical change per commit)

### Before Every PR

- [ ] PR title follows commit message format
- [ ] Description includes Security Checklist
- [ ] All CI checks pass
- [ ] RLS policies reviewed if database changes
- [ ] Stripe changes reviewed for PCI compliance
- [ ] Screenshots included for UI changes

### Before Every Release

- [ ] Version bumped following SemVer
- [ ] CHANGELOG.md updated
- [ ] Staging environment tested
- [ ] Database migrations tested with rollback
- [ ] Security audit passed
- [ ] Tag created with annotated message

---

## Appendix A: Example Commits

### Good Commits ✅

```bash
feat(quiz): add timer mode for timed practice sessions

Implements optional countdown timer matching GL Assessment
exam conditions. Timer displays remaining time and auto-submits
when expired.

- Add TimerDisplay component
- Implement countdown logic with pause/resume
- Store timed session metadata
- Add user preference for timer default

Closes #42
```

```bash
security(rls): add policy for child_profiles table

Ensures parents can only access their own children's profiles.
Policy checks auth.uid() = parent_id for all CRUD operations.

Affected data: child first names, year groups, practice history
Compliance: ICO Children's Code - data minimisation
```

```bash
fix(payment): handle Stripe webhook idempotency

Adds idempotency check to prevent duplicate subscription
activations when Stripe retries webhook delivery.

- Store processed event IDs in database
- Check for duplicates before processing
- Return 200 for already-processed events
```

### Bad Commits ❌

```bash
# Too vague
fixed stuff

# No scope
feat: add new feature

# Wrong case
Feat(Quiz): Add Timer Mode

# Contains secret (NEVER DO THIS)
fix(auth): use correct api key sk_live_xxx

# Too long, multiple changes
feat(quiz): add timer, fix scoring, update UI, refactor database
```

---

## Appendix B: Gitleaks Configuration

Create `.gitleaks.toml`:

```toml
title = "Ember Ascent Gitleaks Config"

[allowlist]
description = "Global allowlist"
paths = [
  '''\.env\.example$''',
  '''COMMIT_POLICY\.md$''',
]

[[rules]]
id = "stripe-secret-key"
description = "Stripe Secret Key"
regex = '''sk_(live|test)_[0-9a-zA-Z]{24,}'''
tags = ["stripe", "secret"]

[[rules]]
id = "supabase-service-role"
description = "Supabase Service Role Key"
regex = '''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+'''
tags = ["supabase", "jwt"]

[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey|api[_-]?secret)['":\s]*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?'''
tags = ["api", "key"]
```

---

## Appendix C: Useful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  # Commit with conventional format prompt
  cm = "!git commit -m \"$(read -p 'Type: ' t; read -p 'Scope: ' s; read -p 'Message: ' m; echo \"$t($s): $m\")\""
  
  # View recent commits nicely
  lg = log --oneline --graph --decorate -20
  
  # Show what would be committed
  dc = diff --cached
  
  # Amend without editing message
  amend = commit --amend --no-edit
  
  # Undo last commit (keep changes)
  undo = reset --soft HEAD~1
  
  # Show branches with last commit
  branches = branch -v
  
  # Clean merged branches
  cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
```

---

*Ember Ascent | Commit Policy v1.0*  
*Quality over cost, transparency over opacity, simplicity over complexity.*

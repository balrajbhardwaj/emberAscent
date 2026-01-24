# End-to-End Testing Strategy - Ember Ascent

## Executive Summary

This document outlines a comprehensive, modular end-to-end testing framework for Ember Ascent. The testing structure follows a **Module → Feature → Functionality** hierarchy aligned with the application architecture, enabling granular test execution and automated fix cycles.

---

## 1. Testing Framework Recommendation

### Recommended Stack

| Component | Tool | Rationale |
|-----------|------|-----------|
| **E2E Testing** | Playwright | Best-in-class for modern web apps, multi-browser, great TypeScript support |
| **Component Testing** | React Testing Library + Vitest | Fast, follows React best practices |
| **API Testing** | Vitest + Supertest | Lightweight, integrates with existing TypeScript |
| **Visual Regression** | Percy (optional) | Catch UI regressions automatically |
| **Coverage Reporting** | c8/Istanbul | Built into Vitest |
| **CI/CD Integration** | GitHub Actions | Free for public repos, easy Playwright integration |

### Why Playwright Over Alternatives?

| Feature | Playwright | Cypress | Puppeteer |
|---------|------------|---------|-----------|
| Multi-browser | ✅ Chrome, Firefox, WebKit | ⚠️ Chrome, Firefox (experimental) | ❌ Chrome only |
| TypeScript support | ✅ Excellent | ✅ Good | ⚠️ Fair |
| Parallel execution | ✅ Built-in | ⚠️ Paid feature | ❌ Manual |
| Auto-wait | ✅ Smart defaults | ✅ Smart defaults | ❌ Manual |
| Component testing | ✅ Yes | ✅ Yes | ❌ No |
| Network interception | ✅ Powerful | ✅ Good | ⚠️ Limited |
| Video recording | ✅ Built-in | ✅ Built-in | ❌ Manual |
| Cost | Free | Free (limited) | Free |

**Decision: Playwright** for E2E, Vitest for component/API testing.

---

## 2. Module Structure Analysis

Based on the current codebase, here's the module hierarchy:

```
Ember Ascent Platform
├── 🔐 Authentication Module
│   ├── Feature: User Registration
│   │   ├── Signup with email/password
│   │   ├── Email validation
│   │   └── Profile creation
│   ├── Feature: User Login
│   │   ├── Login with credentials
│   │   ├── Session management
│   │   └── "Remember me" functionality
│   ├── Feature: Password Recovery
│   │   ├── Forgot password flow
│   │   ├── Reset password with token
│   │   └── Email delivery verification
│   └── Feature: Onboarding
│       ├── Child profile setup
│       ├── Avatar selection
│       └── Year group/school selection
│
├── 🎯 Practice Module
│   ├── Feature: Quick Byte (Daily 4-question mode)
│   │   ├── Daily question generation
│   │   ├── Immediate feedback
│   │   └── Daily completion tracking
│   ├── Feature: Focus Sessions
│   │   ├── Topic selection
│   │   ├── Difficulty selection
│   │   ├── Question navigation
│   │   ├── Answer submission
│   │   └── Session completion
│   ├── Feature: Mock Tests
│   │   ├── Template selection
│   │   ├── Timer functionality
│   │   ├── Question flagging
│   │   ├── Navigator grid
│   │   ├── Auto-submit on timeout
│   │   └── Results analysis
│   └── Feature: Adaptive Engine
│       ├── Difficulty adjustment
│       ├── Performance tracking
│       └── Question selection algorithm
│
├── 📊 Analytics Module (Ascent Tier)
│   ├── Feature: Weakness Heatmap
│   │   ├── Topic-level performance
│   │   ├── Visual grid display
│   │   └── Drill-down functionality
│   ├── Feature: Learning Health Check
│   │   ├── Rush factor detection
│   │   ├── Fatigue pattern analysis
│   │   └── Stagnant topic identification
│   ├── Feature: Readiness Score
│   │   ├── Composite score calculation
│   │   ├── Breakdown by component
│   │   └── Historical tracking
│   ├── Feature: Growth Tracking
│   │   ├── Subject-wise trends
│   │   ├── Time-series charts
│   │   └── Benchmarking
│   └── Feature: Study Plans
│       ├── AI-generated recommendations
│       ├── Priority-based suggestions
│       └── Weekly report emails
│
├── 📈 Progress Module
│   ├── Feature: Session History
│   │   ├── List all sessions
│   │   ├── Filter by type/subject/date
│   │   └── Detailed session view
│   ├── Feature: Topic Progress
│   │   ├── Subject breakdown
│   │   ├── Topic completion %
│   │   └── Difficulty distribution
│   └── Feature: Bookmarks
│       ├── Save questions
│       ├── Review bookmarked questions
│       └── Remove bookmarks
│
├── 🏆 Gamification Module
│   ├── Feature: Achievements
│   │   ├── Achievement unlocking
│   │   ├── Category filtering
│   │   ├── Rarity display
│   │   └── Progress tracking
│   └── Feature: Streaks
│       ├── Daily streak tracking
│       ├── Calendar visualization
│       ├── At-risk warnings
│       └── Streak freeze (premium)
│
├── ⚙️ Settings Module
│   ├── Feature: Profile Management
│   │   ├── Update parent info
│   │   ├── Password change
│   │   └── Email preferences
│   ├── Feature: Child Management
│   │   ├── Add children
│   │   ├── Edit child profiles
│   │   ├── Switch active child
│   │   └── Delete children
│   └── Feature: Subscription
│       ├── View current plan
│       ├── Upgrade to Ascent
│       ├── Manage billing
│       └── Cancel subscription
│
├── 🛡️ Admin Module
│   ├── Feature: User Management
│   │   ├── View all users
│   │   ├── Impersonation
│   │   └── Audit logs
│   ├── Feature: Question Management
│   │   ├── Review error reports
│   │   ├── Edit questions
│   │   ├── Approve new questions
│   │   └── Update Ember scores
│   └── Feature: Analytics Dashboard
│       ├── Platform metrics
│       ├── Revenue tracking
│       └── Usage statistics
│
├── 👀 Reviewer Module
│   ├── Feature: Review Queue
│   │   ├── Assigned questions
│   │   ├── Review interface
│   │   └── Submission
│   ├── Feature: Review History
│   │   ├── Completed reviews
│   │   └── Earnings tracking
│   └── Feature: Stats Dashboard
│       ├── Reviews completed
│       ├── Accuracy metrics
│       └── Payment history
│
└── 🌐 Marketing Module
    ├── Feature: Landing Page
    ├── Feature: Pricing Page
    ├── Feature: Transparency Pages
    └── Feature: How Questions Are Made
```

---

## 3. Testing Hierarchy Structure

### 3.1 Directory Structure

```
/tests
├── /e2e                           # End-to-end tests (Playwright)
│   ├── /auth                      # Authentication module
│   │   ├── /signup
│   │   │   ├── signup-basic.spec.ts
│   │   │   ├── signup-validation.spec.ts
│   │   │   └── signup-edge-cases.spec.ts
│   │   ├── /login
│   │   │   ├── login-success.spec.ts
│   │   │   ├── login-failure.spec.ts
│   │   │   └── login-session.spec.ts
│   │   ├── /password-recovery
│   │   │   ├── forgot-password.spec.ts
│   │   │   └── reset-password.spec.ts
│   │   └── /onboarding
│   │       ├── child-setup.spec.ts
│   │       └── avatar-selection.spec.ts
│   │
│   ├── /practice                  # Practice module
│   │   ├── /quick-byte
│   │   │   ├── daily-generation.spec.ts
│   │   │   ├── answer-submission.spec.ts
│   │   │   └── daily-limit.spec.ts
│   │   ├── /focus-sessions
│   │   │   ├── topic-selection.spec.ts
│   │   │   ├── question-flow.spec.ts
│   │   │   └── session-completion.spec.ts
│   │   ├── /mock-tests
│   │   │   ├── template-selection.spec.ts
│   │   │   ├── timer-functionality.spec.ts
│   │   │   ├── navigation.spec.ts
│   │   │   ├── flagging.spec.ts
│   │   │   ├── auto-submit.spec.ts
│   │   │   └── results-display.spec.ts
│   │   └── /adaptive
│   │       ├── difficulty-adjustment.spec.ts
│   │       └── question-selection.spec.ts
│   │
│   ├── /analytics                 # Analytics module
│   │   ├── /weakness-heatmap
│   │   ├── /learning-health
│   │   ├── /readiness-score
│   │   ├── /growth-tracking
│   │   └── /study-plans
│   │
│   ├── /progress                  # Progress module
│   │   ├── /session-history
│   │   ├── /topic-progress
│   │   └── /bookmarks
│   │
│   ├── /gamification              # Gamification module
│   │   ├── /achievements
│   │   └── /streaks
│   │
│   ├── /settings                  # Settings module
│   │   ├── /profile
│   │   ├── /children
│   │   └── /subscription
│   │
│   ├── /admin                     # Admin module
│   │   ├── /users
│   │   ├── /questions
│   │   └── /analytics
│   │
│   ├── /reviewer                  # Reviewer module
│   │   ├── /queue
│   │   ├── /history
│   │   └── /stats
│   │
│   └── /marketing                 # Marketing pages
│       ├── landing.spec.ts
│       ├── pricing.spec.ts
│       └── transparency.spec.ts
│
├── /component                     # Component tests (Vitest)
│   ├── /auth
│   ├── /practice
│   ├── /analytics
│   └── /ui
│
├── /api                           # API tests (Vitest + Supertest)
│   ├── /auth
│   ├── /practice
│   ├── /analytics
│   └── /admin
│
├── /fixtures                      # Test data
│   ├── users.ts
│   ├── questions.ts
│   ├── sessions.ts
│   └── analytics.ts
│
├── /helpers                       # Test utilities
│   ├── auth-helpers.ts
│   ├── db-helpers.ts
│   ├── navigation-helpers.ts
│   └── assertion-helpers.ts
│
├── /config                        # Test configuration
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   └── test-constants.ts
│
└── /reports                       # Test results & logs
    ├── /playwright-report
    ├── /coverage
    ├── /screenshots
    └── /videos
```

### 3.2 Test Naming Convention

```typescript
// Format: [module]-[feature]-[scenario].spec.ts

// Examples:
auth-login-success.spec.ts
auth-login-invalid-credentials.spec.ts
practice-mock-timer-expiry.spec.ts
analytics-heatmap-drill-down.spec.ts
```

---

## 4. Master Test Runner Script

### 4.1 CLI Interface

```bash
# Run all tests
npm run test

# Run specific module
npm run test:module auth
npm run test:module practice

# Run specific feature
npm run test:feature auth/login
npm run test:feature practice/mock-tests

# Run specific functionality
npm run test:spec auth-login-success

# Run by tag
npm run test:tag @critical
npm run test:tag @regression

# Run with options
npm run test:module practice --headed
npm run test:module analytics --browser firefox
npm run test --parallel 4
```

### 4.2 Master Script Implementation

```typescript
// scripts/test-runner.ts

interface TestRunConfig {
  scope: 'all' | 'module' | 'feature' | 'spec';
  target?: string;
  browser?: 'chromium' | 'firefox' | 'webkit' | 'all';
  headed?: boolean;
  parallel?: number;
  tags?: string[];
  retries?: number;
  reportFormat?: 'html' | 'json' | 'junit';
}

interface TestResult {
  module: string;
  feature: string;
  spec: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
}

interface TestReport {
  runId: string;
  timestamp: string;
  config: TestRunConfig;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
  recommendations: string[];
  failedTests: TestResult[];
}

class TestRunner {
  async run(config: TestRunConfig): Promise<TestReport> {
    console.log('🚀 Starting Ember Ascent Test Suite...\n');
    
    // 1. Setup test environment
    await this.setupEnvironment();
    
    // 2. Determine test files to run
    const testFiles = this.resolveTestFiles(config);
    console.log(`📋 Found ${testFiles.length} test files\n`);
    
    // 3. Execute tests
    const results = await this.executeTests(testFiles, config);
    
    // 4. Generate report
    const report = this.generateReport(results, config);
    
    // 5. Save report
    await this.saveReport(report);
    
    // 6. Display summary
    this.displaySummary(report);
    
    // 7. Check for failures
    if (report.failedTests.length > 0) {
      await this.handleFailures(report);
    }
    
    return report;
  }
  
  private async setupEnvironment(): Promise<void> {
    // Ensure test database is fresh
    // Seed test data
    // Clear browser cache/storage
  }
  
  private resolveTestFiles(config: TestRunConfig): string[] {
    // Logic to find test files based on scope
  }
  
  private async executeTests(
    files: string[], 
    config: TestRunConfig
  ): Promise<TestResult[]> {
    // Execute with Playwright/Vitest
  }
  
  private generateReport(
    results: TestResult[], 
    config: TestRunConfig
  ): TestReport {
    // Create comprehensive report
  }
  
  private async saveReport(report: TestReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `test-report-${timestamp}.json`;
    const filepath = path.join(__dirname, '../tests/reports', filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also generate HTML report
    await this.generateHTMLReport(report, filepath.replace('.json', '.html'));
  }
  
  private displaySummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏭️  Skipped: ${report.summary.skipped}`);
    console.log(`⏱️  Duration: ${report.summary.duration}ms`);
    console.log('='.repeat(60) + '\n');
    
    if (report.failedTests.length > 0) {
      console.log('❌ FAILED TESTS:');
      report.failedTests.forEach(test => {
        console.log(`  - ${test.module}/${test.feature}/${test.spec}`);
        console.log(`    Error: ${test.error}`);
      });
      console.log();
    }
    
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
      console.log();
    }
  }
  
  private async handleFailures(report: TestReport): Promise<void> {
    console.log('\n🔧 FAILURE ANALYSIS\n');
    
    // Analyze failure patterns
    const analysis = this.analyzeFailures(report.failedTests);
    
    console.log('Failure Categories:');
    Object.entries(analysis.categories).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
    
    // Prompt for auto-fix
    const shouldAutoFix = await this.promptForAutoFix();
    
    if (shouldAutoFix) {
      await this.attemptAutoFix(report.failedTests);
    } else {
      console.log('\nSkipping auto-fix. Manual intervention required.');
      console.log('Run: npm run test:fix to attempt fixes later.\n');
    }
  }
  
  private analyzeFailures(failures: TestResult[]) {
    // Categorize failures: timeout, assertion, network, etc.
    const categories: Record<string, number> = {};
    
    failures.forEach(failure => {
      const category = this.categorizeFailure(failure);
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return { categories };
  }
  
  private categorizeFailure(failure: TestResult): string {
    if (failure.error?.includes('Timeout')) return 'Timeout';
    if (failure.error?.includes('expect')) return 'Assertion';
    if (failure.error?.includes('network')) return 'Network';
    if (failure.error?.includes('selector')) return 'Selector';
    return 'Unknown';
  }
  
  private async promptForAutoFix(): Promise<boolean> {
    // Interactive prompt
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    return new Promise(resolve => {
      readline.question('Attempt auto-fix? (y/n): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }
  
  private async attemptAutoFix(failures: TestResult[]): Promise<void> {
    console.log('\n🔨 Attempting auto-fix...\n');
    
    for (const failure of failures) {
      const fix = this.generateFix(failure);
      
      if (fix) {
        console.log(`Applying fix for: ${failure.spec}`);
        await this.applyFix(fix);
      } else {
        console.log(`No auto-fix available for: ${failure.spec}`);
      }
    }
    
    console.log('\n✅ Auto-fix complete. Re-running failed tests...\n');
    
    // Re-run failed tests
    const retryConfig: TestRunConfig = {
      scope: 'spec',
      target: failures.map(f => f.spec).join(','),
    };
    
    const retryResults = await this.run(retryConfig);
    
    if (retryResults.failedTests.length === 0) {
      console.log('✅ All tests now passing!');
    } else {
      console.log(`⚠️  ${retryResults.failedTests.length} tests still failing.`);
      console.log('Manual intervention required.');
    }
  }
  
  private generateFix(failure: TestResult): Fix | null {
    // AI-assisted fix generation
    // Pattern matching for common issues
    return null;
  }
  
  private async applyFix(fix: Fix): Promise<void> {
    // Apply code changes
  }
}

// Run from CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = parseArgs(args);
  
  const runner = new TestRunner();
  runner.run(config).catch(console.error);
}
```

---

## 5. Testing Cycle Workflow

### 5.1 Automated Testing Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. RUN TESTS                                │
│  npm run test:module practice                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  2. COLLECT RESULTS                             │
│  - Passed: 45                                                   │
│  - Failed: 5                                                    │
│  - Duration: 2m 34s                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  3. GENERATE REPORT                             │
│  - HTML report: tests/reports/report-2026-01-24.html           │
│  - JSON log: tests/reports/report-2026-01-24.json              │
│  - Screenshots: tests/reports/screenshots/                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  4. ANALYZE FAILURES                            │
│  - Timeout errors: 2                                            │
│  - Assertion errors: 2                                          │
│  - Selector errors: 1                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. PROMPT FOR ACTION                               │
│  "5 tests failed. Options:                                      │
│   [1] Attempt auto-fix                                          │
│   [2] Show detailed errors                                      │
│   [3] Skip and continue                                         │
│   [4] Exit"                                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
    ┌────────────────┐     ┌────────────────┐
    │   AUTO-FIX     │     │  MANUAL FIX    │
    │   ATTEMPTED    │     │   REQUIRED     │
    └───────┬────────┘     └────────┬───────┘
            │                       │
            │                       │
            ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  6. RE-RUN FAILED TESTS                         │
│  npm run test:retry                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  7. VERIFY FIX                                  │
│  - If passing: ✅ Mark as resolved                              │
│  - If failing: ⚠️  Log for manual review                        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Interactive Test Runner

```bash
$ npm run test:interactive

┌─────────────────────────────────────────────────────────┐
│          EMBER ASCENT - TEST SUITE RUNNER               │
│                                                         │
│  What would you like to test?                           │
│                                                         │
│  [1] Run all tests                                      │
│  [2] Select module                                      │
│  [3] Select feature                                     │
│  [4] Run specific test                                  │
│  [5] Run tagged tests (@critical, @smoke, etc.)         │
│  [6] View previous test reports                         │
│  [7] Exit                                               │
│                                                         │
│  Choice:                                                │
└─────────────────────────────────────────────────────────┘

# User selects [2] Select module

┌─────────────────────────────────────────────────────────┐
│          SELECT MODULE TO TEST                          │
│                                                         │
│  [1] 🔐 Authentication                                  │
│  [2] 🎯 Practice                                        │
│  [3] 📊 Analytics                                       │
│  [4] 📈 Progress                                        │
│  [5] 🏆 Gamification                                    │
│  [6] ⚙️  Settings                                        │
│  [7] 🛡️  Admin                                          │
│  [8] 👀 Reviewer                                        │
│  [9] 🌐 Marketing                                       │
│  [0] Back                                               │
│                                                         │
│  Choice:                                                │
└─────────────────────────────────────────────────────────┘

# User selects [2] Practice

┌─────────────────────────────────────────────────────────┐
│          PRACTICE MODULE - SELECT FEATURE               │
│                                                         │
│  [1] Quick Byte (12 tests)                             │
│  [2] Focus Sessions (28 tests)                         │
│  [3] Mock Tests (34 tests)                             │
│  [4] Adaptive Engine (15 tests)                        │
│  [5] Run all Practice tests (89 tests)                 │
│  [0] Back                                               │
│                                                         │
│  Choice:                                                │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Test Implementation Examples

### 6.1 Authentication Module - Login Test

```typescript
// tests/e2e/auth/login/login-success.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../../helpers/auth-helpers';
import { TEST_USERS } from '../../../fixtures/users';

/**
 * Authentication Module
 * Feature: User Login
 * Functionality: Successful login with valid credentials
 */
test.describe('Auth - Login - Success Flow', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await page.goto('/login');
  });
  
  test('should login successfully with correct credentials', async ({ page }) => {
    // Arrange
    const user = TEST_USERS.freeUser;
    
    // Act
    await authHelper.login(user.email, user.password);
    
    // Assert
    await expect(page).toHaveURL('/practice');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText(user.name);
  });
  
  test('should persist session after page refresh', async ({ page }) => {
    // Arrange
    const user = TEST_USERS.freeUser;
    await authHelper.login(user.email, user.password);
    
    // Act
    await page.reload();
    
    // Assert
    await expect(page).toHaveURL('/practice');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
  
  test('should redirect to setup if no children exist', async ({ page }) => {
    // Arrange
    const user = TEST_USERS.noChildrenUser;
    
    // Act
    await authHelper.login(user.email, user.password);
    
    // Assert
    await expect(page).toHaveURL('/setup');
    await expect(page.locator('h1')).toContainText('Set Up Your First Child');
  });
});
```

### 6.2 Practice Module - Mock Test

```typescript
// tests/e2e/practice/mock-tests/timer-functionality.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../../helpers/auth-helpers';
import { MockTestHelper } from '../../../helpers/mock-test-helpers';
import { TEST_USERS } from '../../../fixtures/users';

/**
 * Practice Module
 * Feature: Mock Tests
 * Functionality: Timer countdown and auto-submit
 */
test.describe('Practice - Mock Tests - Timer', () => {
  let authHelper: AuthHelper;
  let mockTestHelper: MockTestHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    mockTestHelper = new MockTestHelper(page);
    
    // Login and navigate to mock tests
    await authHelper.login(TEST_USERS.ascentUser.email, TEST_USERS.ascentUser.password);
    await page.goto('/practice/mock');
  });
  
  test('should display timer countdown', async ({ page }) => {
    // Arrange
    await mockTestHelper.selectTemplate('Quick Mock (10 mins)');
    await mockTestHelper.startTest();
    
    // Assert
    const timer = page.locator('[data-testid="mock-timer"]');
    await expect(timer).toBeVisible();
    await expect(timer).toContainText('10:00');
  });
  
  test('should show warning at 5 minutes remaining', async ({ page }) => {
    // Arrange
    await mockTestHelper.selectTemplate('Quick Mock (10 mins)');
    await mockTestHelper.startTest();
    
    // Act - Fast-forward to 5 minutes remaining
    await mockTestHelper.setTimeRemaining(300);
    
    // Assert
    const timer = page.locator('[data-testid="mock-timer"]');
    await expect(timer).toHaveClass(/warning/);
    await expect(page.locator('[data-testid="time-warning"]')).toBeVisible();
  });
  
  test('should auto-submit when timer reaches zero', async ({ page }) => {
    // Arrange
    await mockTestHelper.selectTemplate('Quick Mock (10 mins)');
    await mockTestHelper.startTest();
    
    // Act - Fast-forward to time expiry
    await mockTestHelper.setTimeRemaining(0);
    
    // Assert
    await expect(page).toHaveURL(/\/results$/);
    await expect(page.locator('[data-testid="auto-submit-notice"]')).toBeVisible();
  });
});
```

### 6.3 Analytics Module - Weakness Heatmap

```typescript
// tests/e2e/analytics/weakness-heatmap/drill-down.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../../helpers/auth-helpers';
import { AnalyticsHelper } from '../../../helpers/analytics-helpers';
import { TEST_USERS } from '../../../fixtures/users';

/**
 * Analytics Module (Ascent Tier)
 * Feature: Weakness Heatmap
 * Functionality: Drill-down into specific topics
 */
test.describe('Analytics - Heatmap - Drill Down', () => {
  let authHelper: AuthHelper;
  let analyticsHelper: AnalyticsHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    analyticsHelper = new AnalyticsHelper(page);
    
    // Login as Ascent user
    await authHelper.login(TEST_USERS.ascentUser.email, TEST_USERS.ascentUser.password);
    await page.goto('/analytics2');
  });
  
  test('should display heatmap for all subjects', async ({ page }) => {
    // Assert
    await expect(page.locator('[data-testid="heatmap"]')).toBeVisible();
    
    const subjects = ['Mathematics', 'English', 'Verbal Reasoning'];
    for (const subject of subjects) {
      await expect(page.locator(`[data-subject="${subject}"]`)).toBeVisible();
    }
  });
  
  test('should show topic details on hover', async ({ page }) => {
    // Act
    await page.locator('[data-topic="fractions"]').hover();
    
    // Assert
    const tooltip = page.locator('[data-testid="topic-tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Fractions');
    await expect(tooltip).toContainText(/\d+% accuracy/);
  });
  
  test('should drill down to topic detail view', async ({ page }) => {
    // Act
    await page.locator('[data-topic="fractions"]').click();
    
    // Assert
    await expect(page).toHaveURL(/topic=fractions/);
    await expect(page.locator('h2')).toContainText('Fractions Analysis');
    await expect(page.locator('[data-testid="subtopic-breakdown"]')).toBeVisible();
  });
});
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml

name: E2E Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run nightly at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      module:
        description: 'Module to test (leave blank for all)'
        required: false
        type: choice
        options:
          - all
          - auth
          - practice
          - analytics
          - progress
          - gamification
          - settings
          - admin
          - reviewer
          - marketing

jobs:
  e2e-tests:
    name: E2E Tests - ${{ matrix.browser }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1/4, 2/4, 3/4, 4/4]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Setup test database
        run: |
          npm run db:test:setup
          npm run db:test:seed
      
      - name: Run E2E tests
        run: |
          if [ "${{ github.event.inputs.module }}" != "" ]; then
            npm run test:module ${{ github.event.inputs.module }} -- --browser=${{ matrix.browser }} --shard=${{ matrix.shard }}
          else
            npm run test:e2e -- --browser=${{ matrix.browser }} --shard=${{ matrix.shard }}
          fi
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.browser }}-${{ matrix.shard }}
          path: tests/reports/
          retention-days: 30
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-${{ matrix.browser }}-${{ matrix.shard }}
          path: tests/reports/screenshots/
          retention-days: 7
      
      - name: Publish test report
        if: always()
        uses: mikepenz/action-junit-report@v4
        with:
          report_paths: 'tests/reports/junit/*.xml'
          check_name: E2E Tests - ${{ matrix.browser }}
  
  test-summary:
    name: Test Summary
    needs: e2e-tests
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Download all reports
        uses: actions/download-artifact@v4
        with:
          path: all-reports
      
      - name: Generate consolidated report
        run: |
          # Merge all reports
          node scripts/merge-test-reports.js
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('consolidated-report.json'));
            
            const comment = `
            ## 🧪 E2E Test Results
            
            | Metric | Value |
            |--------|-------|
            | Total Tests | ${report.total} |
            | ✅ Passed | ${report.passed} |
            | ❌ Failed | ${report.failed} |
            | ⏭️ Skipped | ${report.skipped} |
            | ⏱️ Duration | ${report.duration} |
            
            ${report.failed > 0 ? `### ❌ Failed Tests\n${report.failedTests.map(t => `- ${t}`).join('\n')}` : '✅ All tests passed!'}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 8. Feature Implementation Tracking

### 8.1 HTML Feature Status Page

We'll create an interactive HTML page that shows all planned features and their implementation status across phases.

```html
<!-- public/feature-status.html -->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ember Ascent - Feature Implementation Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .header-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      font-size: 0.9rem;
      color: #666;
    }
    
    .progress-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .progress-card {
      padding: 20px;
      border-radius: 12px;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
    }
    
    .progress-card h3 {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .progress-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }
    
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 8px 16px;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }
    
    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .module {
      margin-bottom: 40px;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .module-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .module-header h2 {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .module-stats {
      display: flex;
      gap: 15px;
      font-size: 0.9rem;
    }
    
    .module-content {
      padding: 20px;
    }
    
    .feature {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .feature:last-child {
      border-bottom: none;
    }
    
    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .feature-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }
    
    .phase-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .phase-1 {
      background: #d4edda;
      color: #155724;
    }
    
    .phase-2 {
      background: #fff3cd;
      color: #856404;
    }
    
    .phase-3 {
      background: #f8d7da;
      color: #721c24;
    }
    
    .functionalities {
      list-style: none;
      padding-left: 20px;
    }
    
    .functionality {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .status-icon {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    
    .status-done {
      background: #28a745;
      color: white;
    }
    
    .status-progress {
      background: #ffc107;
      color: white;
    }
    
    .status-planned {
      background: #6c757d;
      color: white;
    }
    
    .functionality-name {
      flex: 1;
    }
    
    .test-coverage {
      font-size: 0.85rem;
      color: #666;
      padding: 2px 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔥 Ember Ascent</h1>
    <div class="header-meta">
      <span>Feature Implementation Status</span>
      <span>•</span>
      <span>Last Updated: January 24, 2026</span>
      <span>•</span>
      <span>Phase 1 MVP</span>
    </div>
    
    <div class="progress-summary">
      <div class="progress-card">
        <h3>Overall Completion</h3>
        <div class="value">68%</div>
      </div>
      <div class="progress-card">
        <h3>Features</h3>
        <div class="value">48/71</div>
      </div>
      <div class="progress-card">
        <h3>Test Coverage</h3>
        <div class="value">0%</div>
      </div>
      <div class="progress-card">
        <h3>Active Phase</h3>
        <div class="value">Day 18</div>
      </div>
    </div>
    
    <div class="filters">
      <button class="filter-btn active" data-filter="all">All Features</button>
      <button class="filter-btn" data-filter="done">✅ Completed</button>
      <button class="filter-btn" data-filter="progress">🚧 In Progress</button>
      <button class="filter-btn" data-filter="planned">📋 Planned</button>
      <button class="filter-btn" data-filter="phase-1">Phase 1</button>
      <button class="filter-btn" data-filter="phase-2">Phase 2</button>
    </div>
    
    <!-- AUTHENTICATION MODULE -->
    <div class="module" data-module="auth">
      <div class="module-header">
        <h2>🔐 Authentication Module</h2>
        <div class="module-stats">
          <span>✅ 8</span>
          <span>🚧 0</span>
          <span>📋 0</span>
        </div>
      </div>
      <div class="module-content">
        <!-- User Registration -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">User Registration</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Signup with email/password</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Email validation</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Profile creation</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
          </ul>
        </div>
        
        <!-- User Login -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">User Login</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Login with credentials</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Session management</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">"Remember me" functionality</span>
              <span class="test-coverage">0/1 tests</span>
            </li>
          </ul>
        </div>
        
        <!-- Password Recovery -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">Password Recovery</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Forgot password flow</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Reset password with token</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- PRACTICE MODULE -->
    <div class="module" data-module="practice">
      <div class="module-header">
        <h2>🎯 Practice Module</h2>
        <div class="module-stats">
          <span>✅ 18</span>
          <span>🚧 2</span>
          <span>📋 5</span>
        </div>
      </div>
      <div class="module-content">
        <!-- Quick Byte -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">Quick Byte (Daily 4-question mode)</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Daily question generation</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Immediate feedback</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Daily completion tracking</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
          </ul>
        </div>
        
        <!-- Mock Tests -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">Mock Tests</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Template selection</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Timer functionality</span>
              <span class="test-coverage">0/5 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Question flagging</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Navigator grid</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Auto-submit on timeout</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="done">
              <span class="status-icon status-done">✓</span>
              <span class="functionality-name">Results analysis</span>
              <span class="test-coverage">0/4 tests</span>
            </li>
          </ul>
        </div>
        
        <!-- Focus Sessions -->
        <div class="feature" data-phase="1">
          <div class="feature-header">
            <div class="feature-title">Focus Sessions</div>
            <span class="phase-badge phase-1">Phase 1</span>
          </div>
          <ul class="functionalities">
            <li class="functionality" data-status="progress">
              <span class="status-icon status-progress">→</span>
              <span class="functionality-name">Topic selection</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="progress">
              <span class="status-icon status-progress">→</span>
              <span class="functionality-name">Difficulty selection</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="planned">
              <span class="status-icon status-planned">○</span>
              <span class="functionality-name">Question navigation</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
            <li class="functionality" data-status="planned">
              <span class="status-icon status-planned">○</span>
              <span class="functionality-name">Answer submission</span>
              <span class="test-coverage">0/2 tests</span>
            </li>
            <li class="functionality" data-status="planned">
              <span class="status-icon status-planned">○</span>
              <span class="functionality-name">Session completion</span>
              <span class="test-coverage">0/3 tests</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Continue with other modules... -->
    
  </div>
  
  <script>
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const functionalities = document.querySelectorAll('.functionality');
    const modules = document.querySelectorAll('.module');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        // Filter functionalities
        functionalities.forEach(func => {
          const status = func.dataset.status;
          const phase = func.closest('[data-phase]')?.dataset.phase;
          
          let show = false;
          
          if (filter === 'all') {
            show = true;
          } else if (filter === 'done') {
            show = status === 'done';
          } else if (filter === 'progress') {
            show = status === 'progress';
          } else if (filter === 'planned') {
            show = status === 'planned';
          } else if (filter.startsWith('phase-')) {
            show = phase === filter.split('-')[1];
          }
          
          func.style.display = show ? 'flex' : 'none';
        });
        
        // Hide empty modules
        modules.forEach(module => {
          const visibleFuncs = module.querySelectorAll('.functionality:not([style*="display: none"])');
          module.style.display = visibleFuncs.length > 0 ? 'block' : 'none';
        });
      });
    });
    
    // Collapsible modules
    document.querySelectorAll('.module-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
      });
    });
  </script>
</body>
</html>
```

This HTML page will be automatically generated by scanning the codebase and comparing against the phase plans.

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

| Task | Deliverable | Owner |
|------|-------------|-------|
| Install Playwright + Vitest | Testing framework ready | Dev |
| Create directory structure | Folder hierarchy | Dev |
| Set up test configuration | playwright.config.ts, vitest.config.ts | Dev |
| Create test helpers | auth-helpers.ts, db-helpers.ts | Dev |
| Build master test runner | test-runner.ts with CLI | Dev |
| Set up CI/CD pipeline | GitHub Actions workflow | Dev |

### Phase 2: Core Tests (Weeks 3-4)

| Task | Deliverable | Owner |
|------|-------------|-------|
| Authentication tests | 15 tests | Dev |
| Practice module tests | 35 tests | Dev |
| Progress module tests | 12 tests | Dev |
| Settings tests | 10 tests | Dev |
| Generate initial report | HTML status page | Dev |

### Phase 3: Advanced Tests (Weeks 5-6)

| Task | Deliverable | Owner |
|------|-------------|-------|
| Analytics tests | 20 tests | Dev |
| Gamification tests | 15 tests | Dev |
| Admin module tests | 18 tests | Dev |
| Reviewer module tests | 12 tests | Dev |
| Marketing pages tests | 8 tests | Dev |

### Phase 4: Optimization & Documentation (Week 7)

| Task | Deliverable | Owner |
|------|-------------|-------|
| Performance optimization | Faster test runs | Dev |
| Visual regression setup | Percy integration | Dev |
| Documentation | Complete test docs | Dev |
| Team training | Testing best practices | Dev |

---

## 10. Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Coverage | 80% | 0% | 🔴 Not Started |
| Tests Passing | >95% | N/A | 🔴 Not Started |
| Avg Test Duration | <5min | N/A | 🔴 Not Started |
| Flaky Tests | <5% | N/A | 🔴 Not Started |
| CI/CD Build Time | <15min | N/A | 🔴 Not Started |

---

## 11. Recommendations & Improvements

### Immediate Actions (Priority 1)

1. **Install Testing Framework**
   - Set up Playwright with TypeScript
   - Install Vitest for component tests
   - Configure test databases (separate from development)

2. **Create Test Fixtures**
   - Test users for each tier
   - Sample questions and sessions
   - Mock data generators

3. **Build Master Script**
   - CLI for running tests by module/feature
   - Automated reporting
   - Failure analysis

### Short-term Improvements (Priority 2)

4. **Visual Regression Testing**
   - Integrate Percy or similar
   - Baseline screenshots
   - Automated UI comparison

5. **Performance Testing**
   - Lighthouse CI integration
   - API response time tests
   - Database query optimization tests

6. **Security Testing**
   - OWASP ZAP integration
   - Authentication bypass tests
   - SQL injection tests
   - XSS vulnerability tests

### Long-term Enhancements (Priority 3)

7. **Load Testing**
   - k6 or Artillery for load tests
   - Concurrent user simulation
   - Database performance under load

8. **Accessibility Testing**
   - axe-core integration
   - Keyboard navigation tests
   - Screen reader compatibility

9. **Cross-browser Testing**
   - BrowserStack integration
   - Mobile device testing
   - Different viewport sizes

10. **Test Data Management**
    - Snapshot testing for complex data
    - Test data versioning
    - Automated test data refresh

---

## 12. Questions & Considerations

Before implementation, please confirm:

1. **Database Strategy**: Should tests use:
   - Separate test database?
   - Database transactions (rollback after each test)?
   - Docker container for isolated testing?

2. **Test Environment**: Do you want:
   - Local test environment only?
   - Staging environment for integration tests?
   - Production smoke tests (read-only)?

3. **Coverage Goals**: What's the target coverage?
   - Critical paths: 100%
   - All features: 80%+
   - Edge cases: 50%+

4. **CI/CD Budget**: Are you using:
   - Free tier (GitHub Actions minutes limited)?
   - Paid tier for unlimited minutes?
   - Self-hosted runners?

5. **Team Size**: Testing responsibility:
   - Just you?
   - Multiple developers?
   - QA team?

6. **Test Data Source**: Where will test questions come from?
   - Separate test question bank?
   - Copy of production data?
   - Generated/mock questions?

---

## Next Steps

1. **Review this strategy** and provide feedback
2. **Answer the questions** in Section 12
3. **Approve implementation plan**
4. **Start Phase 1** (Foundation setup)

Once approved, I'll begin implementing the testing framework module by module.


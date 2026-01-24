# Ember Ascent Testing Framework

Complete E2E and component testing framework for the Ember Ascent platform.

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Setup test database (see docs/TEST_DATABASE_SETUP.md)
# Create .env.test.local with your test Supabase credentials

# Run all tests
npm test

# Run E2E tests only
npm run test:e2e

# Run component/unit tests only
npm run test:unit

# Run with UI
npm run test:ui

# Run specific module
npm run test:auth
npm run test:practice

# Generate coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

## 📁 Directory Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth/              # Authentication tests
│   │   ├── login/
│   │   └── signup/
│   ├── practice/          # Practice session tests
│   │   ├── quick-byte/
│   │   └── mock-tests/
│   └── [other modules]/
├── component/             # React component tests
│   └── ember-score/
├── unit/                  # Unit tests
│   └── scoring/
├── fixtures/              # Test data
│   └── users.ts          # Test users & children
├── helpers/               # Test utilities
│   ├── auth-helpers.ts   # Authentication helpers
│   ├── db-helpers.ts     # Database operations
│   └── navigation-helpers.ts  # Navigation utilities
├── setup.ts              # Vitest setup
├── global-setup.ts       # Playwright global setup
└── global-teardown.ts    # Cleanup after tests
```

## 🧪 Test Types

### E2E Tests (Playwright)
- Full user journey testing
- Browser automation (Chromium)
- Real database interactions
- Example: Login flow, Quick Byte session

```typescript
test('should log in successfully', async ({ page }) => {
  const authHelper = new AuthHelper(page);
  await authHelper.login('test@example.com', 'password');
  expect(page).toHaveURL('/practice');
});
```

### Component Tests (Vitest + React Testing Library)
- Isolated component rendering
- User interaction testing
- Accessibility checks

```typescript
it('renders badge with score', () => {
  render(<EmberScoreBadge score={85} />);
  expect(screen.getByText('85')).toBeInTheDocument();
});
```

### Unit Tests (Vitest)
- Pure function testing
- Algorithm validation
- Business logic verification

```typescript
it('calculates ember score correctly', () => {
  const score = calculateEmberScore({ accuracy: 0.8, ... });
  expect(score).toBeGreaterThanOrEqual(60);
});
```

## 📚 Documentation

- [Testing Strategy](../docs/E2E_TESTING_STRATEGY.md) - Comprehensive 3,000+ line strategy
- [Quick Start Guide](../docs/TESTING_QUICK_START.md) - Quick reference
- [Test Database Setup](../docs/TEST_DATABASE_SETUP.md) - Separate test DB guide
- [Implementation Summary](../docs/TESTING_IMPLEMENTATION_SUMMARY.md) - Current status

## 🔧 Configuration

### Playwright (`playwright.config.ts`)
- **Browser**: Chromium only (CI budget optimization)
- **Base URL**: `http://localhost:3000`
- **Reporters**: HTML, JSON, JUnit, List
- **Screenshots**: On failure
- **Videos**: On failure
- **Test Database**: Via `.env.test.local`

### Vitest (`vitest.config.ts`)
- **Environment**: JSDOM (for React components)
- **Coverage**: 80% target (lines/functions/branches/statements)
- **Reporters**: HTML, JSON
- **Setup**: `tests/setup.ts` (global mocks)

## 🧑‍💻 Test Helpers

### AuthHelper
```typescript
const authHelper = new AuthHelper(page);
await authHelper.login(email, password);
await authHelper.signup(email, password, fullName);
await authHelper.logout();
await authHelper.setupFirstChild(name, yearGroup);
```

### NavigationHelper
```typescript
const navHelper = new NavigationHelper(page);
await navHelper.startQuickByte('mathematics');
await navHelper.startMockTest('11plus');
await navHelper.switchChild('Oliver');
await navHelper.goToAnalytics();
```

### Database Helpers
```typescript
await cleanupTestData();
const questions = await seedTestQuestions();
const session = await createTestSession(childId, 'quick_byte');
```

## 📊 Test Fixtures

Pre-configured test data for consistent testing:

```typescript
import { TEST_USERS } from './fixtures/users';

// Free tier user with 1 child
const freeUser = TEST_USERS.freeUser;

// Ascent user with 2 children
const ascentUser = TEST_USERS.ascentUser;

// Use in tests
await authHelper.loginAsTestUser(freeUser);
```

## 🎯 Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| E2E Tests | 80% features | 0% (setup phase) |
| Component Tests | 80% components | 0% (setup phase) |
| Unit Tests | 80% functions | 0% (setup phase) |

## 🔐 Test Database

**IMPORTANT**: Always use a separate test database.

1. Create new Supabase project for testing
2. Copy credentials to `.env.test.local`
3. Apply schema from production
4. Seed with test users and sample questions

See [TEST_DATABASE_SETUP.md](../docs/TEST_DATABASE_SETUP.md) for full guide.

## 🐛 Debugging

### View test results
```bash
npm run test:report
```

### Run tests in headed mode
```bash
npm run test:headed
```

### Debug specific test
```bash
npm run test:debug -- tests/e2e/auth/login/auth-login-success.spec.ts
```

### Check test database connection
```bash
npm test -- --grep "verify test database"
```

## 📝 Writing New Tests

### 1. Choose test type
- **E2E**: Full user flows (login, practice session)
- **Component**: UI components (buttons, cards, forms)
- **Unit**: Pure functions (scoring algorithms, validators)

### 2. Use appropriate structure

E2E test:
```typescript
/**
 * Test ID: E2E-MODULE-FEATURE-###
 * Priority: P0 (Critical) | P1 (High) | P2 (Medium)
 */
test.describe('Module - Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should [expected behavior]', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

Component test:
```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<Component prop={value} />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### 3. Follow naming conventions
- Test files: `feature-name.spec.ts` (E2E), `ComponentName.test.tsx` (component)
- Test names: Start with "should"
- Use descriptive names explaining expected behavior

### 4. Add test to tracking
Update `public/feature-status.html` when test is complete.

## 🚦 CI/CD Integration

### GitHub Actions (Not Yet Configured)

When ready:
1. Add test database secrets to GitHub
2. Create `.github/workflows/test.yml`
3. Run tests on PR and push to main
4. Upload test reports as artifacts

Free tier: 2,000 CI minutes/month

## 📈 Test Metrics

Track in `public/feature-status.html`:
- ✅ Test implemented
- 🔄 Test in progress
- ⏸️ Deferred
- ❌ Test failed

## 🤝 Contributing

1. Write tests for new features (TDD encouraged)
2. Run tests before committing: `npm test`
3. Ensure 80%+ coverage for new code
4. Update test documentation if adding new patterns
5. Follow commit policy: `test(scope): description`

## 📞 Support

- Check [E2E_TESTING_STRATEGY.md](../docs/E2E_TESTING_STRATEGY.md) for detailed guidance
- Review [TEST_DATABASE_SETUP.md](../docs/TEST_DATABASE_SETUP.md) for database issues
- Inspect test failures with `npm run test:report`

---

**Status**: ✅ Framework setup complete | ⏸️ Tests implementation in progress

**Next Steps**: 
1. Setup test database (see docs/TEST_DATABASE_SETUP.md)
2. Run first test: `npm run test:e2e -- tests/e2e/auth/login/auth-login-success.spec.ts`
3. Begin systematic test implementation following [TESTING_QUICK_START.md](../docs/TESTING_QUICK_START.md)

# Ember Ascent Documentation

**Navigation hub for all project documentation.**

## 🚀 Quick Start
- [Main README](../README.md) - Project overview, installation, quick start
- [Quick Start Guide](../QUICK_START.md) - Get up and running
- [Architecture Guidelines](../architecture-guidelines.md) - Production architecture & security
- [Commit Policy](../commit_policy.md) - Version control standards

---

## 📁 Documentation Structure

### 🛠️ Development
**Location:** `/docs/development/`

- [API Documentation](development/API.md) - API routes and endpoints
- [Architecture](development/architecture.md) - System architecture overview
- [Progress Tracker](development/PROGRESS.md) - Development milestones
- [Pending Tasks](development/pendingTasksTodo.md) - Current todo list
- [Refactor Tasks](development/refactorTasks.md) - Code improvement backlog

### ✨ Features
**Location:** `/docs/features/`

#### Core User Features
- [**Quick Byte**](features/QUICK_BYTE.md) - Daily 4-question micro-practice ⭐
- [**Explanation System**](features/EXPLANATION_SYSTEM.md) - AI-powered 3-mode explanations ⭐
- [**Practice Session Flow**](features/PRACTICE_SESSION.md) - Complete session lifecycle ⭐
- [**Recommendations**](features/RECOMMENDATIONS.md) - Analytics-driven study suggestions ⭐

#### Learning Systems
- [Adaptive System](features/ADAPTIVE_SYSTEM.md) - Adaptive learning engine
- [Adaptive Integration](features/ADAPTIVE_INTEGRATION.md) - Integration guide
- [Ember Score](features/EMBER_SCORE_INTEGRATION.md) - Question quality rating system

#### Analytics & Coaching
- [Ascent Guide](features/ASCENT_GUIDE_FEATURE.md) - Daily coaching narrative feature
- [Ascent Guide Tasks](features/ASCENT_GUIDE_TASKS.md) - Implementation tasks

#### Admin & Maintenance
- [Admin Study Plan Oversight](features/ADMIN_STUDY_PLAN_OVERSIGHT.md) - Admin features
- [Error Reporting](features/ERROR_REPORTING_SYSTEM.md) - Error handling system
- [Feature Status Dashboard](features/FEATURE_STATUS_DASHBOARD_UPDATE.md) - Feature tracking
- [New Features](features/NEW_FEATURES.md) - Recently added features
- [Integration Examples](features/INTEGRATION_EXAMPLES.md) - Code integration patterns

### 🗄️ Database
**Location:** `/docs/database/`

- [Database Schema](database/DATABASE_SCHEMA.md) - Full schema documentation
- [Question Import Status](database/QUESTION_IMPORT_STATUS.md) - Import progress
- [Y3 Import Guide](database/Y3_IMPORT_GUIDE.md) - Year 3 question import
- [Y3 Import Preparation](database/Y3_IMPORT_PREPARATION.md) - Import setup

### 🔒 Security & Compliance
**Location:** `/docs/security/`

- [Security Audit Report](security/SECURITY_AUDIT_REPORT.md) - Known issues & remediation
- [Security Implementation](security/SECURITY_IMPLEMENTATION.md) - Security features
- [Architecture Guidelines](../architecture-guidelines.md) - Security requirements (root)

**Key Standards:**
- UK GDPR compliant
- ICO Children's Code compliant
- PCI DSS ready (Stripe integration)
- Row Level Security (RLS) on all user tables

### 🧪 Testing
**Location:** `/docs/testing/`

- [Testing Guide](testing/TESTING.md) - Testing strategy
- [E2E Testing Strategy](testing/E2E_TESTING_STRATEGY.md) - End-to-end tests
- [Test Database Setup](testing/TEST_DATABASE_SETUP.md) - Test environment

### 📦 Archive
**Location:** `/docs/archive/`

Historical completion summaries and migration docs:
- Day completion summaries (DAY3, DAY10, DAY17, DAY18)
- Implementation summaries
- Tier migration docs

---

## 🔗 Component-Specific Documentation

### Supabase
- [Supabase Client Usage](../lib/supabase/README.md)
- [Database Migrations](../supabase/migrations/README.md)
- [Schema Documentation](../supabase/migrations/SCHEMA.md)

### Testing
- [Test Helpers](../tests/README.md)

### TypeScript Types
- [Type System Overview](../types/README.md)

---

## 📝 Documentation Standards

### File Naming
- Use UPPERCASE for top-level docs (e.g., `README.md`, `TESTING.md`)
- Use descriptive names with underscores (e.g., `EMBER_SCORE_INTEGRATION.md`)
- Archive dated summaries (e.g., `DAY10_COMPLETION.md`)

### Header Structure
All documentation should include:
```markdown
# Title

**Brief description**

## Overview
[What this document covers]

## Key Sections
[...]
```

### Code Documentation
- **All files:** File header comment explaining purpose
- **Functions:** JSDoc comments with `@param`, `@returns`, `@example`
- **Components:** Props documentation with usage examples
- **Types:** Inline comments for complex interfaces

---

## 🆘 Need Help?

1. **New to the project?** Start with [Main README](../README.md)
2. **Setting up?** See [Quick Start Guide](../QUICK_START.md)
3. **Implementing a feature?** Check [Architecture Guidelines](../architecture-guidelines.md)
4. **Making commits?** Follow [Commit Policy](../commit_policy.md)
5. **Adding questions?** See [Y3 Import Guide](database/Y3_IMPORT_GUIDE.md)
6. **Security question?** Review [Security Audit Report](security/SECURITY_AUDIT_REPORT.md)

---

## 📊 Feature Status

Check [Feature Status Dashboard](features/FEATURE_STATUS_DASHBOARD_UPDATE.md) for current implementation status of all features.

---

**Last Updated:** January 25, 2026

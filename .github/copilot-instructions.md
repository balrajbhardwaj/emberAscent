# Ember Ascent - AI Coding Rules

## Project Overview
Ember Ascent is a freemium UK 11+ exam preparation platform. Free learning content for all children, paid analytics for parents who want deeper insights.

## Critical Reference Documents
**IMPORTANT**: Before implementing any feature, review these documents for security and architecture guidance:
- `architecture-guidelines.md` - Production architecture patterns, security requirements, and compliance rules (UK GDPR, ICO Children's Code, PCI DSS)
- `SECURITY_AUDIT_REPORT.md` - Known security issues and remediation guidance
- `commit_policy.md` - Version control standards, commit message format, and compliance requirements

## Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Database: Supabase (PostgreSQL + Auth + RLS)
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Payments: Stripe (future)
- Email: Resend (future)

## Code Standards
- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces over types
- Handle loading, error, and empty states in all async operations
- Use Supabase RLS for authorization, never client-side checks only
- All database columns: snake_case
- All TypeScript variables: camelCase
- Include proper error handling with try/catch
- Add loading skeletons for async data
- **SECURITY**: Never expose internal error messages to client - see `architecture-guidelines.md` section 7
- **SECURITY**: Validate all API inputs with Zod schemas - see `architecture-guidelines.md` section 6
- **SECURITY**: Never log PII (emails, names, child data) - see `architecture-guidelines.md` section 7.2

## File Structure
/app - Next.js app router pages
/components - React components
/components/ui - shadcn/ui components
/hooks - Custom React hooks
/lib - Utility functions and configurations
/lib/supabase - Supabase client and helpers
/types - TypeScript type definitions
/supabase/migrations - Database migrations

## Database Conventions
- All tables have: id (uuid, primary key), created_at, updated_at
- Use soft delete (deleted_at) where appropriate
- Foreign keys follow pattern: {table_name}_id
- Enable RLS on all tables
- Parent can only access their own children's data
- **SECURITY**: RLS must be enabled on EVERY user data table - see `architecture-guidelines.md` section 3.3
- **SECURITY**: Use parameterized queries only (Supabase default) - see `architecture-guidelines.md` section 6.2

## Database Migrations & Queries
- **NEVER** execute SQL migrations via npm, psql, or terminal commands
- **ALWAYS** provide SQL migration files and ask user to run them
- User will execute migrations in Supabase Dashboard SQL Editor
- Process:
  1. Create migration file in `supabase/migrations/`
  2. Ask user: "Please run this migration in Supabase Dashboard SQL Editor"
  3. Provide link: `https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new`
  4. Wait for user to confirm execution and provide output
  5. Continue based on user's feedback
- **NEVER** use:
  - `psql` commands
  - `npm run` database scripts
  - `supabase` CLI commands (user may not have installed)
  - Direct database connections via connection strings
- For verification queries, ask user to run in SQL Editor and paste results

## UI/UX Standards
- Mobile-first responsive design
- Use shadcn/ui components (Button, Card, Input, etc.)
- Loading states: use Skeleton components
- Errors: use toast notifications (sonner)
- All interactive elements need aria-labels
- Support keyboard navigation

## Ember Ascent Specific
- Questions tagged with curriculum references (NC objectives)
- Ember Score displayed on all questions (60-100, enforced by constraint)
- Three difficulty levels: Foundation, Standard, Challenge
- **Year groups supported**: Year 3, Year 4, Year 5, Year 6 (ages 7-11)
  - Year 3 import complete (10,000 questions)
  - Year 4-6 import templates available in scripts/
- **DATA PROTECTION**: Children's platform subject to ICO Children's Code - see `architecture-guidelines.md` section 5
- **DATA MINIMIZATION**: Collect only child first name, year group, exam type - NO surnames, DOB, school names - see `architecture-guidelines.md` section 2
- Free tier: unlimited questions, basic progress
- Paid tier (Ascent): analytics dashboard, insights

## Question Import Guidelines
- **Import templates**: Use scripts/import-y{N}-questions.ts for year group N
- **JSON structure**: See docs/Y3_IMPORT_GUIDE.md for expected format
- **Required fields**: question_id (external_id), subject, topic, difficulty, year_group, question_text, options (exactly 5), correct_option, explanations
- **Batch size**: 50 questions per batch to avoid timeouts
- **Ember scores**: Calculate after import with `SELECT * FROM update_all_ember_scores();` (no query limit)
- **Verification**: Use scripts/verify-y{N}-import.ts to check distribution
- **Deduplication**: external_id provides unique constraint for reimports
- **System profile**: Use a0000000-0000-0000-0000-000000000001 for bulk imports

## Documentation Standards

### File Headers
Every file should start with a comment block explaining:
- Purpose of the file
- Key responsibilities
- Dependencies (if complex)
- Example:
```typescript
/**
 * User Authentication Actions
 * 
 * Server actions for handling user authentication flow including:
 * - Sign up with email/password
 * - Sign in and session management
 * - Password reset functionality
 * 
 * @module app/(auth)/actions
 */
```

### Function Documentation
Use JSDoc for all exported functions:
```typescript
/**
 * Creates a new child profile during onboarding
 * 
 * @param formData - Form data containing child name, year group, etc.
 * @returns Promise with success/error response
 * @throws Never throws - returns error in response object
 * 
 * @example
 * const formData = new FormData()
 * formData.append('name', 'Emma')
 * formData.append('yearGroup', '5')
 * const result = await createInitialChild(formData)
 */
```

### Component Documentation
React components should document:
- Purpose and usage
- Props with types
- Key behaviors or side effects
```typescript
/**
 * Avatar picker component for child profile setup
 * 
 * Displays a grid of emoji avatars for children to choose from.
 * Selection state is managed internally and communicated via onChange callback.
 * 
 * @param value - Currently selected avatar ID
 * @param onChange - Callback when avatar selection changes
 */
```

### Complex Logic Comments
Add inline comments for:
- Non-obvious business logic
- Workarounds or hacks
- Security considerations
- Performance optimizations

### Type Documentation
Document complex types and interfaces:
```typescript
/**
 * Child profile database record
 * 
 * Represents a learner account linked to a parent.
 * Children do not have direct login access.
 */
export interface Child {
  // ...
}
```

### README Files
Each major directory should have a README:
- /lib/supabase/README.md - Supabase client usage
- /types/README.md - Type system overview
- /supabase/migrations/README.md - Migration guide

### Commit Messages
**MUST follow the detailed commit policy in `commit_policy.md`**

Quick reference (see full policy for details):
- `feat(scope):` New feature for users
- `fix(scope):` Bug fix for users
- `security(scope):` Security improvements (CRITICAL - special requirements apply)
- `docs:` Documentation only
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

**Required scopes for feat/fix/security:** auth, child, quiz, content, analytics, payment, rls, api, ui, db

**Security commits MUST:**
- Use `security` type (not `fix`)
- Include affected data types in body
- Reference CVE/advisory if applicable
- Never include sensitive data

Examples:
- `feat(quiz): add timer mode`
- `security(rls): enforce parent_id check on child_profiles`
- `fix(auth): resolve session expiry issue`

## Security & Compliance Checklist
Before submitting code, verify:
- [ ] API routes check `auth.getUser()` before data access
- [ ] No PII in console.log statements
- [ ] Error responses don't expose internal details
- [ ] All user inputs validated with Zod schemas
- [ ] RLS policies enabled on new user data tables
- [ ] No hardcoded secrets or API keys
- [ ] Child data limited to first name, year group, exam type only
- [ ] Commit messages follow `commit_policy.md` format and requirements

**For detailed guidance, always reference `architecture-guidelines.md` and `commit_policy.md`**
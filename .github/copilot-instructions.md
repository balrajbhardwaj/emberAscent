# Ember Ascent - AI Coding Rules

## Project Overview
Ember Ascent is a freemium UK 11+ exam preparation platform. Free learning content for all children, paid analytics for parents who want deeper insights.

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

## UI/UX Standards
- Mobile-first responsive design
- Use shadcn/ui components (Button, Card, Input, etc.)
- Loading states: use Skeleton components
- Errors: use toast notifications (sonner)
- All interactive elements need aria-labels
- Support keyboard navigation

## Ember Ascent Specific
- Questions tagged with curriculum references (NC objectives)
- Ember Score displayed on all questions (0-100)
- Three difficulty levels: Foundation, Standard, Challenge
- Target year groups: Year 4-5 (ages 8-10)
- Free tier: unlimited questions, basic progress
- Paid tier (Ascent): analytics dashboard, insights

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
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example: `feat: add child profile setup flow with avatar picker`
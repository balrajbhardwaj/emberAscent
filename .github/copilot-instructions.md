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
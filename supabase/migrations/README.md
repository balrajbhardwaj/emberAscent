# Supabase Migrations

This directory contains database migration files for Ember Ascent.

## Migrations

### 001_initial_schema.sql

Initial database schema including:

**Core Tables:**
- `profiles` - Parent/guardian accounts (extends auth.users)
- `children` - Learner profiles (linked to parents)
- `questions` - Question bank with quality scoring
- `practice_sessions` - Practice session tracking
- `question_attempts` - Individual question responses
- `error_reports` - Community quality feedback

**Features:**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic `updated_at` triggers
- ✅ Foreign key constraints with cascade deletes
- ✅ Performance indexes on frequently queried columns
- ✅ Check constraints for data validation
- ✅ Auto-create profile on user signup
- ✅ Progress summary view

## Running Migrations

### Local Development

```bash
# Start local Supabase
npx supabase start

# Run migrations
npx supabase db reset

# Or apply specific migration
npx supabase db push
```

### Production

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

## Generating TypeScript Types

After running migrations, regenerate types:

```bash
# For linked project
npx supabase gen types typescript --linked > types/supabase.ts

# For local dev
npx supabase gen types typescript --local > types/supabase.ts
```

## Key Design Decisions

### Parent-Child Model
- Parents are the account holders (linked to auth.users)
- Children don't have accounts - accessed via parent's auth
- RLS policies enforce parent can only access their own children's data

### Question Quality (Ember Score)
- Questions must have `ember_score >= 60` to be published
- Score breakdown: curriculum (25%), exam pattern (25%), expert review (25%), community feedback (15%), technical accuracy (10%)
- Published questions are read-only for users

### Soft Deletes
- Children table uses `is_active` flag for soft deletes
- Allows preserving historical data while hiding from UI

### Subscription Tiers
- `free`: Unlimited questions, basic progress tracking
- `ascent`: Analytics dashboard, detailed insights (PAID)
- `summit`: AI tutor, personalized plans (Future)

### Session Types
- `quick`: 10 random questions, 5-10 minutes
- `focus`: Topic-specific practice, unlimited questions
- `mock`: Timed exam simulation, 50+ questions

## RLS Policy Summary

| Table | Policy | Who Can Access |
|-------|--------|----------------|
| profiles | View/Update | Own profile only |
| children | Full CRUD | Own children only (via parent_id) |
| questions | View | All authenticated (published only) |
| practice_sessions | CRUD | Own children's sessions |
| question_attempts | Create/View | Own children's attempts |
| error_reports | Create/View | Own reports |

## Indexes Strategy

High-volume queries are optimized:
- Child → Sessions → Attempts (analytics queries)
- Question filtering by subject/difficulty/year
- Session lookup by child (most common UX)
- Pending error reports (admin dashboard)

## Future Migrations

Planned additions:
- Stripe webhook events table
- Parent analytics preferences
- AI tutor conversation history
- Content tagging system
- School/cohort management (for teachers)

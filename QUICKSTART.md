# 🚀 Ember Ascent - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account ([sign up here](https://supabase.com))
- Git installed

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

**Option A: Use Supabase Cloud (Recommended for production)**

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Add your credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

**Option B: Use Local Supabase (Recommended for development)**

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   npm run db:start
   ```
   This will give you local URLs and keys.

3. Update `.env.local` with local credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

### 3. Run Database Migrations

**For Supabase Cloud:**
```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npm run db:migrate
```

**For Local Supabase:**
```bash
# Reset database (runs all migrations)
npm run db:reset
```

### 4. Generate TypeScript Types

```bash
npm run db:types
```

This creates `types/supabase.ts` with your database schema types.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |
| `npm run db:start` | Start local Supabase |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reset local database |
| `npm run db:migrate` | Push migrations to cloud |
| `npm run db:types` | Generate TypeScript types |
| `npm run db:status` | Check Supabase status |

## Project Structure

```
ember-ascent/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected routes
│   ├── globals.css        # Global styles + theme
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   └── *.tsx              # Feature components
├── lib/
│   ├── supabase/          # Supabase clients & helpers
│   └── utils.ts           # Utility functions
├── supabase/
│   └── migrations/        # Database migrations
├── types/
│   ├── database.ts        # Custom types
│   └── supabase.ts        # Generated DB types
└── middleware.ts          # Auth middleware
```

## Database Schema

See [supabase/migrations/SCHEMA.md](supabase/migrations/SCHEMA.md) for full schema documentation.

**Core tables:**
- `profiles` - Parent accounts
- `children` - Learner profiles
- `questions` - Question bank
- `practice_sessions` - Practice tracking
- `question_attempts` - Individual answers
- `error_reports` - Quality feedback

## Testing the Setup

### 1. Create a Test User

Go to [http://localhost:3000/signup](http://localhost:3000/signup) and create an account.

### 2. Check Supabase

**Local:**
- Dashboard: [http://localhost:54323](http://localhost:54323)
- Studio: Browse tables and data

**Cloud:**
- Go to [app.supabase.com](https://app.supabase.com)
- Navigate to Table Editor

### 3. Verify RLS Policies

In Supabase Studio:
1. Go to Authentication → Policies
2. Check that all tables have RLS enabled
3. Verify policies are active

## Common Issues

### Port Already in Use

```bash
# Stop local Supabase
npm run db:stop

# Or change ports in supabase/config.toml
```

### Auth Not Working

1. Check `.env.local` has correct credentials
2. Verify Supabase project is running
3. Check browser console for errors
4. Ensure RLS policies are enabled

### Types Out of Sync

```bash
# Regenerate types after schema changes
npm run db:types
```

### Build Errors

```bash
# Check TypeScript
npm run type-check

# Check for missing dependencies
npm install
```

## Next Steps

1. **Set up authentication pages**
   - Customize login/signup forms
   - Add password reset flow

2. **Create child profile management**
   - Add/edit/delete children
   - Upload avatars

3. **Build practice interface**
   - Question display component
   - Answer selection
   - Progress tracking

4. **Implement analytics dashboard**
   - Parent dashboard (Ascent tier)
   - Progress charts
   - Weak topic identification

## Getting Help

- **Documentation**: See `/docs` and migration READMEs
- **Architecture**: Read [architecture.md](architecture.md)
- **Database**: Check [SCHEMA.md](supabase/migrations/SCHEMA.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## License

Private - Ember Ascent © 2026

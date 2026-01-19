# Supabase Configuration

This directory contains all Supabase client configurations and helpers for Ember Ascent.

## Files

### `client.ts`
Browser client for client components. Use when you need to interact with Supabase from the client side.

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // Use supabase client...
}
```

### `server.ts`
Server client for Server Components, Server Actions, and Route Handlers.

**Server Component:**
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>...</div>
}
```

**Route Handler:**
```typescript
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createRouteHandlerClient()
  // Use supabase client...
}
```

### `middleware.ts`
Middleware helper for refreshing auth sessions. Used by the root middleware.

### `auth-helpers.ts`
Common authentication utilities:
- `getCurrentUser()` - Get the current authenticated user
- `getSession()` - Get the current session
- `isAuthenticated()` - Check if user is authenticated
- `requireAuth()` - Throw error if not authenticated

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

## Row Level Security (RLS)

All database tables MUST have RLS enabled. Examples:

```sql
-- Parents can only see their own data
CREATE POLICY "Parents see own data" ON parents
  FOR SELECT USING (auth.uid() = id);

-- Parents can only see their children
CREATE POLICY "Parents see own children" ON children
  FOR SELECT USING (parent_id = auth.uid());
```

## Generating Types

To generate TypeScript types from your database schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Or with local dev:

```bash
npx supabase gen types typescript --local > types/supabase.ts
```

Regenerate types whenever the database schema changes.

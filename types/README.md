# Ember Ascent - Type Definitions

This directory contains TypeScript type definitions for the Ember Ascent application.

## Files

### `database.ts`
**Database schema types** matching the PostgreSQL tables exactly.

**Core Types:**
- `Profile` - Parent/guardian accounts
- `Child` - Learner profiles
- `Question` - Question bank with options and explanations
- `PracticeSession` - Practice session tracking
- `QuestionAttempt` - Individual question responses
- `ErrorReport` - Quality feedback reports

**Enums:**
- `Subject` - verbal_reasoning, english, mathematics
- `Difficulty` - foundation, standard, challenge
- `SessionType` - quick, focus, mock
- `SubscriptionTier` - free, ascent, summit
- `ExamBoard` - gl, cem, iseb, generic

**Insert/Update Types:**
Each table has `Insert` and `Update` types:
```typescript
ChildInsert // For creating new children
ChildUpdate // For updating existing children
```

**Usage:**
```typescript
import { Child, ChildInsert, Difficulty } from '@/types/database';

// Create a new child
const newChild: ChildInsert = {
  parent_id: userId,
  name: 'Emma',
  year_group: 5,
};

// Query with filters
const questions = await supabase
  .from('questions')
  .select('*')
  .eq('difficulty', Difficulty.Standard);
```

### `index.ts`
**Application-level types** that extend or complement database types.

**API Types:**
- `ApiResponse<T>` - Successful API response wrapper
- `ApiError` - Error response structure
- `ApiResult<T>` - Union of success/error responses

**Practice Types:**
- `PracticeConfig` - Configuration for starting a session
- `PracticeQuestion` - Simplified question for display
- `AnswerSubmission` - Answer submission payload

**Analytics Types:**
- `TopicPerformance` - Performance metrics per topic
- `WeeklyProgress` - Weekly progress tracking
- `DashboardStats` - Dashboard data structure

**Form Types:**
- `ChildFormData` - Child creation/edit form
- `ProfileFormData` - Profile edit form
- `ErrorReportFormData` - Error report form

**Usage:**
```typescript
import { ApiResult, PracticeConfig, TopicPerformance } from '@/types';

// API handler
export async function getQuestions(): Promise<ApiResult<Question[]>> {
  try {
    const questions = await fetchQuestions();
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Practice configuration
const config: PracticeConfig = {
  session_type: 'focus',
  subject: 'mathematics',
  difficulty: 'standard',
  year_group: 5,
};
```

### `supabase.ts`
**Generated Supabase types** (auto-generated from database schema).

**Regenerating:**
```bash
npm run db:types
```

This overwrites `supabase.ts` with fresh types from your database.

**Note:** `database.ts` provides manually-maintained types that are more developer-friendly. Use `supabase.ts` for strict Supabase client typing.

## Type Organization

```
types/
├── database.ts      # Database schema types (manual)
├── supabase.ts      # Auto-generated Supabase types
└── index.ts         # Application types + re-exports
```

## Best Practices

### 1. Use Enums for Constrained Values

```typescript
// ❌ Bad
const difficulty: string = 'standard';

// ✅ Good
import { Difficulty } from '@/types';
const difficulty = Difficulty.Standard;
```

### 2. Use Insert Types for Mutations

```typescript
// ❌ Bad
const child = {
  id: uuid(), // Don't manually set ID
  parent_id: userId,
  name: 'John',
  created_at: new Date(), // Auto-generated
};

// ✅ Good
import { ChildInsert } from '@/types/database';
const child: ChildInsert = {
  parent_id: userId,
  name: 'John',
  year_group: 5,
};
```

### 3. Use ApiResult for Consistent Responses

```typescript
// API route handler
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await processRequest(req);
    const result: ApiResult<Child> = { success: true, data };
    return Response.json(result);
  } catch (error) {
    const result: ApiResult<Child> = { 
      success: false, 
      error: error.message 
    };
    return Response.json(result, { status: 500 });
  }
}

// Client-side usage
const result = await fetch('/api/children', { method: 'POST' });
const json: ApiResult<Child> = await result.json();

if (json.success) {
  console.log('Created child:', json.data);
} else {
  console.error('Error:', json.error);
}
```

### 4. Type Guards for Runtime Checking

```typescript
import { Subject } from '@/types';

function isValidSubject(value: string): value is Subject {
  return Object.values(Subject).includes(value as Subject);
}

const input = req.body.subject;
if (isValidSubject(input)) {
  // TypeScript knows input is Subject here
  const questions = await getQuestions({ subject: input });
}
```

### 5. Utility Types for Flexibility

```typescript
import { Optional, WithTimestamps } from '@/types';

// Make some fields optional
type ChildForm = Optional<ChildInsert, 'year_group' | 'target_school'>;

// Add timestamps to any type
type TimestampedData = WithTimestamps<{ name: string }>;
```

## Type Safety with Supabase

### Typed Queries

```typescript
import { Database } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Type-safe query
const { data, error } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', userId);

// data is typed as Child[] | null
```

### Typed Inserts

```typescript
import { ChildInsert } from '@/types/database';

const newChild: ChildInsert = {
  parent_id: userId,
  name: 'Emma',
  year_group: 5,
};

const { data, error } = await supabase
  .from('children')
  .insert(newChild)
  .select()
  .single();

// data is typed as Child | null
```

### Typed Relations

```typescript
const { data } = await supabase
  .from('practice_sessions')
  .select(`
    *,
    child:children(*),
    attempts:question_attempts(*)
  `)
  .eq('id', sessionId)
  .single();

// Cast to custom relation type
const session = data as PracticeSessionWithDetails;
console.log(session.child.name);
console.log(session.attempts.length);
```

## Regenerating Types

### From Supabase Cloud

```bash
# Link to project first
npx supabase link --project-ref your-project-ref

# Generate types
npx supabase gen types typescript --linked > types/supabase.ts
```

### From Local Supabase

```bash
# Start local Supabase
npm run db:start

# Generate types
npm run db:types
```

### When to Regenerate

- After running database migrations
- When adding/modifying tables
- When changing column types or constraints
- After adding new enums

## Common Type Issues

### Issue: `Type 'string' is not assignable to type 'Subject'`

```typescript
// ❌ Problem
const subject: Subject = 'mathematics'; // Error!

// ✅ Solution
import { Subject } from '@/types';
const subject = Subject.Mathematics;
```

### Issue: Missing timestamps on insert

```typescript
// ❌ Problem
const question: Question = { /* ... */ }; // Missing created_at, updated_at

// ✅ Solution
import { QuestionInsert } from '@/types/database';
const question: QuestionInsert = { /* ... */ }; // Timestamps auto-generated
```

### Issue: Nullable fields

```typescript
// ❌ Problem
const school = child.target_school.toLowerCase(); // Error if null!

// ✅ Solution
const school = child.target_school?.toLowerCase() ?? 'Not set';
```

## Contributing

When adding new database tables:

1. Update the migration file
2. Run the migration
3. Regenerate types: `npm run db:types`
4. Add custom types to `database.ts` if needed
5. Export from `index.ts` if they're used app-wide
6. Update this README with new types

# Ember Ascent API Reference

## Overview

This document provides a complete reference for all server actions, database queries, and API patterns used in Ember Ascent.

## Authentication Actions

### signUp

Creates a new user account with profile.

**Location:** `app/(auth)/actions.ts`

**Parameters:**
```typescript
FormData {
  fullName: string       // Min 2 characters
  email: string         // Valid email format
  password: string      // Min 8 chars, uppercase, lowercase, number
  confirmPassword: string
}
```

**Returns:**
```typescript
{
  success: boolean
  message?: string      // "Account created! Please check your email..."
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData()
formData.append('fullName', 'John Smith')
formData.append('email', 'john@example.com')
formData.append('password', 'SecurePass123')
formData.append('confirmPassword', 'SecurePass123')

const result = await signUp(formData)
if (result.success) {
  // Show success message
} else {
  // Display error
}
```

---

### signIn

Authenticates existing user.

**Location:** `app/(auth)/actions.ts`

**Parameters:**
```typescript
FormData {
  email: string
  password: string
}
```

**Returns:**
- Redirects to `/practice` on success
- Returns error object on failure

**Example:**
```typescript
const formData = new FormData()
formData.append('email', 'john@example.com')
formData.append('password', 'SecurePass123')

await signIn(formData) // Redirects on success
```

---

### signOut

Logs out the current user.

**Location:** `app/(auth)/actions.ts`

**Parameters:** None

**Returns:** Redirects to `/login`

**Example:**
```typescript
<Button onClick={() => signOut()}>Log Out</Button>
```

---

### resetPassword

Sends password reset email.

**Location:** `app/(auth)/actions.ts`

**Parameters:**
```typescript
FormData {
  email: string
}
```

**Returns:**
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

---

### updatePassword

Updates password after reset link.

**Location:** `app/(auth)/actions.ts`

**Parameters:**
```typescript
FormData {
  password: string
  confirmPassword: string
}
```

**Returns:**
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

---

## Child Profile Actions

### createInitialChild

Creates first child profile during onboarding.

**Location:** `app/(auth)/setup/actions.ts`

**Parameters:**
```typescript
FormData {
  name: string          // 2-50 characters
  yearGroup: string     // "4", "5", or "6"
  targetSchool?: string // Optional, max 100 chars
  avatarUrl?: string    // Optional avatar ID
}
```

**Returns:**
```typescript
{
  success: boolean
  message?: string      // "{name}'s profile has been created!"
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData()
formData.append('name', 'Emma')
formData.append('yearGroup', '5')
formData.append('targetSchool', 'King Edward VI Grammar')
formData.append('avatarUrl', 'girl-1')

const result = await createInitialChild(formData)
```

---

## Authentication Helpers

### getCurrentUser

Gets the currently authenticated user.

**Location:** `lib/supabase/auth-helpers.ts`

**Parameters:** None

**Returns:** `Promise<User | null>`

**Example:**
```typescript
const user = await getCurrentUser()
if (!user) {
  redirect('/login')
}
```

---

### getSession

Gets the full session object.

**Location:** `lib/supabase/auth-helpers.ts`

**Parameters:** None

**Returns:** `Promise<Session | null>`

---

### isAuthenticated

Checks if user is logged in.

**Location:** `lib/supabase/auth-helpers.ts`

**Parameters:** None

**Returns:** `Promise<boolean>`

---

### requireAuth

Ensures user is authenticated, redirects if not.

**Location:** `lib/supabase/auth-helpers.ts`

**Parameters:** None

**Returns:** `Promise<User>` or redirects to `/login`

**Example:**
```typescript
export async function MyProtectedPage() {
  const user = await requireAuth() // Auto-redirect if not logged in
  // User is guaranteed to exist here
}
```

---

## Database Queries

### Get User Profile

```typescript
const supabase = await createClient()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### Get Children for Parent

```typescript
const supabase = await createClient()
const { data: children } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', parentId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Create Practice Session

```typescript
const supabase = await createClient()
const { data: session } = await supabase
  .from('practice_sessions')
  .insert({
    child_id: childId,
    session_type: 'quick',
    subject: 'mathematics',
    started_at: new Date().toISOString(),
  })
  .select()
  .single()
```

### Record Question Attempt

```typescript
const supabase = await createClient()
const { error } = await supabase
  .from('question_attempts')
  .insert({
    session_id: sessionId,
    question_id: questionId,
    selected_answer: 'a',
    is_correct: true,
    time_taken_seconds: 45,
  })
```

---

## Validation Schemas

### Sign Up Schema

```typescript
{
  fullName: string (min 2 chars)
  email: string (valid email)
  password: string (min 8, uppercase, lowercase, number)
  confirmPassword: string (must match password)
}
```

### Sign In Schema

```typescript
{
  email: string (valid email)
  password: string (min 1 char)
}
```

### Child Setup Schema

```typescript
{
  name: string (2-50 chars)
  yearGroup: number (4, 5, or 6)
  targetSchool?: string (max 100 chars)
  avatarUrl?: string
}
```

---

## Error Handling

All server actions return a consistent response format:

```typescript
type ActionResponse = {
  success: boolean
  message?: string  // Success message
  error?: string    // Error message
}
```

**Best Practices:**
1. Always check `success` before proceeding
2. Display `message` for success feedback
3. Show `error` in toast or form field
4. Handle redirect errors separately (NEXT_REDIRECT)

**Example:**
```typescript
const result = await someAction(formData)

if (!result.success) {
  toast({
    variant: "destructive",
    title: "Error",
    description: result.error,
  })
  return
}

toast({
  title: "Success",
  description: result.message,
})
```

---

## Type Definitions

### Database Types

Generated from Supabase schema:
- Location: `types/supabase.ts`
- Generated via: `npx supabase gen types typescript --linked`

### Application Types

Custom types for app logic:
- Location: `types/database.ts`, `types/index.ts`
- Includes: ApiResult, PracticeConfig, DashboardStats, etc.

---

## Environment Variables

### Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Admin operations
```

---

## Rate Limiting

Supabase handles rate limiting automatically:
- **Auth operations:** 30 requests per hour per IP
- **Database queries:** Based on subscription plan
- **Realtime connections:** 100 concurrent per project

---

## Security Notes

1. **RLS Policies:** All tables have Row Level Security enabled
2. **Server Actions:** Run on server, never expose credentials
3. **Validation:** All inputs validated with Zod before processing
4. **Auth Tokens:** Managed by Supabase, httpOnly cookies
5. **CORS:** Configured in Supabase dashboard

---

## Support

For issues or questions:
- Check TypeScript types for parameter requirements
- Review Supabase logs for database errors
- Use browser DevTools for client-side debugging
- Check server logs for server action errors

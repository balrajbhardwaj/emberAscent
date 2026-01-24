# Admin Panel Issues & Solutions

## Issues Found

### 1. "View as parent" link goes to `/dashboard` ✅ FIXED
**Issue:** `/dashboard` route doesn't exist - it's in `/(dashboard)` route group  
**Expected:** Admins should see the parent experience  
**Solution:** Changed link to `/practice` (default parent landing page)

### 2. Users page shows no users ⚠️ NEEDS MIGRATION  
**Issue:** RLS policies block admin from viewing other users' profiles  
**Root cause:** `profiles_select_own` policy only allows users to see their own profile  
**Solution:** Run migration `999_admin_access_fix.sql` to add admin bypass policies

### 3. Reports page - fully implemented ✅
**Status:** Full implementation exists at `/admin/reports`  
**Location:** `app/admin/reports/ReportsManagementClient`  
**Issue:** Shows empty state because no error reports in database yet (need users to submit reports)

### 4. Analytics page - created placeholder ✅  
**Status:** Placeholder page created  
**Location:** `app/admin/analytics/page.tsx`  
**Shows:** "Coming soon" message with planned metrics

## Solutions

### Code Changes - COMPLETED ✅

1. ✅ **Fixed "View as parent" link** - Now goes to `/practice` instead of `/dashboard`
2. ✅ **Fixed nav labels** - "Reports" label corrected (was "Reviews")  
3. ✅ **Created analytics placeholder** - Temporary "Coming soon" page

### Migration Required - ACTION NEEDED ⚠️

Run this migration in Supabase Dashboard SQL Editor:
```
supabase/migrations/999_admin_access_fix.sql
```

This adds admin bypass policies for:
- ✅ profiles (view all users)
- ✅ children (view all children)  
- ✅ practice_sessions (view all sessions)
- ✅ question_attempts (view all attempts)
- ✅ error_reports (view and update reports)

### Code Changes Required

1. **Fix "View as parent" link** - Update AdminSidebar.tsx
2. **Create analytics page or remove from nav**
3. **Fix nav label** - "Reviews" should be "Reports" (matches /admin/reports)

## Testing After Migration

1. **Users page:**
   ```
   Navigate to /admin/users
   Should see: List of all users with counts
   ```

2. **Reports page:**
   ```
   Navigate to /admin/reports  
   Should see: Empty state (no reports yet) or test reports if any
   ```

3. **"View as parent" link:**
   ```
   Click button in admin sidebar
   Should go to: /practice page (parent experience)
   ```

## Database State
- ✅ Admin user exists: support@emberdatalabs.co.uk (super_admin)
- ❌ RLS blocks admin queries (needs migration) in Supabase Dashboard
2. **TEST:** Verify /admin/users shows all users after migration
3. **TEST:** Click "View as parent" button (should go to /practice)  
4. **LATER:** Implement full analytics dashboard with real metrics
5. **LATER:** Create test users/children for admin testing
6. **LATER
## Recommended Next Steps

1. **URGENT:** Run `999_admin_access_fix.sql` migration
2. **HIGH:** Fix AdminSidebar "View as parent" link  
3. **MEDIUM:** Create placeholder analytics page or hide nav item
4. **LOW:** Create test users/children for admin testing
5. **LOW:** Create test error reports for reports page testing

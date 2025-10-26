# Role-Based Testing Guide

## ✅ Completed Tasks

### 1. ✅ Unified Course Detail Page

- Created `src/components/courses/course-detail-page.tsx` - Shared component for both admin and teacher
- Updated `src/app/admin/courses/[id]/page.tsx` - Now uses shared component
- Updated `src/app/teacher/courses/[id]/page.tsx` - Now uses shared component
- **Result**: 56% code reduction (1764 lines → 762 lines)

### 2. ✅ Role-Based Permission Hooks

- Created `src/hooks/common/use-role-permissions.ts`
- Exported in `src/hooks/common/index.ts`
- **Usage**: `import { useRolePermissions } from "@/hooks/common"`

### 3. ✅ Set Password Flow

- Fixed for all user roles (admin, teacher, any user)
- Uses API response `userId` (no frontend JWT parsing)
- Stores `userId` in onboarding store
- Works with or without admin data

## 🧪 Testing Guide

### Test 1: Admin Course Detail Page

**URL**: `http://localhost:3000/admin/courses/[courseId]`

**Expected Behavior**:

- ✅ Shows all 6 tabs: Overview, Subjects, Teachers, Students, Analytics, Settings
- ✅ Edit and Delete buttons visible
- ✅ Can create/manage subjects
- ✅ Can create/manage teachers
- ✅ Full admin functionality

**How to Test**:

1. Login as admin
2. Navigate to any course from `/admin/courses`
3. Click on a course to view details
4. Verify all tabs and actions are available

---

### Test 2: Teacher Course Detail Page

**URL**: `http://localhost:3000/teacher/courses/[courseId]`

**Expected Behavior**:

- ✅ Shows 4 tabs: Overview, Teachers, Students, Analytics
- ✅ NO Subjects tab
- ✅ NO Settings tab
- ✅ NO Edit/Delete buttons
- ✅ Can view teachers but limited management
- ✅ Can view analytics

**How to Test**:

1. Login as teacher
2. Navigate to any course from `/teacher/courses`
3. Click on a course to view details
4. Verify limited tabs and no delete/edit buttons

---

### Test 3: Set Password Flow for Teacher

**Scenario**: Teacher receives email link and sets password

**Expected Flow**:

1. Admin invites teacher via `/admin/teachers`
2. Teacher receives email: `queztlearn.com/verify-email?token=...`
3. Teacher verifies email
4. Backend returns: `{ success: true, data: { userId: "..." } }`
5. Frontend stores `userId` in onboarding store
6. Redirects to `/set-password`
7. No admin-specific UI shown
8. Teacher can set password
9. Success → Login

**How to Test**:

```bash
# 1. As admin, invite a teacher
# 2. Check teacher's email
# 3. Click the verification link
# 4. Verify email → Should store userId in localStorage
# 5. Should redirect to /set-password
# 6. Set password → Should work without "Admin data is missing" error
# 7. Login as teacher → Should work
```

**Verification**:

- Check browser DevTools → Application → Local Storage → `onboarding-storage`
- Should contain: `{"userId":"<uuid>","emailVerified":true}`

---

### Test 4: Set Password Flow for Admin

**Scenario**: Admin during onboarding sets password

**Expected Flow**:

1. Admin creates organization
2. Admin registers
3. Admin verifies email
4. Redirects to `/set-password`
5. Shows onboarding progress sidebar
6. Can set password
7. Success → Login

**How to Test**:

```bash
# 1. Navigate to /create-organization
# 2. Create org
# 3. Register admin
# 4. Verify email
# 5. Should show sidebar with progress
# 6. Set password
# 7. Should complete onboarding and login
```

**Verification**:

- Should show left sidebar with "Organization created", "Admin account created", etc.

---

### Test 5: Role Permissions Hook

**Code**:

```typescript
import { useRolePermissions } from "@/hooks/common";

function MyComponent() {
  const { isAdmin, canDeleteCourses, canManageUsers } = useRolePermissions();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canDeleteCourses && <DeleteButton />}
      {canManageUsers && <UserManagement />}
    </div>
  );
}
```

**Expected Behavior**:

- `isAdmin` = true only for admin role
- `canDeleteCourses` = true only for admin
- `canManageUsers` = true only for admin
- Teachers see limited permissions

---

## 📊 Code Metrics

### Before Unification

```
admin/courses/[id]/page.tsx → 950 lines
teacher/courses/[id]/page.tsx → 814 lines
Total: 1764 lines (with 90% duplication)
```

### After Unification

```
components/courses/course-detail-page.tsx → 749 lines
admin/courses/[id]/page.tsx → 13 lines
teacher/courses/[id]/page.tsx → 13 lines
Total: 775 lines (56% reduction)
```

### Benefits

- ✅ Single source of truth
- ✅ Bug fixes apply to all roles
- ✅ New features benefit all roles
- ✅ Easier maintenance
- ✅ Consistent UI/UX

---

## 🔄 Migration Path

### If Admin Page Has New Feature

**Before**: Need to manually add to teacher page too
**Now**: Add to shared component once

### If Teacher Page Has Issue

**Before**: Might exist in admin page too
**Now**: Fix once, works for both

---

## 🚀 Next Steps

1. ✅ **DONE**: Unified course detail pages
2. ⏳ **TODO**: Unify course list pages
3. ⏳ **TODO**: Unify other duplicated pages
4. ⏳ **TODO**: Add E2E tests for role behavior
5. ✅ **DONE**: Set password works for all roles
6. ✅ **DONE**: Role permissions hook created

---

## 📝 Notes

- The shared component uses props to control visibility: `showSubjectsTab`, `showAnalyticsTab`, `showSettingsTab`
- Teachers can access admin UI features where permissions allow
- The `useRolePermissions` hook provides type-safe permission checks
- All shared components are in `src/components/courses/`
- Role-based logic is centralized in the shared component

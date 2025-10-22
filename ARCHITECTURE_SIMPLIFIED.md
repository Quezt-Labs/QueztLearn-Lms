# Simplified Architecture - QueztLearn LMS

## 🎯 **Architecture Overview**

The LMS has been simplified to a clean, role-based routing structure without unnecessary complexity.

## 📁 **New File Structure**

```
src/app/
├── admin/
│   ├── layout.tsx          # Admin-only layout with route guard
│   ├── dashboard/
│   │   └── page.tsx        # Admin dashboard
│   ├── users/
│   │   └── page.tsx        # User management
│   └── ...                 # Other admin pages
├── teacher/
│   ├── layout.tsx          # Teacher layout with route guard
│   ├── dashboard/
│   │   └── page.tsx        # Teacher dashboard
│   └── ...                 # Other teacher pages
├── student/
│   ├── layout.tsx          # Student layout with route guard
│   ├── dashboard/
│   │   └── page.tsx        # Student dashboard
│   └── ...                 # Other student pages
├── login/
│   └── page.tsx            # Unified login page
├── [client]/
│   ├── page.tsx            # Client homepage
│   └── login/
│       └── page.tsx        # Redirects to unified login
└── test-subdomain/
    └── page.tsx            # Development testing
```

## 🌐 **URL Structure**

### **Main Domain (queztlearn.com)**

- `queztlearn.com/` → Redirects to `/login`
- `queztlearn.com/login` → Unified login page
- `queztlearn.com/admin/dashboard` → Admin dashboard
- `queztlearn.com/teacher/dashboard` → Teacher dashboard

### **Subdomains (mit.queztlearn.in)**

- `mit.queztlearn.in/` → Client homepage
- `mit.queztlearn.in/login` → Unified login page (student-focused)
- `mit.queztlearn.in/student/dashboard` → Student dashboard

## 🔐 **Role-Based Access**

| Role        | Main Domain          | Subdomain            | Access Level                   |
| ----------- | -------------------- | -------------------- | ------------------------------ |
| **Admin**   | ✅ Full access       | ❌ Redirected        | Complete platform control      |
| **Teacher** | ✅ Teacher interface | ❌ Redirected        | Course and student management  |
| **Student** | ❌ Redirected        | ✅ Student interface | Learning and progress tracking |

## 🚀 **Key Improvements**

### **1. Eliminated Redundancy**

- ❌ Removed `(dashboard)` route group
- ❌ Removed `(public)` route group
- ❌ Removed duplicate login pages
- ❌ Removed unnecessary `/dashboard` redirects

### **2. Unified Login System**

- ✅ Single login page handles both domains
- ✅ Auto-detects domain and shows appropriate options
- ✅ Smart role-based redirects
- ✅ Client branding on subdomains

### **3. Simplified Routing**

- ✅ Direct role-based paths: `/admin/*`, `/teacher/*`, `/student/*`
- ✅ Clean middleware without complex redirects
- ✅ Intuitive URL structure

### **4. Better Developer Experience**

- ✅ Clear file organization
- ✅ No nested route groups
- ✅ Easy to understand and maintain

## 🔧 **Technical Implementation**

### **Middleware Logic**

```typescript
// Main domain: queztlearn.com
if (hostname === "queztlearn.com") {
  if (pathname === "/") redirect("/login");
  if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) allow();
  else redirect("/login");
}

// Subdomain: mit.queztlearn.in
if (hostname.endsWith(".queztlearn.in")) {
  if (pathname === "/") showClientHomepage();
  if (pathname === "/login") showUnifiedLogin();
  else showStudentInterface();
}
```

### **Unified Login Features**

- **Domain Detection**: Automatically detects main domain vs subdomain
- **Role Filtering**: Shows appropriate roles based on domain
- **Client Branding**: Displays client logo and branding on subdomains
- **Smart Redirects**: Redirects users to correct dashboard based on role and domain

## 📊 **Benefits**

### **For Users**

- 🎯 Clear, intuitive URLs
- 🔄 Seamless role-based experience
- 🎨 Consistent branding per client

### **For Developers**

- 🧹 Clean, maintainable code
- 📁 Logical file organization
- 🚀 Easy to extend and modify
- 🐛 Fewer bugs and edge cases

### **For System**

- ⚡ Better performance (fewer redirects)
- 🔒 Clearer security boundaries
- 📈 Easier to scale and monitor

## 🧪 **Testing**

### **Local Development**

```bash
# Test main domain
http://localhost:3000/login

# Test subdomain simulation
http://localhost:3000?subdomain=mit&role=student

# Test specific pages
http://localhost:3000/admin/dashboard
http://localhost:3000/teacher/dashboard
```

### **Production URLs**

```bash
# Main domain
https://queztlearn.com/login
https://queztlearn.com/admin/dashboard
https://queztlearn.com/teacher/dashboard

# Subdomains
https://mit.queztlearn.in/
https://mit.queztlearn.in/login
https://mit.queztlearn.in/student/dashboard
```

## 🎉 **Result**

The architecture is now:

- **Simpler**: Fewer files, clearer structure
- **Faster**: Fewer redirects, direct routing
- **Maintainable**: Easy to understand and modify
- **Scalable**: Clean separation of concerns
- **User-friendly**: Intuitive URLs and experience

This simplified architecture eliminates unnecessary complexity while maintaining all the functionality needed for a multi-tenant LMS system.

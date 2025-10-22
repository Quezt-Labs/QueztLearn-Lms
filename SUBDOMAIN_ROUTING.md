# Subdomain Routing Setup

This document explains the subdomain routing implementation for the QueztLearn LMS system.

## Overview

The system now supports two distinct access patterns:

1. **Main Domain (queztlearn.com)** - Admin dashboard
2. **Subdomains (mit.queztlearn.in, etc.)** - Student/Organization-facing sites

## Architecture

### Domain Structure

```
queztlearn.com/admin/dashboard    → Admin dashboard
queztlearn.com/teacher/dashboard  → Teacher dashboard
mit.queztlearn.in/student/dashboard → MIT student site
stanford.queztlearn.in/student/dashboard → Stanford student site
harvard.queztlearn.in/student/dashboard → Harvard student site
```

### Role-Based Access

| Role    | Main Domain                  | Subdomain                       |
| ------- | ---------------------------- | ------------------------------- |
| Admin   | ✅ queztlearn.com/admin/\*   | ❌ Redirected to main domain    |
| Teacher | ✅ queztlearn.com/teacher/\* | ❌ Redirected to main domain    |
| Student | ❌ Redirected to subdomain   | ✅ mit.queztlearn.in/student/\* |

## Implementation Details

### 1. Next.js Configuration (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/[client]/:path*",
        has: [
          {
            type: "host",
            value: "(?<subdomain>.*)\\.queztlearn\\.in",
          },
        ],
      },
    ];
  },
};
```

### 2. Middleware (`src/middleware.ts`)

The middleware handles:

- Subdomain detection
- Route rewriting
- Development environment support
- Main domain redirects

### 3. Client Provider (`src/components/client/client-provider.tsx`)

Enhanced to:

- Auto-detect subdomains from hostname
- Support development with URL parameters
- Handle both domain and subdomain-based client detection

### 4. Navigation System (`src/lib/constants/index.ts`)

Three separate navigation sets:

- `ADMIN_NAVIGATION_ITEMS` - Main domain admin interface
- `TEACHER_NAVIGATION_ITEMS` - Subdomain teacher interface
- `STUDENT_NAVIGATION_ITEMS` - Subdomain student interface

### 5. Login Redirects

Updated both login pages to:

- Detect current domain
- Redirect users based on role and domain
- Handle cross-domain redirects

## Development Testing

### Local Development

1. **Test Subdomain Routing:**

   ```
   http://localhost:3000/test-subdomain
   ```

2. **Simulate Subdomain Access:**

   ```
   http://localhost:3000?subdomain=mit&role=student
   ```

3. **Test Main Domain:**
   ```
   http://localhost:3000/dashboard
   ```

### Production URLs

1. **Admin Dashboard:**

   ```
   https://queztlearn.com/admin/dashboard
   https://queztlearn.com/admin/users
   https://queztlearn.com/admin/courses
   ```

2. **Teacher Dashboard:**

   ```
   https://queztlearn.com/teacher/dashboard
   https://queztlearn.com/teacher/courses
   https://queztlearn.com/teacher/students
   ```

3. **Student Sites:**
   ```
   https://mit.queztlearn.in/student/dashboard
   https://mit.queztlearn.in/student/courses
   https://stanford.queztlearn.in/student/dashboard
   ```

## DNS Configuration

For production deployment, configure DNS records:

```
queztlearn.com          A    <server-ip>
*.queztlearn.in         A    <server-ip>
www.queztlearn.com      CNAME queztlearn.com
```

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_MAIN_DOMAIN=queztlearn.com
NEXT_PUBLIC_SUBDOMAIN_DOMAIN=queztlearn.in
```

## Deployment Considerations

1. **Vercel/Netlify:** Configure custom domains and wildcard subdomains
2. **Server:** Ensure wildcard SSL certificates for \*.queztlearn.in
3. **CDN:** Configure routing rules for subdomain handling

## Security Notes

1. **CORS:** Configure appropriate CORS policies for cross-subdomain requests
2. **Cookies:** Set appropriate domain scoping for authentication cookies
3. **CSRF:** Implement CSRF protection for cross-domain forms

## Troubleshooting

### Common Issues

1. **Subdomain not detected:** Check middleware configuration and DNS settings
2. **Infinite redirects:** Verify login redirect logic
3. **Navigation not updating:** Clear browser cache and check role detection

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG_SUBDOMAIN_ROUTING=true
```

## Future Enhancements

1. **Custom Domains:** Support for client custom domains
2. **Multi-tenant:** Enhanced multi-tenant support
3. **Analytics:** Subdomain-specific analytics tracking
4. **Theming:** Client-specific theming per subdomain

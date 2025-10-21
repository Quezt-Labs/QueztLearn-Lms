# Development Guide - QueztLearn LMS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd queztlearn-lms

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
queztlearn-lms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── (public)/          # Public routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── common/           # Shared components
│   │   ├── ui/               # shadcn/ui components
│   │   └── providers.tsx     # React providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Core library
│   │   ├── api/              # Mock API functions
│   │   ├── constants/        # App constants
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── utils.ts          # Utility functions
├── public/                   # Static assets
├── components.json           # shadcn/ui config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Check TypeScript types

# Utilities
npm run clean            # Clean build artifacts
```

## 🎯 Key Concepts

### 1. Route Groups

Next.js App Router uses route groups `(folder)` to organize routes without affecting the URL structure:

- `(public)` - Public routes (landing, login)
- `(dashboard)` - Protected dashboard routes

### 2. Role-Based Access Control

The application uses a three-tier role system:

- **Admin**: Full platform access
- **Teacher**: Course and student management
- **Student**: Learning and progress tracking

### 3. State Management

- **Zustand**: Global state (auth, theme, tenant)
- **React Query**: Server state and caching
- **React State**: Component-level state

## 🔧 Development Workflow

### 1. Adding New Pages

#### Public Page

```typescript
// src/app/(public)/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

#### Dashboard Page

```typescript
// src/app/(dashboard)/admin/settings/page.tsx
export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      {/* Page content */}
    </div>
  );
}
```

### 2. Adding New Components

#### Shared Component

```typescript
// src/components/common/my-component.tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

#### UI Component (shadcn/ui)

```bash
npx shadcn@latest add button
```

### 3. Adding New Hooks

```typescript
// src/hooks/use-my-data.ts
import { useQuery } from "@tanstack/react-query";
import { myApi } from "@/lib/api";

export function useMyData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: myApi.getData,
  });
}
```

### 4. Adding New API Functions

```typescript
// src/lib/api/my-api.ts
export const myApi = {
  async getData(): Promise<ApiResponse<MyData>> {
    await delay(500);
    return {
      data: mockData,
      success: true,
    };
  },
};
```

## 🎨 Styling Guidelines

### 1. Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <h2 className="text-lg font-semibold">Title</h2>
  <Button variant="outline">Action</Button>
</div>
```

### 2. Component Variants

Use `class-variance-authority` for component variants:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
      },
    },
  }
);
```

### 3. Responsive Design

Always consider mobile-first responsive design:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 🔐 Authentication & Authorization

### 1. Route Protection

Use `RouteGuard` component for route protection:

```tsx
<RouteGuard allowedRoles={["admin", "teacher"]}>
  <AdminContent />
</RouteGuard>
```

### 2. Role Checking

Use custom hooks for role checking:

```tsx
const { hasAccess } = useRequireRole(["admin"]);
const isAdmin = useIsAdmin();
```

### 3. Mock Authentication

The app uses mock authentication for development:

```typescript
// Demo credentials
admin@example.com / password
teacher@example.com / password
student@example.com / password
```

## 📊 Data Management

### 1. React Query

Use React Query for server state:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["courses"],
  queryFn: coursesApi.getCourses,
});
```

### 2. Zustand Stores

Use Zustand for global state:

```typescript
const { user, login, logout } = useAuthStore();
```

### 3. Mock APIs

All APIs are mocked for development:

```typescript
// src/lib/api/index.ts
export const coursesApi = {
  async getCourses() {
    await delay(800); // Simulate network delay
    return { data: mockCourses, success: true };
  },
};
```

## 🧪 Testing

### 1. Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./my-component";

test("renders component", () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

### 2. Hook Testing

```typescript
import { renderHook } from "@testing-library/react";
import { useMyData } from "./use-my-data";

test("returns data", () => {
  const { result } = renderHook(() => useMyData());
  expect(result.current.data).toBeDefined();
});
```

## 🚀 Deployment

### 1. Build Process

```bash
npm run build
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Production Checklist

- [ ] Run `npm run lint` and fix errors
- [ ] Run `npm run type-check`
- [ ] Test all user flows
- [ ] Verify responsive design
- [ ] Check performance

## 🐛 Debugging

### 1. React Query DevTools

Add to your layout for debugging:

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 2. Console Logging

Use console.log for debugging:

```typescript
console.log("Debug data:", data);
```

### 3. Browser DevTools

- React DevTools for component debugging
- Network tab for API calls
- Console for errors and logs

## 📚 Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Tools

- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Playground](https://play.tailwindcss.com/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

---

Happy coding! 🚀

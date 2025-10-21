# QueztLearn LMS

A modern, multi-tenant Learning Management System built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Multi-Tenant Architecture

- Support for multiple organizations with isolated data
- Custom branding and settings per tenant
- Scalable user management

### Role-Based Access Control

- **Admin**: Full platform management, user management, analytics
- **Teacher**: Course creation, student management, analytics
- **Student**: Course enrollment, progress tracking, learning

### Modern Tech Stack

- **Frontend**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **TypeScript**: Full type safety

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/              # Admin-only routes
│   │   ├── teacher/            # Teacher routes
│   │   └── student/            # Student routes
│   ├── (public)/               # Public routes
│   │   └── login/              # Authentication
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── common/                 # Shared components
│   │   ├── layout.tsx          # Main layout wrapper
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── header.tsx          # Top navigation
│   │   ├── page-header.tsx     # Page header with breadcrumbs
│   │   ├── route-guard.tsx     # Route protection
│   │   └── loading-skeleton.tsx # Loading states
│   ├── providers.tsx           # React Query provider
│   └── ui/                     # shadcn/ui components
├── hooks/                      # Custom React hooks
│   └── index.ts                # Data fetching hooks
├── lib/
│   ├── api/                    # Mock API functions
│   │   └── index.ts
│   ├── constants/              # App constants
│   │   └── index.ts
│   ├── store/                  # Zustand stores
│   │   └── index.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   └── utils.ts                # Utility functions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd queztlearn-lms
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Login

The application includes mock authentication with demo credentials:

- **Admin**: `admin@example.com` / `password`
- **Teacher**: `teacher@example.com` / `password`
- **Student**: `student@example.com` / `password`

## 🎯 Key Features

### 1. Role-Based Navigation

- Dynamic sidebar that shows different menu items based on user role
- Route guards that protect admin/teacher/student specific pages
- Seamless role switching for demo purposes

### 2. Dashboard Views

#### Admin Dashboard

- Platform statistics and analytics
- User management with CRUD operations
- Course management and oversight
- Recent activity monitoring
- Quick action buttons

#### Teacher Dashboard

- Personal course management
- Student progress tracking
- Teaching analytics
- Course creation tools
- Recent activity feed

#### Student Dashboard

- Enrolled courses overview
- Progress tracking and achievements
- Upcoming classes and events
- Course discovery and enrollment
- Learning streak tracking

### 3. Course Management

- Rich course creation and editing
- Lesson organization with video support
- Progress tracking for students
- Enrollment management
- Course analytics

### 4. User Management

- Role-based user creation
- User profile management
- Activity tracking
- Permission management

## 🎨 Design System

### Components

Built with shadcn/ui for consistent, accessible components:

- Cards, Buttons, Inputs, Tables
- Dropdowns, Dialogs, Sheets
- Progress bars, Badges, Avatars
- Responsive grid layouts

### Theming

- Light/Dark mode support
- Custom color palette
- Consistent spacing and typography
- Responsive design patterns

### Animations

- Framer Motion for smooth transitions
- Loading skeletons and shimmer effects
- Hover states and micro-interactions
- Page transition animations

## 🔧 Technical Implementation

### State Management

- **Zustand** for global state (auth, theme, tenant)
- **React Query** for server state and caching
- **Local state** with React hooks for component state

### Data Flow

1. User actions trigger API calls through custom hooks
2. React Query manages caching and background updates
3. Zustand stores handle global state updates
4. Components re-render based on state changes

### Route Protection

- Layout-based route guards
- Role-specific access control
- Automatic redirects for unauthorized access
- Loading states during authentication checks

### API Layer

- Mock API functions for development
- Type-safe API responses
- Error handling and loading states
- Pagination support

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Route-based access control
- Role-based permissions
- Input validation and sanitization
- XSS protection through React
- CSRF protection ready

## 🧪 Testing

### Running Tests

```bash
npm run test
```

### Test Coverage

- Component unit tests
- Hook testing
- Integration tests
- E2E testing with Playwright

## 📈 Performance

- Server-side rendering with Next.js
- Image optimization
- Code splitting and lazy loading
- React Query caching
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

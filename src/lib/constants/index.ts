import { NavigationItem } from "@/lib/types";

export const ROLES = {
  ADMIN: "admin" as const,
  TEACHER: "teacher" as const,
  STUDENT: "student" as const,
} as const;

// Admin navigation items (main domain)
export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin"],
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: "UserCog",
    roles: ["admin"],
  },
  {
    title: "Teachers",
    href: "/admin/teachers",
    icon: "GraduationCap",
    roles: ["admin"],
  },
  {
    title: "All Courses",
    href: "/admin/courses",
    icon: "BookOpen",
    roles: ["admin"],
  },
  {
    title: "Test Series",
    href: "/admin/test-series",
    icon: "FileText",
    roles: ["admin"],
  },
];

// Teacher navigation items (main domain)
export const TEACHER_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/teacher/dashboard",
    icon: "LayoutDashboard",
    roles: ["teacher"],
  },
  {
    title: "My Courses",
    href: "/teacher/courses",
    icon: "BookOpen",
    roles: ["teacher"],
  },
  {
    title: "Test Series",
    href: "/teacher/test-series",
    icon: "FileText",
    roles: ["teacher"],
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: "Users",
    roles: ["teacher"],
  },
];

// Student navigation items (subdomain)
export const STUDENT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: "LayoutDashboard",
    roles: ["student"],
  },
  {
    title: "My Batches",
    href: "/student/batches",
    icon: "BookOpen",
    roles: ["student"],
  },
  {
    title: "My Progress",
    href: "/student/progress",
    icon: "TrendingUp",
    roles: ["student"],
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: "FileText",
    roles: ["student"],
  },
  {
    title: "Upcoming Classes",
    href: "/student/classes",
    icon: "Calendar",
    roles: ["student"],
  },
  {
    title: "Grades",
    href: "/student/grades",
    icon: "Award",
    roles: ["student"],
  },
];

// Legacy navigation items for backward compatibility
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Students",
    href: "/students",
    icon: "Users",
    roles: ["admin", "teacher"],
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: "UserCog",
    roles: ["admin"],
  },
  {
    title: "My Progress",
    href: "/student/progress",
    icon: "TrendingUp",
    roles: ["student"],
  },
  {
    title: "Upcoming Classes",
    href: "/student/classes",
    icon: "Calendar",
    roles: ["student"],
  },
];

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  SUSPENDED: "suspended",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
  },
  USERS: {
    LIST: "/api/users",
    CREATE: "/api/users",
    UPDATE: "/api/users/:id",
    DELETE: "/api/users/:id",
  },
  COURSES: {
    LIST: "/api/courses",
    CREATE: "/api/courses",
    UPDATE: "/api/courses/:id",
    DELETE: "/api/courses/:id",
    ENROLL: "/api/courses/:id/enroll",
  },
  TEST_SERIES: {
    LIST: "/api/admin/test-series",
    CREATE: "/api/admin/test-series",
    GET: "/api/admin/test-series/:id",
    UPDATE: "/api/admin/test-series/:id",
    DELETE: "/api/admin/test-series/:id",
    ANALYTICS: "/api/admin/test-series/:id/analytics",
  },
  TESTS: {
    LIST: "/api/admin/tests",
    CREATE: "/api/admin/tests",
    GET: "/api/admin/tests/:id",
    UPDATE: "/api/admin/tests/:id",
    DELETE: "/api/admin/tests/:id",
    ANALYTICS: "/api/admin/tests/:id/analytics",
  },
  SECTIONS: {
    LIST: "/api/admin/sections/test/:testId",
    CREATE: "/api/admin/sections",
    GET: "/api/admin/sections/:id",
    UPDATE: "/api/admin/sections/:id",
    DELETE: "/api/admin/sections/:id",
  },
  QUESTIONS: {
    LIST: "/api/admin/questions/section/:sectionId",
    CREATE: "/api/admin/questions",
    GET: "/api/admin/questions/:id",
    UPDATE: "/api/admin/questions/:id",
    DELETE: "/api/admin/questions/:id",
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
    ACTIVITY: "/api/dashboard/activity",
  },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
} as const;

// Utility function to get navigation items based on domain and role
type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const getNavigationItems = (
  hostname: string,
  role: UserRole
): NavigationItem[] => {
  console.log("Navigation Debug:", { hostname, role, ROLES });

  // Normalize role to lowercase for comparison
  const normalizedRole = role?.toLowerCase();

  // Main domain (queztlearn.com) or localhost - admin and teacher
  if (
    hostname === "queztlearn.com" ||
    hostname === "www.queztlearn.com" ||
    hostname === "localhost"
  ) {
    switch (normalizedRole) {
      case ROLES.ADMIN:
        console.log("Returning ADMIN_NAVIGATION_ITEMS");
        return ADMIN_NAVIGATION_ITEMS;
      case ROLES.TEACHER:
        console.log("Returning TEACHER_NAVIGATION_ITEMS");
        return TEACHER_NAVIGATION_ITEMS;
      default:
        console.log("Returning STUDENT_NAVIGATION_ITEMS (default)");
        // Students should be redirected to subdomain
        return STUDENT_NAVIGATION_ITEMS;
    }
  }

  // Subdomain - students only
  switch (normalizedRole) {
    case ROLES.STUDENT:
      return STUDENT_NAVIGATION_ITEMS;
    case ROLES.TEACHER:
      // Teacher on subdomain should redirect to main domain
      return TEACHER_NAVIGATION_ITEMS;
    case ROLES.ADMIN:
      // Admin on subdomain should redirect to main domain
      return ADMIN_NAVIGATION_ITEMS;
    default:
      return STUDENT_NAVIGATION_ITEMS;
  }
};

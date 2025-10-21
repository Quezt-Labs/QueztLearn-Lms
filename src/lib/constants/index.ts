import { NavigationItem } from "@/lib/types";

export const ROLES = {
  ADMIN: "admin" as const,
  TEACHER: "teacher" as const,
  STUDENT: "student" as const,
} as const;

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Courses",
    href: "/courses",
    icon: "BookOpen",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Students",
    href: "/students",
    icon: "Users",
    roles: ["admin", "teacher"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
    roles: ["admin", "teacher"],
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: "UserCog",
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
    roles: ["admin"],
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: "CreditCard",
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

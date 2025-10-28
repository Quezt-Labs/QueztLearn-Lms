/**
 * API response types for consistent type safety
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth API Types
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    organizationId: string;
  };
}

export interface RegisterData {
  organizationId: string;
  email: string;
  username: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  message: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  userId: string;
}

export interface SetPasswordData {
  userId: string;
  password: string;
}

export interface SetPasswordResponse {
  message: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface InviteUserData {
  email: string;
  username: string;
}

export interface InviteUserResponse {
  id: string;
  email: string;
  username: string;
  role: "TEACHER";
  organizationId: string;
  message: string;
}

// Organization API Types
export interface CreateOrganizationData {
  name: string;
  slug: string;
  subdomain?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: File | null;
    customDomain?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  createdAt: string;
}

// Course API Types
export interface CreateCourseData {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  instructorName: string;
  tenantId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  enrolledStudents: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// User API Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  avatar?: string;
  tenantId: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  tenantId: string;
}

// Dashboard API Types
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  activeEnrollments: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: "enrollment" | "course_created" | "completion" | "login";
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  lastAccessedAt: Date;
}

// Organization Configuration API Types
export interface OrganizationConfig {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  domain: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  logoUrl: string;
  faviconUrl: string;
  bannerUrls: string[];
  motto: string;
  description: string;
  theme: Record<string, any>;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaUrl: string;
  socialLinks: Record<string, any>;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  supportEmail: string;
  featuresEnabled: Record<string, any>;
  maintenanceMode: boolean;
  customCSS: string;
  customJS: string;
}

export interface OrganizationConfigResponse {
  success: boolean;
  data: OrganizationConfig;
}

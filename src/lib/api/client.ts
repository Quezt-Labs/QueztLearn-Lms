import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management
const QUEZT_AUTH_KEY = "QUEZT_AUTH";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isVerified: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  userId: string;
}

export interface SetPasswordResponse {
  message: string;
}

export interface InviteUserResponse {
  id: string;
  email: string;
  username: string;
  role: "TEACHER";
  organizationId: string;
  message: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie(QUEZT_AUTH_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      deleteCookie(QUEZT_AUTH_KEY);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const tokenManager = {
  setAuthData: (
    token: string,
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
      organizationId: string;
    }
  ) => {
    const authData = {
      token,
      user,
      timestamp: Date.now(),
    };

    setCookie(QUEZT_AUTH_KEY, JSON.stringify(authData), {
      maxAge: 7 * 24 * 60 * 60, // 7 days (matches JWT expiry)
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  getToken: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        const parsed = JSON.parse(authData);
        return parsed.token;
      } catch {
        return null;
      }
    }
    return null;
  },

  getUser: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        const parsed = JSON.parse(authData);
        return parsed.user;
      } catch {
        return null;
      }
    }
    return null;
  },

  getAuthData: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        return JSON.parse(authData);
      } catch {
        return null;
      }
    }
    return null;
  },

  clearAuthData: () => {
    deleteCookie(QUEZT_AUTH_KEY);
  },

  isAuthenticated: () => !!getCookie(QUEZT_AUTH_KEY),
};

// API endpoints
export const api = {
  // Organizations
  createOrganization: (data: { name: string }) =>
    apiClient.post<ApiResponse<Organization>>("/admin/organizations", data),

  // Auth
  register: (data: {
    organizationId: string;
    email: string;
    username: string;
  }) =>
    apiClient.post<ApiResponse<RegisterResponse>>("/admin/auth/register", data),

  verifyEmail: (data: { token: string }) =>
    apiClient.post<ApiResponse<VerifyEmailResponse>>(
      "/admin/auth/verify-email",
      data
    ),

  setPassword: (data: { userId: string; password: string }) =>
    apiClient.post<ApiResponse<SetPasswordResponse>>(
      "/admin/auth/set-password",
      data
    ),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>("/admin/auth/login", data),

  resendVerification: (data: { email: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      "/admin/auth/resend-verification",
      data
    ),

  inviteUser: (data: { email: string; username: string }) =>
    apiClient.post<ApiResponse<InviteUserResponse>>(
      "/admin/auth/invite-user",
      data
    ),

  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/admin/auth/refresh",
      data
    ),

  // Course endpoints
  getCourses: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<unknown>>(
      `/admin/courses?page=${page}&limit=${limit}`
    ),

  createCourse: (data: { title: string; description: string }) =>
    apiClient.post<ApiResponse<unknown>>("/admin/courses", data),
};

export default apiClient;

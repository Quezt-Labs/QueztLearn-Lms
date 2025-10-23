import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

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
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/admin/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Update tokens in cookies
          setCookie(ACCESS_TOKEN_KEY, accessToken, {
            maxAge: 7 * 24 * 60 * 60, // 7 days
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          setCookie(REFRESH_TOKEN_KEY, newRefreshToken, {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken: string) => {
    setCookie(ACCESS_TOKEN_KEY, accessToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    setCookie(REFRESH_TOKEN_KEY, refreshToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  getAccessToken: () => getCookie(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getCookie(REFRESH_TOKEN_KEY),

  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: () => !!getCookie(ACCESS_TOKEN_KEY),
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

  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/admin/auth/refresh",
      data
    ),

  // Check email availability
  checkEmailAvailability: (email: string) =>
    apiClient.get<ApiResponse<{ available: boolean }>>(
      `/admin/auth/check-email?email=${encodeURIComponent(email)}`
    ),

  // Dashboard endpoints
  getDashboardStats: () =>
    apiClient.get<ApiResponse<unknown>>("/admin/dashboard/stats"),

  getActivity: () => apiClient.get<ApiResponse<unknown>>("/admin/activity"),

  getCourses: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<unknown>>(
      `/admin/courses?page=${page}&limit=${limit}`
    ),

  createCourse: (data: { title: string; description: string }) =>
    apiClient.post<ApiResponse<unknown>>("/admin/courses", data),
};

export default apiClient;

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  tokenManager,
  ApiResponse,
  Organization,
  LoginResponse,
} from "@/lib/api/client";
import { useRouter } from "next/navigation";

// Query Keys
export const queryKeys = {
  user: ["user"] as const,
  organization: ["organization"] as const,
  emailAvailability: (email: string) => ["emailAvailability", email] as const,
};

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.login(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<LoginResponse>) => {
      if (data.success && data.data) {
        // Store tokens
        tokenManager.setTokens(data.data.token, data.data.token); // Using same token for both in this example

        // Update user cache
        queryClient.setQueryData(queryKeys.user, data.data.user);

        // Redirect to dashboard
        router.push("/admin/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Clear tokens
      tokenManager.clearTokens();
      // Clear all cached data
      queryClient.clear();
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      if (!tokenManager.isAuthenticated()) {
        throw new Error("Not authenticated");
      }
      // In a real app, you'd fetch user data from /me endpoint
      // For now, return null to indicate no user
      return null;
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Organization Hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.createOrganization(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<Organization>) => {
      if (data.success && data.data) {
        // Cache the organization
        queryClient.setQueryData(queryKeys.organization, data.data);
      }
    },
    onError: (error) => {
      console.error("Failed to create organization:", error);
    },
  });
};

// Auth Registration Hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      username: string;
    }) => api.register(data).then((res) => res.data),
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      api.verifyEmail(data).then((res) => res.data),
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
};

export const useSetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; password: string }) =>
      api.setPassword(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<{ message: string }>) => {
      if (data.success) {
        // Clear any cached auth data
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
    onError: (error) => {
      console.error("Set password failed:", error);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.resendVerification(data).then((res) => res.data),
    onError: (error) => {
      console.error("Resend verification failed:", error);
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; username: string }) =>
      api.inviteUser(data).then((res) => res.data),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate users query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["users"] });
        // You could also show a success toast here
        console.log("Teacher invited successfully:", data.data);
      }
    },
    onError: (error) => {
      console.error("Invite user failed:", error);
    },
  });
};

// Utility hook for authentication state
export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
};

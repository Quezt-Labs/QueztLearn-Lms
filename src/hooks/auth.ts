"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./api";
import { tokenManager } from "@/lib/api/client";

// Require Authentication Hook
export const useRequireAuth = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
};

// Require Role Hook
export const useRequireRole = (
  requiredRole: "ADMIN" | "TEACHER" | "STUDENT"
) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      (user as { role?: string }).role !== requiredRole
    ) {
      // Redirect to appropriate dashboard based on user role
      switch ((user as { role?: string }).role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "TEACHER":
          router.push("/teacher/dashboard");
          break;
        case "STUDENT":
          router.push("/student/dashboard");
          break;
        default:
          router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole: user && (user as { role?: string }).role === requiredRole,
  };
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  return tokenManager.isAuthenticated();
};

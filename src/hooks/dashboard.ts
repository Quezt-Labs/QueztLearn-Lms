"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Dashboard Stats Hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Activity Hook
export const useActivity = () => {
  return useQuery({
    queryKey: ["activity"],
    queryFn: () => api.getActivity().then((res) => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Courses Hook
export const useCourses = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["courses", page, limit],
    queryFn: () => api.getCourses(page, limit).then((res) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create Course Hook
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description: string }) => {
      return api.createCourse(data).then((res) => res.data);
    },
    onSuccess: () => {
      // Invalidate courses query to refetch data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

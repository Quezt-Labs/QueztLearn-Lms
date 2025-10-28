"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, tokenManager } from "@/lib/api/client";
import apiClient from "@/lib/api/client";
import { ApiResponse, Organization, LoginResponse } from "@/lib/types/api";
import { useRouter } from "next/navigation";

// Query Keys
export const queryKeys = {
  user: ["user"] as const,
  organization: ["organization"] as const,
  organizationConfig: (slug: string) => ["organizationConfig", slug] as const,
  emailAvailability: (email: string) => ["emailAvailability", email] as const,
  users: ["users"] as const,
  batches: ["batches"] as const,
  batch: (id: string) => ["batch", id] as const,
  teachers: ["teachers"] as const,
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
        // Store complete auth data (token + user) in QUEZT_AUTH cookie
        tokenManager.setAuthData(data.data.token, data.data.user);

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
      // Clear auth data
      tokenManager.clearAuthData();
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
      // Get user data from cookie
      const user = tokenManager.getUser();
      if (!user) {
        throw new Error("User data not found");
      }
      return user;
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Organization Hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug: string }) =>
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

// Organization Configuration Hook (Public endpoint)
export const useOrganizationConfig = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.organizationConfig(slug),
    queryFn: () => api.getOrganizationConfig(slug).then((res) => res.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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

export const useInviteTeacher = () => {
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

// User Management Hooks
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.get("/admin/users").then((res) => res.data),
    enabled: !!tokenManager.getToken(),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/admin/users/${userId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useInviteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      username: string;
    }) => apiClient.post("/admin/auth/register", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

// Batch Management Hooks
export const useGetAllBatches = () => {
  return useQuery({
    queryKey: queryKeys.batches,
    queryFn: () => apiClient.get("/admin/batches").then((res) => res.data),
    enabled: true,
  });
};

export const useGetBatch = (id: string) => {
  return useQuery({
    queryKey: queryKeys.batch(id),
    queryFn: () =>
      apiClient.get(`/admin/batches/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      class: string;
      exam: string;
      imageUrl?: string;
      startDate: string;
      endDate: string;
      language: string;
      totalPrice: number;
      discountPercentage: number;
      faq: Array<{
        title: string;
        description: string;
      }>;
    }) => apiClient.post("/admin/batches", data).then((res) => res.data),
    onSuccess: (created) => {
      // Invalidate batches query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
      // Redirect to created batch detail when possible
      const extractId = (payload: unknown): string | undefined => {
        if (!payload || typeof payload !== "object") return undefined;
        const maybeWithData = payload as { data?: unknown; id?: unknown };
        if (maybeWithData.data && typeof maybeWithData.data === "object") {
          const inner = maybeWithData.data as { id?: unknown };
          if (typeof inner.id === "string") return inner.id;
        }
        if (typeof maybeWithData.id === "string") return maybeWithData.id;
        return undefined;
      };
      const createdId = extractId(created);
      if (createdId) {
        router.push(`/admin/courses/${createdId}`);
      } else {
        router.push("/admin/courses");
      }
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description: string;
        class: string;
        exam: string;
        imageUrl?: string;
        startDate: string;
        endDate: string;
        language: string;
        totalPrice: number;
        discountPercentage: number;
        faq: Array<{
          title: string;
          description: string;
        }>;
        teacherId?: string;
      };
    }) => apiClient.put(`/admin/batches/${id}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      // Invalidate both batches list and specific batch
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
      queryClient.invalidateQueries({
        queryKey: queryKeys.batch(variables.id),
      });
      // Redirect to updated batch detail page
      router.push(`/admin/courses/${variables.id}`);
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/batches/${id}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate batches query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

// Teacher Management Hooks
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      batchIds: string[];
      highlights: Record<string, unknown>;
      imageUrl?: string;
      subjects: string[];
    }) => apiClient.post("/admin/teachers", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useGetAllTeachers = () => {
  return useQuery({
    queryKey: ["teachers", "all"],
    queryFn: () => apiClient.get(`/admin/teachers`).then((res) => res.data),
  });
};

export const useGetTeachersByBatch = (batchId: string) => {
  return useQuery({
    queryKey: ["teachers", "batch", batchId],
    queryFn: () =>
      apiClient.get(`/admin/teachers/batch/${batchId}`).then((res) => res.data),
    enabled: !!batchId,
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        highlights: Record<string, unknown>;
        imageUrl?: string;
        subjects: string[];
        batchId?: string;
      };
    }) => apiClient.put(`/admin/teachers/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/teachers/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useAssignTeacherToBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) =>
      apiClient
        .post(`/admin/teachers/${teacherId}/batches/${batchId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

export const useRemoveTeacherFromBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) =>
      apiClient
        .delete(`/admin/teachers/${teacherId}/batches/${batchId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

// File Upload Hooks
export const useGenerateSignedUrl = () => {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      folder: string;
    }) =>
      apiClient.post("/admin/upload/signed-url", data).then((res) => res.data),
  });
};

export const useDirectUpload = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient
        .post("/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data),
  });
};

// ==========================================
// Subjects API Hooks
// ==========================================

// Subject query keys (using inline arrays for now)

// Create Subject
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      batchId: string;
      thumbnailUrl?: string;
    }) => apiClient.post("/admin/subjects", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

// Get Subjects by Batch
export const useGetSubjectsByBatch = (batchId: string) => {
  return useQuery({
    queryKey: ["subjects", "batch", batchId],
    queryFn: () =>
      apiClient.get(`/admin/subjects/batch/${batchId}`).then((res) => res.data),
  });
};

// Get Subject by ID
export const useGetSubject = (id: string) => {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () =>
      apiClient.get(`/admin/subjects/${id}`).then((res) => res.data),
  });
};

// Update Subject
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        thumbnailUrl?: string;
      };
    }) => apiClient.put(`/admin/subjects/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({
        queryKey: ["subjects", variables.id],
      });
    },
  });
};

// Delete Subject
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/subjects/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

// ==========================================
// Chapters API Hooks
// ==========================================

// Create Chapter
export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; subjectId: string }) =>
      apiClient.post("/admin/chapters", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};

// Get Chapters by Subject
export const useGetChaptersBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["chapters", "subject", subjectId],
    queryFn: () =>
      apiClient
        .get(`/admin/chapters/subject/${subjectId}`)
        .then((res) => res.data),
  });
};

// Get Chapter by ID
export const useGetChapter = (id: string) => {
  return useQuery({
    queryKey: ["chapters", id],
    queryFn: () =>
      apiClient.get(`/admin/chapters/${id}`).then((res) => res.data),
  });
};

// Update Chapter
export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.put(`/admin/chapters/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({
        queryKey: ["chapters", variables.id],
      });
    },
  });
};

// Delete Chapter
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/chapters/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};

// ==========================================
// Topics API Hooks
// ==========================================

// Create Topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; chapterId: string }) =>
      apiClient.post("/admin/topics", data).then((res) => res.data),
    onSuccess: (data, variables) => {
      // Invalidate all topics queries and specifically the chapter topics
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({
        queryKey: ["topics", "chapter", variables.chapterId],
      });
    },
  });
};

// Get Topics by Chapter
export const useGetTopicsByChapter = (chapterId: string) => {
  return useQuery({
    queryKey: ["topics", "chapter", chapterId],
    queryFn: () =>
      apiClient
        .get(`/admin/topics/chapter/${chapterId}`)
        .then((res) => res.data),
  });
};

// Get Topic by ID
export const useGetTopic = (id: string) => {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: () => apiClient.get(`/admin/topics/${id}`).then((res) => res.data),
  });
};

// Update Topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.put(`/admin/topics/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.id],
      });
    },
  });
};

// Delete Topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/topics/${id}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all topics queries
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

// ==========================================
// Contents API Hooks
// ==========================================

interface ContentData {
  name: string;
  topicId?: string;
  type: "Lecture" | "Video" | "PDF" | "Assignment";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "HLS" | "MP4";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted?: boolean;
}

// Create Content
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContentData) =>
      apiClient.post("/admin/contents", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};

// Get Contents by Topic
export const useGetContentsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["contents", "topic", topicId],
    queryFn: () =>
      apiClient.get(`/admin/contents/topic/${topicId}`).then((res) => res.data),
  });
};

// Get Content by ID
export const useGetContent = (id: string) => {
  return useQuery({
    queryKey: ["contents", id],
    queryFn: () =>
      apiClient.get(`/admin/contents/${id}`).then((res) => res.data),
  });
};

// Update Content
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentData> }) =>
      apiClient.put(`/admin/contents/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.id],
      });
    },
  });
};

// Delete Content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/contents/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};

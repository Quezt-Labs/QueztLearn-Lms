import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, usersApi, coursesApi, dashboardApi } from "@/lib/api";
import { User, Course } from "@/lib/types";

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(["user"], data.data.user);
        queryClient.setQueryData(["auth-token"], data.data.token);
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getProfile(),
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Users hooks
export const useUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => usersApi.getUsers(page, limit),
    select: (data) => (data.success ? data.data : null),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Courses hooks
export const useCourses = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["courses", page, limit],
    queryFn: () => coursesApi.getCourses(page, limit),
    select: (data) => (data.success ? data.data : null),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.getCourse(id),
    select: (data) => (data.success ? data.data : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      coursesApi.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      studentId,
    }: {
      courseId: string;
      studentId: string;
    }) => coursesApi.enrollInCourse(courseId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivity = () => {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => dashboardApi.getActivity(),
    select: (data) => (data.success ? data.data : null),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Utility hooks
export const useRequireRole = (allowedRoles: string[]) => {
  const { data: user } = useUser();
  const role = user?.role;

  return {
    hasAccess: role ? allowedRoles.includes(role) : false,
    role,
    isLoading: !user,
  };
};

export const useRequireAuth = () => {
  const { data: user, isLoading } = useUser();

  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
};

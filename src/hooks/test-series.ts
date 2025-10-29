import apiClient from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export type ExamType =
  | "JEE"
  | "NEET"
  | "UPSC"
  | "BANK"
  | "SSC"
  | "GATE"
  | "CAT"
  | "NDA"
  | "CLAT"
  | "OTHER";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "NUMERICAL";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export interface TestSeries {
  id: string;
  organizationId: string;
  exam: ExamType;
  title: string;
  description?: {
    html?: string;
    features?: string[];
  };
  slug: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice?: number; // Optional as API returns discountedPrice
  discountedPrice?: number; // API response uses this
  isFree: boolean;
  durationDays: number;
  testCount: number;
  totalQuestions: number;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tests?: Test[]; // Optional list of tests if included by API
}

export interface Test {
  id: string;
  testSeriesId: string;
  organizationId: string;
  title: string;
  description?: {
    html?: string;
    topics?: string[];
  };
  slug: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  isFree: boolean;
  isPublished: boolean;
  showAnswersAfterSubmit: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  sectionCount: number;
  questionCount: number;
  attemptCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  testId: string;
  name: string;
  description?: string;
  displayOrder: number;
  totalMarks: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id?: string;
  questionId?: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Question {
  id: string;
  sectionId: string;
  organizationId: string;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  explanationImageUrl?: string;
  displayOrder: number;
  options?: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

// Test Series Hooks
export const useTestSeriesList = (params?: {
  page?: number;
  limit?: number;
  exam?: ExamType;
  isActive?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["test-series", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.exam) queryParams.append("exam", params.exam);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params?.search) queryParams.append("search", params.search);

      const response = await apiClient.get(
        `/admin/test-series?${queryParams.toString()}`
      );
      return response.data;
    },
  });
};

export const useTestSeries = (id: string) => {
  return useQuery({
    queryKey: ["test-series", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/test-series/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTestSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TestSeries>) => {
      const response = await apiClient.post("/admin/test-series", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
    },
  });
};

export const useUpdateTestSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TestSeries>;
    }) => {
      const response = await apiClient.put(`/admin/test-series/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
      queryClient.invalidateQueries({
        queryKey: ["test-series", variables.id],
      });
    },
  });
};

export const useDeleteTestSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/test-series/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
    },
  });
};

// Publish Test Series
export const usePublishTestSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/admin/test-series/${id}/publish`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
      queryClient.invalidateQueries({ queryKey: ["test-series", id] });
    },
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: ["test", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/tests/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Test>) => {
      const response = await apiClient.post("/admin/tests", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Test> }) => {
      const response = await apiClient.put(`/admin/tests/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["test", variables.id] });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/tests/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["test-series"] });
    },
  });
};

// Section Hooks
export const useSectionsByTest = (testId: string) => {
  return useQuery({
    queryKey: ["sections", "test", testId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/sections/test/${testId}`);
      return response.data;
    },
    enabled: !!testId,
  });
};

// Spec-aligned: sections under a specific test
export const useTestSections = (testId: string) => {
  return useQuery({
    queryKey: ["tests", testId, "sections"],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/tests/${testId}/sections`);
      return response.data;
    },
    enabled: !!testId,
  });
};

export const useCreateTestSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testId,
      data,
    }: {
      testId: string;
      data: { name: string; description?: string; displayOrder?: number };
    }) => {
      const response = await apiClient.post(
        `/admin/tests/${testId}/sections`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tests", variables.testId, "sections"],
      });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Section>) => {
      const response = await apiClient.post("/admin/sections", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Section>;
    }) => {
      const response = await apiClient.put(`/admin/sections/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/sections/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

// Question Hooks
export const useQuestionsBySection = (
  sectionId: string,
  params?: {
    includeOptions?: boolean;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ["questions", "section", sectionId, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.includeOptions !== undefined)
        queryParams.append("includeOptions", params.includeOptions.toString());
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await apiClient.get(
        `/admin/questions/section/${sectionId}?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!sectionId,
  });
};

// Spec-aligned: questions under a specific section (nested under tests)
export const useSectionQuestions = (sectionId: string) => {
  return useQuery({
    queryKey: ["tests", "sections", sectionId, "questions"],
    queryFn: async () => {
      const response = await apiClient.get(
        `/admin/tests/sections/${sectionId}/questions`
      );
      return response.data;
    },
    enabled: !!sectionId,
  });
};

export const useCreateSectionQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: Partial<Question> & { options?: QuestionOption[] };
    }) => {
      const response = await apiClient.post(
        `/admin/tests/sections/${sectionId}/questions`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/questions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<Question> & { options: QuestionOption[] }
    ) => {
      const response = await apiClient.post("/admin/questions", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Question>;
    }) => {
      const response = await apiClient.put(`/admin/questions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", variables.id] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/questions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};

// Spec-aligned: stats endpoint for a test series
export const useTestSeriesStats = (id: string) => {
  return useQuery({
    queryKey: ["test-series-stats", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/test-series/${id}/stats`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Query Keys for external use
export const testSeriesQueryKeys = {
  all: ["test-series"] as const,
  lists: () => [...testSeriesQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...testSeriesQueryKeys.lists(), { filters }] as const,
  details: () => [...testSeriesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...testSeriesQueryKeys.details(), id] as const,
};

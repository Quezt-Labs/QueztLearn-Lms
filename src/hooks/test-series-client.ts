import apiClient from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types aligned to client Test Series endpoints
export type ClientExamType =
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

export type ClientApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export type ClientTestSeriesListItem = {
  id: string;
  exam: ClientExamType;
  title: string;
  slug: string;
  description?: { html?: string; features?: string[] };
  imageUrl?: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  isFree: boolean;
  durationDays: number;
  isEnrolled: boolean;
  enrollmentDetails?: Record<string, unknown>;
};

export type ClientTestInSeries = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  isFree: boolean;
  attemptStatus?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

export type ClientCheckoutResponse = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
};

// Query Keys
const clientTsKeys = {
  root: ["client", "test-series"] as const,
  list: (filters: Record<string, unknown>) =>
    [...clientTsKeys.root, "list", filters] as const,
  myEnrollments: (page: number, limit: number) =>
    [...clientTsKeys.root, "my-enrollments", { page, limit }] as const,
  detail: (identifier: string) =>
    [...clientTsKeys.root, "detail", identifier] as const,
  tests: (seriesId: string) =>
    [...clientTsKeys.root, "tests", seriesId] as const,
};

// Hooks
export const useClientTestSeriesList = (params?: {
  page?: number;
  limit?: number;
  exam?: ClientExamType;
}) => {
  return useQuery({
    queryKey: clientTsKeys.list(params ?? {}),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", String(params.page));
      if (params?.limit) queryParams.append("limit", String(params.limit));
      if (params?.exam) queryParams.append("exam", params.exam);

      const { data } = await apiClient.get<
        ClientApiResponse<ClientTestSeriesListItem[]>
      >(
        `/api/client/test-series${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );
      return data;
    },
  });
};

export const useClientMyEnrollments = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: clientTsKeys.myEnrollments(
      params?.page ?? 1,
      params?.limit ?? 10
    ),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", String(params.page));
      if (params?.limit) queryParams.append("limit", String(params.limit));

      const { data } = await apiClient.get<
        ClientApiResponse<ClientTestSeriesListItem[]>
      >(
        `/api/client/test-series/my-enrollments${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );
      return data;
    },
  });
};

export const useClientTestSeriesDetail = (identifier?: string) => {
  return useQuery({
    queryKey: clientTsKeys.detail(identifier ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<
        ClientApiResponse<ClientTestSeriesListItem>
      >(`/api/client/test-series/${identifier}`);
      return data;
    },
    enabled: Boolean(identifier),
  });
};

export const useClientTestsInSeries = (seriesId?: string) => {
  return useQuery({
    queryKey: clientTsKeys.tests(seriesId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<
        ClientApiResponse<ClientTestInSeries[]>
      >(`/api/client/test-series/${seriesId}/tests`);
      return data;
    },
    enabled: Boolean(seriesId),
  });
};

export const useClientCheckoutTestSeries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testSeriesId: string) => {
      const { data } = await apiClient.post<
        ClientApiResponse<ClientCheckoutResponse>
      >(`/api/client/test-series/${testSeriesId}/checkout`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientTsKeys.root });
    },
  });
};

export const useClientEnrollFreeTestSeries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testSeriesId: string) => {
      const { data } = await apiClient.post<
        ClientApiResponse<{ enrolled: boolean }>
      >(`/api/client/test-series/${testSeriesId}/enroll-free`);
      return data;
    },
    onSuccess: (_res, testSeriesId) => {
      qc.invalidateQueries({ queryKey: clientTsKeys.root });
      qc.invalidateQueries({ queryKey: clientTsKeys.detail(testSeriesId) });
    },
  });
};

export const useClientVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      orderId: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) => {
      const { data } = await apiClient.post<
        ClientApiResponse<{ verified: boolean }>
      >("/api/client/test-series/verify-payment", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientTsKeys.root });
    },
  });
};

export const clientTestSeriesKeys = clientTsKeys;

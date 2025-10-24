/**
 * Common error handling utilities
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Extract error message from various error formats
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    // Axios error format
    if ("response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return axiosError.response?.data?.message || "An error occurred";
    }

    // Generic error object
    if ("message" in error) {
      return (error as { message: string }).message;
    }
  }

  return "An unexpected error occurred";
};

/**
 * Extract API error details
 */
export const extractApiError = (error: unknown): ApiError => {
  const message = extractErrorMessage(error);

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: { message?: string; code?: string };
        status?: number;
      };
    };

    return {
      message: axiosError.response?.data?.message || message,
      code: axiosError.response?.data?.code,
      status: axiosError.response?.status,
    };
  }

  return { message };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "code" in error) {
    const errorCode = (error as { code: string }).code;
    return errorCode === "NETWORK_ERROR" || errorCode === "ECONNABORTED";
  }
  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 400;
  }
  return false;
};

/**
 * Get user-friendly error message
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again.";
  }

  if (isAuthError(error)) {
    return "Authentication failed. Please sign in again.";
  }

  if (isValidationError(error)) {
    return "Please check your input and try again.";
  }

  return extractErrorMessage(error);
};

/**
 * Error logging utility
 */
export const logError = (error: unknown, context?: string): void => {
  const errorMessage = extractErrorMessage(error);
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ""}Error:`, {
    message: errorMessage,
    error,
  });
};

/**
 * Retry utility for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

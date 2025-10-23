import { onboardingApi } from "@/lib/api/onboarding";
import { useMutation } from "@tanstack/react-query";

// Organization creation hook
export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: (data: { name: string; subdomain?: string; branding?: any }) =>
      onboardingApi.createOrganization(data),
    onError: (error) => {
      console.error("Failed to create organization:", error);
    },
  });
};

// Admin registration hook
export const useRegisterAdmin = () => {
  return useMutation({
    mutationFn: (data: {
      email: string;
      username: string;
      organizationId: string;
    }) => onboardingApi.registerAdmin(data),
    onError: (error) => {
      console.error("Failed to register admin:", error);
    },
  });
};

// Email verification hook
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: { token: string }) => onboardingApi.verifyEmail(data),
    onError: (error) => {
      console.error("Failed to verify email:", error);
    },
  });
};

// Password setup hook
export const useSetPassword = () => {
  return useMutation({
    mutationFn: (data: {
      password: string;
      confirmPassword: string;
      token: string;
    }) => onboardingApi.setPassword(data),
    onError: (error) => {
      console.error("Failed to set password:", error);
    },
  });
};

// Organization name availability check hook
export const useCheckOrganizationName = () => {
  return useMutation({
    mutationFn: (name: string) => onboardingApi.checkOrganizationName(name),
    onError: (error) => {
      console.error("Failed to check organization name:", error);
    },
  });
};

// Email availability check hook
export const useCheckEmailAvailability = () => {
  return useMutation({
    mutationFn: (email: string) => onboardingApi.checkEmailAvailability(email),
    onError: (error) => {
      console.error("Failed to check email availability:", error);
    },
  });
};

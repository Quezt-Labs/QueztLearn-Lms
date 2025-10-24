// Onboarding hooks
export * from "./onboarding";

// API hooks are exported separately to avoid conflicts
export {
  useLogin,
  useLogout,
  useCurrentUser,
  useCreateOrganization as useCreateOrganizationApi,
  useRegister as useRegisterApi,
  useVerifyEmail as useVerifyEmailApi,
  useSetPassword as useSetPasswordApi,
  useResendVerification,
  useAuth,
  queryKeys,
} from "./api";

// Dashboard hooks
export * from "./dashboard";

// Authentication hooks
export * from "./auth";

// Common hooks
export * from "./common";

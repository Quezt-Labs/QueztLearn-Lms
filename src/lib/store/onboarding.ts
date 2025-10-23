import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrganizationData {
  id: string;
  name: string;
  domain: string;
}

export interface AdminData {
  email: string;
  username: string;
  id?: string;
}

export interface OnboardingState {
  // Organization data
  organizationData: OrganizationData | null;
  setOrganizationData: (data: OrganizationData) => void;

  // Admin data
  adminData: AdminData | null;
  setAdminData: (data: AdminData) => void;

  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Email verification
  emailVerified: boolean;
  setEmailVerified: (verified: boolean) => void;

  // Password setup
  passwordSet: boolean;
  setPasswordSet: (value: boolean) => void;

  // Reset onboarding data
  resetOnboarding: () => void;

  // Complete onboarding
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Organization data
      organizationData: null,
      setOrganizationData: (data) => set({ organizationData: data }),

      // Admin data
      adminData: null,
      setAdminData: (data) => set({ adminData: data }),

      // Current step
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),

      // Email verification
      emailVerified: false,
      setEmailVerified: (verified) => set({ emailVerified: verified }),

      // Password setup
      passwordSet: false,
      setPasswordSet: (value) => set({ passwordSet: value }),

      // Reset onboarding data
      resetOnboarding: () =>
        set({
          organizationData: null,
          adminData: null,
          currentStep: 1,
          emailVerified: false,
          passwordSet: false,
        }),

      // Complete onboarding
      completeOnboarding: () => {
        // Clear onboarding data after completion
        set({
          organizationData: null,
          adminData: null,
          currentStep: 1,
          emailVerified: false,
          passwordSet: false,
        });
      },
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        organizationData: state.organizationData,
        adminData: state.adminData,
        currentStep: state.currentStep,
        emailVerified: state.emailVerified,
        passwordSet: state.passwordSet,
      }),
    }
  )
);

// Helper hooks
export const useOnboardingProgress = () => {
  const {
    currentStep,
    organizationData,
    adminData,
    emailVerified,
    passwordSet,
  } = useOnboardingStore();

  return {
    currentStep,
    totalSteps: 4,
    progress: (currentStep / 4) * 100,
    isStepComplete: (step: number) => {
      switch (step) {
        case 1:
          return !!organizationData;
        case 2:
          return !!adminData;
        case 3:
          return emailVerified;
        case 4:
          return passwordSet;
        default:
          return false;
      }
    },
    canProceedToStep: (step: number) => {
      switch (step) {
        case 1:
          return true;
        case 2:
          return !!organizationData;
        case 3:
          return !!organizationData && !!adminData;
        case 4:
          return !!organizationData && !!adminData && emailVerified;
        default:
          return false;
      }
    },
  };
};

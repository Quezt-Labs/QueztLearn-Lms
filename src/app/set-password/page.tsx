"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";
import { useSetPassword, useCreateOrganizationConfig, useLogin } from "@/hooks";
import { useStudentSetPassword, useStudentLogin } from "@/hooks/api";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useStudentAuthStore } from "@/lib/store/student-auth";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { calculatePasswordStrength } from "@/lib/utils/validation";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { CreateOrganizationConfigData } from "@/lib/types/api";

function SetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  const router = useRouter();

  // Admin onboarding store
  const {
    organizationData,
    adminData,
    emailVerified,
    userId: storeUserId,
    setPasswordSet,
    setOrganizationConfig,
    completeOnboarding,
  } = useOnboardingStore();

  // Student auth store
  const {
    studentData,
    userId: studentUserId,
    setPasswordSet: setStudentPasswordSet,
    completeStudentAuth,
  } = useStudentAuthStore();

  // Determine if this is a student password setup
  const isStudentPasswordSetup = !!studentData && !!studentUserId;

  // Call all hooks unconditionally (Rules of Hooks)
  const adminSetPasswordMutation = useSetPassword();
  const studentSetPasswordMutation = useStudentSetPassword();
  const adminLoginMutation = useLogin();
  const studentLoginMutation = useStudentLogin();
  const createOrganizationConfigMutation = useCreateOrganizationConfig();

  // Use appropriate hooks based on user type
  const setPasswordMutation = isStudentPasswordSetup
    ? studentSetPasswordMutation
    : adminSetPasswordMutation;
  const loginMutation = isStudentPasswordSetup
    ? studentLoginMutation
    : adminLoginMutation;

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFormValid,
  } = useEnhancedFormValidation({
    password: "",
    confirmPassword: "",
  });

  // Loading state management
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  // Get userId from store or admin data
  useEffect(() => {
    if (isStudentPasswordSetup) {
      // For student password setup, use student userId
      setLocalUserId(studentUserId);
    } else if (storeUserId) {
      // Try to get userId from store first (from email verification)
      setLocalUserId(storeUserId);
    } else if (adminData?.id) {
      // For admin onboarding flow, use adminData
      setLocalUserId(adminData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudentPasswordSetup, studentUserId]);

  // Initialize and handle redirects
  useEffect(() => {
    // Set initializing to false after a short delay to allow store to load
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    // Don't run redirect checks if password is already set (celebration screen)
    if (isPasswordSet) {
      return () => clearTimeout(initTimer);
    }

    // If we have userId from store (coming from email verification), no redirects needed
    if (storeUserId || studentUserId) {
      return () => clearTimeout(initTimer);
    }

    // Only run redirect checks for admin onboarding flow
    if (!isInitializing && !isStudentPasswordSetup) {
      // If we have no data at all, redirect to create organization
      if (!adminData && !organizationData) {
        router.push("/create-organization");
        return;
      }

      // If we have admin data but no organization, redirect to create organization
      if (adminData && !organizationData) {
        router.push("/create-organization");
        return;
      }

      // If we have both but email not verified, redirect to verify email
      if (adminData && organizationData && !emailVerified) {
        router.push("/verify-email");
        return;
      }
    }

    // For student password setup, redirect to register if no student data
    if (!isInitializing && isStudentPasswordSetup && !studentData) {
      router.push("/register");
      return;
    }

    return () => clearTimeout(initTimer);
  }, [
    adminData,
    organizationData,
    emailVerified,
    router,
    isInitializing,
    storeUserId,
    studentUserId,
    isStudentPasswordSetup,
    studentData,
    isPasswordSet,
  ]);

  const handlePasswordChange = (value: string) => {
    updateField("password", value);
    // Re-validate confirm password if it has a value
    if (getFieldValue("confirmPassword")) {
      updateField("confirmPassword", getFieldValue("confirmPassword"));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    updateField("confirmPassword", value);
  };

  // Helper function to create organization configuration data
  const createOrganizationConfigData = (): CreateOrganizationConfigData => {
    if (!organizationData) {
      throw new Error("Organization data is missing");
    }

    // Generate a default domain if not provided
    const domain =
      organizationData.domain ||
      `${organizationData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}.queztlearn.in`;

    // Extract slug from domain (e.g., "mit.queztlearn.in" -> "mit")
    // Handle cases where domain might be malformed
    const domainParts = domain.split(".");
    const slug =
      domainParts?.length > 0
        ? domainParts[0]
        : organizationData?.name?.toLowerCase().replace(/\s+/g, "-");

    console.log(organizationData, "org data");

    return {
      organizationId: organizationData.id,
      name: organizationData.name,
      slug: slug,
      domain: domain,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    if (!localUserId) {
      setError(
        "User information is missing. Please try again or contact support."
      );
      return;
    }

    try {
      await executeWithLoading(async () => {
        // Start showing the multi-step loader
        setIsPasswordSet(true);

        // We'll handle the actual password setting here
        await setPasswordMutation.mutateAsync({
          userId: localUserId,
          password: getFieldValue("password"),
        });

        if (isStudentPasswordSetup) {
          setStudentPasswordSet(true);
          completeStudentAuth();
        } else {
          setPasswordSet(true);
          completeOnboarding();
        }

        // Auto-login after password setup
        const email = isStudentPasswordSetup
          ? studentData?.email
          : adminData?.email;
        if (email && getFieldValue("password")) {
          try {
            console.log(
              `Auto-logging in ${
                isStudentPasswordSetup ? "student" : "admin"
              }:`,
              email
            );
            const loginResult = await loginMutation.mutateAsync({
              email: email,
              password: getFieldValue("password"),
            });

            // For admin: create organization configuration after login
            if (
              !isStudentPasswordSetup &&
              loginResult.success &&
              organizationData &&
              adminData
            ) {
              try {
                console.log(
                  "Creating organization config after login with data:",
                  {
                    organizationData,
                    adminData,
                    domain: organizationData?.domain,
                  }
                );

                const configData = createOrganizationConfigData();
                console.log("Generated config data:", configData);

                const configResult =
                  await createOrganizationConfigMutation.mutateAsync(
                    configData
                  );

                if (configResult.success && configResult.data) {
                  // Store the organization configuration
                  setOrganizationConfig(configResult.data);
                  console.log(
                    "Organization configuration created successfully:",
                    configResult.data
                  );
                }
              } catch (configError) {
                console.error(
                  "Failed to create organization configuration:",
                  configError
                );
                console.error("Organization data:", organizationData);
                console.error("Admin data:", adminData);
                // Don't fail the entire flow if config creation fails
              }
            } else if (isStudentPasswordSetup) {
              console.warn("Missing data for student login:", {
                hasStudentData: !!studentData,
                loginSuccess: loginResult?.success,
                studentData,
              });
            } else {
              console.warn("Missing data for organization config creation:", {
                hasOrganizationData: !!organizationData,
                hasAdminData: !!adminData,
                loginSuccess: loginResult?.success,
                organizationData,
                adminData,
              });
            }

            // Login hook will handle redirect to appropriate dashboard
            return; // Exit early since login will redirect
          } catch (loginError) {
            console.error("Auto-login failed:", loginError);
            // If auto-login fails, redirect to login page
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            return;
          }
        }

        // Fallback: redirect to login page
        setTimeout(() => {
          window.location.href = "/login";
        }, 4000);
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const onboardingSteps = isStudentPasswordSetup
    ? [
        { text: "Setting up your account" },
        { text: "Creating your secure profile" },
        { text: "Logging you in automatically" },
        { text: "Welcome to QueztLearn!" },
      ]
    : [
        { text: "Setting up your account" },
        { text: "Creating your secure profile" },
        { text: "Logging you in automatically" },
        { text: "Configuring your organization" },
        { text: "Setting up organization branding" },
        { text: "Welcome to QueztLearn!" },
      ];

  const passwordStrength = calculatePasswordStrength(getFieldValue("password"));
  const strengthColor =
    passwordStrength.score >= 75
      ? "bg-green-500"
      : passwordStrength.score >= 50
      ? "bg-yellow-500"
      : passwordStrength.score >= 25
      ? "bg-orange-500"
      : "bg-red-500";

  const strengthLabel =
    passwordStrength.score >= 75
      ? "Strong"
      : passwordStrength.score >= 50
      ? "Medium"
      : passwordStrength.score >= 25
      ? "Weak"
      : "Very Weak";

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if coming from email (has userId in store) vs admin onboarding
  const isAdminOnboarding = !storeUserId && !studentUserId && !!adminData;

  return (
    <>
      {/* Multi-step loader - shown during password setup */}
      {isPasswordSet && !isInitializing && (
        <MultiStepLoader
          loadingStates={onboardingSteps}
          loading={isPasswordSet}
          duration={1500}
          loop={false}
        />
      )}

      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Show only for admin onboarding */}
        {isAdminOnboarding && (
          <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary to-primary/80 flex-col justify-center p-8 text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md"
            >
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Secure Your Account</h1>
                <p className="text-primary-foreground/80">
                  Create a strong password to protect your account
                </p>
              </div>

              <div className="space-y-4">
                {!isStudentPasswordSetup && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Organization created</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Admin account created</span>
                    </div>
                  </>
                )}
                {isStudentPasswordSetup && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Student account created</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Email verified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">
                    Set secure password
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Right Side - Password Form */}
        <div
          className={`${
            isAdminOnboarding ? "flex-1 lg:w-3/5" : "flex-1 lg:w-full"
          } flex items-center justify-center p-6 bg-background`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
              <p className="text-muted-foreground">
                Create a secure password for your account
              </p>
            </div>

            {/* Password Form */}
            <Card>
              <CardHeader>
                <CardTitle>Password Setup</CardTitle>
                <CardDescription>
                  Choose a strong password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ErrorMessage error={error} />

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={getFieldValue("password")}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onBlur={() => validateFieldOnBlur("password")}
                        className="pr-20"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getFieldError("password") && (
                      <p className="text-sm text-destructive">
                        {getFieldError("password")}
                      </p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {getFieldValue("password") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Password strength
                        </span>
                        <span
                          className={`font-medium ${
                            passwordStrength.score >= 75
                              ? "text-green-600"
                              : passwordStrength.score >= 50
                              ? "text-yellow-600"
                              : passwordStrength.score >= 25
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {strengthLabel}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.score}
                        className="h-2"
                      />
                      <div className="flex space-x-1">
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 25
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 50
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 75
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 100
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={getFieldValue("confirmPassword")}
                        onChange={(e) =>
                          handleConfirmPasswordChange(e.target.value)
                        }
                        onBlur={() => validateFieldOnBlur("confirmPassword")}
                        className="pr-20"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getFieldError("confirmPassword") && (
                      <p className="text-sm text-destructive">
                        {getFieldError("confirmPassword")}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !isFormValid || setPasswordMutation.isPending || isLoading
                    }
                  >
                    {isLoading || setPasswordMutation.isPending
                      ? "Setting Password..."
                      : "Set Password"}
                  </Button>
                </form>

                {/* Back button - show for both admin and student */}
                {(isAdminOnboarding || isStudentPasswordSetup) && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" asChild>
                      <Link href="/verify-email">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Email Verification
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}

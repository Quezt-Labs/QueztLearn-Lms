"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
// import Image from "next/image";
import { useSetPassword } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { calculatePasswordStrength } from "@/lib/utils/validation";

function SetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    organizationData,
    adminData,
    emailVerified,
    userId: storeUserId,
    setUserId,
    setPasswordSet,
    completeOnboarding,
  } = useOnboardingStore();
  const setPasswordMutation = useSetPassword();

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
    // Try to get userId from store first (from email verification)
    if (storeUserId) {
      setLocalUserId(storeUserId);
    } else if (adminData?.id) {
      // For admin onboarding flow, use adminData
      setLocalUserId(adminData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (storeUserId) {
      return () => clearTimeout(initTimer);
    }

    // Only run redirect checks for admin onboarding flow
    if (!isInitializing) {
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

    return () => clearTimeout(initTimer);
  }, [
    adminData,
    organizationData,
    emailVerified,
    router,
    isInitializing,
    storeUserId,
    isPasswordSet, // Add isPasswordSet to dependencies
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
        await setPasswordMutation.mutateAsync({
          userId: localUserId,
          password: getFieldValue("password"),
        });

        setIsPasswordSet(true);
        setPasswordSet(true);

        // Complete onboarding
        completeOnboarding();

        // Show celebration screen for everyone and redirect after 4 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 4000);
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

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

  if (isPasswordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 relative overflow-hidden">
        {/* Celebration Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-20 left-20"
          >
            <PartyPopper className="h-8 w-8 text-yellow-500 animate-bounce" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute top-32 right-32"
          >
            <Sparkles className="h-6 w-6 text-pink-500 animate-pulse" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="absolute bottom-32 left-32"
          >
            <PartyPopper className="h-6 w-6 text-green-500 animate-bounce" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="absolute bottom-20 right-20"
          >
            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg mx-auto p-6 relative z-10"
        >
          {/* Success Icon with Celebration */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="h-12 w-12 text-primary-foreground" />
            </div>
            {/* Floating sparkles around the icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-2 -left-2"
            >
              <Sparkles className="h-5 w-5 text-pink-400" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-primary mb-3"
          >
            🎉 Welcome to QueztLearn!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-muted-foreground mb-6"
          >
            Your account is all set up and ready to go! You&apos;ll be
            redirected to the login page shortly.
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center space-x-2 text-sm text-primary mb-6"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Redirecting to login...</span>
          </motion.div>

          {/* Fun mascot/character */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
            className="text-6xl mb-4"
          >
            🚀
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-sm text-muted-foreground"
          >
            Ready to start your journey!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Check if coming from email (has userId in store) vs admin onboarding
  const isAdminOnboarding = !storeUserId && !!adminData;

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Show only for admin onboarding */}
      {isAdminOnboarding && (
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary to-primary/80 flex-col justify-center p-8 text-primary-foreground">
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
                <span className="text-sm font-medium">Set secure password</span>
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
                    <Progress value={passwordStrength.score} className="h-2" />
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

              {/* Back button - only show for admin onboarding */}
              {isAdminOnboarding && (
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

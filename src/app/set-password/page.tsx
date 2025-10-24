"use client";

import { useState, useEffect } from "react";
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
// import Image from "next/image";
import { useSetPassword } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { calculatePasswordStrength } from "@/lib/utils/validation";

export default function SetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);

  const router = useRouter();
  const {
    organizationData,
    adminData,
    emailVerified,
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

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!adminData || !organizationData || !emailVerified) {
      router.push("/create-organization");
    }
  }, [adminData, organizationData, emailVerified, router]);

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

    if (!adminData?.id) {
      setError("Admin data is missing");
      return;
    }

    try {
      await executeWithLoading(async () => {
        await setPasswordMutation.mutateAsync({
          userId: adminData.id!,
          password: getFieldValue("password"),
        });

        setIsPasswordSet(true);
        setPasswordSet(true);

        // Complete onboarding
        completeOnboarding();

        // Redirect to login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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

  if (isPasswordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <h1 className="text-2xl font-bold text-primary mb-2">
            Password Set Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your account is now ready. You&apos;ll be redirected to the login
            page shortly.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Redirecting to login...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Success State */}
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
              Create a strong password to protect your administrator account
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

      {/* Right Side - Password Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
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
              Create a secure password for your administrator account
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

              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link href="/verify-email">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Email Verification
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
import { ArrowLeft, CheckCircle, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
// import Image from "next/image";
import { useVerifyEmail, useResendVerification } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";

function VerifyEmailContent() {
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizationData, adminData, setEmailVerified } =
    useOnboardingStore();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    getFieldValue,
    getFieldError,
    isFormValid,
  } = useEnhancedFormValidation({
    verificationToken: "",
  });

  // Loading state management
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  const handleVerifyEmail = useCallback(
    async (token?: string) => {
      const tokenToUse = token || getFieldValue("verificationToken");

      if (!tokenToUse.trim()) {
        setError("Please enter a verification code");
        return;
      }

      try {
        await executeWithLoading(async () => {
          const result = (await verifyEmailMutation.mutateAsync({
            token: tokenToUse,
          })) as { success: boolean; data?: { userId: string } };

          if (result.success && result.data?.userId) {
            setIsVerified(true);
            setEmailVerified(true);

            // Auto-redirect to password setup after 2 seconds
            setTimeout(() => {
              router.push("/set-password");
            }, 2000);
          } else {
            setError("Invalid verification code");
          }
        });
      } catch (error: unknown) {
        setError(getFriendlyErrorMessage(error));
      }
    },
    [
      getFieldValue,
      executeWithLoading,
      verifyEmailMutation,
      router,
      setEmailVerified,
      setError,
    ]
  );

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      updateField("verificationToken", token);
      handleVerifyEmail(token);
    }
  }, [searchParams, handleVerifyEmail, updateField]);

  // Redirect if no admin data
  useEffect(() => {
    if (!adminData || !organizationData) {
      router.push("/create-organization");
    }
  }, [adminData, organizationData, router]);

  const handleResendEmail = async () => {
    if (!canResend || !adminData?.email) return;

    try {
      await executeWithLoading(async () => {
        await resendVerificationMutation.mutateAsync({
          email: adminData.email,
        });

        setResendCount((prev) => prev + 1);
        setCanResend(false);

        // Allow resend after 60 seconds
        setTimeout(() => {
          setCanResend(true);
        }, 60000);
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handleTokenChange = (value: string) => {
    updateField("verificationToken", value);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
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
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Email Verified Successfully!
          </h1>
          <p className="text-green-600 dark:text-green-300 mb-6">
            Your email has been verified. You&apos;ll be redirected to set your
            password shortly.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-green-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            <span>Redirecting to password setup...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Success State */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-500 to-blue-600 flex-col justify-center p-8 text-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-blue-100">
              Check your email and enter the verification code to continue
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm">Organization created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm">Admin account created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Verify email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
              <span className="text-sm text-white/70">Set password</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-muted-foreground">
              We&apos;ve sent a verification code to{" "}
              <span className="font-medium">{adminData?.email}</span>
            </p>
          </div>

          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Enter the verification code sent to your email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyEmail();
                }}
                className="space-y-4"
              >
                <ErrorMessage error={error} />

                <div className="space-y-2">
                  <Label htmlFor="verificationToken">Verification Code</Label>
                  <Input
                    id="verificationToken"
                    type="text"
                    placeholder="Enter verification code"
                    value={getFieldValue("verificationToken")}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    onBlur={() => validateFieldOnBlur("verificationToken")}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                  {getFieldError("verificationToken") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("verificationToken")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !isFormValid || verifyEmailMutation.isPending || isLoading
                  }
                >
                  {isLoading || verifyEmailMutation.isPending
                    ? "Verifying..."
                    : "Verify Email"}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={
                      !canResend || resendVerificationMutation.isPending
                    }
                    className="w-full"
                  >
                    {resendVerificationMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  {resendCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resend attempts: {resendCount}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/register-admin">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Registration
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

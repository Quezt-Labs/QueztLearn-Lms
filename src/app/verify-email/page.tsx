"use client";

import { useState, useEffect } from "react";
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
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useVerifyEmail } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";

export default function VerifyEmailPage() {
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizationData, adminData, setEmailVerified } =
    useOnboardingStore();
  const verifyEmailMutation = useVerifyEmail();

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setVerificationToken(token);
      handleVerifyEmail(token);
    }
  }, [searchParams]);

  // Redirect if no admin data
  useEffect(() => {
    if (!adminData || !organizationData) {
      router.push("/create-organization");
    }
  }, [adminData, organizationData, router]);

  const handleVerifyEmail = async (token?: string) => {
    const tokenToUse = token || verificationToken;

    if (!tokenToUse.trim()) {
      setVerificationError("Please enter a verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const result = await verifyEmailMutation.mutateAsync({
        token: tokenToUse,
      });

      if (result.success && result.data?.verified) {
        setIsVerified(true);
        setEmailVerified(true);

        // Auto-redirect to password setup after 2 seconds
        setTimeout(() => {
          router.push("/set-password");
        }, 2000);
      } else {
        setVerificationError(result.error || "Invalid verification code");
      }
    } catch (error) {
      setVerificationError("Failed to verify email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = () => {
    if (!canResend) return;

    setResendCount((prev) => prev + 1);
    setCanResend(false);

    // Mock resend - in real app, this would call an API
    setTimeout(() => {
      setCanResend(true);
    }, 30000); // 30 seconds cooldown
  };

  const handleTokenChange = (value: string) => {
    setVerificationToken(value);
    setVerificationError("");
  };

  if (!adminData || !organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Admin Data Found</h1>
          <p className="text-muted-foreground mb-4">
            Please complete the previous steps first.
          </p>
          <Button asChild>
            <Link href="/create-organization">Start Over</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary/10 to-primary/5 flex-col justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8">
            <Image
              src="/images/Logo.png"
              alt="QueztLearn Logo"
              width={300}
              height={200}
              className="mx-auto mb-6 w-auto h-24"
              priority
            />
            <h1 className="text-3xl font-bold mb-4">QueztLearn</h1>
            <p className="text-lg text-muted-foreground">
              Verify your email address
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Secure account setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Email verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Account activation</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Email Verification Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm font-medium">Verify Email</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 3 of 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-3/4 transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a verification code to {adminData.email}
            </p>
          </div>

          {/* Email Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Verification</span>
              </CardTitle>
              <CardDescription>
                Enter the verification code sent to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVerified ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Email Verified!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your email has been successfully verified.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to password setup...
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyEmail();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="verificationToken">Verification Code</Label>
                    <div className="relative">
                      <Input
                        id="verificationToken"
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationToken}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        className={`pr-10 ${
                          verificationError ? "border-destructive" : ""
                        }`}
                        required
                        disabled={isVerifying}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isVerifying ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : verificationError ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    </div>
                    {verificationError && (
                      <p className="text-sm text-destructive">
                        {verificationError}
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Didn't receive the email?
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        • Check your spam/junk folder
                      </p>
                      <p className="text-sm text-muted-foreground">
                        • Make sure the email address is correct
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          For testing purposes:
                        </p>
                        <p className="text-sm text-blue-800 font-mono">
                          Use code: <span className="font-bold">123456</span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendEmail}
                        disabled={!canResend}
                        className="w-full"
                      >
                        {canResend ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Code
                          </>
                        ) : (
                          `Resend in ${30 - resendCount * 30}s`
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href="/register-admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Link>
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!verificationToken.trim() || isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify Email"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import Image from "next/image";
import { useSetPassword } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";
// import { useAuthStore } from "@/lib/store";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);

  const router = useRouter();
  const {
    organizationData,
    adminData,
    emailVerified,
    setPasswordSet,
    completeOnboarding,
  } = useOnboardingStore();
  // const { login } = useAuthStore();
  const setPasswordMutation = useSetPassword();

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!adminData || !organizationData || !emailVerified) {
      router.push("/create-organization");
    }
  }, [adminData, organizationData, emailVerified, router]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      // Get userId from adminData (should be available after email verification)
      const userId = adminData?.id;
      if (!userId) {
        console.error("No user ID available");
        return;
      }

      const result = (await setPasswordMutation.mutateAsync({
        userId,
        password,
      })) as { success: boolean; data?: { message: string } };

      if (result.success && result.data) {
        setIsPasswordSet(true);
        setPasswordSet(true);

        // Complete onboarding
        completeOnboarding();

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to set password:", error);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);
  const isFormValid =
    password &&
    confirmPassword &&
    !passwordError &&
    !confirmPasswordError &&
    password === confirmPassword;

  if (!adminData || !organizationData || !emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
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
            <p className="text-lg text-muted-foreground">Secure your account</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Strong password protection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Secure authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Ready to get started</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Password Setup Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <span className="text-sm font-medium">Set Password</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 4 of 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
            <p className="text-muted-foreground">
              Create a strong password to secure your admin account
            </p>
          </div>

          {/* Password Setup Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Password Setup</span>
              </CardTitle>
              <CardDescription>
                Choose a strong password to protect your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPasswordSet ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Account Created!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your admin account has been successfully created.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to your dashboard...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className={`pr-10 ${
                          passwordError ? "border-destructive" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-destructive">
                        {passwordError}
                      </p>
                    )}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Password strength:</span>
                          <span
                            className={
                              passwordStrength >= 75
                                ? "text-green-600"
                                : passwordStrength >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {passwordStrength >= 75
                              ? "Strong"
                              : passwordStrength >= 50
                              ? "Medium"
                              : "Weak"}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) =>
                          handleConfirmPasswordChange(e.target.value)
                        }
                        className={`pr-10 ${
                          confirmPasswordError ? "border-destructive" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    {confirmPasswordError && (
                      <p className="text-sm text-destructive">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Password requirements:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains at least one number</li>
                      <li>• Special characters recommended</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href="/verify-email">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Link>
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!isFormValid || setPasswordMutation.isPending}
                    >
                      {setPasswordMutation.isPending
                        ? "Setting Password..."
                        : "Complete Setup"}
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

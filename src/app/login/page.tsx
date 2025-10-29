"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, Loader2, Users, UserCheck } from "lucide-react";
import { useLogin, useLogout, useStudentLogin } from "@/hooks/api";
import { BrandingSidebar } from "@/components/onboarding/branding-sidebar";
import { tokenManager } from "@/lib/api/client";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const studentLoginMutation = useStudentLogin();
  const logoutMutation = useLogout();

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFormValid,
  } = useEnhancedFormValidation({
    email: "",
    password: "",
    userType: "admin", // Default to admin
  });

  // Loading state management
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = async () => {
      try {
        if (tokenManager.isAuthenticated()) {
          const userData = tokenManager.getUser();
          if (userData) {
            // Redirect based on user role
            switch ((userData as { role?: string }).role?.toLowerCase()) {
              case "admin":
                router.push("/admin/dashboard");
                break;
              case "teacher":
                router.push("/teacher/dashboard");
                break;
              case "student":
                router.push("/student/dashboard");
                break;
              default:
                router.push("/admin/dashboard");
            }
            return;
          }
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsCheckingAuth(false);
      }
    };

    const timer = setTimeout(checkAuthAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    try {
      await executeWithLoading(async () => {
        const userType = getFieldValue("userType");

        if (userType === "student") {
          await studentLoginMutation.mutateAsync({
            email: getFieldValue("email"),
            password: getFieldValue("password"),
          });
        } else {
          await loginMutation.mutateAsync({
            email: getFieldValue("email"),
            password: getFieldValue("password"),
          });
        }
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <BrandingSidebar
        title="Welcome Back"
        subtitle="Sign in to your dashboard"
        features={[
          "Access your account",
          "Manage your content",
          "Track your progress",
        ]}
      />

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Sign In</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Choose your account type and sign in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage
                  error={
                    error ||
                    (loginMutation.error
                      ? getFriendlyErrorMessage(loginMutation.error)
                      : null) ||
                    (studentLoginMutation.error
                      ? getFriendlyErrorMessage(studentLoginMutation.error)
                      : null)
                  }
                />

                {/* User Type Selector */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={
                        getFieldValue("userType") === "admin"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => updateField("userType", "admin")}
                      className="flex items-center space-x-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                    <Button
                      type="button"
                      variant={
                        getFieldValue("userType") === "student"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => updateField("userType", "student")}
                      className="flex items-center space-x-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Student</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@yourorganization.com"
                      value={getFieldValue("email")}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => validateFieldOnBlur("email")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {getFieldError("email") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={getFieldValue("password")}
                      onChange={(e) => updateField("password", e.target.value)}
                      onBlur={() => validateFieldOnBlur("password")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {getFieldError("password") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("password")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    loginMutation.isPending ||
                    studentLoginMutation.isPending ||
                    !isFormValid
                  }
                >
                  {isLoading ||
                  loginMutation.isPending ||
                  studentLoginMutation.isPending
                    ? "Signing In..."
                    : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    {getFieldValue("userType") === "student" ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push("/register")}
                      >
                        Register as Student
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push("/create-organization")}
                      >
                        Create Organization
                      </Button>
                    )}
                  </p>
                </div>

                {tokenManager.isAuthenticated() && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Already logged in as{" "}
                      {tokenManager.getUser()?.username || "User"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => logoutMutation.mutate()}
                      className="w-full"
                    >
                      Logout and Sign In as Different User
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

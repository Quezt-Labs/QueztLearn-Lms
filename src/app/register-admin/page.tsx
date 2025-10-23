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
import { ArrowLeft, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRegisterAdmin } from "@/hooks";
import { useOnboardingStore } from "@/lib/store/onboarding";

export default function RegisterAdminPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  const { organizationData, setAdminData, adminData } = useOnboardingStore();
  const registerAdminMutation = useRegisterAdmin();

  // Redirect if no organization data
  useEffect(() => {
    if (!organizationData) {
      router.push("/create-organization");
    }
  }, [organizationData, router]);

  // Pre-fill form if data exists
  useEffect(() => {
    if (adminData) {
      setEmail(adminData.email);
      setUsername(adminData.username);
    }
  }, [adminData]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 20) {
      return "Username must be less than 20 characters";
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };

  const handleEmailChange = async (value: string) => {
    setEmail(value);

    if (value && validateEmail(value)) {
      setIsCheckingEmail(true);
      try {
        // Email availability check is not needed for this flow
        setEmailError("");
      } catch {
        setEmailError("Error checking email availability");
      } finally {
        setIsCheckingEmail(false);
      }
    } else if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Clear error when user starts typing
    if (usernameError) {
      setUsernameError("");
    }
  };

  const handleUsernameBlur = () => {
    if (username) {
      const error = validateUsername(username);
      setUsernameError(error || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email) || validateUsername(username) || emailError) {
      return;
    }

    if (!organizationData) {
      router.push("/create-organization");
      return;
    }

    try {
      const result = (await registerAdminMutation.mutateAsync({
        email,
        username,
        organizationId: organizationData.id,
      })) as {
        success: boolean;
        data?: { id: string; email: string; username: string };
      };

      if (result.success && result.data) {
        // Save admin data to store
        setAdminData({
          id: result.data.id,
          email: result.data.email,
          username: result.data.username,
        });

        // Navigate to email verification
        router.push("/verify-email");
      }
    } catch (error) {
      console.error("Failed to register admin:", error);
    }
  };

  const isFormValid =
    email &&
    username &&
    validateEmail(email) &&
    !validateUsername(username) &&
    !emailError &&
    !usernameError;

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Organization Found</h1>
          <p className="text-muted-foreground mb-4">
            Please create an organization first.
          </p>
          <Button asChild>
            <Link href="/create-organization">Create Organization</Link>
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
              Set up your admin account
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Full platform control</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">User management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Analytics & reporting</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Admin Registration Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm font-medium">Register Admin</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 2 of 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-2/4 transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Create Admin Account</h2>
            <p className="text-muted-foreground">
              Set up your administrator account for {organizationData.name}
            </p>
          </div>

          {/* Admin Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
              <CardDescription>
                Create your administrator account to manage your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@yourorganization.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`pr-10 ${
                        emailError ? "border-destructive" : ""
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCheckingEmail ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : email && validateEmail(email) && !emailError ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : emailError ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin_username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onBlur={handleUsernameBlur}
                    className={usernameError ? "border-destructive" : ""}
                    required
                  />
                  {usernameError && (
                    <p className="text-sm text-destructive">{usernameError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Next steps:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verify your email address</li>
                    <li>• Set up your password</li>
                    <li>• Access your admin dashboard</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <Link href="/create-organization">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!isFormValid || registerAdminMutation.isPending}
                  >
                    {registerAdminMutation.isPending
                      ? "Creating Account..."
                      : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

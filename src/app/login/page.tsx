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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import { useLogin } from "@/hooks";
import { useAuthStore } from "@/lib/store";
import { isAllowedDevDomain } from "@/lib/config/development";
import Image from "next/image";
import Link from "next/link";

// Unified Login Component
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const loginMutation = useLogin();
  const { login } = useAuthStore();

  // This component is for main domain only (admin/teacher login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Clear previous errors

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.data) {
        login(result.data.user, result.data.token);

        // Redirect based on role and domain
        const hostname = window.location.hostname;

        if (
          hostname === "queztlearn.com" ||
          hostname === "www.queztlearn.com" ||
          isAllowedDevDomain(hostname)
        ) {
          // Main domain - admin and teacher dashboards
          switch (role) {
            case "admin":
              router.push("/admin/dashboard");
              break;
            case "teacher":
              router.push("/teacher/dashboard");
              break;
            default:
              // Redirect students to appropriate subdomain
              if (isAllowedDevDomain(hostname)) {
                // For development, redirect to test subdomain
                router.push("/?subdomain=mit&role=student");
              } else {
                router.push(`https://mit.queztlearn.in/student/dashboard`);
              }
              break;
          }
        } else {
          // Invalid domain - redirect to home
          router.push("/");
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login failed:", error);
      }
      setLoginError(
        "Login failed. Please check your credentials and try again."
      );
    }
  };

  const demoCredentials = {
    admin: { email: "admin@example.com", password: "password" },
    teacher: { email: "teacher@example.com", password: "password" },
  };

  const handleDemoLogin = (selectedRole: "admin" | "teacher") => {
    const credentials = demoCredentials[selectedRole];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setRole(selectedRole);
  };

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
              className="mx-auto mb-6 w-auto h-24 scale-250"
            />
            <h1 className="text-3xl font-bold mb-4">QueztLearn</h1>
            <p className="text-lg text-muted-foreground">
              Your Institution. One Platform. Infinite Learning.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Personalized learning experience</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Expert-led courses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Progress tracking</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to your admin/teacher account
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value: "admin" | "teacher") =>
                      setRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Login */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Demo Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin("admin")}
                  >
                    Admin Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin("teacher")}
                  >
                    Teacher Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subdomain Login Component (with ClientProvider)
function SubdomainLoginContent() {
  const { client, isLoading: clientLoading, error: clientError } = useClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const { login } = useAuthStore();

  // Show loading for client detection
  if (clientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error for client not found
  if (clientError || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <p className="text-muted-foreground">
            The requested client does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.data) {
        login(result.data.user, result.data.token);

        // Redirect based on role
        const hostname = window.location.hostname;

        switch (role) {
          case "student":
            router.push("/student/dashboard");
            break;
          case "teacher":
            // Redirect teachers to main domain
            if (isAllowedDevDomain(hostname)) {
              router.push("/teacher/dashboard");
            } else {
              router.push("https://queztlearn.com/teacher/dashboard");
            }
            break;
          case "admin":
            // Redirect admin to main domain
            if (isAllowedDevDomain(hostname)) {
              router.push("/admin/dashboard");
            } else {
              router.push("https://queztlearn.com/admin/dashboard");
            }
            break;
          default:
            router.push("/student/dashboard");
            break;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login failed:", error);
      }
      // Show user-friendly error message via toast/alert
    }
  };

  const demoCredentials = {
    admin: { email: "admin@example.com", password: "password" },
    teacher: { email: "teacher@example.com", password: "password" },
    student: { email: "student@example.com", password: "password" },
  };

  const handleDemoLogin = (selectedRole: "admin" | "teacher" | "student") => {
    const credentials = demoCredentials[selectedRole];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Client Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary/10 to-primary/5 flex-col justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8">
            <Image
              src={client.logo}
              alt={`${client.name} Logo`}
              width={120}
              height={80}
              className="mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold mb-4">{client.name}</h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your learning platform
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Personalized learning experience</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Expert-led courses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Progress tracking</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to your student account
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value: "admin" | "teacher" | "student") =>
                      setRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Login */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Demo Account:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("student")}
                  className="w-full"
                >
                  Student Demo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Login Page
export default function LoginPage() {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.endsWith(".queztlearn.in")) {
      const parts = hostname.split(".");
      if (parts.length > 2) {
        setSubdomain(parts[0]);
      }
    }
  }, []);

  // Server-side rendering - determine subdomain from hostname
  if (typeof window === "undefined") {
    // During SSR, we can't detect subdomain, so render main domain login
    return <LoginContent />;
  }

  if (subdomain) {
    return (
      <ClientProvider subdomain={subdomain}>
        <SubdomainLoginContent />
      </ClientProvider>
    );
  }

  return <LoginContent />;
}

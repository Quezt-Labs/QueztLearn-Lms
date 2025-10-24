"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { tokenManager } from "@/lib/api/client";
import { useLogout } from "@/hooks";

export default function Home() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const logoutMutation = useLogout();

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = async () => {
      try {
        console.log("Homepage: Checking authentication...");
        console.log(
          "Homepage: isAuthenticated:",
          tokenManager.isAuthenticated()
        );

        if (tokenManager.isAuthenticated()) {
          const userData = tokenManager.getUser();
          console.log("Homepage: User data:", userData);

          if (userData) {
            console.log(
              "Homepage: User role:",
              (userData as { role?: string }).role
            );
            setIsAuthenticated(true);
            // Don't auto-redirect, let user choose
            setIsCheckingAuth(false);
            return;
          }
        }
        console.log("Homepage: Not authenticated, showing homepage");
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Homepage: Auth check error:", error);
        setIsCheckingAuth(false);
      }
    };

    // Add a small delay to ensure cookies are available
    const timer = setTimeout(checkAuthAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [router]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/ChatGPT Image Oct 21, 2025 at 11_26_51 AM.png"
                alt="QueztLearn Logo"
                width={32}
                height={24}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-foreground">
                QueztLearn
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Logout
                  </Button>
                  <Button
                    onClick={() => {
                      const userData = tokenManager.getUser();
                      const role = (
                        userData as { role?: string }
                      )?.role?.toLowerCase();
                      switch (role) {
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
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
            🚀 New Features Available
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            <span className="text-foreground">Modern Learning Management</span>
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower educators and students with our comprehensive LMS platform.
            Multi-tenant, scalable, and built for the future of education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-border hover:border-primary hover:text-primary"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for administrators, teachers, and
              students
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-card-foreground">
                  Multi-Tenant Architecture
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Support multiple organizations with isolated data and custom
                  branding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-1 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-card-foreground">
                  Course Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create, organize, and deliver engaging courses with rich
                  content
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-card-foreground">
                  Analytics & Insights
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track progress, engagement, and performance with detailed
                  analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-destructive flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-card-foreground">
                  Role-Based Access
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Granular permissions for admins, teachers, and students
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-card-foreground">
                  Real-Time Updates
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Live notifications and instant updates across all devices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-card-foreground">
                  Global Accessibility
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Access your learning platform from anywhere in the world
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary-foreground">
            Ready to Transform Education?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who trust QueztLearn for their learning
            management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-organization">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90"
              >
                Create Organization
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/images/ChatGPT Image Oct 21, 2025 at 11_26_51 AM.png"
              alt="QueztLearn Logo"
              width={32}
              height={24}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">
              QueztLearn
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2025 QueztLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

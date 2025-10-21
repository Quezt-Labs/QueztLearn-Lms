"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks";
import { useAuthStore } from "@/lib/store";
import { BrandingSection } from "@/components/auth/branding-section";
import { LoginHeader } from "@/components/auth/login-header";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const { login } = useAuthStore();

  // Carousel images data
  const carouselImages = [
    {
      src: "/images/generated-image.png",
      alt: "LMS Dashboard",
      title: "Comprehensive LMS",
      description:
        "Complete learning management system with analytics and insights",
    },
    {
      src: "/images/generated-image (1).png",
      alt: "Multi-tenant LMS",
      title: "Multi-tenant Architecture",
      description:
        "Support multiple institutions with isolated data and custom branding",
    },
    {
      src: "/images/generated-image (2).png",
      alt: "Professional SaaS",
      title: "Professional SaaS",
      description:
        "Enterprise-grade software with advanced features and scalability",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.data) {
        login(result.data.user, result.data.token);

        // Redirect based on role
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
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
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
      {/* Left Side - Branding */}
      <BrandingSection
        title="QueztLearn"
        tagline="Your Institution. One Platform. Infinite Learning."
        carouselImages={carouselImages}
      />

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-12 bg-background">
        <div className="w-full max-w-lg">
          {/* Header */}
          <LoginHeader
            logoSrc="/images/Logo.png"
            logoAlt="QueztLearn Logo"
            logoWidth={300}
            logoHeight={200}
            logoClassName="w-auto h-24 mx-auto scale-250"
          />

          {/* Main Form */}
          <LoginForm
            email={email}
            password={password}
            role={role}
            showPassword={showPassword}
            isLoading={loginMutation.isPending}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRoleChange={setRole}
            onShowPasswordToggle={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
            onDemoLogin={handleDemoLogin}
          />
        </div>
      </div>
    </div>
  );
}

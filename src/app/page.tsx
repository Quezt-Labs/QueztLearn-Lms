"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Loader2,
  GraduationCap,
  Video,
  FileText,
} from "lucide-react";
import { tokenManager } from "@/lib/api/client";
import { HeroSection } from "@/components/ui/3d-hero-section-boxes";
import { FeatureSection } from "@/components/ui/feature-section";
import { HowItWorks } from "@/components/ui/how-it-works";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-vertical-marquee";
import HoverFooter from "@/components/ui/hover-footer";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import ResizableNavbarContainer from "@/components/common/resizable-navbar-container";
import { PricingSection } from "@/components/ui/pricing";

export default function Home() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

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
      {/* Resizable Navbar */}
      <ResizableNavbarContainer />

      {/* 3D Hero Section */}
      <HeroSection />

      {/* Content below hero will be part of the HeroSection component */}

      {/* How It Works Section */}
      <HowItWorks />

      {/* Advanced Features Section */}
      <FeatureSection
        mainIcon={<GraduationCap className="h-8 w-8" />}
        title="Comprehensive Learning Tools"
        subtitle="Empower your educational institution with advanced features designed for modern learning experiences."
        features={[
          {
            icon: <BookOpen className="h-6 w-6" />,
            title: "Interactive Course Content",
            description:
              "Create engaging courses with rich media content, interactive quizzes, and multimedia resources to enhance student learning.",
          },
          {
            icon: <Video className="h-6 w-6" />,
            title: "Live Streaming & Video Lessons",
            description:
              "Deliver real-time classes and recorded video lessons with seamless playback on any device for flexible learning.",
          },
          {
            icon: <FileText className="h-6 w-6" />,
            title: "Automated Assessments",
            description:
              "Build comprehensive tests with auto-grading capabilities, detailed analytics, and personalized feedback for students.",
          },
          {
            icon: <Users className="h-6 w-6" />,
            title: "Collaborative Learning",
            description:
              "Enable group projects, discussion forums, and peer-to-peer learning to foster a collaborative educational environment.",
          },
        ]}
        callToAction={{
          title: "Start Your Free Trial Today",
          description:
            "Experience the power of QueztLearn with a 14-day free trial. No credit card required.",
          primaryAction: {
            text: "Get Started Free",
            url: "/create-organization",
          },
          secondaryAction: {
            text: "Schedule a Demo",
            url: "/login",
          },
        }}
      />

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            What Our Users Say
          </h2>
          <p className="text-xl text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of educators who trust QueztLearn for their learning
            management needs.
          </p>
          <AnimatedTestimonials
            testimonials={[
              {
                quote:
                  "QueztLearn has completely transformed how we manage our educational programs. The intuitive interface and powerful features have made our workflow seamless.",
                name: "Dr. Sarah Johnson",
                designation: "Dean of Academic Affairs at State University",
                src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
              },
              {
                quote:
                  "The multi-tenant architecture is exactly what we needed. We can manage multiple departments and courses all from one platform. Highly recommended!",
                name: "Michael Chen",
                designation: "IT Director at Global Education Institute",
                src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2574&auto=format&fit=crop",
              },
              {
                quote:
                  "As a teacher, I love how easy it is to create and manage courses. The student engagement tools are phenomenal and have improved our class participation significantly.",
                name: "Emily Rodriguez",
                designation: "Senior Instructor, Community College",
                src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2574&auto=format&fit=crop",
              },
              {
                quote:
                  "The analytics dashboard provides incredible insights into student progress. We've been able to identify at-risk students early and provide timely support.",
                name: "Prof. David Park",
                designation: "Academic Coordinator at Technical Institute",
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
              },
              {
                quote:
                  "Implementation was smooth and the support team was excellent throughout. The platform has become essential to our daily operations.",
                name: "Lisa Thompson",
                designation: "Educational Administrator, K-12 District",
                src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
              },
            ]}
            autoplay={true}
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <PricingSection
          heading="Plans That Scale With Your Institution"
          description="Whether you're a small school or a large university, our flexible pricing adapts to your needs — transparent pricing, no hidden costs."
          plans={[
            {
              name: "Starter",
              info: "Perfect for small institutions",
              price: {
                monthly: 29,
                yearly: Math.round(29 * 12 * (1 - 0.15)),
              },
              features: [
                { text: "Up to 100 students" },
                { text: "Up to 5 teachers" },
                { text: "Unlimited courses" },
                {
                  text: "Basic analytics",
                  tooltip: "Track student progress and engagement",
                },
                {
                  text: "Email support",
                  tooltip: "Get answers within 24 hours",
                },
                { text: "Mobile app access" },
              ],
              btn: {
                text: "Start Free Trial",
                href: "/create-organization",
              },
            },
            {
              highlighted: true,
              name: "Professional",
              info: "For growing institutions",
              price: {
                monthly: 79,
                yearly: Math.round(79 * 12 * (1 - 0.15)),
              },
              features: [
                { text: "Up to 500 students" },
                { text: "Up to 20 teachers" },
                { text: "Unlimited courses and content" },
                {
                  text: "Advanced analytics",
                  tooltip: "Detailed insights and reporting",
                },
                { text: "Live streaming support" },
                { text: "Priority support", tooltip: "Get 24/7 chat support" },
                { text: "Custom branding" },
              ],
              btn: {
                text: "Get Started",
                href: "/create-organization",
              },
            },
            {
              name: "Enterprise",
              info: "For large organizations",
              price: {
                monthly: 199,
                yearly: Math.round(199 * 12 * (1 - 0.15)),
              },
              features: [
                { text: "Unlimited students" },
                { text: "Unlimited teachers" },
                { text: "Unlimited courses and content" },
                {
                  text: "Advanced analytics & AI insights",
                  tooltip: "AI-powered learning analytics",
                },
                { text: "Live streaming & virtual classrooms" },
                {
                  text: "Dedicated support",
                  tooltip: "Get a dedicated account manager",
                },
                { text: "Custom integrations & API access" },
              ],
              btn: {
                text: "Contact Sales",
                href: "/contact",
              },
            },
          ]}
        />
      </section>

      {/* Animated CTA Section */}
      <CTAWithVerticalMarquee />

      {/* Animated Footer */}
      <HoverFooter />
    </div>
  );
}

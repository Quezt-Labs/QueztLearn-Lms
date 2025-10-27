"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Loader2,
  Github,
  Linkedin,
  Mail,
  GraduationCap,
  Video,
  FileText,
} from "lucide-react";
import { tokenManager } from "@/lib/api/client";
import { HeroSection } from "@/components/ui/3d-hero-section-boxes";
import { TeamSection } from "@/components/ui/team-section";
import { FeatureSection } from "@/components/ui/feature-section";
import { HowItWorks } from "@/components/ui/how-it-works";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-vertical-marquee";
import HoverFooter from "@/components/ui/hover-footer";

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

      {/* Team Section */}
      <div id="team">
        <TeamSection
          title="DEVELOPMENT TEAM"
          description="Built with passion by a dedicated team of developers committed to transforming education through innovative technology."
          members={[
            {
              name: "Shivam Jha",
              designation: "Full Stack Developer",
              imageSrc: "/images/Shivam.png",
              socialLinks: [
                { icon: Github, href: "https://github.com/shivamjha" },
                { icon: Linkedin, href: "https://linkedin.com/in/shivamjha" },
                { icon: Mail, href: "mailto:shivam@queztlearn.com" },
              ],
            },
            {
              name: "Amir Khan",
              designation: "Full Stack Developer",
              imageSrc: "/images/Amir.png",
              socialLinks: [
                { icon: Github, href: "https://github.com/amir" },
                { icon: Linkedin, href: "https://linkedin.com/in/amir" },
                { icon: Mail, href: "mailto:amir@queztlearn.com" },
              ],
            },
          ]}
          socialLinksMain={[
            { icon: Github, href: "https://github.com/queztlearn" },
            { icon: Linkedin, href: "https://linkedin.com/company/queztlearn" },
            { icon: Mail, href: "mailto:info@queztlearn.com" },
          ]}
        />
      </div>

      {/* Animated CTA Section */}
      <CTAWithVerticalMarquee />

      {/* Animated Footer */}
      <HoverFooter />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  FileText,
  Calendar,
  Award,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_NAVIGATION_ITEMS } from "@/lib/constants";

// Extended navigation item type with optional badge
interface NavigationItemWithBadge {
  title: string;
  href: string;
  icon: string;
  badge?: number | boolean; // Number for count, boolean for dot indicator
}

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  BookOpen: BookOpen,
  TrendingUp: TrendingUp,
  FileText: FileText,
  Calendar: Calendar,
  Award: Award,
};

// Special handling for Assignments - using ClipboardList icon
const getIcon = (iconName: string, title: string) => {
  if (title === "Assignments") {
    return ClipboardList;
  }
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};

interface MobileBottomTabsProps {
  badges?: Record<string, number | boolean>; // Map of href to badge value
  isLoading?: boolean;
}

export function MobileBottomTabs({
  badges = {},
  isLoading = false,
}: MobileBottomTabsProps) {
  const pathname = usePathname();
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeTabRef = useRef<HTMLDivElement>(null);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Active route detection function
  const isActive = (href: string) => {
    if (!pathname) return false;

    // Normalize: remove client segment if present (e.g., /mit/student/dashboard -> /student/dashboard)
    const normalizedPath =
      pathname.replace(/^\/[^/]+(?=\/student)/, "") || pathname;

    // Handle exact match for dashboard
    if (href === "/student/dashboard") {
      return (
        normalizedPath === "/student/dashboard" ||
        normalizedPath === "/dashboard"
      );
    }

    // For other routes, check if normalized path starts with the href
    // This ensures /student/tests matches but /student/test-series doesn't match /student/tests
    return normalizedPath.startsWith(href + "/") || normalizedPath === href;
  };

  // Filter navigation items - UX best practice: 4-5 items max for optimal usability
  // Prioritize: Dashboard, Batches, Progress, Tests, Grades
  const navItems = STUDENT_NAVIGATION_ITEMS.slice(0, 5).map((item) => ({
    ...item,
    badge: badges[item.href],
  })); // Reduced from 7 to 5 for better UX

  // Find active tab index for iOS-style pill animation
  const activeIndex = navItems.findIndex((item) => isActive(item.href));

  // Update active indicator position when active tab changes
  useEffect(() => {
    // Use requestAnimationFrame and setTimeout to ensure DOM is fully rendered
    const updateIndicatorPosition = () => {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        if (activeTabRef.current && activeIndex >= 0) {
          const tabElement = activeTabRef.current;
          const navElement = tabElement.closest("nav");

          if (navElement) {
            const navRect = navElement.getBoundingClientRect();
            const tabRect = tabElement.getBoundingClientRect();

            // Calculate position relative to nav container
            const left = tabRect.left - navRect.left;
            const width = tabRect.width;

            if (left >= 0 && width > 0) {
              setActiveIndicatorStyle({
                left,
                width,
              });
            }
          }
        }
      });
    };

    // Immediate calculation on mount/update
    updateIndicatorPosition();

    // Also calculate after a small delay to handle initial render after animations
    const timeoutId = setTimeout(updateIndicatorPosition, 150);

    // Recalculate on window resize
    const handleResize = () => {
      updateIndicatorPosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex, pathname, navItems.length]);

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // Light haptic feedback (10ms vibration)
      navigator.vibrate(10);
    }
  };

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    index: number
  ) => {
    // Haptic feedback on tap
    triggerHapticFeedback();

    // Set tapped index for ripple effect
    setTappedIndex(index);
    setTimeout(() => setTappedIndex(null), 400);

    // Normalize paths for comparison
    const normalizedPath =
      pathname?.replace(/^\/[^/]+(?=\/student)/, "") || pathname;
    const normalizedHref = href.replace(/^\/[^/]+(?=\/student)/, "");

    // Only smooth scroll if we're navigating to a different route
    if (
      normalizedPath !== normalizedHref &&
      !normalizedPath?.startsWith(normalizedHref + "/")
    ) {
      // Scroll to top smoothly when navigating to a new route
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50); // Reduced delay for snappier feel
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.6,
            }
      }
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        // Premium glassmorphism
        "bg-background/80 dark:bg-background/90",
        "backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:dark:bg-background/85",
        // Premium border with gradient
        "border-t border-border/60 dark:border-border/40",
        // Premium shadow with multiple layers
        "shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08),0_-8px_32px_-8px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3),0_-8px_32px_-8px_rgba(0,0,0,0.2)]",
        // Layout
        "flex items-center justify-around",
        "px-1 py-1",
        "md:hidden", // Only show on mobile
        // Premium overflow handling
        "overflow-hidden"
      )}
      style={{
        paddingBottom:
          "max(0.5rem, calc(0.5rem + env(safe-area-inset-bottom)))",
        paddingTop: "0.5rem",
      }}
    >
      {/* Premium top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

      {/* iOS-style sliding pill indicator for active tab */}
      {activeIndex >= 0 &&
        !prefersReducedMotion &&
        activeIndicatorStyle.width > 0 && (
          <motion.div
            className="absolute bottom-0 h-1 bg-primary rounded-t-full pointer-events-none z-10"
            initial={false}
            animate={{
              left: activeIndicatorStyle.left,
              width: activeIndicatorStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.6,
            }}
            style={{
              willChange: "left, width",
            }}
          />
        )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex items-center justify-around w-full px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="w-12 h-2 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        navItems.map((item, index) => {
          const Icon = getIcon(item.icon, item.title);
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.href}
              ref={index === activeIndex ? activeTabRef : null}
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { y: 50, opacity: 0, scale: 0.85 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { y: 0, opacity: 1, scale: 1 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                      mass: 0.5,
                      delay: index * 0.04, // Faster stagger for smoother feel
                    }
              }
              className="flex-1 min-w-0"
              style={{ willChange: active ? "transform" : "auto" }}
            >
              <Link
                href={item.href}
                onClick={(e) => handleClick(e, item.href, index)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "min-w-0 w-full px-2 py-2",
                  "min-h-[44px] rounded-xl transition-all duration-300", // WCAG 2.1 AAA: 44px minimum touch target
                  "hover:bg-accent/30 dark:hover:bg-accent/20",
                  "active:scale-[0.92]", // Less aggressive scale for better feedback
                  "touch-manipulation select-none", // Optimize for touch
                  "overflow-hidden",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", // Keyboard accessibility
                  active &&
                    "bg-gradient-to-b from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/8"
                )}
                aria-label={item.title}
                aria-current={active ? "page" : undefined}
              >
                {/* Premium ripple effect on tap */}
                {tappedIndex === index && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-primary/30 dark:bg-primary/40"
                      initial={{ scale: 0, opacity: 0.9 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                    {/* Secondary ripple for premium feel */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-primary/15"
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.1,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  </>
                )}
                {/* Simplified active state - cleaner premium feel */}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/8 dark:bg-primary/12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.2,
                    }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 600,
                    damping: 30,
                    mass: 0.4,
                  }}
                  className={cn(
                    "relative flex items-center justify-center",
                    "w-10 h-10 rounded-full mb-1", // Slightly larger for better visual balance
                    "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    active
                      ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 dark:shadow-primary/40"
                      : "text-muted-foreground"
                  )}
                  style={{
                    boxShadow: active
                      ? "0 8px 24px -4px hsl(var(--primary) / 0.4), 0 4px 8px -2px hsl(var(--primary) / 0.3)"
                      : undefined,
                  }}
                >
                  {/* Premium inner glow for active state */}
                  {active && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  )}
                  <motion.div
                    key={
                      active ? `active-${item.href}` : `inactive-${item.href}`
                    }
                    animate={
                      active
                        ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, -10, 10, 0],
                          }
                        : {
                            scale: 1,
                            rotate: 0,
                          }
                    }
                    transition={
                      active
                        ? {
                            scale: {
                              duration: 0.55,
                              ease: [0.34, 1.56, 0.64, 1],
                            },
                            rotate: {
                              duration: 0.45,
                              ease: [0.34, 1.56, 0.64, 1],
                            },
                          }
                        : {
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }
                    }
                    className="flex items-center justify-center relative z-10"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300", // Increased from h-4 w-4 for better visibility
                        active
                          ? "text-primary-foreground drop-shadow-sm"
                          : "text-muted-foreground",
                        "relative z-10"
                      )}
                      strokeWidth={active ? 2.5 : 2}
                      aria-hidden="true" // Icon is decorative, label provides context
                    />
                    {/* Premium icon glow effect when active - simplified */}
                    {active && (
                      <div className="absolute inset-0 rounded-full bg-primary/15 blur-sm z-0" />
                    )}
                  </motion.div>

                  {/* Badge/Notification indicator */}
                  {item.badge !== undefined && item.badge !== false && (
                    <div
                      className={cn(
                        "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                        "rounded-full bg-destructive text-destructive-foreground",
                        "text-[10px] font-bold leading-none",
                        typeof item.badge === "number" && item.badge > 0
                          ? "min-w-[18px] h-[18px] px-1"
                          : "w-2 h-2"
                      )}
                      aria-label={
                        typeof item.badge === "number"
                          ? `${item.badge} notifications`
                          : "New notification"
                      }
                    >
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span className="px-0.5">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
                <motion.span
                  animate={{
                    color: active
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground))",
                    fontWeight: active ? 600 : 500,
                    scale: active ? 1.08 : 1,
                    letterSpacing: active ? "0.02em" : "0em",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                    duration: 0.3,
                  }}
                  className={cn(
                    "text-xs font-medium leading-tight", // Increased from text-[10px] to text-xs (12px) for better legibility
                    "px-0.5",
                    "transition-all duration-300",
                    "relative z-10",
                    "overflow-hidden text-ellipsis whitespace-nowrap", // Better text truncation
                    "max-w-full",
                    active
                      ? "text-primary font-semibold tracking-tight"
                      : "text-muted-foreground"
                  )}
                  style={{
                    textShadow: active
                      ? "0 1px 2px hsl(var(--primary) / 0.15)"
                      : undefined,
                    maxWidth: "calc((100vw - 2rem) / 5 - 0.5rem)", // Responsive width based on screen and item count
                  }}
                  title={item.title} // Show full text on hover/long-press
                >
                  {item.title}
                </motion.span>
              </Link>
            </motion.div>
          );
        })
      )}
    </motion.nav>
  );
}

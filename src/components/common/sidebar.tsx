"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  UserCog,
  Settings,
  CreditCard,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronRight,
  Building2,
  FileText,
  Award,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/store";
import { getNavigationItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUser, useLogout } from "@/hooks";

const iconMap = {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  UserCog,
  Settings,
  CreditCard,
  TrendingUp,
  Calendar,
  Building2,
  FileText,
  Award,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const role = useRole();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hostname, setHostname] = useState("");
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemTitle)
        ? prev.filter((item) => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  // Get navigation items based on current domain and role
  const filteredItems = getNavigationItems(hostname, role || "student");

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/admin/dashboard" ||
        pathname === "/teacher/dashboard" ||
        pathname === "/student/dashboard"
      );
    }
    return pathname.startsWith(href);
  };
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div
      className={cn("flex h-full w-64 flex-col border-r bg-card", className)}
    >
      {/* Welcome Section */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3 w-full">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary-foreground">
              {userLoading
                ? "..."
                : user?.username?.charAt(0).toUpperCase() ||
                  role?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-none">
              Welcome back,
            </p>
            <p className="text-sm font-medium truncate leading-tight">
              {userLoading
                ? "Loading..."
                : user?.username ||
                  (role === "admin"
                    ? "Admin"
                    : role === "teacher"
                    ? "Teacher"
                    : "Student")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-6 py-4">
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || BookOpen;
            const isItemActive = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.title);

            if (hasChildren) {
              return (
                <div key={item.title}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between px-3 py-2 h-auto font-normal",
                      isItemActive && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {item.children!.map((child) => {
                        const ChildIcon =
                          iconMap[child.icon as keyof typeof iconMap] ||
                          BookOpen;
                        const isChildActive = isActive(child.href);

                        return (
                          <Button
                            key={child.title}
                            variant="ghost"
                            asChild
                            className={cn(
                              "w-full justify-start px-3 py-2 h-auto font-normal text-sm",
                              isChildActive &&
                                "bg-accent text-accent-foreground"
                            )}
                          >
                            <Link href={child.href}>
                              <ChildIcon className="h-4 w-4 mr-3" />
                              {child.title}
                            </Link>
                          </Button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            }

            return (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start px-3 py-2 h-auto font-normal",
                  isItemActive && "bg-accent text-accent-foreground"
                )}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-3" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
        {/* Logout Section */}
      </ScrollArea>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, useHasRole } from "@/lib/store";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const role = useRole();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemTitle)
        ? prev.filter((item) => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const filteredItems = NAVIGATION_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  );

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

  return (
    <div
      className={cn("flex h-full w-64 flex-col border-r bg-card", className)}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">QueztLearn</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
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
                          iconMap[child.icon as keyof typeof iconMap];
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
      </ScrollArea>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">
              {role?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {role === "admin"
                ? "Admin User"
                : role === "teacher"
                ? "Teacher User"
                : "Student User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {role}@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

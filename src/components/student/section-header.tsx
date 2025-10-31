"use client";

import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  viewAllHref?: string;
  viewAllText?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  viewAllHref,
  viewAllText = "View All",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        {title}
      </h2>
      {viewAllHref && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={viewAllHref}>
            {viewAllText}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface MobileExploreTabsProps {
  activeTab: "batches" | "test-series";
  onTabChange: (tab: "batches" | "test-series") => void;
}

export function MobileExploreTabs({
  activeTab,
  onTabChange,
}: MobileExploreTabsProps) {
  return (
    <div className="border-b border-border/40 bg-background">
      <div className="flex px-4">
        <button
          onClick={() => onTabChange("batches")}
          className={cn(
            "relative py-4 px-2 font-semibold text-sm",
            "transition-colors duration-200",
            activeTab === "batches"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          Batches
          {activeTab === "batches" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => onTabChange("test-series")}
          className={cn(
            "relative py-4 px-2 font-semibold text-sm",
            "transition-colors duration-200",
            activeTab === "test-series"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          Test series
          {activeTab === "test-series" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}


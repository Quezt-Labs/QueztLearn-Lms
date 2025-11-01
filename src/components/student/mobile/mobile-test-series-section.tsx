"use client";

import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestSeries {
  id: string;
  title: string;
  topic: string;
  completionRate: number;
  averageScore: number;
  totalQuestions: number;
}

interface MobileTestSeriesSectionProps {
  testSeries: TestSeries;
}

export function MobileTestSeriesSection({
  testSeries,
}: MobileTestSeriesSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">
        Test Series Preparation
      </h2>

      <Link
        href={`/student/test-series/${testSeries.id}`}
        className="block active:scale-[0.98] transition-transform"
      >
        <div
          className={cn(
            "rounded-2xl overflow-hidden",
            "bg-card border border-border/30",
            "shadow-lg",
            "p-4 space-y-4"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground">
                  {testSeries.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Topic: {testSeries.topic}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-full bg-muted shrink-0">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
            <div>
              <div className="text-2xl font-bold text-primary">
                {testSeries.completionRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Completion Rate
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {testSeries.averageScore}/{testSeries.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Average Score
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            className={cn(
              "w-full py-3 rounded-xl",
              "bg-primary text-primary-foreground",
              "font-semibold text-sm",
              "flex items-center justify-center gap-2",
              "hover:bg-primary/90 active:bg-primary/95",
              "transition-colors"
            )}
            onClick={(e) => {
              e.preventDefault();
              // Handle navigation
            }}
          >
            Continue Practice
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </section>
  );
}


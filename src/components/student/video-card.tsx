"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDuration, formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  id: string;
  title: string;
  subject: string;
  thumbnail: string;
  duration: number;
  watchedDuration: number;
  lastWatchedAt: Date;
  batchName: string;
  index?: number;
}

export function VideoCard({
  id,
  title,
  subject,
  thumbnail,
  duration,
  watchedDuration,
  lastWatchedAt,
  batchName,
  index = 0,
}: VideoCardProps) {
  const progressPercentage = (watchedDuration / duration) * 100;
  const isCompleted = progressPercentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="w-full"
    >
      <Link
        href={`/student/videos/${id}`}
        className="block w-full touch-manipulation active:scale-[0.98] transition-transform duration-150"
      >
        <Card
          className={cn(
            "group relative w-full overflow-hidden",
            // Mobile-first: Compact padding
            "rounded-2xl md:rounded-xl",
            // Premium background
            "bg-card",
            "border border-border/50 dark:border-border/30",
            "shadow-sm md:shadow-md",
            "hover:shadow-xl md:hover:shadow-2xl",
            "transition-all duration-300 ease-out",
            "hover:border-primary/30 dark:hover:border-primary/20",
            // Active state for mobile
            "active:border-primary/50",
            "cursor-pointer"
          )}
        >
          {/* Thumbnail Section - Mobile Optimized */}
          <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden bg-muted/50">
            {/* Image */}
            <div className="absolute inset-0">
              <img
                src={thumbnail}
                alt={title}
                className={cn(
                  "object-cover w-full h-full",
                  "transition-transform duration-500 ease-out",
                  "group-hover:scale-105",
                  "group-active:scale-100"
                )}
              />
            </div>

            {/* Gradient overlay for better text readability */}
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
              )}
            />

            {/* Progress bar on thumbnail */}
            {progressPercentage > 0 && (
              <div
                className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-primary/80 backdrop-blur-sm z-10"
                style={{ width: `${progressPercentage}%` }}
              />
            )}

            {/* Play button - Always visible on mobile, animated on desktop */}
            <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div
                className={cn(
                  "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full",
                  "bg-white/95 dark:bg-white/90 backdrop-blur-md",
                  "flex items-center justify-center",
                  "shadow-xl",
                  "group-active:scale-95 transition-transform",
                  // Inner shine
                  "before:absolute before:inset-0 before:rounded-full",
                  "before:bg-gradient-to-br before:from-white/50 before:to-transparent"
                )}
              >
                <Play
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8",
                    "text-primary ml-0.5 relative z-10",
                    "fill-current"
                  )}
                />
              </div>
            </div>

            {/* Top badges - Compact for mobile */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 z-10">
              {/* Completion badge */}
              {isCompleted && (
                <Badge
                  className={cn(
                    "bg-emerald-500/95 dark:bg-emerald-600/95",
                    "text-white border-0",
                    "backdrop-blur-sm shadow-md",
                    "px-2 py-0.5 text-[10px] sm:text-xs font-semibold",
                    "flex items-center gap-1"
                  )}
                >
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}

              {/* Duration Badge */}
              <Badge
                className={cn(
                  "bg-black/85 backdrop-blur-sm",
                  "text-white border-0",
                  "shadow-lg",
                  "px-2 py-0.5",
                  "text-[10px] sm:text-xs font-semibold",
                  "flex items-center gap-1",
                  "ml-auto"
                )}
              >
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>{formatDuration(duration)}</span>
              </Badge>
            </div>
          </div>

          {/* Content Section - Mobile Optimized */}
          <CardContent className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3">
            {/* Subject & Title Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] sm:text-xs font-semibold",
                    "border-primary/30 dark:border-primary/40",
                    "bg-primary/10 dark:bg-primary/15",
                    "text-primary",
                    "px-2 py-0.5",
                    "shrink-0"
                  )}
                >
                  {subject}
                </Badge>
                {progressPercentage > 0 && progressPercentage < 100 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                )}
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "font-bold text-sm sm:text-base leading-snug line-clamp-2",
                  "text-foreground",
                  "group-hover:text-primary",
                  "transition-colors duration-200"
                )}
              >
                {title}
              </h3>

              {/* Batch Name */}
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                {batchName}
              </p>
            </div>

            {/* Progress Section - Compact Mobile Design */}
            <div className="space-y-1.5 pt-1">
              {/* Progress info row */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {formatDuration(watchedDuration)} /{" "}
                    {formatDuration(duration)}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-bold shrink-0 ml-2",
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-primary"
                  )}
                >
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-1.5 sm:h-2 bg-muted/60 dark:bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      "bg-gradient-to-r",
                      isCompleted
                        ? "from-emerald-500 to-emerald-600"
                        : "from-primary to-primary/80",
                      "relative overflow-hidden"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer - Last Watched */}
            <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate flex-1">
                {formatDate(lastWatchedAt)}
              </p>
              {progressPercentage > 0 && progressPercentage < 100 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 font-semibold",
                    "bg-primary/10 text-primary border-primary/20",
                    "shrink-0 ml-2"
                  )}
                >
                  Continue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Video {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  progress: number;
  duration: number;
  watchedDuration: number;
}

interface MobileContinueWatchingSectionProps {
  videos: Video[];
}

export function MobileContinueWatchingSection({
  videos,
}: MobileContinueWatchingSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowScrollIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [videos]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Continue Watching</h2>
      
      {/* Horizontal Scrollable Cards with Scroll Indicator */}
      <div className="relative -mx-4 px-4">
        {/* Scroll Indicator - Right fade with arrow */}
        {showScrollIndicator && (
          <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2">
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-[10px] font-semibold text-muted-foreground">Swipe</span>
            </div>
          </div>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex gap-4 w-max items-stretch">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0 snap-start h-full"
              >
                <Link
                  href={`/student/videos/${video.id}`}
                  className="block w-[280px] h-full active:scale-[0.98] transition-transform"
                >
                  <div className={cn(
                    "rounded-2xl overflow-hidden h-full min-h-[320px] flex flex-col",
                    "bg-card border border-border/30",
                    "shadow-lg"
                  )}>
                    {/* Thumbnail with Play Button */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute bottom-3 left-3">
                        <div className="h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="h-5 w-5 text-primary ml-0.5 fill-current" />
                        </div>
                      </div>

                      {/* Progress Bar on Thumbnail */}
                      {video.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/80">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {video.subtitle}
                        </p>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-1.5 mt-auto">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-primary">
                          {video.progress}% watched
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  lessonsCompleted: number;
  totalLessons: number;
  backgroundColor: string;
}

interface MobileInProgressSectionProps {
  courses: Course[];
}

export function MobileInProgressSection({
  courses,
}: MobileInProgressSectionProps) {
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
  }, [courses]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">In progress</h2>

      {/* Horizontal Scrollable Cards with Scroll Indicator */}
      <div className="relative -mx-4 px-4">
        {/* Scroll Indicator - Right fade with arrow */}
        {showScrollIndicator && (
          <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2">
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                Swipe
              </span>
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex gap-4 w-max">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0 snap-start"
              >
                <Link
                  href={`/student/courses/${course.id}`}
                  className="block w-[280px] active:scale-[0.98] transition-transform"
                >
                  <div
                    className={cn(
                      "relative rounded-2xl overflow-hidden flex flex-col",
                      "bg-gradient-to-br",
                      course.backgroundColor,
                      "border border-border/30",
                      "shadow-lg"
                    )}
                  >
                    {/* Thumbnail Area */}
                    <div className="h-36 relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Progress Badge - Shows percentage */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-xs font-semibold text-foreground">
                            {Math.round(
                              (course.lessonsCompleted / course.totalLessons) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content - Compact Layout */}
                    <div className="px-3 py-2.5 bg-background/95">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-primary/10 shrink-0">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground line-clamp-1 leading-tight mb-1.5">
                            {course.title}
                          </h3>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (course.lessonsCompleted /
                                      course.totalLessons) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {Math.round(
                                (course.lessonsCompleted /
                                  course.totalLessons) *
                                  100
                              )}
                              % completed
                            </p>
                          </div>
                        </div>
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

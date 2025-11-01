"use client";

import { useState } from "react";
import { Settings, Play, FileText, BookOpen, TrendingUp } from "lucide-react";
import { VideoCard } from "@/components/student/video-card";
import { TestAttemptCard } from "@/components/student/test-attempt-card";
import { BatchCard } from "@/components/student/batch-card";
import { TestSeriesCard } from "@/components/student/test-series-card";
import { SectionHeader } from "@/components/student/section-header";

// Mock data - Replace with actual API calls
const recentVideos = [
  {
    id: "1",
    title: "Introduction to Organic Chemistry",
    subject: "Chemistry",
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    duration: 3600, // in seconds
    watchedDuration: 2400,
    lastWatchedAt: new Date("2025-10-30T10:30:00"),
    batchName: "JEE Main 2025",
  },
  {
    id: "2",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration: 2700,
    watchedDuration: 2700,
    lastWatchedAt: new Date("2025-10-29T15:20:00"),
    batchName: "JEE Advanced 2025",
  },
  {
    id: "3",
    title: "Calculus - Differentiation Basics",
    subject: "Mathematics",
    thumbnail:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration: 3000,
    watchedDuration: 1500,
    lastWatchedAt: new Date("2025-10-28T18:45:00"),
    batchName: "JEE Main 2025",
  },
];

const recentTests = [
  {
    id: "1",
    title: "Physics Mock Test 1",
    testSeriesName: "JEE Main Mock Series",
    totalMarks: 300,
    obtainedMarks: 245,
    totalQuestions: 75,
    attemptedQuestions: 73,
    accuracy: 82.5,
    attemptedAt: new Date("2025-10-29T14:00:00"),
    rank: 145,
    percentile: 89.5,
  },
  {
    id: "2",
    title: "Chemistry Full Test",
    testSeriesName: "NEET Practice Tests",
    totalMarks: 180,
    obtainedMarks: 156,
    totalQuestions: 45,
    attemptedQuestions: 45,
    accuracy: 86.7,
    attemptedAt: new Date("2025-10-27T10:00:00"),
    rank: 89,
    percentile: 92.3,
  },
];

const purchasedBatches = [
  {
    id: "1",
    name: "JEE Main 2025 Complete Course",
    class: "12th",
    exam: "JEE",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    language: "English",
    totalPrice: 15000,
    discountPercentage: 20,
    finalPrice: 12000,
    progress: 45,
    totalSubjects: 3,
    completedSubjects: 1,
  },
  {
    id: "2",
    name: "NEET Biology Mastery",
    class: "12th",
    exam: "NEET",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-11-30"),
    language: "Hindi",
    totalPrice: 8000,
    discountPercentage: 15,
    finalPrice: 6800,
    progress: 68,
    totalSubjects: 1,
    completedSubjects: 0,
  },
];

const purchasedTestSeries = [
  {
    id: "1",
    title: "JEE Main 2025 Complete Mock Series",
    exam: "JEE",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    totalPrice: 2999,
    discountPercentage: 20,
    finalPrice: 2399,
    totalTests: 30,
    attemptedTests: 12,
    averageScore: 68.5,
    validUntil: new Date("2026-03-31"),
  },
  {
    id: "2",
    title: "NEET Practice Test Series",
    exam: "NEET",
    imageUrl:
      "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=400",
    totalPrice: 1999,
    discountPercentage: 25,
    finalPrice: 1499,
    totalTests: 20,
    attemptedTests: 8,
    averageScore: 72.3,
    validUntil: new Date("2026-04-30"),
  },
];

export function MyLearningMobile() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold text-foreground">My Learning</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="py-6 space-y-8">
        {/* Recently Watched Videos */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="Continue Watching"
              icon={Play}
              viewAllHref="/student/videos"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {recentVideos.map((video, index) => (
              <div
                key={video.id}
                className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
              >
                <VideoCard {...video} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Recently Attempted Tests */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="Recent Test Attempts"
              icon={FileText}
              viewAllHref="/student/tests"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {recentTests.map((test, index) => (
              <div
                key={test.id}
                className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
              >
                <TestAttemptCard {...test} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Purchased Batches */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="My Batches"
              icon={BookOpen}
              viewAllHref="/student/batches"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {purchasedBatches.map((batch, index) => (
              <div
                key={batch.id}
                className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
              >
                <BatchCard {...batch} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Purchased Test Series */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="My Test Series"
              icon={TrendingUp}
              viewAllHref="/student/test-series"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {purchasedTestSeries.map((series, index) => (
              <div
                key={series.id}
                className="shrink-0 w-[85vw] sm:w-[350px] snap-start"
              >
                <TestSeriesCard {...series} index={index} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

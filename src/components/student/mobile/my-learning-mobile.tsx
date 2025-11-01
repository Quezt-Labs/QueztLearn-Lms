"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { MobileInProgressSection } from "./mobile-in-progress-section";
import { MobileContinueWatchingSection } from "./mobile-continue-watching-section";
import { MobileTestSeriesSection } from "./mobile-test-series-section";

// Mock data - Replace with actual API calls
const inProgressCourses = [
  {
    id: "1",
    title: "Mastering Data Analysis",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    lessonsCompleted: 10,
    totalLessons: 20,
    backgroundColor: "from-amber-50 to-amber-100",
  },
  {
    id: "2",
    title: "Advanced Python Programming",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4f18da5?w=400",
    lessonsCompleted: 5,
    totalLessons: 15,
    backgroundColor: "from-slate-50 to-slate-100",
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400",
    lessonsCompleted: 8,
    totalLessons: 25,
    backgroundColor: "from-blue-50 to-blue-100",
  },
];

const continueWatchingVideos = [
  {
    id: "1",
    title: "Data Analysis Fundamentals",
    subtitle: "Lesson 3: Data Visualization",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    progress: 75,
    duration: 1800,
    watchedDuration: 1350,
  },
  {
    id: "2",
    title: "Python Functions",
    subtitle: "Module 2: Advanced Concepts",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4f18da5?w=400",
    progress: 40,
    duration: 2400,
    watchedDuration: 960,
  },
  {
    id: "3",
    title: "Statistical Methods",
    subtitle: "Lesson 5: Hypothesis Testing",
    thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400",
    progress: 60,
    duration: 2100,
    watchedDuration: 1260,
  },
];

const testSeriesData = {
  id: "1",
  title: "Quantitative Aptitude",
  topic: "Number Systems",
  completionRate: 85,
  averageScore: 78,
  totalQuestions: 100,
};

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
      <div className="px-4 py-6 space-y-8">
        {/* In Progress Section */}
        <MobileInProgressSection courses={inProgressCourses} />

        {/* Continue Watching Section */}
        <MobileContinueWatchingSection videos={continueWatchingVideos} />

        {/* Test Series Preparation Section */}
        <MobileTestSeriesSection testSeries={testSeriesData} />
      </div>
    </div>
  );
}


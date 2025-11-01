"use client";

import { useState } from "react";
import { Search, BookOpen, FileText } from "lucide-react";
import { StudentHeader } from "@/components/student/student-header";
import { ExploreBatchCard } from "@/components/student/explore-batch-card";
import { MobileTestSeriesCard } from "@/components/student/mobile/mobile-test-series-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data - will be replaced with actual API data
const mockBatches = [
  {
    id: "1",
    name: "NEET 2026 Complete Foundation Batch - Biology, Physics & Chemistry",
    class: "12" as const,
    exam: "NEET",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2025-05-31"),
    language: "English & Hindi",
    totalPrice: 25000,
    discountPercentage: 40,
  },
  {
    id: "2",
    name: "JEE Main & Advanced 2025 - Complete Mathematics Mastery",
    class: "12" as const,
    exam: "JEE",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    startDate: new Date("2024-11-15"),
    endDate: new Date("2025-04-30"),
    language: "English",
    totalPrice: 20000,
    discountPercentage: 35,
  },
  {
    id: "3",
    name: "UPSC CSE 2025 - General Studies Foundation Course",
    class: "Grad" as const,
    exam: "UPSC",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2025-06-30"),
    language: "English & Hindi",
    totalPrice: 30000,
    discountPercentage: 25,
  },
  {
    id: "4",
    name: "CA Foundation Complete Course - Accounts, Laws & Maths",
    class: "12+" as const,
    exam: "CA",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
    startDate: new Date("2024-11-01"),
    endDate: new Date("2025-05-15"),
    language: "English",
    totalPrice: 18000,
    discountPercentage: 30,
  },
  {
    id: "5",
    name: "Class 11 Science PCM Complete Foundation Course",
    class: "11" as const,
    exam: "Boards",
    imageUrl:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    startDate: new Date("2024-11-10"),
    endDate: new Date("2025-03-31"),
    language: "Hindi",
    totalPrice: 15000,
    discountPercentage: 20,
  },
  {
    id: "6",
    name: "SSC CGL 2025 - Complete Preparation with Mock Tests",
    class: "Grad" as const,
    exam: "SSC",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2025-07-31"),
    language: "English & Hindi",
    totalPrice: 12000,
    discountPercentage: 45,
  },
];

const mockTestSeries = [
  {
    id: "1",
    title: "JEE Main 2025 Mock Test Series - 30 Full Length Tests",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    originalPrice: 5000,
    discountedPrice: 3499,
    badge: "Popular",
    badgeColor: "bg-blue-500",
  },
  {
    id: "2",
    title: "NEET 2025 Grand Test Series with Detailed Analysis",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
    originalPrice: 4500,
    discountedPrice: 2999,
    badge: "Best Seller",
    badgeColor: "bg-emerald-500",
  },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"batches" | "test-series">(
    "batches"
  );
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="sticky top-14 z-30 bg-background border-b border-border/40">
          <div className="flex">
            <button
              onClick={() => setActiveTab("batches")}
              className={`flex-1 flex items-center justify-center gap-2 h-12 font-medium text-sm transition-colors ${
                activeTab === "batches"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Batches
            </button>
            <button
              onClick={() => setActiveTab("test-series")}
              className={`flex-1 flex items-center justify-center gap-2 h-12 font-medium text-sm transition-colors ${
                activeTab === "test-series"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Test Series
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-4">
          {activeTab === "batches" ? (
            <>
              {mockBatches.map((batch, index) => (
                <ExploreBatchCard key={batch.id} {...batch} index={index} />
              ))}
            </>
          ) : (
            <>
              {mockTestSeries.map((series) => (
                <MobileTestSeriesCard key={series.id} {...series} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-background">
        <StudentHeader />

        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
            <p className="text-muted-foreground">
              Find the perfect batch or test series to accelerate your learning
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search batches and test series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "batches" ? "default" : "outline"}
                onClick={() => setActiveTab("batches")}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Batches
              </Button>
              <Button
                variant={activeTab === "test-series" ? "default" : "outline"}
                onClick={() => setActiveTab("test-series")}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Test Series
              </Button>
            </div>
          </div>

          {/* Content Grid */}
          {activeTab === "batches" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBatches.map((batch, index) => (
                <ExploreBatchCard key={batch.id} {...batch} index={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTestSeries.map((series) => (
                <MobileTestSeriesCard key={series.id} {...series} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

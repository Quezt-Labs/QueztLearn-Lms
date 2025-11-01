"use client";

import { useState } from "react";
import { Search, BookOpen, FileText, Loader2 } from "lucide-react";
import { StudentHeader } from "@/components/student/student-header";
import { ExploreBatchCard } from "@/components/student/explore-batch-card";
import { ExploreTestSeriesCard } from "@/components/student/explore-test-series-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetExploreBatches } from "@/hooks";

// Mock data for test series - will be replaced with actual API
const mockTestSeries = [
  {
    id: "1",
    exam: "JEE",
    title: "JEE Main 2025 Mock Test Series - 30 Full Length Tests",
    slug: "jee-main-2025-mock-series",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    totalPrice: 5000,
    discountPercentage: 30,
    isFree: false,
    durationDays: 180,
  },
  {
    id: "2",
    exam: "NEET",
    title: "NEET 2025 Grand Test Series with Detailed Analysis",
    slug: "neet-2025-grand-test-series",
    imageUrl:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
    totalPrice: 4500,
    discountPercentage: 33,
    isFree: false,
    durationDays: 150,
  },
  {
    id: "3",
    exam: "UPSC",
    title: "UPSC Prelims Free Mock Test Series 2025",
    slug: "upsc-prelims-free-mock-series",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    totalPrice: 0,
    discountPercentage: 0,
    isFree: true,
    durationDays: 90,
  },
  {
    id: "4",
    exam: "SSC",
    title: "SSC CGL Tier 1 & 2 Complete Test Package",
    slug: "ssc-cgl-complete-test-package",
    imageUrl:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800",
    totalPrice: 3000,
    discountPercentage: 40,
    isFree: false,
    durationDays: 120,
  },
  {
    id: "5",
    exam: "CAT",
    title: "CAT 2025 - 50 Sectional + 20 Full Mock Tests",
    slug: "cat-2025-mock-test-series",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
    totalPrice: 6000,
    discountPercentage: 25,
    isFree: false,
    durationDays: 200,
  },
];

interface Batch {
  id: string;
  name: string;
  description?: any;
  class: "11" | "12" | "12+" | "Grad";
  exam: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"batches" | "test-series">(
    "batches"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch batches from API using client-specific endpoint
  const { data: batchesResponse, isLoading: isBatchesLoading } =
    useGetExploreBatches();
  const batches: Batch[] = batchesResponse?.data || [];

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
            {/* <Search className="h-5 w-5 text-muted-foreground" /> */}
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
              {isBatchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No batches available at the moment
                </div>
              ) : (
                batches.map((batch, index) => (
                  <ExploreBatchCard key={batch.id} {...batch} index={index} />
                ))
              )}
            </>
          ) : (
            <>
              {mockTestSeries.map((series, index) => (
                <ExploreTestSeriesCard
                  key={series.id}
                  {...series}
                  index={index}
                />
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
            {/* <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search batches and test series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div> */}
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
            <>
              {isBatchesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Batches Available
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new courses
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map((batch, index) => (
                    <ExploreBatchCard key={batch.id} {...batch} index={index} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTestSeries.map((series, index) => (
                <ExploreTestSeriesCard
                  key={series.id}
                  {...series}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

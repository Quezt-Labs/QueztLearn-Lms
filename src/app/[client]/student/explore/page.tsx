"use client";

import { Suspense, useState, lazy } from "react";
import { BookOpen, FileText, Loader2 } from "lucide-react";
import { StudentHeader } from "@/components/student/student-header";
import { Button } from "@/components/ui/button";
import { useGetExploreBatches, useGetExploreTestSeries } from "@/hooks";

// Dynamic imports for code splitting
const ExploreBatchCard = lazy(() =>
  import("@/components/student/explore-batch-card").then((mod) => ({
    default: mod.ExploreBatchCard,
  }))
);

const ExploreTestSeriesCard = lazy(() =>
  import("@/components/student/explore-test-series-card").then((mod) => ({
    default: mod.ExploreTestSeriesCard,
  }))
);

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

interface TestSeries {
  id: string;
  exam: string;
  title: string;
  slug: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage?: number;
  isFree?: boolean;
  durationDays?: number;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"batches" | "test-series">(
    "batches"
  );

  const {
    data: batchesResponse,
    isLoading: isBatchesLoading,
    isFetched: isBatchesFetched,
  } = useGetExploreBatches();
  const batches: Batch[] = batchesResponse?.data || [];

  const {
    data: testSeriesResponse,
    isLoading: isTestSeriesLoading,
    isFetched: isTestSeriesFetched,
  } = useGetExploreTestSeries();
  const testSeries: TestSeries[] = testSeriesResponse?.data || [];

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
              {isBatchesLoading && !isBatchesFetched ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No batches available at the moment
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  }
                >
                  {batches.map((batch, index) => (
                    <ExploreBatchCard key={batch.id} {...batch} index={index} />
                  ))}
                </Suspense>
              )}
            </>
          ) : (
            <>
              {isTestSeriesLoading && !isTestSeriesFetched ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : testSeries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No test series available at the moment
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  }
                >
                  {testSeries.map((series, index) => (
                    <ExploreTestSeriesCard
                      key={series.id}
                      {...series}
                      index={index}
                    />
                  ))}
                </Suspense>
              )}
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
              {isBatchesLoading && !isBatchesFetched ? (
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
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch, index) => (
                      <ExploreBatchCard
                        key={batch.id}
                        {...batch}
                        index={index}
                      />
                    ))}
                  </div>
                </Suspense>
              )}
            </>
          ) : (
            <>
              {isTestSeriesLoading && !isTestSeriesFetched ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : testSeries.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Test Series Available
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new test series
                  </p>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testSeries.map((series, index) => (
                      <ExploreTestSeriesCard
                        key={series.id}
                        {...series}
                        index={index}
                      />
                    ))}
                  </div>
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { MobileExploreTabs } from "./mobile-explore-tabs";
import { MobileBatchCard } from "./mobile-batch-card";
import { MobileTestSeriesCard } from "./mobile-test-series-card";

// Mock data
const batches = [
  {
    id: "1",
    title: "UPSC CSE GS 2025 Foundation Batch",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    originalPrice: 20000,
    discountedPrice: 12999,
    badge: "Limited Offer",
    badgeColor: "bg-orange-500",
  },
  {
    id: "2",
    title: "UPSC CSE Optional (History) Batch",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
    originalPrice: 15000,
    discountedPrice: 9999,
    badge: "Best Seller",
    badgeColor: "bg-emerald-500",
  },
];

const testSeries = [
  {
    id: "1",
    title: "JEE Main 2025 Mock Series",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    originalPrice: 5000,
    discountedPrice: 3499,
    badge: "Popular",
    badgeColor: "bg-blue-500",
  },
];

export function MobileExplorePage() {
  const [activeTab, setActiveTab] = useState<"batches" | "test-series">("batches");

  return (
    <div className="min-h-screen bg-background pb-20 md:hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold text-foreground">Explore</h1>
          <button
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <MobileExploreTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {activeTab === "batches" ? (
          <>
            {batches.map((batch) => (
              <MobileBatchCard key={batch.id} {...batch} />
            ))}
          </>
        ) : (
          <>
            {testSeries.map((series) => (
              <MobileTestSeriesCard key={series.id} {...series} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

